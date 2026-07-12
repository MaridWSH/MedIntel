"""Embedding service for the MedIntel Semantic Search module.

Responsibilities:
    - Load BAAI/bge-m3 exactly once and cache it in memory.
    - Generate dense embeddings for queries and paper passages.
    - Support batch embedding for efficient indexing.
    - Provide both sync and async APIs.
    - Normalize text before embedding.

For the first version each paper is treated as a single document. The passage
used for embedding is built from:
    Title + TLDR + Study Type + Specialty Tags
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
import re
from typing import List, Protocol, runtime_checkable

import numpy as np

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

EMBEDDING_MODEL_NAME = os.environ.get("MEDINTEL_EMBEDDING_MODEL", "BAAI/bge-m3")
EMBEDDING_DIMENSION = int(os.environ.get("MEDINTEL_EMBEDDING_DIMENSION", "1024"))
QUERY_INSTRUCTION = os.environ.get(
    "MEDINTEL_QUERY_INSTRUCTION",
    "Represent this sentence for searching relevant scientific papers: ",
)
DEFAULT_BATCH_SIZE = int(os.environ.get("MEDINTEL_EMBEDDING_BATCH_SIZE", "32"))


# ---------------------------------------------------------------------------
# Protocol (interface)
# ---------------------------------------------------------------------------


@runtime_checkable
class EmbeddingService(Protocol):
    """Abstract interface for generating dense text embeddings."""

    def encode_query(self, query: str) -> np.ndarray:
        """Encode a single search query into a dense vector."""
        ...

    def encode_papers(self, papers: list, batch_size: int | None = None) -> np.ndarray:
        """Encode a batch of papers into dense vectors."""
        ...

    def encode_texts(
        self,
        texts: list[str],
        batch_size: int | None = None,
    ) -> np.ndarray:
        """Encode arbitrary text strings into dense vectors."""
        ...


# ---------------------------------------------------------------------------
# Text normalization
# ---------------------------------------------------------------------------


def normalize_text(text: str | None) -> str:
    """Clean and normalize a raw text string before embedding.

    Steps:
        - Collapse whitespace
        - Strip leading/trailing whitespace
        - Return empty string for None input
    """
    if not text:
        return ""
    text = str(text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def _build_passage_from_paper(paper) -> str:
    """Build the embedding passage for a paper.

    Combines only: Title + TLDR + Study Type + Specialty Tags.
    Detailed summaries are intentionally excluded in the first version.
    """
    parts: List[str] = [
        paper.title or "",
        paper.tldr or "",
        paper.study_type or "",
    ]

    if paper.specialty_tags:
        try:
            tags = json.loads(paper.specialty_tags)
            if isinstance(tags, list):
                parts.extend(str(tag) for tag in tags)
        except (json.JSONDecodeError, TypeError):
            logger.warning("Failed to parse specialty_tags for paper %s", getattr(paper, "id", "?"))

    return " ".join(normalize_text(part) for part in parts)


# ---------------------------------------------------------------------------
# Concrete implementation
# ---------------------------------------------------------------------------


class SentenceTransformerEmbeddingService:
    """BGE-M3 embedding service backed by sentence-transformers.

    The model is loaded lazily on first use and kept in memory. It is never
    reloaded between requests, which keeps search latency low.
    """

    def __init__(
        self,
        model_name: str | None = None,
        dimension: int | None = None,
        query_instruction: str | None = None,
        default_batch_size: int | None = None,
    ):
        """Initialize the embedding service.

        Args:
            model_name: HuggingFace sentence-transformer model name.
            dimension: Expected embedding dimension (used for validation).
            query_instruction: Prefix added to search queries.
            default_batch_size: Default batch size for encoding.
        """
        self.model_name = model_name or EMBEDDING_MODEL_NAME
        self.dimension = dimension or EMBEDDING_DIMENSION
        self.query_instruction = query_instruction or QUERY_INSTRUCTION
        self.default_batch_size = default_batch_size or DEFAULT_BATCH_SIZE
        self._model = None
        self._lock = asyncio.Lock()

    def _load_model(self):
        """Load the sentence-transformer model once and cache it."""
        if self._model is None:
            from sentence_transformers import SentenceTransformer

            logger.info("Loading embedding model: %s", self.model_name)
            self._model = SentenceTransformer(self.model_name)
            logger.info("Embedding model loaded: %s", self.model_name)
        return self._model

    def encode_texts(
        self,
        texts: list[str],
        batch_size: int | None = None,
        normalize: bool = True,
    ) -> np.ndarray:
        """Encode a list of raw texts into dense vectors.

        Args:
            texts: Raw text strings to encode.
            batch_size: Number of passages to encode per batch.
            normalize: If True, L2-normalize the output vectors.

        Returns:
            A 2D numpy array of shape (len(texts), dimension).

        Raises:
            RuntimeError: If encoding fails.
        """
        if not texts:
            return np.zeros((0, self.dimension), dtype=np.float32)

        try:
            model = self._load_model()
            cleaned = [normalize_text(t) for t in texts]
            embeddings = model.encode(
                cleaned,
                batch_size=batch_size or self.default_batch_size,
                show_progress_bar=False,
                convert_to_numpy=True,
                normalize_embeddings=normalize,
            )
            result = np.asarray(embeddings, dtype=np.float32)
            if result.shape[1] != self.dimension:
                logger.warning(
                    "Model produced dimension %d but expected %d",
                    result.shape[1],
                    self.dimension,
                )
            return result
        except Exception as exc:
            logger.exception("Failed to encode %d texts", len(texts))
            raise RuntimeError(f"Embedding generation failed: {exc}") from exc

    def encode_papers(
        self,
        papers: list,
        batch_size: int | None = None,
    ) -> np.ndarray:
        """Encode a batch of papers into dense vectors.

        Args:
            papers: List of Paper objects (or any object with title, tldr,
                    study_type, and specialty_tags attributes).
            batch_size: Number of passages to encode per batch.

        Returns:
            A 2D numpy array of shape (len(papers), dimension).
        """
        passages = [_build_passage_from_paper(paper) for paper in papers]
        return self.encode_texts(passages, batch_size=batch_size)

    def encode_passage_for_paper(self, paper) -> np.ndarray:
        """Encode a single paper object as a searchable passage.

        Args:
            paper: A Paper ORM object or any object with the required attributes.

        Returns:
            A 1D numpy array of shape (dimension,).
        """
        return self.encode_papers([paper], batch_size=1)[0]

    def encode_query(self, query: str, normalize: bool = True) -> np.ndarray:
        """Encode a single search query into a dense vector.

        The query is prefixed with an instruction tuned for retrieval tasks.

        Args:
            query: Raw user query.
            normalize: If True, L2-normalize the output vector.

        Returns:
            A 1D numpy array of shape (dimension,).
        """
        try:
            model = self._load_model()
            cleaned = normalize_text(query)
            instructed = f"{self.query_instruction}{cleaned}"
            embedding = model.encode(
                instructed,
                show_progress_bar=False,
                convert_to_numpy=True,
                normalize_embeddings=normalize,
            )
            return np.asarray(embedding, dtype=np.float32)
        except Exception as exc:
            logger.exception("Failed to encode query: %s", query)
            raise RuntimeError(f"Query embedding failed: {exc}") from exc

    # -----------------------------------------------------------------------
    # Async APIs
    # -----------------------------------------------------------------------

    async def encode_texts_async(
        self,
        texts: list[str],
        batch_size: int | None = None,
        normalize: bool = True,
        executor=None,
    ) -> np.ndarray:
        """Async wrapper around encode_texts that runs in a thread pool."""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            executor,
            self.encode_texts,
            texts,
            batch_size,
            normalize,
        )

    async def encode_query_async(
        self,
        query: str,
        normalize: bool = True,
        executor=None,
    ) -> np.ndarray:
        """Async wrapper around encode_query that runs in a thread pool."""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            executor,
            self.encode_query,
            query,
            normalize,
        )

    async def encode_papers_async(
        self,
        papers: list,
        batch_size: int | None = None,
        executor=None,
    ) -> np.ndarray:
        """Async wrapper around encode_papers."""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            executor,
            self.encode_papers,
            papers,
            batch_size,
        )


# ---------------------------------------------------------------------------
# Singleton instance for simple usage and FastAPI dependency injection
# ---------------------------------------------------------------------------

_default_service: SentenceTransformerEmbeddingService | None = None


def get_embedding_service() -> SentenceTransformerEmbeddingService:
    """Return the default singleton embedding service.

    This ensures the model is loaded only once across the application.
    """
    global _default_service
    if _default_service is None:
        _default_service = SentenceTransformerEmbeddingService()
    return _default_service


# ---------------------------------------------------------------------------
# Module-level convenience API (delegates to the singleton)
# ---------------------------------------------------------------------------


def encode_texts(texts: list[str], batch_size: int | None = None, normalize: bool = True) -> np.ndarray:
    """Encode texts using the default embedding service."""
    return get_embedding_service().encode_texts(texts, batch_size=batch_size, normalize=normalize)


def encode_papers(papers: list, batch_size: int | None = None) -> np.ndarray:
    """Encode papers using the default embedding service."""
    return get_embedding_service().encode_papers(papers, batch_size=batch_size)


def encode_passage_for_paper(paper) -> np.ndarray:
    """Encode a single paper using the default embedding service."""
    return get_embedding_service().encode_passage_for_paper(paper)


def encode_query(query: str, normalize: bool = True) -> np.ndarray:
    """Encode a query using the default embedding service."""
    return get_embedding_service().encode_query(query, normalize=normalize)


def get_model_info() -> dict[str, str | int]:
    """Return metadata about the configured embedding model."""
    return {
        "model_name": EMBEDDING_MODEL_NAME,
        "dimension": EMBEDDING_DIMENSION,
        "batch_size": DEFAULT_BATCH_SIZE,
    }
