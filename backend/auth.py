"""JWT auth utilities — hashing, token creation/verification, FastAPI dependency."""

import os
import secrets
import time
import warnings
from ipaddress import ip_address, ip_network
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from database import get_db
from models import User

# JWT secret — must be set via environment variable in production.
# Generates a random key for local dev if not provided.
ENVIRONMENT = os.getenv("MEDINTEL_ENV", "development").strip().lower()
_env_secret = os.environ.get("MEDINTEL_SECRET_KEY")
_in_production = ENVIRONMENT in {"production", "staging"}
if _in_production and (
    not _env_secret
    or len(_env_secret) < 32
    or _env_secret in {"change-me", "change-me-in-production"}
):
    raise RuntimeError(
        "MEDINTEL_SECRET_KEY must be a unique value of at least 32 characters "
        "when MEDINTEL_ENV is production or staging"
    )
if _env_secret:
    SECRET_KEY = _env_secret
else:
    warnings.warn(
        "MEDINTEL_SECRET_KEY not set — using random dev key. "
        "Tokens will not survive restarts. Set MEDINTEL_SECRET_KEY in production.",
        stacklevel=2,
    )
    SECRET_KEY = secrets.token_hex(32)
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("MEDINTEL_ACCESS_TOKEN_MINUTES", "15"))
REFRESH_TOKEN_EXPIRE_DAYS = 7
SECURE_COOKIES = os.getenv(
    "MEDINTEL_SECURE_COOKIES", "true" if _in_production else "false"
).lower() == "true"
ACCESS_TOKEN_COOKIE = "access_token"
REFRESH_TOKEN_COOKIE = "refresh_token"

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

_RATE_LIMIT_STATE: dict[str, dict[str, float | int]] = {}


def _client_ip(request: Request) -> str:
    """Return the client IP, trusting forwarding headers only from known proxies."""
    if request.client is None or request.client.host is None:
        return "anonymous"
    direct_ip = request.client.host
    try:
        direct_address = ip_address(direct_ip)
    except ValueError:
        return direct_ip

    trusted_networks = os.getenv(
        "MEDINTEL_TRUSTED_PROXY_NETWORKS", "127.0.0.1/32,::1/128"
    ).split(",")
    try:
        trusted = any(
            direct_address in ip_network(network.strip(), strict=False)
            for network in trusted_networks
            if network.strip()
        )
    except ValueError:
        trusted = False

    if trusted:
        forwarded = (
            request.headers.get("cf-connecting-ip")
            or request.headers.get("x-real-ip")
            or request.headers.get("x-forwarded-for", "").split(",")[0].strip()
        )
        if forwarded:
            try:
                return str(ip_address(forwarded))
            except ValueError:
                pass
    return str(direct_address)


def validate_cookie_request_origin(request: Request) -> None:
    """Reject unsafe cookie-authenticated requests from unapproved browser origins."""
    if request.method in {"GET", "HEAD", "OPTIONS"}:
        return

    # Browsers send Origin on fetch/form writes. Non-browser API clients may omit
    # it, so absence alone is not treated as authentication.
    origin = request.headers.get("origin")
    if not origin:
        return

    allowed = {
        value.strip().rstrip("/")
        for value in os.getenv(
            "MEDINTEL_ALLOWED_ORIGINS",
            "http://localhost:3000,http://localhost:3001,"
            "http://127.0.0.1:3000,http://127.0.0.1:3001,"
            "https://med.aidashnews.tech",
        ).split(",")
        if value.strip()
    }
    if origin.rstrip("/") not in allowed:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Request origin is not allowed",
        )


def enforce_rate_limit(request: Request, action: str, limit: int, window_seconds: int) -> None:
    """Simple in-memory rate limiter keyed by client IP and action."""
    key = f"{action}:{_client_ip(request)}"
    now = time.time()
    entry = _RATE_LIMIT_STATE.get(key)
    if entry is None or entry["reset"] <= now:
        entry = {"count": 0, "reset": now + window_seconds}

    entry["count"] += 1
    _RATE_LIMIT_STATE[key] = entry

    if entry["count"] > limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many {action.replace('_', ' ')} requests. Try again later.",
        )


def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a signed JWT refresh token with a longer lifetime."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS))
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_refresh_token(token: str) -> Optional[dict]:
    """Decode and validate a refresh token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "refresh":
            return None
        return payload
    except JWTError:
        return None


def get_refresh_token_from_request(request: Request) -> Optional[str]:
    """Extract the refresh token from the request cookie."""
    return request.cookies.get(REFRESH_TOKEN_COOKIE)


def hash_password(password: str) -> str:
    """Hash a plain-text password using Argon2."""
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    """Check a plain-text password against a stored Argon2 hash."""
    return pwd_context.verify(plain, hashed)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a signed JWT access token with an expiration claim."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> Optional[dict]:
    """Decode and validate a JWT string, returning its payload or None if invalid."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "access":
            return None
        return payload
    except JWTError:
        return None


def get_current_user(
    request: Request,
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Validate a Bearer token or the browser's HttpOnly access cookie."""
    using_cookie = token is None
    if using_cookie:
        token = request.cookies.get(ACCESS_TOKEN_COOKIE)
    if token is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    # SameSite cookies block most cross-site writes. This Origin check also
    # protects cookie-authenticated requests from same-site sibling origins.
    if using_cookie:
        validate_cookie_request_origin(request)

    payload = decode_token(token)
    if payload is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    try:
        parsed_user_id = int(user_id)
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload"
        ) from None

    user = db.query(User).filter(User.id == parsed_user_id).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    if payload.get("ver") != user.token_version:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has been revoked")

    return user


def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    """Restrict maintenance endpoints to explicitly configured admin emails."""
    admin_emails = {
        email.strip().lower()
        for email in os.getenv("MEDINTEL_ADMIN_EMAILS", "").split(",")
        if email.strip()
    }
    if current_user.email.lower() not in admin_emails:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator access required",
        )
    return current_user
