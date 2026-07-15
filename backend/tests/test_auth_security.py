import hashlib

import pytest
from fastapi import HTTPException
from starlette.requests import Request
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from auth import _client_ip, create_refresh_token, get_current_admin
from database import Base, get_db
from main import app
from models import User


@pytest.fixture
def auth_db():
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
def auth_client(auth_db):
    def override_get_db():
        yield auth_db

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()


def register(client: TestClient):
    return client.post(
        "/api/auth/register",
        json={
            "email": "Doctor@Example.COM",
            "name": "Test Doctor",
            "password": "correct-horse-battery-staple",
        },
    )


def test_register_normalizes_email_and_sets_httponly_cookies(auth_client, auth_db):
    response = register(auth_client)

    assert response.status_code == 201
    assert response.json()["user"]["email"] == "doctor@example.com"
    set_cookie = "; ".join(response.headers.get_list("set-cookie")).lower()
    assert "access_token=" in set_cookie
    assert "refresh_token=" in set_cookie
    assert set_cookie.count("httponly") == 2
    assert auth_db.query(User).one().email == "doctor@example.com"


def test_refresh_token_cannot_be_used_as_access_bearer(auth_client, auth_db):
    register(auth_client)
    user = auth_db.query(User).one()
    refresh_token = create_refresh_token({"sub": str(user.id), "ver": user.token_version})

    response = auth_client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {refresh_token}"},
    )

    assert response.status_code == 401


def test_cookie_session_writes_reject_unapproved_browser_origin(auth_client):
    register(auth_client)

    refresh_response = auth_client.post(
        "/api/auth/refresh",
        headers={"Origin": "https://attacker.example"},
    )
    logout_response = auth_client.post(
        "/api/auth/logout",
        headers={"Origin": "https://attacker.example"},
    )

    assert refresh_response.status_code == 403
    assert logout_response.status_code == 403


def test_password_reset_token_is_hashed_at_rest(auth_client, auth_db, monkeypatch):
    register(auth_client)
    raw_token = "a" * 43
    monkeypatch.setattr("routers.auth.secrets.token_urlsafe", lambda _length: raw_token)

    response = auth_client.post(
        "/api/auth/forgot-password",
        json={"email": "doctor@example.com"},
    )

    assert response.status_code == 200
    user = auth_db.query(User).one()
    assert user.reset_token == hashlib.sha256(raw_token.encode()).hexdigest()
    assert user.reset_token != raw_token

    reset_response = auth_client.post(
        "/api/auth/reset-password",
        json={"reset_token": raw_token, "new_password": "a-new-strong-password"},
    )
    assert reset_response.status_code == 200
    assert user.reset_token is None
    assert auth_client.get("/api/auth/me").status_code == 401


def test_account_deletion_removes_user_and_cookies(auth_client, auth_db):
    register(auth_client)

    response = auth_client.delete("/api/user/account")

    assert response.status_code == 200
    assert auth_db.query(User).count() == 0
    assert "access_token=\"\"" in response.headers.get("set-cookie", "") or "access_token=" in response.headers.get("set-cookie", "")


def test_admin_access_requires_explicit_email(monkeypatch):
    user = User(email="admin@example.com", name="Admin", hashed_password="unused")
    monkeypatch.delenv("MEDINTEL_ADMIN_EMAILS", raising=False)
    with pytest.raises(HTTPException) as exc_info:
        get_current_admin(user)
    assert exc_info.value.status_code == 403

    monkeypatch.setenv("MEDINTEL_ADMIN_EMAILS", "admin@example.com")
    assert get_current_admin(user) is user


def test_forwarded_client_ip_is_used_only_for_trusted_proxy(monkeypatch):
    def request_from(client_ip: str) -> Request:
        return Request(
            {
                "type": "http",
                "method": "POST",
                "path": "/api/auth/login",
                "headers": [(b"x-real-ip", b"203.0.113.10")],
                "client": (client_ip, 12345),
                "server": ("testserver", 80),
                "scheme": "http",
                "query_string": b"",
            }
        )

    monkeypatch.setenv("MEDINTEL_TRUSTED_PROXY_NETWORKS", "172.19.0.0/16")
    assert _client_ip(request_from("172.19.0.4")) == "203.0.113.10"
    assert _client_ip(request_from("198.51.100.4")) == "198.51.100.4"
