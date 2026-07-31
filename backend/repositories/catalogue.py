"""Paper catalogue database access.

All catalogue SQL lives here so routers and services stay persistence-agnostic.
"""

from __future__ import annotations

import math
from typing import Iterable

from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from database.models import Paper
from services.papers import CURRENT_PIPELINE_VERSION, REQUIRE_CURRENT_PIPELINE


def get_by_id(db: Session, paper_id: str) -> Paper | None:
    """Fetch a paper by its PMC ID."""
    return db.query(Paper).filter(Paper.id == paper_id).first()


def get_fulltext_markdown_path(paper_id: str) -> tuple[bool, str]:
    """Return (available, markdown_content) for a paper's source markdown."""
    from pathlib import Path

    from services.papers import MD_DIR

    md_path = (MD_DIR / f"{paper_id}.md").resolve()
    if not str(md_path).startswith(str(MD_DIR.resolve()) + "/") or not md_path.exists():
        return False, ""
    try:
        return True, md_path.read_text(encoding="utf-8")
    except OSError:
        return False, ""


def _summarised_query(db: Session):
    """Base query restricted to papers with usable summaries."""
    query = db.query(Paper).filter(Paper.tldr != "", Paper.tldr.isnot(None))
    if REQUIRE_CURRENT_PIPELINE:
        query = query.filter(
            Paper.pipeline_version == CURRENT_PIPELINE_VERSION,
            Paper.has_errors.is_(False),
        )
    return query


def list_papers(
    db: Session,
    *,
    page: int = 1,
    per_page: int = 20,
    study_type: str | None = None,
    specialty: str | None = None,
    evidence_level: str | None = None,
    sort: str = "id",
    summarised_only: bool = True,
) -> tuple[list[Paper], int, int]:
    """Return papers, total count, and page count for the listing endpoint."""
    query = _summarised_query(db) if summarised_only else db.query(Paper)

    if study_type:
        query = query.filter(Paper.study_type == study_type)

    if specialty:
        # specialty_tags is a JSON array in a text column, so this is a substring
        # match. Tags are stored inconsistently ("public_health" and "public
        # health" both occur), and /facets normalises to the spaced form, so match
        # either — otherwise picking a facet returns nothing.
        spaced = specialty.strip().replace("_", " ")
        underscored = spaced.replace(" ", "_")
        query = query.filter(
            or_(
                Paper.specialty_tags.ilike(f"%{spaced}%"),
                Paper.specialty_tags.ilike(f"%{underscored}%"),
            )
        )

    if evidence_level:
        # key_findings is a JSON blob in a text column. Matching the serialised
        # key/value is crude but avoids a migration; the alternative was the UI
        # filtering the current page in memory, which silently contradicted the
        # result count it displayed next to it.
        query = query.filter(
            Paper.key_findings.ilike(f'"overall_evidence_level": "{evidence_level}"%')
        )

    total = query.count()
    pages = max(1, math.ceil(total / per_page))

    order = Paper.id.desc() if sort == "-id" else Paper.id
    items = query.order_by(order).offset((page - 1) * per_page).limit(per_page).all()
    return items, total, pages


def keyword_search(db: Session, q: str) -> list[Paper]:
    """Substring match over title, tldr and detailed_summary."""
    pattern = f"%{q}%"
    query = db.query(Paper)
    if REQUIRE_CURRENT_PIPELINE:
        query = query.filter(
            Paper.pipeline_version == CURRENT_PIPELINE_VERSION,
            Paper.has_errors.is_(False),
        )
    return (
        query
        .filter(
            or_(
                Paper.title.ilike(pattern),
                Paper.tldr.ilike(pattern),
                Paper.detailed_summary.ilike(pattern),
            )
        )
        .all()
    )


def get_facet_data(db: Session) -> tuple[list[tuple[str, int]], list[str]]:
    """Return raw study-type counts and all specialty tag JSON strings."""
    summarised = _summarised_query(db)

    study_types = [
        (value, count)
        for value, count in (
            summarised.with_entities(Paper.study_type, func.count(Paper.id))
            .group_by(Paper.study_type)
            .order_by(func.count(Paper.id).desc())
            .all()
        )
        if value
    ]

    raw_specialty_tags = [
        row[0]
        for row in summarised.with_entities(Paper.specialty_tags).all()
    ]
    return study_types, raw_specialty_tags


def current_corpus_count(db: Session) -> int:
    """Count summaries produced by the currently accepted pipeline version."""
    return (
        db.query(Paper)
        .filter(
            Paper.pipeline_version == CURRENT_PIPELINE_VERSION,
            Paper.tldr != "",
            Paper.tldr.isnot(None),
            Paper.has_errors.is_(False),
            Paper.verification.ilike('%"passed": true%'),
        )
        .count()
    )
