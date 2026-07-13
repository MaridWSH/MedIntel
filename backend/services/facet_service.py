"""Dynamic facet counts for the hybrid search endpoint.

For each facetable field, we run a single PostgreSQL `GROUP BY` query against
the union of paper IDs returned by the active retriever(s), applying every
filter **except the facet being computed** — the standard faceted-search
behavior used by PubMed, Elasticsearch, and Algolia.

The service is decoupled from `HybridSearchService` so the architecture stays
modular and facets can be reused for non-search contexts later.
"""

from __future__ import annotations

import hashlib
import json
import logging
import time
from dataclasses import dataclass
from typing import Iterable

from sqlalchemy import and_, distinct, func, or_, select, text
from sqlalchemy.orm import Session

from models import Paper
from repositories.paper_repository import PaperRepository
from schemas import FacetBucket, Facets, HybridSearchFilters

logger = logging.getLogger(__name__)


# ── Field configuration ──────────────────────────────────────────────────
#
# Each entry maps a facet name (the public key in the response) to its
# underlying SQL column on `papers`. `specialty_tags` is special because it
# stores a JSON array string, so the matching predicate uses `ILIKE` against
# the quoted form of each tag (PostgreSQL-native `jsonb` would be cleaner,
# but the existing column is `TEXT`).
#
# `category` is "tag" for multi-valued fields (specialty_tags, language) and
# "scalar" for single-valued fields. The result type in the API bucket is
# always `str | int`.

@dataclass(frozen=True)
class _FacetField:
    name: str
    column: object  # SQLAlchemy column
    category: str  # "scalar" | "tag" | "year"


def _all_facets() -> dict[str, _FacetField]:
    return {
        "specialty": _FacetField(
            "specialty",
            Paper.specialty_tags,
            "tag",
        ),
        "study_type": _FacetField(
            "study_type",
            Paper.study_type,
            "scalar",
        ),
        "evidence_level": _FacetField(
            "evidence_level",
            Paper.evidence_level,
            "scalar",
        ),
        "publication_year": _FacetField(
            "publication_year",
            Paper.publication_year,
            "year",
        ),
        "journal": _FacetField(
            "journal",
            Paper.journal,
            "scalar",
        ),
        "language": _FacetField(
            "language",
            Paper.language,
            "scalar",
        ),
    }


# ── Filter mapping ──────────────────────────────────────────────────────
#
# Convert a `HybridSearchFilters` instance into SQLAlchemy `where` clauses.
# The `apply_filters` function below already does this for SQL queries; we
# reuse it.

from services.search_filters import apply_filters  # noqa: E402


# ── Service ──────────────────────────────────────────────────────────────


@dataclass
class _FacetQuery:
    """A single GROUP BY query plus its meta."""

    field: _FacetField
    where_clause: list  # extra SQLAlchemy conditions from filters
    cache_key: str


