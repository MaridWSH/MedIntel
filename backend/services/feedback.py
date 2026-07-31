"""Feedback submission business logic."""

from __future__ import annotations

import json

from sqlalchemy.orm import Session

from database.models import ProductFeedbackSubmission, ResearchSurveySubmission
from repositories import feedback as feedback_repository
from schemas import (
    FeedbackSubmissionResponse,
    ProductFeedbackCreate,
    ProductFeedbackOut,
    ResearchSurveyCreate,
    ResearchSurveyOut,
)


def submit_research_survey(body: ResearchSurveyCreate, db: Session) -> FeedbackSubmissionResponse:
    """Store one anonymous research survey response."""
    submission = feedback_repository.create_research_survey(
        db,
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
    return FeedbackSubmissionResponse(
        message="Thank you. Your research workflow response has been recorded.",
        submission_id=submission.id,
    )


def research_surveys_to_api(rows: list[ResearchSurveySubmission]) -> list[ResearchSurveyOut]:
    """Convert ORM rows to API responses."""
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


def submit_product_feedback(body: ProductFeedbackCreate, db: Session) -> FeedbackSubmissionResponse:
    """Store one product feedback submission."""
    submission = feedback_repository.create_product_feedback(
        db,
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
    return FeedbackSubmissionResponse(
        message="Thank you. Your CiteRounds feedback has been recorded.",
        submission_id=submission.id,
    )


def product_feedback_to_api(rows: list[ProductFeedbackSubmission]) -> list[ProductFeedbackOut]:
    """Convert ORM rows to API responses."""
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
