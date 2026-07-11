"""Semantic search router for MedIntel.

Exposes the semantic search pipeline as a FastAPI endpoint.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Security, status

from auth import get_current_user
from models import User
from api.dependencies import get_semantic_search_service
from schemas import (
    SemanticSearchRequest,
    SemanticSearchResponse,
    SemanticSearchResult,
)
from services.semantic_search_service import SemanticSearchService

router = APIRouter(prefix="/search", tags=["semantic-search"])


@router.post("", response_model=SemanticSearchResponse)
def semantic_search(
    request: SemanticSearchRequest,
    current_user: User = Security(get_current_user),
    service: SemanticSearchService = Depends(get_semantic_search_service),
):
    """Search papers semantically using BGE-M3 embeddings and Qdrant.

    This endpoint embeds only the query; paper embeddings are pre-computed
    during indexing.
    """
    try:
        results = service.search(
            query=request.query,
            top_k=request.top_k,
            filters=request.filters,
        )
    except Exception as exc:
        # Logged by the service layer; return a generic error to the caller.
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Semantic search unavailable: {exc}",
        ) from exc

    items = [
        SemanticSearchResult(
            id=result.paper.id,
            title=result.paper.title or "",
            tldr=result.paper.tldr or "",
            study_type=result.paper.study_type or "",
            specialty_tags=(
                __parse_tags(result.paper.specialty_tags)
                if result.paper.specialty_tags
                else []
            ),
            journal=getattr(result.paper, "journal", ""),
            doi=getattr(result.paper, "doi", ""),
            author_list=getattr(result.paper, "author_list", ""),
            authors_count=getattr(result.paper, "authors_count", None),
            centers_count=getattr(result.paper, "centers_count", None),
            overall_evidence_level=(
                __parse_findings(result.paper.key_findings).get("overall_evidence_level")
            ),
            sample_size=__parse_findings(result.paper.key_findings).get("sample_size"),
            score=result.score,
        )
        for result in results
    ]

    return SemanticSearchResponse(
        query=request.query,
        top_k=request.top_k,
        total=len(items),
        items=items,
    )


def __parse_tags(raw: str) -> list[str]:
    """Parse a JSON-encoded specialty_tags string into a list of strings."""
    import json

    try:
        tags = json.loads(raw)
        if isinstance(tags, list):
            return [str(tag) for tag in tags]
    except (json.JSONDecodeError, TypeError):
        pass
    return []


def __parse_findings(raw: str) -> dict[str, str]:
    """Parse the JSON-encoded key findings object from a Paper row."""
    import json

    try:
        data = json.loads(raw)
        if isinstance(data, dict):
            return {str(k): str(v) for k, v in data.items() if v is not None}
    except (json.JSONDecodeError, TypeError):
        pass
    return {}
