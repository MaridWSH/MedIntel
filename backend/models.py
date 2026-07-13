"""SQLAlchemy ORM models."""

from datetime import datetime, timezone
from typing import Any

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    Integer,
    String,
    Text,
    Index,
    TypeDecorator,
)
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class TSVector(TypeDecorator):
    """Cross-dialect TSVECTOR type.

    Renders as `TSVECTOR` on PostgreSQL and as `TEXT` on SQLite/tests.
    The column is only used for PostgreSQL full-text search; SQLite is only
    supported for local unit tests.
    """

    impl = Text
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name.startswith("postgres"):
            from sqlalchemy.dialects.postgresql import TSVECTOR
            return dialect.type_descriptor(TSVECTOR)
        return dialect.type_descriptor(Text)

    def process_bind_param(self, value, dialect):
        return value

    def process_result_value(self, value, dialect):
        return value


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
    abstract: Mapped[str] = mapped_column(Text, default="")
    keywords: Mapped[str] = mapped_column(Text, default="")
    study_type: Mapped[str] = mapped_column(String(100), default="", index=True)
    specialty_tags: Mapped[str] = mapped_column(Text, default="[]")       # JSON string
    pico_summary: Mapped[str] = mapped_column(Text, default="null")       # JSON string
    key_findings: Mapped[str] = mapped_column(Text, default="null")       # JSON string
    mind_map: Mapped[str] = mapped_column(Text, default="null")           # JSON string
    verification: Mapped[str] = mapped_column(Text, default="null")       # JSON string
    processing_time: Mapped[float] = mapped_column(Float, default=0.0)
    has_errors: Mapped[bool] = mapped_column(Boolean, default=False)

    # ── Production queryable filter fields ──────────────────────────────
    publication_year: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)
    journal: Mapped[str] = mapped_column(String(512), default="", index=True)
    language: Mapped[str] = mapped_column(String(32), default="en", index=True)
    author_list: Mapped[str] = mapped_column(Text, default="")
    authors_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    centers_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    doi: Mapped[str] = mapped_column(String(255), default="")
    evidence_level: Mapped[str] = mapped_column(String(32), default="", index=True)

    # ── Full-text search (PostgreSQL tsvector) ───────────────────────────
    search_vector: Mapped[Any | None] = mapped_column(TSVector, nullable=True)

    __table_args__ = (
        Index("ix_papers_search_vector_gin", "search_vector", postgresql_using="gin"),
        Index("ix_papers_year_journal", "publication_year", "journal"),
        Index("ix_papers_specialty_tags_gin", "specialty_tags", postgresql_using="gin"),
    )
