"""SQLAlchemy ORM models — paper catalogue metadata."""

from sqlalchemy import Boolean, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


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
