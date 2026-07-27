"""SQLAlchemy ORM models."""

from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    token_version: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )
    reset_token: Mapped[str | None] = mapped_column(String(255), nullable=True)
    reset_token_expires: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


class Paper(Base):
    __tablename__ = "papers"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    title: Mapped[str] = mapped_column(Text, default="")
    tldr: Mapped[str] = mapped_column(Text, default="")
    detailed_summary: Mapped[str] = mapped_column(Text, default="")
    study_type: Mapped[str] = mapped_column(String(100), default="", index=True)
    specialty_tags: Mapped[str] = mapped_column(Text, default="[]")       # JSON string
    pico_summary: Mapped[str] = mapped_column(Text, default="null")       # JSON string
    key_findings: Mapped[str] = mapped_column(Text, default="null")       # JSON string
    mind_map: Mapped[str] = mapped_column(Text, default="null")           # JSON string
    verification: Mapped[str] = mapped_column(Text, default="null")       # JSON string
    processing_time: Mapped[float] = mapped_column(Float, default=0.0)
    has_errors: Mapped[bool] = mapped_column(Boolean, default=False)
    pipeline_version: Mapped[str] = mapped_column(String(50), default="", nullable=False, index=True)
    source_sha256: Mapped[str] = mapped_column(String(64), default="", nullable=False)
    prompt_sha256: Mapped[str] = mapped_column(Text, default="{}", nullable=False)  # JSON object
    generation_models: Mapped[str] = mapped_column(Text, default="{}", nullable=False)  # JSON object
    # ponytail: metadata from XML fallback — journal, centers, authors, doi
    journal: Mapped[str] = mapped_column(Text, default="")
    doi: Mapped[str] = mapped_column(String(255), default="", index=True)
    author_list: Mapped[str] = mapped_column(Text, default="")            # comma-separated author names
    authors_count: Mapped[int] = mapped_column(Integer, default=0)
    centers: Mapped[str] = mapped_column(Text, default="")                # JSON array of affiliation strings
    centers_count: Mapped[int] = mapped_column(Integer, default=0)
    # ponytail: XML-parsed fields — citation, sections, excerpt (abstract), reviewer
    citation: Mapped[str] = mapped_column(Text, default="")
    sections: Mapped[str] = mapped_column(Text, default="[]")             # JSON array of section titles
    excerpt: Mapped[str] = mapped_column(Text, default="")                # abstract text
    reviewer: Mapped[str] = mapped_column(Text, default="")               # editor/reviewer names


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
