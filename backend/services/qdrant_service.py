"""Qdrant service for the MedIntel Semantic Search module.

Responsibilities:
    - Create and configure the Qdrant collection.
    - Insert vectors (upsert).
    - Update existing vectors.
    - Delete vectors by ID.
    - Search vectors by cosine similarity.
    - Search vectors with metadata filters.

This module provides low-level Qdrant primitives. Higher-level repository
abstractions live in repositories.vector_repository.
"""

from __future__ import annotations

import logging
import os
import time
import uuid
from dataclasses import dataclass
from typing import Any, List

import numpy as np
from qdrant_client import QdrantClient
from qdrant_client.http import models as rest

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

QDRANT_URL = os.environ.get("MEDINTEL_QDRANT_URL", "http://localhost:6333")
QDRANT_API_KEY = os.environ.get("MEDINTEL_QDRANT_API_KEY", None)
QDRANT_COLLECTION_NAME = os.environ.get("MEDINTEL_QDRANT_COLLECTION", "papers")
EMBEDDING_DIMENSION = int(os.environ.get("MEDINTEL_EMBEDDING_DIMENSION", "1024"))
SCORE_THRESHOLD = float(os.environ.get("MEDINTEL_SEARCH_SCORE_THRESHOLD", "0.65"))

# Deterministic UUID namespace for paper IDs.
# Using UUIDv5 means the same paper_id always maps to the same UUID.
_PAPER_ID_NAMESPACE = uuid.UUID("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11")


def _paper_id_to_uuid(paper_id: str) -> str:
    """Convert a paper ID to a deterministic string UUID.

    Qdrant accepts string IDs safely, and this ensures the PointStruct id is
    always a valid string representation.
    """
    return str(uuid.uuid5(_PAPER_ID_NAMESPACE, paper_id))


# ---------------------------------------------------------------------------
# Data structures
# ---------------------------------------------------------------------------


@dataclass
class PaperEmbeddingPayload:
    """A paper together with its dense embedding, ready for Qdrant upsert."""

    paper_id: str
    embedding: np.ndarray
    title: str
    tldr: str
    study_type: str
    specialty_tags: list[str]


@dataclass
class SemanticSearchResult:
    """One result returned from Qdrant semantic search."""

    paper_id: str
    score: float
    title: str
    tldr: str
    study_type: str
    specialty_tags: list[str]


# ---------------------------------------------------------------------------
# Client management
# ---------------------------------------------------------------------------


def get_qdrant_client() -> QdrantClient:
    """Return a Qdrant client configured from environment variables.

    Supports:
        - Remote Qdrant: http://localhost:6333
        - Local mode: set MEDINTEL_QDRANT_URL to ':memory:' or a path prefix
    """
    kwargs: dict[str, Any] = {}
    if QDRANT_URL == ":memory:":
        kwargs["location"] = ":memory:"
    else:
        kwargs["url"] = QDRANT_URL
    if QDRANT_API_KEY:
        kwargs["api_key"] = QDRANT_API_KEY
    return QdrantClient(**kwargs)


# ---------------------------------------------------------------------------
# Collection management
# ---------------------------------------------------------------------------


def ensure_collection(client: QdrantClient | None = None) -> QdrantClient:
    """Create the papers collection if it does not already exist."""
    client = client or get_qdrant_client()

    try:
        collections = client.get_collections().collections
        collection_names = {c.name for c in collections}

        if QDRANT_COLLECTION_NAME not in collection_names:
            logger.info("Creating Qdrant collection: %s", QDRANT_COLLECTION_NAME)
            client.create_collection(
                collection_name=QDRANT_COLLECTION_NAME,
                vectors_config=rest.VectorParams(
                    size=EMBEDDING_DIMENSION,
                    distance=rest.Distance.COSINE,
                ),
            )
            logger.info("Qdrant collection created: %s", QDRANT_COLLECTION_NAME)
        return client
    except Exception as exc:
        logger.exception("Failed to ensure Qdrant collection")
        raise RuntimeError(f"Qdrant collection setup failed: {exc}") from exc


def collection_exists(client: QdrantClient | None = None) -> bool:
    """Return True if the configured collection exists in Qdrant."""
    try:
        client = client or get_qdrant_client()
        collections = client.get_collections().collections
        return any(c.name == QDRANT_COLLECTION_NAME for c in collections)
    except Exception as exc:
        logger.exception("Failed to check Qdrant collections")
        raise RuntimeError(f"Qdrant check failed: {exc}") from exc


