"""Semantic search service for MedIntel.

Responsibilities:
    - Normalize user queries.
    - Generate query embeddings (only the query is embedded during search).
    - Search Qdrant for similar vectors.
    - Retrieve paper IDs from search results.
    - Load paper metadata from PostgreSQL/SQLite.
    - Return ranked results enriched with full paper rows.

The service is intentionally decoupled from ingestion, OCR, XML parsing, and
LLM extraction. It only reads already-persisted papers and indexes them into
Qdrant for vector search.
"""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass
from typing import Any

from sqlalchemy.orm import Session

from app.db.models import Paper
from app.repositories.paper_repository import PaperRepository, SQLAlchemyPaperRepository
from app.repositories.vector_repository import VectorRepository
from app.services.embedding_service import EmbeddingService, encode_papers, get_embedding_service

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Result data structure
# ---------------------------------------------------------------------------


@dataclass
class SemanticSearchResult:
    """A single ranked semantic search result with its full paper metadata."""

    paper: Paper
    score: float


# ---------------------------------------------------------------------------
# Query normalization
# ---------------------------------------------------------------------------


def normalize_query(query: str) -> str:
    """Normalize a user query before embedding.

    Steps:
        - Trim whitespace
        - Collapse multiple spaces/newlines
        - Remove non-informative leading/trailing punctuation
    """
    if not query:
        return ""
    query = re.sub(r"[\r\n]+", " ", query)
    query = re.sub(r"\s+", " ", query).strip()
    return query


# ---------------------------------------------------------------------------
# Core service
# ---------------------------------------------------------------------------


class SemanticSearchService:
    """Service that orchestrates query normalization, embedding, and vector search.

    Dependencies are injected via the constructor, making the service easy to
    unit test with fake repositories and embedding models.
    """

    def __init__(
        self,
        embedding_service: EmbeddingService,
        vector_repository: VectorRepository,
        paper_repository: PaperRepository,
    ):
        """Initialize the semantic search service.

        Args:
            embedding_service: Implementation of EmbeddingService.
            vector_repository: Implementation of VectorRepository (e.g., Qdrant).
            paper_repository: Implementation of PaperRepository (e.g., SQLAlchemy).
        """
        self._embedding_service = embedding_service
        self._vector_repository = vector_repository
        self._paper_repository = paper_repository

    def search(
        self,
        query: str,
        top_k: int = 10,
        filters: dict[str, Any] | None = None,
    ) -> list[SemanticSearchResult]:
        """Run the full semantic search pipeline and return ranked Paper rows.

        Pipeline:
            User Query → Normalize Query → Embedding Generation → Qdrant Search
            → Retrieve Paper IDs → Load Paper Metadata from DB → Return Ranked Results

        IMPORTANT: Only the query is embedded during search. Paper embeddings are
        pre-computed during indexing and never recomputed here.

        Args:
            query: Raw user query string.
            top_k: Maximum number of results to return.
            filters: Optional metadata filters (e.g., {"study_type": "RCT"}).

        Returns:
            A list of SemanticSearchResult sorted by descending similarity score.
        """
        normalized = normalize_query(query)
        if not normalized:
            return []

        query_vector = self._embedding_service.encode_query(normalized)
        vector_results = self._vector_repository.search(
            query_vector,
            top_k=top_k,
            filters=filters,
        )

        if not vector_results:
            return []

        paper_ids = [r.paper_id for r in vector_results]
        papers = self._paper_repository.get_by_ids(paper_ids)
        paper_by_id = {p.id: p for p in papers}

        ranked: list[SemanticSearchResult] = []
        for result in vector_results:
            paper = paper_by_id.get(result.paper_id)
            if paper is None:
                logger.warning(
                    "Paper %s exists in Qdrant but not in the database; skipping",
                    result.paper_id,
                )
                continue
            ranked.append(SemanticSearchResult(paper=paper, score=result.score))

        return ranked

    async def search_async(
        self,
        query: str,
        top_k: int = 10,
        filters: dict[str, Any] | None = None,
    ) -> list[SemanticSearchResult]:
        """Async version of search.

        Embedding generation runs in a thread pool so the event loop stays free.
        Qdrant search and database lookup remain synchronous because the Python
        SDKs do not provide async APIs.
        """
        normalized = normalize_query(query)
        if not normalized:
            return []

        query_vector = await self._embedding_service.encode_query_async(normalized)
        vector_results = self._vector_repository.search(
            query_vector,
            top_k=top_k,
            filters=filters,
        )

        if not vector_results:
            return []

        paper_ids = [r.paper_id for r in vector_results]
        papers = self._paper_repository.get_by_ids(paper_ids)
        paper_by_id = {p.id: p for p in papers}

        ranked: list[SemanticSearchResult] = []
        for result in vector_results:
            paper = paper_by_id.get(result.paper_id)
            if paper is None:
                logger.warning(
                    "Paper %s exists in Qdrant but not in the database; skipping",
                    result.paper_id,
                )
                continue
            ranked.append(SemanticSearchResult(paper=paper, score=result.score))

        return ranked


