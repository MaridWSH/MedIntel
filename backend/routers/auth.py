"""Auth router — register, login, me, logout, forgot-password, reset-password."""

import hashlib
import html
import logging
import os
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from auth import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    enforce_rate_limit,
    ACCESS_TOKEN_COOKIE,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    ENVIRONMENT,
    get_current_user,
    get_refresh_token_from_request,
    hash_password,
    REFRESH_TOKEN_COOKIE,
    REFRESH_TOKEN_EXPIRE_DAYS,
    SECURE_COOKIES,
    validate_cookie_request_origin,
    verify_password,
)
from database import get_db
from models import User
from schemas import (
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    LoginResponse,
    LogoutResponse,
    RegisterResponse,
    ResetPasswordRequest,
    ResetPasswordResponse,
    TokenOut,
    UserCreate,
    UserLogin,
    UserOut,
)

router = APIRouter(prefix="/auth", tags=["auth"])
logger = logging.getLogger(__name__)


def _utcnow_naive() -> datetime:
    """UTC timestamp compatible with the existing timezone-naive DB column."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _token_claims(user: User) -> dict[str, str | int]:
    return {"sub": str(user.id), "ver": user.token_version}


def _set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    """Store browser credentials in scoped HttpOnly cookies."""
    response.set_cookie(
        ACCESS_TOKEN_COOKIE,
        access_token,
        httponly=True,
        secure=SECURE_COOKIES,
        samesite="lax",
        path="/api",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    response.set_cookie(
        REFRESH_TOKEN_COOKIE,
        refresh_token,
        httponly=True,
        secure=SECURE_COOKIES,
        samesite="lax",
        path="/api/auth",
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
    )


def _clear_auth_cookies(response: Response) -> None:
    response.delete_cookie(ACCESS_TOKEN_COOKIE, path="/api")
    response.delete_cookie(REFRESH_TOKEN_COOKIE, path="/api/auth")


@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register new user",
    description=(
        "Create a new user account, return an access token, and set the refresh token as an HttpOnly cookie. "
        "The refresh token is a JWT and is not returned in the JSON body."
    ),
)
def register(body: UserCreate, response: Response, request: Request, db: Session = Depends(get_db)):
    """Create a new user account and return a JWT access token."""
    enforce_rate_limit(request, "register", limit=5, window_seconds=60)

    email = str(body.email).strip().lower()
    name = body.name.strip()
    if not name:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Name is required")

    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(
        email=email,
        name=name,
        hashed_password=hash_password(body.password),
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        # The unique email constraint protects concurrent registrations that
        # both pass the optimistic existence check above.
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        ) from None
    db.refresh(user)

    token = create_access_token(_token_claims(user))
    refresh_token = create_refresh_token(_token_claims(user))
    _set_auth_cookies(response, token, refresh_token)
    return RegisterResponse(access_token=token, user=UserOut.model_validate(user))


@router.post(
    "/login",
    response_model=LoginResponse,
    summary="Login user",
    description=(
        "Authenticate a user and return an access token. "
        "A signed JWT refresh token is also set as an HttpOnly cookie for later token refresh."
    ),
)
def login(body: UserLogin, response: Response, request: Request, db: Session = Depends(get_db)):
    """Authenticate a user with email and password, returning a JWT access token."""
    enforce_rate_limit(request, "login", limit=5, window_seconds=60)

    email = str(body.email).strip().lower()
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token(_token_claims(user))
    refresh_token = create_refresh_token(_token_claims(user))
    _set_auth_cookies(response, token, refresh_token)
    return LoginResponse(access_token=token, user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    """Return the profile of the currently authenticated user."""
    return UserOut.model_validate(current_user)


@router.post(
    "/logout",
    response_model=LogoutResponse,
    summary="Logout user",
    description=(
        "Log out the current user by deleting the refresh token cookie. "
        "Access tokens remain stateless and should be discarded by the client."
    ),
)
def logout(response: Response, request: Request):
    """Clear browser credentials. The operation is intentionally idempotent."""
    validate_cookie_request_origin(request)
    _clear_auth_cookies(response)
    return LogoutResponse(message="Successfully logged out.")


@router.post(
    "/forgot-password",
    response_model=ForgotPasswordResponse,
    summary="Request password reset",
    description=(
        "Generate a password reset token for the provided email. "
        "The endpoint returns a generic success message and does not reveal whether the email exists."
    ),
)
def forgot_password(body: ForgotPasswordRequest, request: Request, db: Session = Depends(get_db)):
    """Generate a password-reset token for the given email. In production, email it to the user."""
    enforce_rate_limit(request, "forgot_password", limit=5, window_seconds=60)

    email = str(body.email).strip().lower()
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Don't reveal whether email exists — always return success
        return ForgotPasswordResponse(
            message="If the email exists, a reset link has been sent to the registered email.",
        )

    # Generate a secure random token
    reset_token = secrets.token_urlsafe(32)
    reset_token_hash = hashlib.sha256(reset_token.encode("utf-8")).hexdigest()
    expires = _utcnow_naive() + timedelta(hours=1)

    user.reset_token = reset_token_hash
    user.reset_token_expires = expires
    db.commit()

    # Send reset email (or log token if SMTP not configured)
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_pass = os.getenv("SMTP_PASSWORD")
    from_email = os.getenv("FROM_EMAIL", "noreply@med.aidashnews.tech")

    if smtp_host and smtp_user and smtp_pass:
        # Send email via SMTP
        import smtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart

        reset_page_url = os.getenv(
            "MEDINTEL_RESET_URL", "https://med.aidashnews.tech/reset-password"
        ).rstrip("?")
        reset_url = f"{reset_page_url}?token={reset_token}"
        safe_name = html.escape(user.name or "User")

        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Claritas password reset"
        msg["From"] = from_email
        msg["To"] = body.email

        text = f"""
