"""FastAPI dependency injection providers for search."""

from __future__ import annotations

from fastapi import Depends
from sqlalchemy.orm import Session

from database import get_db
from repositories.paper_repository import SQLAlchemyPaperRepository
from repositories.vector_repository import QdrantVectorRepository
from services.embedding_service import get_embedding_service
from services.hybrid_search_service import HybridSearchService
from services.qdrant_service import get_qdrant_client


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


def get_hybrid_search_service(
    db: Session = Depends(get_db),
    paper_repository=Depends(get_paper_repository),
    vector_repository=Depends(get_vector_repository),
):
    """Return a configured HybridSearchService for the current request."""
    return HybridSearchService(
        db=db,
        paper_repository=paper_repository,
        vector_repository=vector_repository,
        embedding_service=get_embedding_service(),
    )