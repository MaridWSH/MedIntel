"""Feedback submission repository — database access."""

from __future__ import annotations

from sqlalchemy.orm import Session

from database.models import ProductFeedbackSubmission, ResearchSurveySubmission


def create_research_survey(
    db: Session,
    *,
    professional_role: str,
    specialty: str,
    years_experience: str,
    sources: str,
    sources_other: str,
    papers_needed: str,
    most_time_consuming: str,
    most_time_consuming_other: str,
    biggest_problem: str,
    biggest_problem_other: str,
    trust_level: str,
    trust_reason: str,
) -> ResearchSurveySubmission:
    """Store a research survey submission."""
    submission = ResearchSurveySubmission(
        professional_role=professional_role,
        specialty=specialty,
        years_experience=years_experience,
        sources=sources,
        sources_other=sources_other,
        papers_needed=papers_needed,
        most_time_consuming=most_time_consuming,
        most_time_consuming_other=most_time_consuming_other,
        biggest_problem=biggest_problem,
        biggest_problem_other=biggest_problem_other,
        trust_level=trust_level,
        trust_reason=trust_reason,
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    return submission


def list_research_surveys(db: Session, limit: int) -> list[ResearchSurveySubmission]:
    """Return recent research survey submissions."""
    return (
        db.query(ResearchSurveySubmission)
        .order_by(ResearchSurveySubmission.created_at.desc())
        .limit(limit)
        .all()
    )


def create_product_feedback(
    db: Session,
    *,
    overall_rating: int,
    ease_of_use_rating: int,
    search_rating: int | None,
    summary_rating: int | None,
    features_used: str,
    most_useful: str,
    problems_encountered: str,
    improvements: str,
    feature_requests: str,
    would_recommend: str,
    contact_email: str,
) -> ProductFeedbackSubmission:
    """Store a product feedback submission."""
    submission = ProductFeedbackSubmission(
        overall_rating=overall_rating,
        ease_of_use_rating=ease_of_use_rating,
        search_rating=search_rating,
        summary_rating=summary_rating,
        features_used=features_used,
        most_useful=most_useful,
        problems_encountered=problems_encountered,
        improvements=improvements,
        feature_requests=feature_requests,
        would_recommend=would_recommend,
        contact_email=contact_email,
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    return submission


def list_product_feedback(db: Session, limit: int) -> list[ProductFeedbackSubmission]:
    """Return recent product feedback submissions."""
    return (
        db.query(ProductFeedbackSubmission)
        .order_by(ProductFeedbackSubmission.created_at.desc())
        .limit(limit)
        .all()
    )
