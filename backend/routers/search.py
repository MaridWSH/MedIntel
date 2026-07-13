"""Search router — single hybrid search endpoint at POST /api/search."""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from api.dependencies import get_hybrid_search_service
from database import get_db
from schemas import HybridSearchRequest, HybridSearchResponse
from services.hybrid_search_service import HybridSearchService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/search", tags=["search"])


@router.post(
    "",
    response_model=HybridSearchResponse,
    summary="Hybrid (semantic + keyword) search across papers",
    description=(
        "Combines BGE-M3 semantic search on Qdrant with PostgreSQL full-text "
        "search (websearch_to_tsquery + ts_rank_cd), merges results with "
        "Reciprocal Rank Fusion, applies filters, sorts, and returns one "
        "paginated page."
    ),
)
def hybrid_search(
    request: HybridSearchRequest,
    service: HybridSearchService = Depends(get_hybrid_search_service),
):
    """Execute a hybrid search and return one page of results."""
    try:
        return service.search(request)
    except Exception as exc:
        logger.exception("Hybrid search failed")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Search failed: {exc}",
        ) from exc