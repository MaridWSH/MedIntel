"""PostgreSQL Full Text Search utilities.

Builds a `tsvector` from title + tldr + detailed_summary + abstract + keywords +
specialty_tags, then exposes a single search helper used by the hybrid search
service. The tsvector column is also kept in sync by a database trigger (see
init_db.py), so this module provides an in-Python fallback for tests and for
backfilling rows that were inserted before the trigger existed.
"""

from __future__ import annotations

import logging
import re
from typing import Any

from sqlalchemy import text
from sqlalchemy.orm import Session

from models import Paper

logger = logging.getLogger(__name__)


# Stable weight labels — `setweight(to_tsvector(...), 'A')` style is impossible
# from Python, but the database trigger does exactly this when assigning weights.
# Here we only concatenate; the trigger takes care of weighting.
def _corpus_text(paper: Paper) -> str:
    """Concatenate all searchable text fields into a single corpus string."""
    parts: list[str] = [
        paper.title or "",
        paper.tldr or "",
        paper.detailed_summary or "",
        getattr(paper, "abstract", "") or "",
        getattr(paper, "keywords", "") or "",
    ]
    # specialty_tags is a JSON-encoded list — flatten to a space-separated string.
    raw_tags = getattr(paper, "specialty_tags", "") or ""
    if raw_tags:
        import json

        try:
            tags = json.loads(raw_tags)
            if isinstance(tags, list):
                parts.append(" ".join(str(t) for t in tags))
        except (json.JSONDecodeError, TypeError):
            parts.append(raw_tags)
    return "\n".join(p for p in parts if p)


# Strip characters that confuse websearch_to_tsquery input (it expects raw text).
_NON_PRINTABLE = re.compile(r"[\x00-\x08\x0b-\x1f\x7f]")


def sanitize_query(query: str) -> str:
    """Sanitize raw user input for websearch_to_tsquery."""
    if not query:
        return ""
    cleaned = _NON_PRINTABLE.sub(" ", query)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned[:1024]


def build_search_vector(paper: Paper) -> str:
    """Build a to_tsvector() expression for a Paper row.

    Returns the SQL string used by the trigger and the backfill helper.
    The trigger weights: title=A, tldr=B, abstract=B, detailed_summary=C,
    keywords=B, specialty_tags=D.
    """
    def weight(letter: str, value: str) -> str:
        value = (value or "").replace("'", " ")
        value = re.sub(r"\s+", " ", value).strip()
        if not value:
            return ""
        return f"setweight(to_tsvector('english', '{value}'), '{letter}')"

    a = weight("A", paper.title)
    b = weight("B", paper.tldr)
    b2 = weight("B", getattr(paper, "abstract", ""))
    b3 = weight("B", getattr(paper, "keywords", ""))
    c = weight("C", paper.detailed_summary)
    d_parts: list[str] = []
    raw_tags = getattr(paper, "specialty_tags", "") or ""
    if raw_tags:
        import json

        try:
            tags = json.loads(raw_tags)
            if isinstance(tags, list):
                d_parts.extend(str(t) for t in tags)
        except (json.JSONDecodeError, TypeError):
            d_parts.append(raw_tags)
    d = weight("D", " ".join(d_parts))

    parts = [p for p in (a, b, b2, b3, c, d) if p]
    if not parts:
        # Empty tsvector
        return "to_tsvector('english', '')"
    return " || ".join(parts)


def populate_search_vector_for_paper(paper: Paper) -> None:
    """Assign a tsvector expression to a Paper before insert/update."""
    paper.search_vector = build_search_vector(paper)


def backfill_search_vectors(db: Session, batch_size: int = 500) -> int:
    """Update `search_vector` for any rows where it is NULL.

    Returns the number of rows updated. No-op on non-PostgreSQL engines.
    """
    from database import engine

    if not engine.dialect.name.startswith("postgres"):
        logger.info("Skipping FTS backfill — engine is not PostgreSQL.")
        return 0

    stmt = text(
        """
        UPDATE papers
        SET search_vector = (
            setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
            setweight(to_tsvector('english', coalesce(tldr, '')), 'B') ||
            setweight(to_tsvector('english', coalesce(abstract, '')), 'B') ||
            setweight(to_tsvector('english', coalesce(keywords, '')), 'B') ||
            setweight(to_tsvector('english', coalesce(detailed_summary, '')), 'C') ||
            setweight(to_tsvector('english', coalesce(specialty_tags, '')), 'D')
        )
        WHERE search_vector IS NULL
        """
    )
    result = db.execute(stmt)
    db.commit()
    return result.rowcount or 0


def install_fts_trigger() -> None:
    """Install a database trigger that keeps `search_vector` in sync.

    Idempotent: safe to run on every startup. No-op on non-PostgreSQL engines.
    The trigger ensures the GIN index on `search_vector` is always accurate.
    """
    from database import engine

    if not engine.dialect.name.startswith("postgres"):
        logger.info(
            "Skipping FTS trigger install — engine is %s, not PostgreSQL.",
            engine.dialect.name,
        )
        return

    statements = (
        """
        CREATE OR REPLACE FUNCTION papers_search_vector_update() RETURNS trigger AS $$
        BEGIN
            NEW.search_vector :=
                setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
                setweight(to_tsvector('english', coalesce(NEW.tldr, '')), 'B') ||
                setweight(to_tsvector('english', coalesce(NEW.abstract, '')), 'B') ||
                setweight(to_tsvector('english', coalesce(NEW.keywords, '')), 'B') ||
                setweight(to_tsvector('english', coalesce(NEW.detailed_summary, '')), 'C') ||
                setweight(to_tsvector('english', coalesce(NEW.specialty_tags, '')), 'D');
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        """,
        "DROP TRIGGER IF EXISTS trg_papers_search_vector ON papers",
        """
        CREATE TRIGGER trg_papers_search_vector
            BEFORE INSERT OR UPDATE OF title, tldr, abstract, keywords, detailed_summary, specialty_tags
            ON papers
            FOR EACH ROW
            EXECUTE FUNCTION papers_search_vector_update()
        """,
    )

    with engine.begin() as conn:
        for stmt in statements:
            conn.execute(text(stmt))
    logger.info("Installed FTS trigger on papers.search_vector.")