# ---------------------------------------------------------------------------
# Dependency injection helpers
# ---------------------------------------------------------------------------


def get_semantic_search_service(
    db: Session,
    embedding_service: EmbeddingService | None = None,
    vector_repository: VectorRepository | None = None,
) -> SemanticSearchService:
    """Build a SemanticSearchService with default Qdrant and SQLAlchemy repositories.

    Args:
        db: SQLAlchemy session.
        embedding_service: Optional embedding service. Defaults to the singleton.
        vector_repository: Optional vector repository. Defaults to Qdrant.

    Returns:
        A configured SemanticSearchService instance.
    """
    from app.services.qdrant_service import get_qdrant_client

    if embedding_service is None:
        embedding_service = get_embedding_service()
    if vector_repository is None:
        from app.repositories.vector_repository import QdrantVectorRepository

        vector_repository = QdrantVectorRepository(client=get_qdrant_client())

    paper_repository = SQLAlchemyPaperRepository(db)
    return SemanticSearchService(
        embedding_service=embedding_service,
        vector_repository=vector_repository,
        paper_repository=paper_repository,
    )


# ---------------------------------------------------------------------------
# Indexing helpers (read-only w.r.t. the ingestion pipeline)
# ---------------------------------------------------------------------------


def build_paper_payload(
    paper: Paper,
    embedding_service: EmbeddingService,
) -> Any:
    """Convert a Paper ORM row into a Qdrant upsert payload with embedding.

    Args:
        paper: Paper ORM row.
        embedding_service: Embedding service used to generate the vector.

    Returns:
        PaperEmbeddingPayload ready for the vector repository.
    """
    import json

    embedding = embedding_service.encode_passage_for_paper(paper)

    specialty_tags: list[str] = []
    if paper.specialty_tags:
        try:
            tags = json.loads(paper.specialty_tags)
            if isinstance(tags, list):
                specialty_tags = [str(tag) for tag in tags]
        except (json.JSONDecodeError, TypeError):
            logger.warning("Failed to parse specialty_tags for paper %s", paper.id)

    from app.services.qdrant_service import PaperEmbeddingPayload

    return PaperEmbeddingPayload(
        paper_id=paper.id,
        embedding=embedding,
        title=paper.title or "",
        tldr=paper.tldr or "",
        study_type=paper.study_type or "",
        specialty_tags=specialty_tags,
    )


def index_papers(
    db: Session,
    embedding_service: EmbeddingService | None = None,
    vector_repository: VectorRepository | None = None,
    batch_size: int = 100,
    limit: int | None = None,
) -> int:
    """Index papers from the database into the vector store.

    This reads papers from the existing `papers` table and upserts their
    embeddings into the vector repository. It does NOT modify the ingestion
    pipeline.

    Args:
        db: SQLAlchemy session.
        embedding_service: Optional embedding service. Defaults to the singleton.
        vector_repository: Optional vector repository. Defaults to Qdrant.
        batch_size: Number of papers to embed and upsert per batch.
        limit: Optional cap on the number of papers to index.

    Returns:
        Total number of papers indexed.
    """
    if embedding_service is None:
        embedding_service = get_embedding_service()
    if vector_repository is None:
        from app.repositories.vector_repository import QdrantVectorRepository

        vector_repository = QdrantVectorRepository()

    paper_repository = SQLAlchemyPaperRepository(db)
    total_indexed = 0
    batch: list[Any] = []

    for paper in paper_repository.get_all(batch_size=batch_size, limit=limit):
        batch.append(build_paper_payload(paper, embedding_service))

        if len(batch) >= batch_size:
            vector_repository.upsert(batch)
            total_indexed += len(batch)
            batch = []

    if batch:
        vector_repository.upsert(batch)
        total_indexed += len(batch)

    return total_indexed
