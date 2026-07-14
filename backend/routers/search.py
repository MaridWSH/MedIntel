"""Authenticated semantic-search API kept for documented API compatibility."""

import json
import logging

from fastapi import APIRouter, Depends, HTTPException, status

from api.dependencies import get_semantic_search_service
from auth import get_current_user
from models import User
from schemas import SemanticSearchRequest, SemanticSearchResponse, SemanticSearchResult
from services.semantic_search_service import SemanticSearchService

router = APIRouter(tags=["search"])
logger = logging.getLogger(__name__)


def _json_object(raw: str | None) -> dict:
    try:
        parsed = json.loads(raw) if raw else {}
    except (json.JSONDecodeError, TypeError):
        return {}
    return parsed if isinstance(parsed, dict) else {}


@router.post("/search", response_model=SemanticSearchResponse)
def semantic_search(
    body: SemanticSearchRequest,
    _current_user: User = Depends(get_current_user),
    service: SemanticSearchService = Depends(get_semantic_search_service),
):
    """Search the vector index and return ranked paper metadata."""
    try:
        results = service.search(body.query, top_k=body.top_k, filters=body.filters)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from exc
    except RuntimeError as exc:
        logger.exception("Semantic search backend is unavailable")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Semantic search is temporarily unavailable",
        ) from exc

    items = []
    for result in results:
        paper = result.paper
        findings = _json_object(getattr(paper, "key_findings", None))
        try:
            tags = json.loads(paper.specialty_tags) if paper.specialty_tags else []
        except (json.JSONDecodeError, TypeError):
            tags = []
        if not isinstance(tags, list):
            tags = []
        items.append(
            SemanticSearchResult(
                id=paper.id,
                title=paper.title or "",
                tldr=paper.tldr or "",
                study_type=paper.study_type or "",
                specialty_tags=[str(tag) for tag in tags],
                journal=getattr(paper, "journal", "") or "",
                doi=getattr(paper, "doi", "") or "",
                author_list=getattr(paper, "author_list", "") or "",
                authors_count=getattr(paper, "authors_count", 0) or 0,
                centers_count=getattr(paper, "centers_count", 0) or 0,
                overall_evidence_level=findings.get("overall_evidence_level"),
                sample_size=findings.get("sample_size"),
                score=result.score,
            )
        )

    return SemanticSearchResponse(
        query=body.query,
        top_k=body.top_k,
        total=len(items),
        items=items,
    )
