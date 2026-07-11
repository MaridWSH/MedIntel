"""Unit tests for the semantic search service.

These tests use fake embedding and repository implementations so they do not
require a running Qdrant server or the BGE-M3 model.
"""

from __future__ import annotations

import numpy as np
import pytest

from models import Paper
from repositories.paper_repository import PaperRepository
from repositories.vector_repository import VectorRepository
from services.embedding_service import EmbeddingService
from services.qdrant_service import PaperEmbeddingPayload, SemanticSearchResult
from services.semantic_search_service import (
    SemanticSearchService,
    normalize_query,
)


class FakeEmbeddingService:
    """Fake embedding service that returns deterministic vectors."""

    def __init__(self, dimension: int = 1024):
        self.dimension = dimension

    def encode_query(self, query: str) -> np.ndarray:
        # Deterministic vector: each char contributes to a position.
        vec = np.zeros(self.dimension, dtype=np.float32)
        for i, ch in enumerate(query):
            vec[i % self.dimension] += ord(ch)
        # L2-normalize for cosine comparison
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec

    async def encode_query_async(self, query: str) -> np.ndarray:
        return self.encode_query(query)

    def encode_papers(self, papers: list, batch_size: int | None = None) -> np.ndarray:
        return np.stack([self.encode_query(p.tldr or p.title or "") for p in papers])

    def encode_passage_for_paper(self, paper) -> np.ndarray:
        return self.encode_query(paper.tldr or paper.title or "")


class FakeVectorRepository:
    """Fake vector repository backed by an in-memory list."""

    def __init__(self, embedding_service: EmbeddingService, papers: list[Paper]):
        self.embedding_service = embedding_service
        self._papers = papers
        self._vectors = {
            p.id: embedding_service.encode_passage_for_paper(p) for p in papers
        }

    def upsert(self, papers: list[PaperEmbeddingPayload]) -> int:
        for paper in papers:
            self._vectors[paper.paper_id] = paper.embedding
        return len(papers)

    def search(
        self,
        query_vector: np.ndarray,
        top_k: int = 10,
        filters: dict | None = None,
    ) -> list[SemanticSearchResult]:
        # Compute cosine similarity against stored vectors.
        scores = []
        for paper_id, vector in self._vectors.items():
            score = float(np.dot(query_vector, vector))
            scores.append((paper_id, score))

        # Apply simple metadata filters if provided.
        paper_by_id = {p.id: p for p in self._papers}
        if filters:
            filtered = []
            for paper_id, score in scores:
                paper = paper_by_id.get(paper_id)
                if paper is None:
                    continue
                match = True
                for field, value in filters.items():
                    if field == "study_type" and paper.study_type != value:
                        match = False
                        break
                    if field == "specialty_tags":
                        import json

                        try:
                            tags = json.loads(paper.specialty_tags)
                            if value not in tags:
                                match = False
                                break
                        except (json.JSONDecodeError, TypeError):
                            match = False
                            break
                if match:
                    filtered.append((paper_id, score))
            scores = filtered

        scores.sort(key=lambda x: x[1], reverse=True)
        results = []
        for paper_id, score in scores[:top_k]:
            paper = paper_by_id[paper_id]
            results.append(
                SemanticSearchResult(
                    paper_id=paper_id,
                    score=score,
                    title=paper.title or "",
                    tldr=paper.tldr or "",
                    study_type=paper.study_type or "",
                    specialty_tags=[],
                )
            )
        return results


class FakePaperRepository:
    """Fake paper repository backed by an in-memory list."""

    def __init__(self, papers: list[Paper]):
        self._papers = papers

    def get_by_ids(self, paper_ids: list[str]) -> list[Paper]:
        paper_by_id = {p.id: p for p in self._papers}
        return [paper_by_id[pid] for pid in paper_ids if pid in paper_by_id]

    def get_all(self, batch_size: int | None = None, limit: int | None = None):
        for paper in self._papers[:limit]:
            yield paper


@pytest.fixture
def sample_papers():
    return [
        Paper(
            id="PMC_1",
            title="Semaglutide for obesity",
            tldr="GLP-1 receptor agonist reduces body weight in adults.",
            study_type="RCT",
            specialty_tags='["endocrinology"]',
        ),
        Paper(
            id="PMC_2",
            title="Mediterranean diet and cardiovascular health",
            tldr="Olive oil rich diet improves heart health markers.",
            study_type="cohort",
            specialty_tags='["nutrition", "cardiology"]',
        ),
    ]


@pytest.fixture
def search_service(sample_papers):
    embedding_service = FakeEmbeddingService(dimension=1024)
    vector_repository = FakeVectorRepository(embedding_service, sample_papers)
    paper_repository = FakePaperRepository(sample_papers)
    return SemanticSearchService(
        embedding_service=embedding_service,
        vector_repository=vector_repository,
        paper_repository=paper_repository,
    )


def test_normalize_query_cleans_whitespace():
    assert normalize_query("  diabetes\n\n management  ") == "diabetes management"


def test_normalize_query_empty():
    assert normalize_query("   ") == ""


def test_search_returns_ranked_papers(search_service):
    results = search_service.search(query="obesity treatment", top_k=2)

    assert len(results) == 2
    # Results must be sorted by descending score.
    assert results[0].score >= results[1].score
    assert all(isinstance(r.paper, Paper) for r in results)


def test_search_respects_top_k(search_service):
    results = search_service.search(query="health", top_k=1)
    assert len(results) == 1


def test_search_filters_by_study_type(search_service):
    results = search_service.search(
        query="health",
        top_k=10,
        filters={"study_type": "RCT"},
    )
    assert len(results) == 1
    assert results[0].paper.study_type == "RCT"


def test_search_empty_query_returns_empty(search_service):
    assert search_service.search(query="   ") == []


def test_search_paper_not_in_db_is_skipped(sample_papers):
    # Only one paper in the repository, but two in the vector store.
    embedding_service = FakeEmbeddingService(dimension=1024)
    vector_repository = FakeVectorRepository(embedding_service, sample_papers)
    paper_repository = FakePaperRepository([sample_papers[0]])

    service = SemanticSearchService(
        embedding_service=embedding_service,
        vector_repository=vector_repository,
        paper_repository=paper_repository,
    )

    results = service.search(query="health", top_k=10)
    # Only the paper that exists in the DB should be returned.
    assert all(r.paper.id == "PMC_1" for r in results)


@pytest.mark.asyncio
async def test_search_async(search_service):
    results = await search_service.search_async(query="obesity treatment", top_k=2)
    assert len(results) == 2
    assert results[0].score >= results[1].score
