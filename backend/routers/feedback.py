"""Anonymous survey submissions and administrator-only response retrieval."""

import json

from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.orm import Session

from auth import enforce_rate_limit, get_current_admin, validate_cookie_request_origin
from database import get_db
from models import ProductFeedbackSubmission, ResearchSurveySubmission, User
from schemas import (
    FeedbackSubmissionResponse,
    ProductFeedbackCreate,
    ProductFeedbackOut,
    ResearchSurveyCreate,
    ResearchSurveyOut,
)

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

    submission = ResearchSurveySubmission(
        professional_role=body.professional_role,
        specialty=body.specialty,
        years_experience=body.years_experience,
        sources=json.dumps(body.sources),
        sources_other=body.sources_other,
        papers_needed=body.papers_needed,
        most_time_consuming=body.most_time_consuming,
        most_time_consuming_other=body.most_time_consuming_other,
        biggest_problem=body.biggest_problem,
        biggest_problem_other=body.biggest_problem_other,
        trust_level=body.trust_level,
        trust_reason=body.trust_reason,
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    return FeedbackSubmissionResponse(
        message="Thank you. Your research workflow response has been recorded.",
        submission_id=submission.id,
    )


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
        return FeedbackSubmissionResponse(message="Thank you for your feedback.")

    submission = ProductFeedbackSubmission(
        overall_rating=body.overall_rating,
        ease_of_use_rating=body.ease_of_use_rating,
        search_rating=body.search_rating,
        summary_rating=body.summary_rating,
        features_used=json.dumps(body.features_used),
        most_useful=body.most_useful,
        problems_encountered=body.problems_encountered,
        improvements=body.improvements,
        feature_requests=body.feature_requests,
        would_recommend=body.would_recommend,
        contact_email=str(body.contact_email or ""),
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    return FeedbackSubmissionResponse(
        message="Thank you. Your Claritas feedback has been recorded.",
        submission_id=submission.id,
    )


@router.get("/research-methods", response_model=list[ResearchSurveyOut])
def list_research_survey_responses(
    limit: int = Query(100, ge=1, le=500),
    _admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Return recent research-method responses to configured administrators."""
    rows = (
        db.query(ResearchSurveySubmission)
        .order_by(ResearchSurveySubmission.created_at.desc())
        .limit(limit)
        .all()
    )
    return [
        ResearchSurveyOut(
            id=row.id,
            professional_role=row.professional_role,
            specialty=row.specialty,
            years_experience=row.years_experience,
            sources=json.loads(row.sources),
            sources_other=row.sources_other,
            papers_needed=row.papers_needed,
            most_time_consuming=row.most_time_consuming,
            most_time_consuming_other=row.most_time_consuming_other,
            biggest_problem=row.biggest_problem,
            biggest_problem_other=row.biggest_problem_other,
            trust_level=row.trust_level,
            trust_reason=row.trust_reason,
            created_at=row.created_at,
        )
        for row in rows
    ]


@router.get("/product", response_model=list[ProductFeedbackOut])
def list_product_feedback(
    limit: int = Query(100, ge=1, le=500),
    _admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Return recent product feedback to configured administrators."""
    rows = (
        db.query(ProductFeedbackSubmission)
        .order_by(ProductFeedbackSubmission.created_at.desc())
        .limit(limit)
        .all()
    )
    return [
        ProductFeedbackOut(
            id=row.id,
            overall_rating=row.overall_rating,
            ease_of_use_rating=row.ease_of_use_rating,
            search_rating=row.search_rating,
            summary_rating=row.summary_rating,
            features_used=json.loads(row.features_used),
            most_useful=row.most_useful,
            problems_encountered=row.problems_encountered,
            improvements=row.improvements,
            feature_requests=row.feature_requests,
            would_recommend=row.would_recommend,
            contact_email=row.contact_email,
            created_at=row.created_at,
        )
        for row in rows
    ]
