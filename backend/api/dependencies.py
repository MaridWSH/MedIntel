"""FastAPI dependency injection providers for the semantic search module.

These functions wire together the embedding service, vector repository, paper
repository, and semantic search service so routes receive ready-to-use
instances without hard-coding concrete implementations.
"""

from __future__ import annotations

from fastapi import Depends
from sqlalchemy.orm import Session

from fastapi import Depends
from sqlalchemy.orm import Session

from database import get_db
from repositories.paper_repository import SQLAlchemyPaperRepository
from repositories.vector_repository import QdrantVectorRepository
from services.embedding_service import get_embedding_service
from services.qdrant_service import get_qdrant_client
from services.semantic_search_service import SemanticSearchService


# ---------------------------------------------------------------------------
# Repository providers
# ---------------------------------------------------------------------------


def get_paper_repository(db: Session = Depends(get_db)):
    """Return a SQLAlchemy-backed paper repository for the current request."""
    return SQLAlchemyPaperRepository(db)


def get_vector_repository():
    """Return a Qdrant-backed vector repository.

    The repository is created per request to avoid sharing a client across
    async contexts. QdrantClient is thread-safe and lightweight.
    """
    return QdrantVectorRepository(client=get_qdrant_client())


# ---------------------------------------------------------------------------
# Service providers
# ---------------------------------------------------------------------------


def get_semantic_search_service(
    paper_repository=Depends(get_paper_repository),
    vector_repository=Depends(get_vector_repository),
):
    """Return a configured SemanticSearchService for the current request."""
    embedding_service = get_embedding_service()
    return SemanticSearchService(
        embedding_service=embedding_service,
        vector_repository=vector_repository,
        paper_repository=paper_repository,
    )