class FacetService:
    """Compute dynamic facet counts for a search scope."""

    def __init__(
        self,
        db: Session,
        paper_repository: PaperRepository | None = None,
        cache_size: int = 256,
        cache_ttl_seconds: float = 60.0,
    ):
        self._db = db
        self._paper_repo = paper_repository
        self._cache_size = cache_size
        self._cache_ttl_seconds = cache_ttl_seconds
        self._cache: dict[str, tuple[float, list[FacetBucket]]] = {}

    # ── Public API ─────────────────────────────────────────────────────

    def compute(
        self,
        *,
        paper_ids: Iterable[str] | None,
        filters: HybridSearchFilters | None,
        facet_fields: Iterable[str] | None = None,
    ) -> Facets:
        """Compute facets for the given result-set scope.

        Args:
            paper_ids: Paper IDs that survived hybrid retrieval. ``None``
                means the scope is the entire database (e.g. browse mode).
            filters: Currently applied filters.
            facet_fields: Optional allowlist of facet names to compute.
                Defaults to every supported facet.

        Returns:
            A `Facets` object with buckets sorted by count descending.
        """
        t_start = time.perf_counter()
        all_facets = _all_facets()
        if facet_fields is None:
            facet_fields = all_facets.keys()
        requested = [all_facets[name] for name in facet_fields if name in all_facets]

        scoped_ids: list[str] | None = list(paper_ids) if paper_ids is not None else None

        result: dict[str, list[FacetBucket]] = {}
        for facet in requested:
            buckets = self._compute_single(
                field=facet,
                scoped_ids=scoped_ids,
                filters=filters,
            )
            result[facet.name] = buckets

        facets = Facets(
            specialty=result.get("specialty"),
            study_type=result.get("study_type"),
            evidence_level=result.get("evidence_level"),
            publication_year=result.get("publication_year"),
            journal=result.get("journal"),
            language=result.get("language"),
        )
        logger.info(
            "FacetService.compute: scope=%s, total_buckets=%d, time=%.3fs",
            "scoped" if scoped_ids is not None else "global",
            sum(len(v) for v in result.values() if v),
            time.perf_counter() - t_start,
        )
        return facets

    # ── Internal ───────────────────────────────────────────────────────

    def _compute_single(
        self,
        *,
        field: _FacetField,
        scoped_ids: list[str] | None,
        filters: HybridSearchFilters | None,
    ) -> list[FacetBucket]:
        cache_key = self._cache_key(field, scoped_ids, filters)
        cached = self._cache_get(cache_key)
        if cached is not None:
            return cached

        # Filter-respecting: apply every filter except the facet being computed.
        reduced_filters = _exclude_filter_field(filters, field.name)
        base_query = self._db.query(Paper)
        if scoped_ids is not None:
            if not scoped_ids:
                return []
            base_query = base_query.filter(Paper.id.in_(scoped_ids))
        base_query = apply_filters(base_query, reduced_filters)

        if field.category == "tag":
            return self._compute_tag_facet(field, base_query, cache_key)
        if field.category == "year":
            return self._compute_year_facet(field, base_query, cache_key)
        return self._compute_scalar_facet(field, base_query, cache_key)

    def _compute_scalar_facet(
        self,
        field: _FacetField,
        base_query,
        cache_key: str,
    ) -> list[FacetBucket]:
        column = field.column
        subq = base_query.subquery()
        # Reference the column through the subquery so SQLAlchemy doesn't
        # generate a cartesian product between the original table and the subquery.
        subq_col = getattr(subq.c, column.key)
        value_col = func.coalesce(func.cast(subq_col, text("TEXT")), "")
        stmt = (
            select(value_col.label("value"), func.count().label("count"))
            .group_by(value_col)
            .order_by(func.count().desc(), value_col.asc())
        )
        rows = self._db.execute(stmt).all()
        buckets = [
            FacetBucket(value=str(r.value or ""), count=int(r.count))
            for r in rows
            if r.value not in (None, "")
        ]
        self._cache_put(cache_key, buckets)
        return buckets

    def _compute_year_facet(
        self,
        field: _FacetField,
        base_query,
        cache_key: str,
    ) -> list[FacetBucket]:
        column = field.column
        subq = base_query.subquery()
        subq_col = getattr(subq.c, column.key)
        stmt = (
            select(subq_col.label("value"), func.count().label("count"))
            .filter(subq_col.is_not(None))
            .group_by(subq_col)
            .order_by(func.count().desc(), subq_col.desc())
        )
        rows = self._db.execute(stmt).all()
        buckets = [
            FacetBucket(value=int(r.value), count=int(r.count))
            for r in rows
            if r.value is not None
        ]
        self._cache_put(cache_key, buckets)
        return buckets

    def _compute_tag_facet(
        self,
        field: _FacetField,
        base_query,
        cache_key: str,
    ) -> list[FacetBucket]:
        """Compute counts for a JSON-encoded list column (specialty_tags).

        We unnest tags via PostgreSQL's `jsonb_array_elements_text` when
        available; otherwise we materialize tags in Python.
        """
        dialect = self._db.bind.dialect.name if self._db.bind is not None else ""
        column = field.column
        subq = base_query.subquery()
        subq_col = getattr(subq.c, column.key)

        if dialect.startswith("postgres"):
            tag_expr = func.jsonb_array_elements_text(
                func.cast(subq_col, text("JSONB"))
            ).label("tag")
            stmt = (
                select(tag_expr, func.count().label("count"))
                .group_by(tag_expr)
                .order_by(func.count().desc(), tag_expr.asc())
            )
            rows = self._db.execute(stmt).all()
            buckets = [
                FacetBucket(value=str(r.tag), count=int(r.count))
                for r in rows
                if r.tag
            ]
        else:
            # SQLite fallback: parse JSON in Python.
            counts: dict[str, int] = {}
            stmt = select(subq_col)
            for (raw,) in self._db.execute(stmt).all():
                if not raw:
                    continue
                try:
                    tags = json.loads(raw)
                except (json.JSONDecodeError, TypeError):
                    continue
                if not isinstance(tags, list):
                    continue
                for tag in tags:
                    if tag is None:
                        continue
                    counts[str(tag)] = counts.get(str(tag), 0) + 1
            buckets = [
                FacetBucket(value=tag, count=count)
                for tag, count in sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))
            ]

        self._cache_put(cache_key, buckets)
        return buckets

    # ── Cache ──────────────────────────────────────────────────────────

    def _cache_key(
        self,
        field: _FacetField,
        scoped_ids: list[str] | None,
        filters: HybridSearchFilters | None,
    ) -> str:
        ids_hash = ""
        if scoped_ids is not None:
            ids_hash = hashlib.sha1(
                ",".join(sorted(scoped_ids)).encode()
            ).hexdigest()
        filters_dict = _filters_to_dict(filters)
        payload = {
            "field": field.name,
            "scope": "scoped" if scoped_ids is not None else "global",
            "scope_hash": ids_hash,
            "filters": filters_dict,
        }
        raw = json.dumps(payload, sort_keys=True)
        return hashlib.sha1(raw.encode()).hexdigest()

    def _cache_get(self, key: str) -> list[FacetBucket] | None:
        entry = self._cache.get(key)
        if entry is None:
            return None
        ts, buckets = entry
        if time.time() - ts > self._cache_ttl_seconds:
            self._cache.pop(key, None)
            return None
        return buckets

    def _cache_put(self, key: str, buckets: list[FacetBucket]) -> None:
        if len(self._cache) >= self._cache_size:
            # LRU eviction: drop oldest entry.
            oldest_key = next(iter(self._cache))
            self._cache.pop(oldest_key, None)
        self._cache[key] = (time.time(), buckets)


# ── Helpers ────────────────────────────────────────────────────────────


_FILTER_FIELD_MAP: dict[str, str] = {
    "specialty": "specialties",
    "study_type": "study_types",
    "evidence_level": "evidence_levels",
    "publication_year": "years",
    "journal": "journals",
    "language": "languages",
    "authors": "authors",
}


def _exclude_filter_field(
    filters: HybridSearchFilters | None,
    facet_name: str,
) -> HybridSearchFilters | None:
    """Return a copy of `filters` with the facet's filter field stripped."""
    if filters is None:
        return None
    field_to_clear = _FILTER_FIELD_MAP.get(facet_name)
    if field_to_clear is None:
        return filters
    data = filters.model_dump(exclude_none=True)
    data.pop(field_to_clear, None)
    if not data:
        return None
    return HybridSearchFilters(**data)


def _filters_to_dict(filters: HybridSearchFilters | None) -> dict | None:
    if filters is None:
        return None
    data = filters.model_dump(exclude_none=True)
    if not data:
        return None
    return data


# ── Dependency injection ─────────────────────────────────────────────────


def get_facet_service(db: Session) -> FacetService:
    """Build a FacetService for the current request."""
    return FacetService(db=db)