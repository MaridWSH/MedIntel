"""JWT auth utilities — hashing, token creation/verification, FastAPI dependency."""

import os
import secrets
import time
import warnings
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
_env_secret = os.environ.get("MEDINTEL_SECRET_KEY")
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
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours
REFRESH_TOKEN_EXPIRE_DAYS = 7
SECURE_COOKIES = os.getenv("MEDINTEL_SECURE_COOKIES", "false").lower() == "true"

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

_RATE_LIMIT_STATE: dict[str, dict[str, float | int]] = {}


def _client_ip(request: Request) -> str:
    """Return a stable identifier for the requesting client."""
    if request.client is None or request.client.host is None:
        return "anonymous"
    return request.client.host


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
    return request.cookies.get("refresh_token")


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
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> Optional[dict]:
    """Decode and validate a JWT string, returning its payload or None if invalid."""
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None


def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """FastAPI dependency — extracts and validates the current user from JWT."""
    if token is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    payload = decode_token(token)
    if payload is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return user
