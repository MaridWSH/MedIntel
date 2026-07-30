"""Analytics repository — database access for event tracking and aggregation."""

from __future__ import annotations

import json
import uuid
from datetime import date, datetime, timedelta, timezone
from typing import Any

from sqlalchemy import func
from sqlalchemy.orm import Session

from database.models import AnalyticsEvent, User


# Analytics event type constants
PAGE_VIEW = "PAGE_VIEW"
SIGNUP = "SIGNUP"
LOGIN = "LOGIN"
LOGOUT = "LOGOUT"
PAPER_VIEW = "PAPER_VIEW"
PAPER_SEARCH = "PAPER_SEARCH"

ALLOWED_EVENT_TYPES = frozenset({PAGE_VIEW, SIGNUP, LOGIN, LOGOUT, PAPER_VIEW, PAPER_SEARCH})


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def create_event(
    db: Session,
    *,
    event_type: str,
    user_id: int | None = None,
    visitor_id: str | None = None,
    session_id: str | None = None,
    path: str | None = None,
    paper_id: str | None = None,
    metadata_json: dict[str, Any] | None = None,
) -> AnalyticsEvent:
    """Store a single analytics event."""
    event = AnalyticsEvent(
        event_type=event_type,
        user_id=user_id,
visitor_id=visitor_id or str(uuid.uuid4()),
        session_id=session_id or str(uuid.uuid4()),
        path=path,
        paper_id=paper_id,
        metadata_json=json.dumps(metadata_json) if metadata_json else "{}",
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


def _period_bounds(period: str) -> datetime:
    """Return the UTC datetime for the start of the requested period."""
    now = _utcnow()
    mapping = {
        "1d": timedelta(days=1),
        "7d": timedelta(days=7),
        "30d": timedelta(days=30),
        "90d": timedelta(days=90),
        "1y": timedelta(days=365),
    }
    return now - mapping.get(period, timedelta(days=30))


def _today_start() -> datetime:
    now = _utcnow()
    return datetime(now.year, now.month, now.day, tzinfo=timezone.utc)


def _week_start() -> datetime:
    today = _today_start()
    return today - timedelta(days=today.weekday())


def _month_start() -> datetime:
    today = _today_start()
    return datetime(today.year, today.month, 1, tzinfo=timezone.utc)


def count_new_users(db: Session, since: datetime) -> int:
    return db.query(User).filter(User.created_at >= since).count()


def count_total_users(db: Session) -> int:
    return db.query(User).count()


def count_active_users(db: Session, since: datetime) -> int:
    """Distinct authenticated users who generated any event in the period."""
    return (
        db.query(AnalyticsEvent.user_id)
        .filter(AnalyticsEvent.user_id.isnot(None), AnalyticsEvent.created_at >= since)
        .distinct()
        .count()
    )


def count_unique_visitors(db: Session, since: datetime) -> int:
    """Distinct anonymous or authenticated visitors by visitor_id in the period."""
    return (
        db.query(AnalyticsEvent.visitor_id)
        .filter(AnalyticsEvent.visitor_id.isnot(None), AnalyticsEvent.created_at >= since)
        .distinct()
        .count()
    )


def count_total_visitors(db: Session) -> int:
    """Distinct visitor_ids ever recorded."""
    return (
        db.query(AnalyticsEvent.visitor_id)
        .filter(AnalyticsEvent.visitor_id.isnot(None))
        .distinct()
        .count()
    )


def count_page_views(db: Session, since: datetime) -> int:
    return (
        db.query(AnalyticsEvent)
        .filter(AnalyticsEvent.event_type == PAGE_VIEW, AnalyticsEvent.created_at >= since)
        .count()
    )


def get_overview(db: Session) -> dict[str, int]:
    today = _today_start()
    week = _week_start()
    month = _month_start()

    return {
        "total_users": count_total_users(db),
        "new_users_today": count_new_users(db, today),
        "new_users_this_week": count_new_users(db, week),
        "new_users_this_month": count_new_users(db, month),
        "active_users_today": count_active_users(db, today),
        "active_users_this_week": count_active_users(db, week),
        "active_users_this_month": count_active_users(db, month),
        "total_visitors": count_total_visitors(db),
        "visitors_today": count_unique_visitors(db, today),
        "visitors_this_week": count_unique_visitors(db, week),
        "visitors_this_month": count_unique_visitors(db, month),
        "page_views_today": count_page_views(db, today),
    }


def _date_label(d: date) -> str:
    return d.isoformat()


def _build_date_range(period: str) -> list[date]:
    start = _period_bounds(period)
    now = _utcnow()
    dates = []
    current = date(start.year, start.month, start.day)
    end = date(now.year, now.month, now.day)
    while current <= end:
        dates.append(current)
        current += timedelta(days=1)
    return dates


def get_user_signups_time_series(db: Session, period: str) -> list[dict[str, Any]]:
    """Daily new user registrations over the period."""
    start = _period_bounds(period)
    rows = (
        db.query(
            func.date(User.created_at).label("day"),
            func.count(User.id).label("count"),
        )
        .filter(User.created_at >= start)
        .group_by(func.date(User.created_at))
        .order_by(func.date(User.created_at))
        .all()
    )
    counts_by_day = {str(row.day): row.count for row in rows}
    return [
        {"date": _date_label(d), "count": counts_by_day.get(_date_label(d), 0)}
        for d in _build_date_range(period)
    ]


def get_visitors_time_series(db: Session, period: str) -> list[dict[str, Any]]:
    """Daily unique visitors over the period."""
    start = _period_bounds(period)
    rows = (
        db.query(
            func.date(AnalyticsEvent.created_at).label("day"),
            func.count(func.distinct(AnalyticsEvent.visitor_id)).label("count"),
        )
        .filter(
            AnalyticsEvent.visitor_id.isnot(None),
            AnalyticsEvent.created_at >= start,
        )
        .group_by(func.date(AnalyticsEvent.created_at))
        .order_by(func.date(AnalyticsEvent.created_at))
        .all()
    )
    counts_by_day = {str(row.day): row.count for row in rows}
    return [
        {"date": _date_label(d), "count": counts_by_day.get(_date_label(d), 0)}
        for d in _build_date_range(period)
    ]


def get_events_time_series(
    db: Session, period: str, event_type: str | None = None
) -> list[dict[str, Any]]:
    """Daily event counts over the period, optionally filtered by event_type."""
    start = _period_bounds(period)
    query = db.query(
        func.date(AnalyticsEvent.created_at).label("day"),
        func.count(AnalyticsEvent.id).label("count"),
    ).filter(AnalyticsEvent.created_at >= start)
    if event_type:
        query = query.filter(AnalyticsEvent.event_type == event_type)
    rows = query.group_by(func.date(AnalyticsEvent.created_at)).order_by(
        func.date(AnalyticsEvent.created_at)
    ).all()
    counts_by_day = {str(row.day): row.count for row in rows}
    return [
        {"date": _date_label(d), "count": counts_by_day.get(_date_label(d), 0)}
        for d in _build_date_range(period)
    ]


def list_events(
    db: Session,
    *,
    event_type: str | None = None,
    period: str = "30d",
    page: int = 1,
    per_page: int = 50,
) -> tuple[list[AnalyticsEvent], int]:
    """Return paginated analytics events with optional filtering."""
    start = _period_bounds(period)
    query = db.query(AnalyticsEvent).filter(AnalyticsEvent.created_at >= start)
    if event_type:
        query = query.filter(AnalyticsEvent.event_type == event_type)

    total = query.count()
    items = (
        query.order_by(AnalyticsEvent.created_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )
    return items, total
