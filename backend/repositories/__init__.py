"""CiteRounds data repositories.

- catalogue: paper metadata persistence for the catalogue endpoints.
- paper_repository: protocol-based repository used by the semantic search service.
- vector_repository: protocol-based repository for the Qdrant vector store.
"""

from .catalogue import current_corpus_count, get_by_id, keyword_search, list_papers
from .paper_repository import PaperRepository, SQLAlchemyPaperRepository
from .vector_repository import (
    QdrantVectorRepository,
    VectorRepository,
    VectorRepositoryImpl,
)

__all__ = [
    "current_corpus_count",
    "get_by_id",
    "keyword_search",
    "list_papers",
    "PaperRepository",
    "SQLAlchemyPaperRepository",
    "VectorRepository",
    "QdrantVectorRepository",
    "VectorRepositoryImpl",
]
