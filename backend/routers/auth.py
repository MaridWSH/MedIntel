"""Auth router — register, login, me, logout, forgot-password, reset-password."""

import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from auth import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    enforce_rate_limit,
    get_current_user,
    get_refresh_token_from_request,
    hash_password,
    REFRESH_TOKEN_EXPIRE_DAYS,
    SECURE_COOKIES,
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

    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(
        email=body.email,
        name=body.name,
        hashed_password=hash_password(body.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})
    response.set_cookie(
        "refresh_token",
        refresh_token,
        httponly=True,
        secure=SECURE_COOKIES,
        samesite="lax",
        path="/",
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
    )
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

    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})
    response.set_cookie(
        "refresh_token",
        refresh_token,
        httponly=True,
        secure=SECURE_COOKIES,
        samesite="lax",
        path="/",
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
    )
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
def logout(response: Response, current_user: User = Depends(get_current_user)):
    """Log out the current user. JWTs are stateless, so the client must discard the token."""
    response.delete_cookie("refresh_token")
    return LogoutResponse(message="Successfully logged out. Discard your token.")


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

    user = db.query(User).filter(User.email == body.email).first()
    if not user:
        # Don't reveal whether email exists — always return success
        return ForgotPasswordResponse(
            message="If the email exists, a reset link has been sent to the registered email.",
        )

    # Generate a secure random token
    reset_token = secrets.token_urlsafe(32)
    expires = datetime.utcnow() + timedelta(hours=1)  # 1 hour expiry (naive datetime for SQLite)

    user.reset_token = reset_token
    user.reset_token_expires = expires
    db.commit()

    # TODO: In production, send reset_token via email service (e.g., SendGrid, AWS SES)
    # For now, log it so admins can retrieve it for testing
    import logging
    logging.warning(f"Password reset token for {body.email}: {reset_token}")

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
    refresh_token_value = get_refresh_token_from_request(request)
    if not refresh_token_value:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token missing")

    payload = decode_refresh_token(refresh_token_value)
    if payload is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token payload")

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    access_token = create_access_token({"sub": str(user.id)})
    new_refresh_token = create_refresh_token({"sub": str(user.id)})
    response.set_cookie(
        "refresh_token",
        new_refresh_token,
        httponly=True,
        secure=SECURE_COOKIES,
        samesite="lax",
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
    )
    return TokenOut(access_token=access_token)


@router.post("/reset-password", response_model=ResetPasswordResponse)
def reset_password(body: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Reset a user's password using a valid reset token."""
    user = db.query(User).filter(User.reset_token == body.reset_token).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid reset token")

    # Check if token has expired
    if user.reset_token_expires and user.reset_token_expires < datetime.utcnow():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Reset token has expired")

    # Update password and clear reset token
    user.hashed_password = hash_password(body.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()

    return ResetPasswordResponse(message="Password successfully reset. You can now login with the new password.")
