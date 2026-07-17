"""Unit tests for the embedding service.

These tests do not load the real BGE-M3 model. They exercise text
normalization and the service interface using a mocked model.
"""

from __future__ import annotations

import numpy as np
import pytest

from app.services.embedding_service import (
    SentenceTransformerEmbeddingService,
    normalize_text,
)


def test_normalize_text_collapses_whitespace():
    assert normalize_text("hello\n\n  world") == "hello world"


def test_normalize_text_trims():
    assert normalize_text("  spaced  ") == "spaced"


def test_normalize_text_none():
    assert normalize_text(None) == ""


def test_embedding_service_dimension_and_model_name():
    service = SentenceTransformerEmbeddingService(
        model_name="BAAI/bge-m3",
        dimension=1024,
        default_batch_size=16,
    )
    assert service.model_name == "BAAI/bge-m3"
    assert service.dimension == 1024
    assert service.default_batch_size == 16


def test_embedding_service_encode_texts_empty():
    """Empty input should return an empty array with the configured dimension."""
    service = SentenceTransformerEmbeddingService(dimension=512)
    result = service.encode_texts([])
    assert result.shape == (0, 512)


# The following test uses a monkeypatched model to avoid downloading BGE-M3.
def test_embedding_service_encode_with_mocked_model(monkeypatch):
    service = SentenceTransformerEmbeddingService(dimension=3)

    class FakeModel:
        def encode(self, texts, **kwargs):
            # Return one zero vector per text with the requested dimension.
            return np.zeros((len(texts), 3), dtype=np.float32)

    monkeypatch.setattr(service, "_model", FakeModel())

    result = service.encode_texts(["foo", "bar"])
    assert result.shape == (2, 3)


def test_embedding_service_query_instruction(monkeypatch):
    service = SentenceTransformerEmbeddingService(
        dimension=3,
        query_instruction="search: ",
    )

    captured = []

    class FakeModel:
        def encode(self, text, **kwargs):
            captured.append(text)
            return np.zeros(3, dtype=np.float32)

    monkeypatch.setattr(service, "_model", FakeModel())
    service.encode_query("diabetes")
    assert captured == ["search: diabetes"]
