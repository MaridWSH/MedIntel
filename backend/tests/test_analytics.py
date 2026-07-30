"""Tests for the analytics event tracking and admin analytics endpoints."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from core.auth import get_current_admin, get_current_user
from database import Base, get_db
from database.models import AnalyticsEvent, User
from main import app


@pytest.fixture
def analytics_db():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    session_factory = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    db = session_factory()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def analytics_client(analytics_db):
    def override_get_db():
        yield analytics_db

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()


@pytest.fixture
def admin_user(analytics_db):
    user = User(email="admin@example.com", name="Admin", hashed_password="unused", is_admin=True)
    analytics_db.add(user)
    analytics_db.commit()
    analytics_db.refresh(user)
    return user


@pytest.fixture
def normal_user(analytics_db):
    user = User(email="user@example.com", name="User", hashed_password="unused", is_admin=False)
    analytics_db.add(user)
    analytics_db.commit()
    analytics_db.refresh(user)
    return user


class TestEventIngestion:
    def test_page_view_event_is_stored(self, analytics_client, analytics_db):
        response = analytics_client.post(
            "/api/analytics/event",
            json={
                "event_type": "PAGE_VIEW",
                "path": "/search",
                "visitor_id": "visitor-1",
                "session_id": "session-1",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["event_type"] == "PAGE_VIEW"
        assert data["visitor_id"] == "visitor-1"
        assert analytics_db.query(AnalyticsEvent).count() == 1

    def test_event_ingestion_respects_dnt(self, analytics_client, analytics_db):
        response = analytics_client.post(
            "/api/analytics/event",
            json={
                "event_type": "PAGE_VIEW",
                "path": "/",
                "visitor_id": "visitor-1",
            },
            headers={"DNT": "1"},
        )
        assert response.status_code == 204
        assert analytics_db.query(AnalyticsEvent).count() == 0

    def test_unknown_event_type_is_rejected(self, analytics_client):
        response = analytics_client.post(
            "/api/analytics/event",
            json={"event_type": "UNKNOWN", "path": "/"},
        )
        assert response.status_code == 422


class TestAdminAnalytics:
    def test_overview_requires_admin(self, analytics_client, normal_user):
        app.dependency_overrides[get_current_user] = lambda: normal_user
        response = analytics_client.get("/api/admin/analytics/overview")
        assert response.status_code == 403
        app.dependency_overrides.pop(get_current_user, None)

    def test_overview_returns_expected_keys(self, analytics_client, admin_user, analytics_db):
        app.dependency_overrides[get_current_admin] = lambda: admin_user
        response = analytics_client.get("/api/admin/analytics/overview")
        assert response.status_code == 200
        data = response.json()
        expected_keys = {
            "total_users",
            "new_users_today",
            "new_users_this_week",
            "new_users_this_month",
            "active_users_today",
            "active_users_this_week",
            "active_users_this_month",
            "total_visitors",
            "visitors_today",
            "visitors_this_week",
            "visitors_this_month",
            "page_views_today",
        }
        assert set(data.keys()) == expected_keys
        app.dependency_overrides.pop(get_current_admin, None)

    def test_users_time_series(self, analytics_client, admin_user, analytics_db):
        app.dependency_overrides[get_current_admin] = lambda: admin_user
        response = analytics_client.get("/api/admin/analytics/users?period=7d")
        assert response.status_code == 200
        data = response.json()
        assert data["period"] == "7d"
        assert len(data["data"]) == 8  # 7 days + today
        assert "date" in data["data"][0]
        assert "count" in data["data"][0]
        app.dependency_overrides.pop(get_current_admin, None)

    def test_visitors_counts_unique_visitors_not_page_views(
        self, analytics_client, admin_user, analytics_db
    ):
        app.dependency_overrides[get_current_admin] = lambda: admin_user
        for path in ["/", "/search", "/paper/1"]:
            analytics_client.post(
                "/api/analytics/event",
                json={
                    "event_type": "PAGE_VIEW",
                    "path": path,
                    "visitor_id": "visitor-abc",
                    "session_id": "session-abc",
                },
            )

        response = analytics_client.get("/api/admin/analytics/overview")
        data = response.json()
        assert data["visitors_today"] == 1
        assert data["page_views_today"] == 3
        app.dependency_overrides.pop(get_current_admin, None)

    def test_active_users_counts_authenticated_events(
        self, analytics_client, admin_user, normal_user, analytics_db
    ):
        from repositories import analytics as analytics_repository

        app.dependency_overrides[get_current_admin] = lambda: admin_user
        analytics_client.post(
            "/api/analytics/event",
            json={
                "event_type": "PAGE_VIEW",
                "path": "/dashboard",
                "visitor_id": "v1",
                "session_id": "s1",
            },
        )
        analytics_repository.create_event(
            analytics_db,
            event_type="PAGE_VIEW",
            user_id=normal_user.id,
            path="/dashboard",
        )

        response = analytics_client.get("/api/admin/analytics/overview")
        data = response.json()
        assert data["active_users_today"] == 1
        assert data["visitors_today"] == 1
        app.dependency_overrides.pop(get_current_admin, None)
