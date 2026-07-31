"""User account business logic."""

from __future__ import annotations

from fastapi import Response, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from core.auth import (
    ACCESS_TOKEN_COOKIE,
    REFRESH_TOKEN_COOKIE,
    hash_password,
    verify_password,
)
from database.models import Paper, SavedPaper, User
from repositories import users as user_repository
from schemas import (
    DeleteAccountResponse,
    LoginResponse,
    RegisterResponse,
    SavePaperResponse,
    SavedPaperOut,
    SavedPapersListResponse,
    UserCreate,
    UserLogin,
    UserOut,
)


def _clear_auth_cookies(response: Response) -> None:
    response.delete_cookie(ACCESS_TOKEN_COOKIE, path="/api")
    response.delete_cookie(REFRESH_TOKEN_COOKIE, path="/api/auth")


def register_user(
    body: UserCreate,
    db: Session,
    response: Response,
    create_token,
    create_refresh_token,
    secure_cookies: bool,
    access_token_minutes: int,
    refresh_token_days: int,
) -> RegisterResponse:
    """Create a new user account and set auth cookies."""
    email = str(body.email).strip().lower()
    name = body.name.strip()
    if not name:
        from fastapi import HTTPException

        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Name is required")

    if user_repository.email_exists(db, email):
        from fastapi import HTTPException

        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = user_repository.create_user(
        db, email=email, name=name, hashed_password=hash_password(body.password)
    )

    token = create_token({"sub": str(user.id), "ver": user.token_version})
    refresh_token = create_refresh_token({"sub": str(user.id), "ver": user.token_version})

    response.set_cookie(
        ACCESS_TOKEN_COOKIE,
        token,
        httponly=True,
        secure=secure_cookies,
        samesite="lax",
        path="/api",
        max_age=access_token_minutes * 60,
    )
    response.set_cookie(
        REFRESH_TOKEN_COOKIE,
        refresh_token,
        httponly=True,
        secure=secure_cookies,
        samesite="lax",
        path="/api/auth",
        max_age=refresh_token_days * 24 * 60 * 60,
    )

    return RegisterResponse(access_token=token, user=UserOut.model_validate(user))


def login_user(
    body: UserLogin,
    db: Session,
    response: Response,
    create_token,
    create_refresh_token,
    secure_cookies: bool,
    access_token_minutes: int,
    refresh_token_days: int,
) -> LoginResponse:
    """Authenticate a user and set auth cookies."""
    email = str(body.email).strip().lower()
    user = user_repository.get_by_email(db, email)
    if not user or not verify_password(body.password, user.hashed_password):
        from fastapi import HTTPException

        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_token({"sub": str(user.id), "ver": user.token_version})
    refresh_token = create_refresh_token({"sub": str(user.id), "ver": user.token_version})

    response.set_cookie(
        ACCESS_TOKEN_COOKIE,
        token,
        httponly=True,
        secure=secure_cookies,
        samesite="lax",
        path="/api",
        max_age=access_token_minutes * 60,
    )
    response.set_cookie(
        REFRESH_TOKEN_COOKIE,
        refresh_token,
        httponly=True,
        secure=secure_cookies,
        samesite="lax",
        path="/api/auth",
        max_age=refresh_token_days * 24 * 60 * 60,
    )

    return LoginResponse(access_token=token, user=UserOut.model_validate(user))


def delete_account(db: Session, user: User, response: Response) -> DeleteAccountResponse:
    """Delete the current user and clear auth cookies."""
    user_repository.delete_user(db, user)
    _clear_auth_cookies(response)
    return DeleteAccountResponse(message="Account deleted")


def save_paper_for_user(db: Session, user: User, paper_id: str) -> SavePaperResponse:
    """Save a paper to the user's library."""
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="Paper not found")

    existing = user_repository.find_saved_paper(db, user.id, paper_id)
    if existing:
        return SavePaperResponse(message="Paper already saved", paper_id=paper_id)

    try:
        user_repository.save_paper(db, user.id, paper_id)
    except IntegrityError:
        db.rollback()
        return SavePaperResponse(message="Paper already saved", paper_id=paper_id)

    return SavePaperResponse(message="Paper saved", paper_id=paper_id)


def unsave_paper_for_user(db: Session, user: User, paper_id: str) -> SavePaperResponse:
    """Remove a paper from the user's library."""
    saved = user_repository.find_saved_paper(db, user.id, paper_id)
    if not saved:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="Paper not in saved library")

    user_repository.remove_saved_paper(db, saved)
    return SavePaperResponse(message="Paper removed from library", paper_id=paper_id)


def list_saved_papers_for_user(db: Session, user: User) -> SavedPapersListResponse:
    """Return the user's saved papers."""
    saved_rows = user_repository.list_saved_papers(db, user.id)
    return SavedPapersListResponse(
        items=[
            SavedPaperOut(
                paper_id=saved.paper_id,
                saved_at=saved.saved_at,
                title=paper.title or "",
                tldr=paper.tldr or "",
                study_type=paper.study_type or "",
            )
            for saved, paper in saved_rows
        ],
        total=len(saved_rows),
    )
