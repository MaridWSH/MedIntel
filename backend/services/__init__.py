"""MedIntel Semantic Search services.

This package provides three service modules. Import directly to avoid circular
dependencies:

    from services.embedding_service import get_embedding_service
    from services.qdrant_service import get_qdrant_client
    from services.semantic_search_service import SemanticSearchService

Repository abstractions are in the `repositories` package.
"""

# Re-export only the embedding helpers, which have no downstream dependencies.
from .embedding_service import (
    encode_passage_for_paper,
    encode_papers,
    encode_query,
    encode_texts,
    get_embedding_service,
    get_model_info,
    normalize_text,
)

__all__ = [
    "encode_passage_for_paper",
    "encode_papers",
    "encode_query",
    "encode_texts",
    "get_embedding_service",
    "get_model_info",
    "normalize_text",
]