def delete_collection(client: QdrantClient | None = None) -> None:
    """Drop the configured Qdrant collection."""
    client = client or get_qdrant_client()
    try:
        logger.warning("Dropping Qdrant collection: %s", QDRANT_COLLECTION_NAME)
        client.delete_collection(collection_name=QDRANT_COLLECTION_NAME)
    except Exception as exc:
        logger.exception("Failed to drop Qdrant collection")
        raise RuntimeError(f"Qdrant collection deletion failed: {exc}") from exc


# ---------------------------------------------------------------------------
# Vector operations
# ---------------------------------------------------------------------------


def _payload_from_paper(paper: PaperEmbeddingPayload) -> dict[str, Any]:
    """Build the Qdrant payload from a paper embedding payload."""
    return {
        "paper_id": paper.paper_id,
        "title": paper.title,
        "tldr": paper.tldr,
        "study_type": paper.study_type,
        "specialty_tags": paper.specialty_tags,
    }


def _point_from_paper(paper: PaperEmbeddingPayload) -> rest.PointStruct:
    """Convert a PaperEmbeddingPayload into a Qdrant PointStruct."""
    vector = np.asarray(paper.embedding, dtype=np.float32).tolist()
    point_id = _paper_id_to_uuid(paper.paper_id)
    return rest.PointStruct(
        id=point_id,
        vector=vector,
        payload=_payload_from_paper(paper),
    )


def upsert_papers(
    papers: list[PaperEmbeddingPayload],
    client: QdrantClient | None = None,
    batch_size: int = 100,
) -> int:
    """Insert or replace paper vectors in Qdrant (upsert).

    Args:
        papers: List of PaperEmbeddingPayload objects to upsert.
        client: Optional existing Qdrant client.
        batch_size: Number of vectors per upsert batch.

    Returns:
        Number of vectors upserted.
    """
    if not papers:
        return 0

    client = ensure_collection(client)
    points = [_point_from_paper(paper) for paper in papers]

    try:
        for i in range(0, len(points), batch_size):
            batch = points[i : i + batch_size]
            client.upsert(
                collection_name=QDRANT_COLLECTION_NAME,
                points=batch,
            )
            logger.debug("Upserted %d vectors to Qdrant", len(batch))
        return len(points)
    except Exception as exc:
        logger.exception("Failed to upsert %d papers", len(papers))
        raise RuntimeError(f"Qdrant upsert failed: {exc}") from exc


def update_paper(
    paper: PaperEmbeddingPayload,
    client: QdrantClient | None = None,
) -> None:
    """Update an existing paper vector and payload in Qdrant.

    Convenience wrapper over upsert for a single paper.
    """
    upsert_papers([paper], client=client, batch_size=1)


def update_vectors_only(
    paper_ids: list[str],
    embeddings: list[np.ndarray],
    client: QdrantClient | None = None,
) -> None:
    """Update only the vector for existing points without overwriting payloads."""
    if not paper_ids or not embeddings:
        return

    client = ensure_collection(client)
    points = []
    for paper_id, embedding in zip(paper_ids, embeddings):
        vector = np.asarray(embedding, dtype=np.float32).tolist()
        points.append(rest.PointStruct(id=_paper_id_to_uuid(paper_id), vector=vector))

    try:
        client.upsert(collection_name=QDRANT_COLLECTION_NAME, points=points)
    except Exception as exc:
        logger.exception("Failed to update vectors")
        raise RuntimeError(f"Qdrant vector update failed: {exc}") from exc


def delete_papers(paper_ids: list[str], client: QdrantClient | None = None) -> None:
    """Remove paper vectors from Qdrant by their IDs."""
    if not paper_ids:
        return

    client = client or get_qdrant_client()
    try:
        point_ids = [_paper_id_to_uuid(pid) for pid in paper_ids]
        client.delete(
            collection_name=QDRANT_COLLECTION_NAME,
            points_selector=rest.PointIdsList(points=point_ids),
        )
        logger.info("Deleted %d vectors from Qdrant", len(paper_ids))
    except Exception as exc:
        logger.exception("Failed to delete papers from Qdrant")
        raise RuntimeError(f"Qdrant delete failed: {exc}") from exc


def count_papers(client: QdrantClient | None = None) -> int:
    """Return the number of vectors stored in the Qdrant collection."""
    client = ensure_collection(client)
    try:
        count = client.count(collection_name=QDRANT_COLLECTION_NAME, exact=True)
        return count.count
    except Exception as exc:
        logger.exception("Failed to count Qdrant vectors")
        raise RuntimeError(f"Qdrant count failed: {exc}") from exc


