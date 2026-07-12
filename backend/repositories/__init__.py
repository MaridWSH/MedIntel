"""MedIntel Semantic Search repositories.

This package implements the Repository Pattern for the semantic search module:
- paper_repository: abstracts paper metadata persistence in PostgreSQL/SQLite.
- vector_repository: abstracts vector persistence and search in Qdrant.
"""

from .paper_repository import PaperRepository, SQLAlchemyPaperRepository
from .vector_repository import (
    QdrantVectorRepository,
    VectorRepository,
    VectorRepositoryImpl,
)

__all__ = [
    "PaperRepository",
    "SQLAlchemyPaperRepository",
    "VectorRepository",
    "QdrantVectorRepository",
    "VectorRepositoryImpl",
]
