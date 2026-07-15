"""Hybrid search service.

Pipeline:
1. Run semantic search (Qdrant + BGE-M3) and keyword search (PostgreSQL FTS) in parallel.
2. Deduplicate by paper_id, keeping the top scores from each list.
3. Apply filters (OR-within-field, AND-across-fields).
4. Rank the merged set via Reciprocal Rank Fusion (RRF).
5. Apply explicit sort strategy if not "relevance".
6. Paginate and return.
7. Compute dynamic facet counts via FacetService.

Both retrievers return raw hits with the same shape: list[(paper_id, score)].
Paper rows are loaded once after the merge step.
"""

from __future__ import annotations

import asyncio
import logging
import time
from dataclasses import dataclass, field
from typing import Any, Protocol

import numpy as np
from sqlalchemy.orm import Session

from models import Paper
from repositories.paper_repository import PaperRepository
from repositories.vector_repository import VectorRepository
from schemas import (
    Facets,
    HybridSearchFilters,
    HybridSearchItem,
    HybridSearchRequest,
    HybridSearchResponse,
)
from services.embedding_service import EmbeddingService, get_embedding_service
from services.facet_service import FacetService
from services.search_filters import evidence_sort_key, matches_filters

logger = logging.getLogger(__name__)


DEFAULT_SEMANTIC_TOP_K = 100
DEFAULT_KEYWORD_TOP_K = 100
DEFAULT_RRF_K = 60


# ---------------------------------------------------------------------------
# Hit data structures
# ---------------------------------------------------------------------------


@dataclass
class _Hit:
    paper_id: str
    semantic_score: float = 0.0
    semantic_rank: int | None = None
    keyword_score: float = 0.0
    keyword_rank: int | None = None


@dataclass
class _MergedResult:
    paper: Paper
    semantic_score: float
    keyword_score: float
    final_score: float


# ---------------------------------------------------------------------------
# Protocols
# ---------------------------------------------------------------------------


class SemanticSearcher(Protocol):
    """Search Qdrant and return raw hits sorted by score."""

    def search(self, query: str, top_k: int) -> list[tuple[str, float]]:
        ...


class KeywordSearcher(Protocol):
    """Search PostgreSQL FTS and return raw hits sorted by score."""

    def search(self, query: str, top_k: int) -> list[tuple[str, float]]:
        ...


# ---------------------------------------------------------------------------
# Service
# ---------------------------------------------------------------------------


