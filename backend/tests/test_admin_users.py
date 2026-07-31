"""Tests for admin user management endpoints."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from core.auth import get_current_admin, get_current_user
from database import Base, get_db
from database.models import User
from main import app


@pytest.fixture
def admin_db():
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
def admin_client(admin_db):
    def override_get_db():
        yield admin_db

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()


@pytest.fixture
def admin_user(admin_db):
    user = User(email="admin@example.com", name="Admin", hashed_password="unused", is_admin=True)
    admin_db.add(user)
    admin_db.commit()
    admin_db.refresh(user)
    app.dependency_overrides[get_current_admin] = lambda: user
    app.dependency_overrides[get_current_user] = lambda: user
    return user


@pytest.fixture
def target_user(admin_db):
    user = User(email="target@example.com", name="Target", hashed_password="unused", is_admin=False)
    admin_db.add(user)
    admin_db.commit()
    admin_db.refresh(user)
    return user


class TestAdminUserManagement:
    def test_list_users(self, admin_client, admin_user, target_user):
        response = admin_client.get("/api/admin/users")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 2
        assert len(data["items"]) == 2

    def test_search_users(self, admin_client, admin_user, target_user):
        response = admin_client.get("/api/admin/users?q=target")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["items"][0]["email"] == "target@example.com"

    def test_promote_user(self, admin_client, admin_user, target_user):
        response = admin_client.patch(f"/api/admin/users/{target_user.id}/admin")
        assert response.status_code == 200
        assert response.json()["user"]["is_admin"] is True

    def test_cannot_demote_self(self, admin_client, admin_user):
        response = admin_client.patch(f"/api/admin/users/{admin_user.id}/admin")
        assert response.status_code == 400

    def test_cannot_delete_self(self, admin_client, admin_user):
        response = admin_client.delete(f"/api/admin/users/{admin_user.id}")
        assert response.status_code == 400

    def test_cannot_delete_last_admin(self, admin_client, admin_user, target_user):
        response = admin_client.delete(f"/api/admin/users/{target_user.id}")
        assert response.status_code == 200
        response = admin_client.delete(f"/api/admin/users/{admin_user.id}")
        assert response.status_code == 400

    def test_generate_reset_token(self, admin_client, admin_user, target_user):
        response = admin_client.post(f"/api/admin/users/{target_user.id}/reset-password")
        assert response.status_code == 200
        assert "reset_token" in response.json()

    def test_normal_user_cannot_access_admin_users(self, admin_client, admin_db):
        normal_user = User(email="normal@example.com", name="Normal", hashed_password="unused", is_admin=False)
        admin_db.add(normal_user)
        admin_db.commit()
        app.dependency_overrides[get_current_user] = lambda: normal_user
        response = admin_client.get("/api/admin/users")
        assert response.status_code == 403
        app.dependency_overrides.pop(get_current_user, None)
