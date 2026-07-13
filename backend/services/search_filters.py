"""Filter builder for hybrid search.

Produces a SQLAlchemy `Query` filter that applies HybridSearchFilters rules:
- Same-field values are OR-combined (any of the listed specialties).
- Different fields are AND-combined (specialty AND study_type AND ...).
"""

from __future__ import annotations

import json
from typing import Any

from sqlalchemy import or_
from sqlalchemy.orm import Query
from sqlalchemy.sql import func

from models import Paper
from schemas import HybridSearchFilters, YearRange


def _coerce_year(value: Any) -> int | None:
    if value is None:
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def apply_filters(query: Query, filters: HybridSearchFilters | None) -> Query:
    """Apply OR-within-field, AND-across-fields filters to a Paper query."""
    if filters is None:
        return query

    # ── Specialty (stored as JSON array, matches any item in the list) ──
    if filters.specialties:
        terms = [str(s).strip() for s in filters.specialties if s and str(s).strip()]
        if terms:
            clauses = [Paper.specialty_tags.ilike(f"%\"{term}\"%") for term in terms]
            query = query.filter(or_(*clauses))

    # ── Study type (simple equality, OR) ──
    if filters.study_types:
        terms = [str(s).strip() for s in filters.study_types if s and str(s).strip()]
        if terms:
            query = query.filter(or_(*[Paper.study_type == t for t in terms]))

    # ── Evidence level ──
    if filters.evidence_levels:
        terms = [str(s).strip().lower() for s in filters.evidence_levels if s and str(s).strip()]
        if terms:
            query = query.filter(or_(*[func_lower(Paper.evidence_level) == t for t in terms]))

    # ── Journals ──
    if filters.journals:
        terms = [str(s).strip() for s in filters.journals if s and str(s).strip()]
        if terms:
            query = query.filter(or_(*[Paper.journal == j for j in terms]))

    # ── Languages ──
    if filters.languages:
        terms = [str(s).strip().lower() for s in filters.languages if s and str(s).strip()]
        if terms:
            query = query.filter(or_(*[func_lower(Paper.language) == t for t in terms]))

    # ── Authors (substring match on the author_list column) ──
    if filters.authors:
        terms = [str(s).strip() for s in filters.authors if s and str(s).strip()]
        if terms:
            query = query.filter(or_(*[Paper.author_list.ilike(f"%{a}%") for a in terms]))

    # ── Year range ──
    if filters.years is not None:
        years: YearRange = filters.years
        year_from = _coerce_year(years.from_)
        year_to = _coerce_year(years.to)
        if year_from is not None:
            query = query.filter(Paper.publication_year >= year_from)
        if year_to is not None:
            query = query.filter(Paper.publication_year <= year_to)

    return query


def func_lower(column):
    """SQLAlchemy case-insensitive lower()."""
    return func.lower(column)


def matches_filters(paper: Paper, filters: HybridSearchFilters | None) -> bool:
    """In-memory version of `apply_filters` for use on already-loaded rows."""
    if filters is None:
        return True

    if filters.specialties:
        terms = {str(s).strip().lower() for s in filters.specialties if s and str(s).strip()}
        if terms:
            tags: set[str] = set()
            try:
                raw = json.loads(paper.specialty_tags or "[]")
                if isinstance(raw, list):
                    tags = {str(t).lower() for t in raw}
            except (json.JSONDecodeError, TypeError):
                pass
            if tags.isdisjoint(terms):
                return False

    if filters.study_types:
        terms = {str(s).strip() for s in filters.study_types if s and str(s).strip()}
        if terms and paper.study_type not in terms:
            return False

    if filters.evidence_levels:
        terms = {str(s).strip().lower() for s in filters.evidence_levels if s and str(s).strip()}
        if terms and (paper.evidence_level or "").lower() not in terms:
            return False

    if filters.journals:
        terms = {str(s).strip() for s in filters.journals if s and str(s).strip()}
        if terms and paper.journal not in terms:
            return False

    if filters.languages:
        terms = {str(s).strip().lower() for s in filters.languages if s and str(s).strip()}
        if terms and (paper.language or "").lower() not in terms:
            return False

    if filters.authors:
        terms = [str(s).strip() for s in filters.authors if s and str(s).strip()]
        author_list = (paper.author_list or "").lower()
        if terms and not any(a.lower() in author_list for a in terms):
            return False

    if filters.years is not None:
        year_from = _coerce_year(filters.years.from_)
        year_to = _coerce_year(filters.years.to)
        if year_from is not None and (paper.publication_year or 0) < year_from:
            return False
        if year_to is not None and (paper.publication_year or 10**9) > year_to:
            return False

    return True


_EVIDENCE_ORDER = {
    "high": 4,
    "moderate": 3,
    "low": 2,
    "very_low": 1,
    "a": 4,
    "b": 3,
    "c": 2,
    "d": 1,
    "": 0,
}


def evidence_sort_key(paper: Paper) -> int:
    """Sort by evidence level (highest evidence first)."""
    return _EVIDENCE_ORDER.get((paper.evidence_level or "").lower(), 0)