class HybridSearchService:
    """Runs hybrid search end-to-end."""

    def __init__(
        self,
        db: Session,
        paper_repository: PaperRepository,
        vector_repository: VectorRepository,
        embedding_service: EmbeddingService | None = None,
        facet_service: FacetService | None = None,
    ):
        self._db = db
        self._paper_repo = paper_repository
        self._vector_repo = vector_repository
        self._embedding_service = embedding_service or get_embedding_service()
        self._facet_service = facet_service or FacetService(db=db, paper_repository=paper_repository)

    # ── Public entry point ─────────────────────────────────────────────

    def search(self, request: HybridSearchRequest) -> HybridSearchResponse:
        """Execute hybrid search and return a paginated response."""
        t_start = time.perf_counter()
        query = (request.query or "").strip()
        weights = self._resolve_weights(request)

        if query:
            # Normal hybrid search: semantic + keyword in parallel.
            semantic_hits, keyword_hits = self._run_parallel(query, DEFAULT_SEMANTIC_TOP_K, DEFAULT_KEYWORD_TOP_K)
            rrf_k = request.rrf_k or DEFAULT_RRF_K
            merged = self._merge(semantic_hits, keyword_hits, rrf_k, weights)
            scope_ids: list[str] | None = [m.paper.id for m in merged]
        else:
            # Browse mode: no query. Use SQL for filtering/sorting/pagination
            # so we never load the whole table into memory.
            semantic_hits: list[tuple[str, float]] = []
            keyword_hits: list[tuple[str, float]] = []
            merged, total = self._browse_with_sql(request)
            scope_ids = None

            items = [
                HybridSearchItem(
                    paper_id=r.paper.id,
                    title=r.paper.title or "",
                    tldr=r.paper.tldr or "",
                    study_type=r.paper.study_type or "",
                    specialty_tags=_parse_tags(r.paper.specialty_tags),
                    publication_year=r.paper.publication_year,
                    journal=r.paper.journal or "",
                    language=r.paper.language or "",
                    author_list=r.paper.author_list or "",
                    evidence_level=r.paper.evidence_level or "",
                    processing_time=r.paper.processing_time or 0.0,
                    has_errors=bool(r.paper.has_errors),
                    semantic_score=None,
                    keyword_score=None,
                    final_score=0.0,
                )
                for r in merged
            ]

            facets: Facets | None = None
            if request.facets_enabled:
                try:
                    facets = self._facet_service.compute(
                        paper_ids=scope_ids,
                        filters=request.filters,
                    )
                except Exception:
                    logger.exception("Facet computation failed; returning without facets")
                    facets = None

            return HybridSearchResponse(
                query=query,
                page=request.page,
                page_size=request.page_size,
                total=total,
                filters=request.filters,
                facets=facets,
                items=items,
            )
        t_retrieve = time.perf_counter()

        filtered = self._apply_filters(merged, request.filters)
        t_filter = time.perf_counter()

        sorted_results = self._apply_sort(filtered, request.sort, query)
        t_sort = time.perf_counter()

        page_items, total = self._paginate(sorted_results, request.page, request.page_size)
        t_paginate = time.perf_counter()

        # Facet counts for the visible scope. When the result set is the
        # union of semantic + keyword hits (query mode), facet counts respect
        # that scope. In browse mode they cover the entire DB.
        facets: Facets | None = None
        if request.facets_enabled:
            try:
                facets = self._facet_service.compute(
                    paper_ids=scope_ids,
                    filters=request.filters,
                )
            except Exception:
                logger.exception("Facet computation failed; returning without facets")
                facets = None
        t_facets = time.perf_counter()

        logger.info(
            "HybridSearch: q=%r, semantic=%d, keyword=%d, merged=%d, filtered=%d, "
            "total=%d, page=%d, page_size=%d, facets_enabled=%s, "
            "timing retrieve=%.3fs filter=%.3fs sort=%.3fs paginate=%.3fs facets=%.3fs total=%.3fs",
            request.query,
            len(semantic_hits),
            len(keyword_hits),
            len(merged),
            len(filtered),
            total,
            request.page,
            request.page_size,
            request.facets_enabled,
            t_retrieve - t_start,
            t_filter - t_retrieve,
            t_sort - t_filter,
            t_paginate - t_sort,
            t_facets - t_paginate,
            time.perf_counter() - t_start,
        )

        items = [
            HybridSearchItem(
                paper_id=r.paper.id,
                title=r.paper.title or "",
                tldr=r.paper.tldr or "",
                study_type=r.paper.study_type or "",
                specialty_tags=_parse_tags(r.paper.specialty_tags),
                publication_year=r.paper.publication_year,
                journal=r.paper.journal or "",
                language=r.paper.language or "",
                author_list=r.paper.author_list or "",
                evidence_level=r.paper.evidence_level or "",
                processing_time=r.paper.processing_time or 0.0,
                has_errors=r.paper.has_errors,
                semantic_score=round(r.semantic_score, 4) if r.semantic_score is not None else None,
                keyword_score=round(r.keyword_score, 4) if r.keyword_score is not None else None,
                final_score=round(r.final_score, 4),
            )
            for r in page_items
        ]
        return HybridSearchResponse(
            query=request.query,
            page=request.page,
            page_size=request.page_size,
            total=total,
            filters=request.filters,
            facets=facets,
            items=items,
        )

    # ── Pipeline steps ────────────────────────────────────────────────

    def _run_parallel(
        self, query: str, semantic_k: int, keyword_k: int,
    ) -> tuple[list[tuple[str, float]], list[tuple[str, float]]]:
        """Run semantic and keyword retrievers concurrently."""
        async def gather_all() -> tuple[list[tuple[str, float]], list[tuple[str, float]]]:
            sem_task = asyncio.create_task(asyncio.to_thread(self._semantic_search, query, semantic_k))
            kw_task = asyncio.create_task(asyncio.to_thread(self._keyword_search, query, keyword_k))
            return await asyncio.gather(sem_task, kw_task)

        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                # In FastAPI the request loop is running — run on a fresh loop.
                return asyncio.run(gather_all())  # type: ignore[return-value]
            return loop.run_until_complete(gather_all())
        except RuntimeError:
            return asyncio.run(gather_all())

    def _semantic_search(self, query: str, top_k: int) -> list[tuple[str, float]]:
        try:
            vector = self._embedding_service.encode_query(query)
            vector_np = np.asarray(vector, dtype=np.float32)
            results = self._vector_repo.search(
                query_vector=vector_np,
                top_k=top_k,
                score_threshold=None,
                filters=None,
            )
            return [(r.paper_id, float(r.score)) for r in results]
        except Exception:
            logger.exception("Semantic search failed")
            return []

    def _keyword_search(self, query: str, top_k: int) -> list[tuple[str, float]]:
        try:
            results = self._paper_repo.keyword_search(query, top_k=top_k)
            return [(paper.id, score) for paper, score in results]
        except Exception:
            logger.exception("Keyword search failed")
            return []

    def _merge(
        self,
        semantic_hits: list[tuple[str, float]],
        keyword_hits: list[tuple[str, float]],
        rrf_k: int,
        weights: tuple[float, float],
    ) -> list[_MergedResult]:
        """Deduplicate, combine via RRF, and load Paper rows."""
        sem_w, kw_w = weights

        hits: dict[str, _Hit] = {}
        for rank, (pid, score) in enumerate(semantic_hits, start=1):
            hit = hits.setdefault(pid, _Hit(paper_id=pid))
            hit.semantic_score = float(score)
            hit.semantic_rank = rank

        for rank, (pid, score) in enumerate(keyword_hits, start=1):
            hit = hits.setdefault(pid, _Hit(paper_id=pid))
            hit.keyword_score = float(score)
            hit.keyword_rank = rank

        if not hits:
            return []

        # Pre-filter empty ranks: only count hits that actually appeared in each list.
        for hit in hits.values():
            rrf = 0.0
            if hit.semantic_rank is not None:
                rrf += sem_w * 1.0 / (rrf_k + hit.semantic_rank)
            if hit.keyword_rank is not None:
                rrf += kw_w * 1.0 / (rrf_k + hit.keyword_rank)
            hit.final_score = rrf

        # Sort descending by RRF score, then load papers.
        ordered_hits = sorted(
            hits.values(),
            key=lambda h: h.final_score,
            reverse=True,
        )
        ordered_ids = [h.paper_id for h in ordered_hits]
        papers = self._paper_repo.get_by_ids(ordered_ids)
        paper_by_id = {p.id: p for p in papers}

        merged: list[_MergedResult] = []
        for hit in ordered_hits:
            paper = paper_by_id.get(hit.paper_id)
            if paper is None:
                logger.warning(
                    "Paper %s in retrieval but missing from DB; skipping",
                    hit.paper_id,
                )
                continue
            merged.append(
                _MergedResult(
                    paper=paper,
                    semantic_score=hit.semantic_score,
                    keyword_score=hit.keyword_score,
                    final_score=hit.final_score,
                )
            )
        return merged

    def _apply_filters(
        self,
        merged: list[_MergedResult],
        filters: HybridSearchFilters | None,
    ) -> list[_MergedResult]:
        if filters is None:
            return merged
        return [m for m in merged if matches_filters(m.paper, filters)]

    def _apply_sort(
        self,
        results: list[_MergedResult],
        sort: str,
        query: str = "",
    ) -> list[_MergedResult]:
        if sort == "relevance":
            # Relevance sorting only makes sense when a query is present.
            # For filter-only browsing, fall back to newest so results are deterministic.
            if query:
                return sorted(results, key=lambda r: r.final_score, reverse=True)
            return sorted(
                results,
                key=lambda r: (r.paper.publication_year or 0, r.paper.title or ""),
                reverse=True,
            )
        if sort == "newest":
            return sorted(
                results,
                key=lambda r: (r.paper.publication_year or 0, r.final_score),
                reverse=True,
            )
        if sort == "oldest":
            return sorted(
                results,
                key=lambda r: (r.paper.publication_year or 10**9, r.final_score),
            )
        if sort == "highest_evidence":
            return sorted(
                results,
                key=lambda r: (evidence_sort_key(r.paper), r.final_score),
                reverse=True,
            )
        if sort == "title":
            return sorted(results, key=lambda r: (r.paper.title or "").lower())
        return results

    def _paginate(
        self,
        results: list[_MergedResult],
        page: int,
        page_size: int,
    ) -> tuple[list[_MergedResult], int]:
        total = len(results)
        start = (page - 1) * page_size
        end = start + page_size
        return results[start:end], total

    def _browse_with_sql(
        self,
        request: HybridSearchRequest,
    ) -> tuple[list[_MergedResult], int]:
        """Browse mode: filter, sort, and paginate entirely in SQL."""
        from services.search_filters import apply_filters

        query = self._db.query(Paper)
        query = apply_filters(query, request.filters)

        total = query.count()

        # Sorting
        sort = request.sort or "relevance"
        if sort == "newest":
            query = query.order_by(Paper.publication_year.desc().nullslast(), Paper.id)
        elif sort == "oldest":
            query = query.order_by(Paper.publication_year.asc().nullslast(), Paper.id)
        elif sort == "title":
            query = query.order_by(Paper.title.asc())
        elif sort == "highest_evidence":
            # SQL-side evidence ordering: high > moderate > low > very_low > other
            evidence_case = func.case(
                (func.lower(Paper.evidence_level) == "high", 4),
                (func.lower(Paper.evidence_level) == "moderate", 3),
                (func.lower(Paper.evidence_level) == "low", 2),
                (func.lower(Paper.evidence_level) == "very_low", 1),
                else_=0,
            )
            query = query.order_by(evidence_case.desc(), Paper.id)
        else:
            # relevance fallback for browse: newest first
            query = query.order_by(Paper.publication_year.desc().nullslast(), Paper.id)

        # Pagination
        offset = (request.page - 1) * request.page_size
        papers = query.offset(offset).limit(request.page_size).all()

        merged = [
            _MergedResult(
                paper=paper,
                semantic_score=None,
                keyword_score=None,
                final_score=0.0,
            )
            for paper in papers
        ]
        return merged, total

    # ── Helpers ───────────────────────────────────────────────────────

    def _resolve_weights(self, request: HybridSearchRequest) -> tuple[float, float]:
        """Returns (semantic_weight, keyword_weight), summing to 1.0."""
        if request.semantic_weight is None:
            return (0.7, 0.3)
        sw = max(0.0, min(1.0, float(request.semantic_weight)))
        return (sw, 1.0 - sw)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _parse_tags(raw: str) -> list[str]:
    import json
    try:
        tags = json.loads(raw)
        if isinstance(tags, list):
            return [str(t) for t in tags]
    except (json.JSONDecodeError, TypeError):
        pass
    return []


# ---------------------------------------------------------------------------
# Dependency injection
# ---------------------------------------------------------------------------


def get_hybrid_search_service(
    db: Session,
    vector_repository=None,
) -> HybridSearchService:
    """Build a configured HybridSearchService for the current request."""
    from repositories.paper_repository import SQLAlchemyPaperRepository
    from repositories.vector_repository import QdrantVectorRepository
    from services.qdrant_service import get_qdrant_client

    paper_repo = SQLAlchemyPaperRepository(db)
    vector_repo = vector_repository or QdrantVectorRepository(client=get_qdrant_client())
    return HybridSearchService(
        db=db,
        paper_repository=paper_repo,
        vector_repository=vector_repo,
    )