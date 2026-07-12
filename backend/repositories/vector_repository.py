"""Vector repository for the MedIntel Semantic Search module.

Implements the Repository Pattern for the vector store (Qdrant). The service
layer depends on the VectorRepository protocol, not on the concrete Qdrant
client, which keeps the search logic testable and swap-able.
"""

from __future__ import annotations

from typing import Any, Protocol

import numpy as np

from typing import Any, Protocol

import numpy as np

from services.qdrant_service import (
    PaperEmbeddingPayload,
    SemanticSearchResult,
    count_papers,
    delete_papers,
    ensure_collection,
    get_qdrant_client,
    search_similar,
    search_with_filter,
    upsert_papers,
)


# ---------------------------------------------------------------------------
# Protocol (interface)
# ---------------------------------------------------------------------------


class VectorRepository(Protocol):
    """Abstract interface for vector persistence and search."""

    def upsert(self, papers: list[PaperEmbeddingPayload]) -> int:
        """Insert or replace vectors. Returns the number of vectors written."""
        ...

    def search(
        self,
        query_vector: np.ndarray,
        top_k: int = 10,
        filters: dict[str, Any] | None = None,
    ) -> list[SemanticSearchResult]:
        """Search vectors by similarity, optionally filtered by metadata."""
        ...


# ---------------------------------------------------------------------------
# Qdrant implementation
# ---------------------------------------------------------------------------


class QdrantVectorRepository:
    """Qdrant-backed implementation of VectorRepository."""

    def __init__(self, client=None, batch_size: int = 100):
        """Initialize the Qdrant vector repository.

        Args:
            client: Optional QdrantClient instance. If None, a default client
                is created from environment variables.
            batch_size: Number of vectors to upsert per Qdrant request.
        """
        self._client = client or get_qdrant_client()
        self._batch_size = batch_size
        ensure_collection(self._client)

    def upsert(self, papers: list[PaperEmbeddingPayload]) -> int:
        """Insert or replace paper vectors in Qdrant."""
        return upsert_papers(papers, client=self._client, batch_size=self._batch_size)

    def search(
        self,
        query_vector: np.ndarray,
        top_k: int = 10,
        filters: dict[str, Any] | None = None,
    ) -> list[SemanticSearchResult]:
        """Search Qdrant for vectors similar to the query vector.

        Args:
            query_vector: Dense query embedding.
            top_k: Maximum number of results to return.
            filters: Optional metadata filters (e.g., {"study_type": "RCT"}).

        Returns:
            List of SemanticSearchResult sorted by descending similarity score.
        """
        if filters:
            return search_with_filter(
                query_vector, filters, top_k=top_k, client=self._client
            )
        return search_similar(query_vector, top_k=top_k, client=self._client)

    def delete(self, paper_ids: list[str]) -> None:
        """Delete vectors by paper ID."""
        delete_papers(paper_ids, client=self._client)

    def count(self) -> int:
        """Return the number of vectors in the collection."""
        return count_papers(client=self._client)


# Backwards-compatible alias for services that expect a repository instance.
VectorRepositoryImpl = QdrantVectorRepository
