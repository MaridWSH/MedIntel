"""Admin-only feedback response endpoints."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from core.auth import get_current_admin
from database import get_db
from database.models import User
from schemas import ProductFeedbackOut, ResearchSurveyOut
from services import feedback as feedback_service
from repositories import feedback as feedback_repository

router = APIRouter(prefix="/feedback", tags=["admin-feedback"])


@router.get("/research-methods", response_model=list[ResearchSurveyOut])
def list_research_survey_responses(
    limit: int = Query(100, ge=1, le=500),
    _admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Return recent research-method responses to administrators."""
    rows = feedback_repository.list_research_surveys(db, limit)
    return feedback_service.research_surveys_to_api(rows)


@router.get("/product", response_model=list[ProductFeedbackOut])
def list_product_feedback(
    limit: int = Query(100, ge=1, le=500),
    _admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Return recent product feedback to administrators."""
    rows = feedback_repository.list_product_feedback(db, limit)
    return feedback_service.product_feedback_to_api(rows)
