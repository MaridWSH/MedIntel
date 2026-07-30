"""Anonymous survey submissions."""

from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session

from core.auth import enforce_rate_limit, validate_cookie_request_origin
from database import get_db
from schemas import FeedbackSubmissionResponse, ProductFeedbackCreate, ResearchSurveyCreate
from services import feedback as feedback_service

router = APIRouter(prefix="/feedback", tags=["feedback"])


@router.post(
    "/research-methods",
    response_model=FeedbackSubmissionResponse,
    status_code=status.HTTP_201_CREATED,
)
def submit_research_survey(
    body: ResearchSurveyCreate,
    request: Request,
    db: Session = Depends(get_db),
):
    """Store one anonymous response about medical literature-search habits."""
    validate_cookie_request_origin(request)
    enforce_rate_limit(request, "research_survey", limit=10, window_seconds=3600)
    if body.website:
        return FeedbackSubmissionResponse(message="Thank you for your response.")

    return feedback_service.submit_research_survey(body, db)


@router.post(
    "/product",
    response_model=FeedbackSubmissionResponse,
    status_code=status.HTTP_201_CREATED,
)
def submit_product_feedback(
    body: ProductFeedbackCreate,
    request: Request,
    db: Session = Depends(get_db),
):
    """Store one product-rating and feature-feedback response."""
    validate_cookie_request_origin(request)
    enforce_rate_limit(request, "product_feedback", limit=10, window_seconds=3600)
    if body.website:
        return FeedbackSubmissionResponse(message="Thank you for your response.")

    return feedback_service.submit_product_feedback(body, db)
