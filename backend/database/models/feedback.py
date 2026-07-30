"""SQLAlchemy ORM models — saved papers and beta feedback submissions."""

from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class SavedPaper(Base):
    __tablename__ = "saved_papers"
    __table_args__ = (
        UniqueConstraint("user_id", "paper_id", name="uq_saved_papers_user_paper"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    paper_id: Mapped[str] = mapped_column(String(50), ForeignKey("papers.id"), nullable=False, index=True)
    saved_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )


class ResearchSurveySubmission(Base):
    __tablename__ = "research_survey_submissions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    professional_role: Mapped[str] = mapped_column(String(100), nullable=False)
    specialty: Mapped[str] = mapped_column(String(150), default="", nullable=False)
    years_experience: Mapped[str] = mapped_column(String(50), nullable=False)
    sources: Mapped[str] = mapped_column(Text, nullable=False)  # JSON array
    sources_other: Mapped[str] = mapped_column(Text, default="", nullable=False)
    papers_needed: Mapped[str] = mapped_column(String(50), nullable=False)
    most_time_consuming: Mapped[str] = mapped_column(String(100), nullable=False)
    most_time_consuming_other: Mapped[str] = mapped_column(Text, default="", nullable=False)
    biggest_problem: Mapped[str] = mapped_column(String(100), nullable=False)
    biggest_problem_other: Mapped[str] = mapped_column(Text, default="", nullable=False)
    trust_level: Mapped[str] = mapped_column(String(20), nullable=False)
    trust_reason: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True
    )


class ProductFeedbackSubmission(Base):
    __tablename__ = "product_feedback_submissions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    overall_rating: Mapped[int] = mapped_column(Integer, nullable=False)
    ease_of_use_rating: Mapped[int] = mapped_column(Integer, nullable=False)
    search_rating: Mapped[int | None] = mapped_column(Integer, nullable=True)
    summary_rating: Mapped[int | None] = mapped_column(Integer, nullable=True)
    features_used: Mapped[str] = mapped_column(Text, nullable=False)  # JSON array
    most_useful: Mapped[str] = mapped_column(Text, default="", nullable=False)
    problems_encountered: Mapped[str] = mapped_column(Text, default="", nullable=False)
    improvements: Mapped[str] = mapped_column(Text, default="", nullable=False)
    feature_requests: Mapped[str] = mapped_column(Text, default="", nullable=False)
    would_recommend: Mapped[str] = mapped_column(String(20), nullable=False)
    contact_email: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True
    )
