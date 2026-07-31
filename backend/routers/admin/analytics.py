"""Admin-only analytics endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.auth import get_current_admin
from database import get_db
from database.models import User
from schemas import (
    AnalyticsEventOut,
    AnalyticsEventsList,
    AnalyticsEventsQuery,
    AnalyticsOverview,
    AnalyticsPeriod,
    AnalyticsTimeSeries,
)
from services import analytics as analytics_service

router = APIRouter(prefix="/analytics", tags=["admin-analytics"])


@router.get("/overview", response_model=AnalyticsOverview)
def overview(
    _admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """High-level platform analytics summary."""
    return analytics_service.get_overview(db)


@router.get("/users", response_model=AnalyticsTimeSeries)
def users_time_series(
    period: AnalyticsPeriod = "30d",
    _admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Daily new user signups over the selected period."""
    data = analytics_service.get_users_time_series(db, period)
    return AnalyticsTimeSeries(period=period, data=data)


@router.get("/visitors", response_model=AnalyticsTimeSeries)
def visitors_time_series(
    period: AnalyticsPeriod = "30d",
    _admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Daily unique visitor count over the selected period."""
    data = analytics_service.get_visitors_time_series(db, period)
    return AnalyticsTimeSeries(period=period, data=data)


@router.get("/events", response_model=AnalyticsTimeSeries)
def events_time_series(
    period: AnalyticsPeriod = "30d",
    event_type: str | None = None,
    _admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Daily event counts over the selected period, optionally filtered by event type."""
    data = analytics_service.get_events_time_series(db, period, event_type)
    return AnalyticsTimeSeries(period=period, data=data)


@router.get("/events/list", response_model=AnalyticsEventsList)
def list_events(
    event_type: str | None = None,
    period: AnalyticsPeriod = "30d",
    page: int = 1,
    per_page: int = 50,
    _admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Paginated list of recent analytics events."""
    query = AnalyticsEventsQuery(
        event_type=event_type,  # type: ignore[arg-type]
        period=period,
        page=page,
        per_page=per_page,
    )
    items, total = analytics_service.list_events(db, query)
    pages = max(1, (total + per_page - 1) // per_page)
    return AnalyticsEventsList(
        items=[AnalyticsEventOut.model_validate(item) for item in items],
        total=total,
        page=page,
        per_page=per_page,
        pages=pages,
    )