# ---------------------------------------------------------------------------
# Search operations
# ---------------------------------------------------------------------------


def _search_result_from_record(record) -> SemanticSearchResult:
    """Convert a Qdrant search result into a SemanticSearchResult."""
    payload = record.payload or {}
    # Prefer the original paper_id stored in the payload; fall back to stringifying the UUID.
    paper_id = payload.get("paper_id") or str(record.id)
    return SemanticSearchResult(
        paper_id=paper_id,
        score=record.score,
        title=payload.get("title", ""),
        tldr=payload.get("tldr", ""),
        study_type=payload.get("study_type", ""),
        specialty_tags=payload.get("specialty_tags", []) or [],
    )


def search_similar(
    query_vector: np.ndarray,
    top_k: int = 5,
    score_threshold: float | None = None,
    client: QdrantClient | None = None,
) -> list[SemanticSearchResult]:
    """Search Qdrant for papers semantically similar to the query vector."""
    client = ensure_collection(client)
    vector = np.asarray(query_vector, dtype=np.float32).tolist()

    try:
        t_start = time.perf_counter()
        response = client.query_points(
            collection_name=QDRANT_COLLECTION_NAME,
            query=vector,
            limit=top_k,
            with_payload=True,
        )
        results = [_search_result_from_record(record) for record in response.points]
        t_elapsed = time.perf_counter() - t_start
        logger.info(
            "Qdrant search_similar: top_k=%d, raw_results=%d, scores=%s, time=%.3fs",
            top_k,
            len(results),
            [round(r.score, 4) for r in results],
            t_elapsed,
        )
        return results
    except Exception as exc:
        logger.exception("Qdrant semantic search failed")
        raise RuntimeError(f"Qdrant search failed: {exc}") from exc


def search_with_filter(
    query_vector: np.ndarray,
    filters: dict[str, Any],
    top_k: int = 5,
    score_threshold: float | None = None,
    client: QdrantClient | None = None,
) -> list[SemanticSearchResult]:
    """Search Qdrant with metadata filters.

    Supported filters:
        - {"study_type": "RCT"}
        - {"specialty_tags": "nutrition"}
        - {"study_type": ["RCT", "cohort"]}
    """
    client = ensure_collection(client)
    vector = np.asarray(query_vector, dtype=np.float32).tolist()

    conditions: list[rest.FieldCondition] = []
    for field, value in filters.items():
        if isinstance(value, list):
            conditions.append(
                rest.FieldCondition(key=field, match=rest.MatchAny(any=value))
            )
        else:
            conditions.append(
                rest.FieldCondition(key=field, match=rest.MatchValue(value=value))
            )

    filter_object = rest.Filter(must=conditions) if conditions else None

    try:
        t_start = time.perf_counter()
        response = client.query_points(
            collection_name=QDRANT_COLLECTION_NAME,
            query=vector,
            query_filter=filter_object,
            limit=top_k,
            with_payload=True,
        )
        results = [_search_result_from_record(record) for record in response.points]
        t_elapsed = time.perf_counter() - t_start
        logger.info(
            "Qdrant search_with_filter: top_k=%d, filters=%s, raw_results=%d, scores=%s, time=%.3fs",
            top_k,
            filters,
            len(results),
            [round(r.score, 4) for r in results],
            t_elapsed,
        )
        return results
    except Exception as exc:
        logger.exception("Qdrant filtered search failed")
        raise RuntimeError(f"Qdrant filtered search failed: {exc}") from exc


def scroll_all(
    batch_size: int = 1000,
    client: QdrantClient | None = None,
) -> list[SemanticSearchResult]:
    """Scroll through all vectors in the collection.

    Useful for inspection or export. Not recommended for large-scale retrieval.
    """
    client = ensure_collection(client)
    all_results: list[SemanticSearchResult] = []
    offset = None

    try:
        while True:
            records, next_offset = client.scroll(
                collection_name=QDRANT_COLLECTION_NAME,
                limit=batch_size,
                offset=offset,
                with_payload=True,
            )
            all_results.extend(_search_result_from_record(record) for record in records)

            if next_offset is None or not records:
                break
            offset = next_offset
    except Exception as exc:
        logger.exception("Qdrant scroll failed")
        raise RuntimeError(f"Qdrant scroll failed: {exc}") from exc

    return all_results
