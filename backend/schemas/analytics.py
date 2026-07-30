"""Pydantic schemas for analytics events and admin analytics responses."""

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

AnalyticsEventType = Literal[
    "PAGE_VIEW",
    "SIGNUP",
    "LOGIN",
    "LOGOUT",
    "PAPER_VIEW",
    "PAPER_SEARCH",
]

AnalyticsPeriod = Literal["1d", "7d", "30d", "90d", "1y"]


class AnalyticsEventCreate(BaseModel):
    event_type: AnalyticsEventType
    path: str | None = Field(None, max_length=500)
    paper_id: str | None = Field(None, max_length=50)
    visitor_id: str | None = Field(None, max_length=64)
    session_id: str | None = Field(None, max_length=64)
    metadata_json: dict[str, Any] | None = None


class AnalyticsEventOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    event_type: str
    user_id: int | None
    visitor_id: str | None
    session_id: str | None
    path: str | None
    paper_id: str | None
    created_at: datetime


class AnalyticsOverview(BaseModel):
    total_users: int
    new_users_today: int
    new_users_this_week: int
    new_users_this_month: int
    active_users_today: int
    active_users_this_week: int
    active_users_this_month: int
    total_visitors: int
    visitors_today: int
    visitors_this_week: int
    visitors_this_month: int
    page_views_today: int


class TimeSeriesPoint(BaseModel):
    date: str
    count: int


class AnalyticsTimeSeries(BaseModel):
    period: AnalyticsPeriod
    data: list[TimeSeriesPoint]


class AnalyticsEventsList(BaseModel):
    items: list[AnalyticsEventOut]
    total: int
    page: int
    per_page: int
    pages: int


class AnalyticsEventsQuery(BaseModel):
    event_type: AnalyticsEventType | None = None
    period: AnalyticsPeriod = "30d"
    page: int = Field(1, ge=1)
    per_page: int = Field(50, ge=1, le=200)

    @field_validator("period", mode="before")
    @classmethod
    def default_period(cls, value):
        return value if value else "30d"