Hello {user.name or 'User'},

You requested a password reset for your Claritas account.

Click the link below to reset your password:
{reset_url}

This link will expire in 1 hour.

If you did not request this reset, please ignore this email.

— Claritas Team
        """

        html = f"""
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2 style="color: #0b7d72;">Password Reset Request</h2>
    <p>Hello {safe_name},</p>
    <p>You requested a password reset for your Claritas account.</p>
    <p><a href="{reset_url}" style="display: inline-block; padding: 12px 24px; background-color: #0b7d72; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">Reset Password</a></p>
    <p style="font-size: 14px; color: #666;">This link will expire in 1 hour.</p>
    <p style="font-size: 14px; color: #666;">If you did not request this reset, please ignore this email.</p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
    <p style="font-size: 12px; color: #999;">— Claritas Team</p>
</body>
</html>
        """

        msg.attach(MIMEText(text, "plain"))
        msg.attach(MIMEText(html, "html"))

        try:
            with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as server:
                server.starttls()
                server.login(smtp_user, smtp_pass)
                server.sendmail(from_email, body.email, msg.as_string())
            logger.info("Password reset email sent to %s", email)
        except Exception:
            logger.exception("Failed to send password reset email to %s", email)
            if ENVIRONMENT == "development":
                logger.warning("Development password reset token for %s: %s", email, reset_token)
    else:
        if ENVIRONMENT == "development":
            logger.warning("Development password reset token for %s: %s", email, reset_token)
        else:
            logger.error("SMTP is not configured; password reset email was not sent")

    return ForgotPasswordResponse(
        message="If the email exists, a reset link has been sent to the registered email.",
    )


@router.post(
    "/refresh",
    response_model=TokenOut,
    summary="Refresh access token",
    description=(
        "Issue a new access token by validating the refresh token stored in an HttpOnly cookie. "
        "The refresh token is rotated and set again in the cookie."
    ),
)
def refresh_token(response: Response, request: Request, db: Session = Depends(get_db)):
    """Refresh the user's access token using the secure refresh-token cookie."""
    enforce_rate_limit(request, "refresh", limit=30, window_seconds=60)
    validate_cookie_request_origin(request)
    refresh_token_value = get_refresh_token_from_request(request)
    if not refresh_token_value:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token missing")

    payload = decode_refresh_token(refresh_token_value)
    if payload is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token payload")

    try:
        parsed_user_id = int(user_id)
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token payload"
        ) from None

    user = db.query(User).filter(User.id == parsed_user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    if payload.get("ver") != user.token_version:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token revoked")

    access_token = create_access_token(_token_claims(user))
    new_refresh_token = create_refresh_token(_token_claims(user))
    _set_auth_cookies(response, access_token, new_refresh_token)
    return TokenOut(access_token=access_token)


@router.post("/reset-password", response_model=ResetPasswordResponse)
def reset_password(
    body: ResetPasswordRequest, request: Request, db: Session = Depends(get_db)
):
    """Reset a user's password using a valid reset token."""
    enforce_rate_limit(request, "reset_password", limit=5, window_seconds=60)
    token_hash = hashlib.sha256(body.reset_token.encode("utf-8")).hexdigest()
    user = db.query(User).filter(User.reset_token == token_hash).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid reset token")

    # Check if token has expired
    if not user.reset_token_expires or user.reset_token_expires < _utcnow_naive():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Reset token has expired")

    # Update password and clear reset token
    user.hashed_password = hash_password(body.new_password)
    user.token_version += 1
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()

    return ResetPasswordResponse(message="Password successfully reset. You can now login with the new password.")
