"""SQLAlchemy ORM models."""

from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )
    reset_token: Mapped[str] = mapped_column(String(255), nullable=True)
    reset_token_expires: Mapped[datetime] = mapped_column(DateTime, nullable=True)


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

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    paper_id: Mapped[str] = mapped_column(String(50), ForeignKey("papers.id"), nullable=False, index=True)
    saved_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )
