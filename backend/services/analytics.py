"""Analytics business logic."""

from __future__ import annotations

import json
from typing import Any

from fastapi import Request
from sqlalchemy.orm import Session

from database.models import AnalyticsEvent
from repositories import analytics as analytics_repository
from schemas import AnalyticsEventCreate, AnalyticsEventsQuery, AnalyticsOverview


def _safe_metadata(payload: dict[str, Any] | None) -> dict[str, Any]:
    """Strip any potentially sensitive fields from client-provided metadata."""
    if not payload:
        return {}
    blocked = {"password", "token", "access_token", "refresh_token", "ip", "email"}
    return {k: v for k, v in payload.items() if k.lower() not in blocked}


def track_event_from_request(
    db: Session,
    request: Request,
    event_type: str,
    *,
    user_id: int | None = None,
    path: str | None = None,
    paper_id: str | None = None,
    metadata: dict[str, Any] | None = None,
) -> AnalyticsEvent:
    """Track an event from a backend request, extracting visitor/session IDs from headers."""
    visitor_id = request.headers.get("x-visitor-id") or None
    session_id = request.headers.get("x-session-id") or None
    return analytics_repository.create_event(
        db,
        event_type=event_type,
        user_id=user_id,
        visitor_id=visitor_id,
        session_id=session_id,
        path=path or request.url.path,
        paper_id=paper_id,
        metadata_json=_safe_metadata(metadata),
    )


def track_backend_event(
    db: Session,
    *,
    event_type: str,
    user_id: int | None = None,
    visitor_id: str | None = None,
    session_id: str | None = None,
    path: str | None = None,
    paper_id: str | None = None,
    metadata: dict[str, Any] | None = None,
) -> AnalyticsEvent:
    """Track an event triggered by backend logic."""
    return analytics_repository.create_event(
        db,
        event_type=event_type,
        user_id=user_id,
        visitor_id=visitor_id,
        session_id=session_id,
        path=path,
        paper_id=paper_id,
        metadata_json=_safe_metadata(metadata),
    )


def ingest_client_event(body: AnalyticsEventCreate, request: Request, db: Session) -> AnalyticsEvent:
    """Store an event submitted from the frontend."""
    if body.event_type not in analytics_repository.ALLOWED_EVENT_TYPES:
        from fastapi import HTTPException, status

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported event type: {body.event_type}",
        )

    # Do Not Track support
    if request.headers.get("dnt") == "1" or request.headers.get("sec-gpc") == "1":
        from fastapi import HTTPException, status

        raise HTTPException(
            status_code=status.HTTP_204_NO_CONTENT,
            detail="Do Not Track is enabled",
        )

    return analytics_repository.create_event(
        db,
        event_type=body.event_type,
        visitor_id=body.visitor_id,
        session_id=body.session_id,
        path=body.path,
        paper_id=body.paper_id,
        metadata_json=_safe_metadata(body.metadata_json),
    )


def get_overview(db: Session) -> AnalyticsOverview:
    data = analytics_repository.get_overview(db)
    return AnalyticsOverview(**data)


def get_users_time_series(db: Session, period: str) -> list[dict[str, Any]]:
    return analytics_repository.get_user_signups_time_series(db, period)


def get_visitors_time_series(db: Session, period: str) -> list[dict[str, Any]]:
    return analytics_repository.get_visitors_time_series(db, period)


def get_events_time_series(
    db: Session, period: str, event_type: str | None = None
) -> list[dict[str, Any]]:
    return analytics_repository.get_events_time_series(db, period, event_type)


def list_events(db: Session, query: AnalyticsEventsQuery) -> tuple[list[AnalyticsEvent], int]:
    return analytics_repository.list_events(
        db,
        event_type=query.event_type,
        period=query.period,
        page=query.page,
        per_page=query.per_page,
    )
