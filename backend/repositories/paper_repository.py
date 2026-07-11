"""Paper repository for the MedIntel Semantic Search module.

Implements the Repository Pattern for paper metadata stored in PostgreSQL/SQLite.
All database access required by semantic search goes through this module so the
service layer stays persistence-agnostic and testable.
"""

from __future__ import annotations

from typing import Iterable, Protocol

from sqlalchemy.orm import Session

from models import Paper


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

        papers = self._db.query(Paper).filter(Paper.id.in_(paper_ids)).all()
        paper_by_id = {p.id: p for p in papers}
        return [paper_by_id[pid] for pid in paper_ids if pid in paper_by_id]

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
