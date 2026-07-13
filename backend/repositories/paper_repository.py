"""Paper repository for the MedIntel Semantic Search module.

Implements the Repository Pattern for paper metadata stored in PostgreSQL/SQLite.
All database access required by semantic search goes through this module so the
service layer stays persistence-agnostic and testable.
"""

from __future__ import annotations

import logging
import time
from typing import Iterable, Protocol

from sqlalchemy import func, text
from sqlalchemy.orm import Session

from models import Paper

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Protocol (interface)
# ---------------------------------------------------------------------------


class PaperRepository(Protocol):
    """Abstract interface for paper metadata persistence."""

    def get_by_ids(self, paper_ids: list[str]) -> list[Paper]:
        """Fetch full paper rows by their IDs, preserving input order."""
        ...

    def get_all(
        self,
        batch_size: int | None = None,
        limit: int | None = None,
    ) -> Iterable[Paper]:
        """Iterate over all papers in ID order."""
        ...

    def keyword_search(
        self,
        query: str,
        top_k: int = 100,
    ) -> list[tuple[Paper, float]]:
        """PostgreSQL full-text search ranked by ts_rank_cd.

        Returns a list of (paper, keyword_score) tuples sorted by descending score.
        """
        ...


# ---------------------------------------------------------------------------
# SQLAlchemy implementation
# ---------------------------------------------------------------------------


class SQLAlchemyPaperRepository:
    """PostgreSQL/SQLite-backed implementation of PaperRepository."""

    def __init__(self, db: Session):
        """Initialize with a SQLAlchemy session.

        Args:
            db: SQLAlchemy session tied to the request or task lifecycle.
        """
        self._db = db

    def get_by_ids(self, paper_ids: list[str]) -> list[Paper]:
        """Fetch full paper rows by their IDs, preserving input order."""
        if not paper_ids:
            return []

        t_start = time.perf_counter()
        papers = self._db.query(Paper).filter(Paper.id.in_(paper_ids)).all()
        paper_by_id = {p.id: p for p in papers}
        ordered = [paper_by_id[pid] for pid in paper_ids if pid in paper_by_id]
        t_elapsed = time.perf_counter() - t_start
        logger.info("DB get_by_ids: requested=%d, returned=%d, time=%.3fs", len(paper_ids), len(ordered), t_elapsed)
        return ordered

    def get_all(
        self,
        batch_size: int | None = None,
        limit: int | None = None,
    ) -> Iterable[Paper]:
        """Iterate over all papers in ID order.

        Args:
            batch_size: Optional yield-per hint for memory-efficient streaming.
            limit: Optional cap on the number of papers to yield.

        Yields:
            Paper ORM rows.
        """
        query = self._db.query(Paper).order_by(Paper.id)
        if limit:
            query = query.limit(limit)
        if batch_size:
            query = query.yield_per(batch_size)

        yield from query

    def keyword_search(
        self,
        query: str,
        top_k: int = 100,
    ) -> list[tuple[Paper, float]]:
        """PostgreSQL full-text search over title, tldr, abstract, keywords, and specialty_tags.

        Uses websearch_to_tsquery() and ts_rank_cd() for ranking. The GIN index on
        `search_vector` makes this fast at scale.
        """
        t_start = time.perf_counter()
        ts_query = func.websearch_to_tsquery("english", query)
        rank = func.ts_rank_cd(Paper.search_vector, ts_query, 32).label("keyword_score")

        results = (
            self._db.query(Paper, rank)
            .filter(Paper.search_vector.op("@@")(ts_query))
            .order_by(rank.desc())
            .limit(top_k)
            .all()
        )
        t_elapsed = time.perf_counter() - t_start
        logger.info(
            "DB keyword_search: query=%r, top_k=%d, results=%d, time=%.3fs",
            query,
            top_k,
            len(results),
            t_elapsed,
        )
        return [(paper, float(score)) for paper, score in results]
