"""Admin-only user management endpoints."""

from __future__ import annotations

import hashlib
import os
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from core.auth import get_current_admin, is_admin_user
from database import get_db
from database.models import User
from repositories import users as user_repository
from schemas import UserOut

router = APIRouter(prefix="/users", tags=["admin-users"])


def _env_admin_emails() -> set[str]:
    return {
        email.strip().lower()
        for email in os.getenv("MEDINTEL_ADMIN_EMAILS", "").split(",")
        if email.strip()
    }


def _count_all_admins(db: Session) -> int:
    """Count unique admin emails from env list plus users with is_admin=True."""
    env_admins = _env_admin_emails()
    db_admin_emails = {
        u.email.lower()
        for u in db.query(User.email).filter(User.is_admin.is_(True)).all()
    }
    return len(env_admins | db_admin_emails)


@router.get("/me", response_model=UserOut)
def admin_me(
    current_user: User = Depends(get_current_admin),
):
    """Return the current admin user's profile."""
    return UserOut.model_validate(current_user)


@router.get("", response_model=dict)
def list_users(
    q: str | None = Query(None, description="Search by email or name"),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    _admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """List and search registered users."""
    query = db.query(User)
    if q:
        pattern = f"%{q}%"
        query = query.filter(
            or_(User.email.ilike(pattern), User.name.ilike(pattern))
        )

    total = query.count()
    pages = max(1, (total + per_page - 1) // per_page)
    items = query.order_by(User.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()

    return {
        "items": [UserOut.model_validate(u) for u in items],
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": pages,
    }


@router.get("/{user_id}", response_model=UserOut)
def get_user(
    user_id: int,
    _admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Get a single user by ID."""
    user = user_repository.get_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return UserOut.model_validate(user)


@router.patch("/{user_id}/admin")
def toggle_admin(
    user_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Promote or demote a user's admin status."""
    target = user_repository.get_by_id(db, user_id)
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if target.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot change your own admin status",
        )

    if target.email.lower() in _env_admin_emails():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Users in MEDINTEL_ADMIN_EMAILS cannot be demoted via the UI",
        )

    if target.is_admin and _count_all_admins(db) <= 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot remove the last administrator",
        )

    target.is_admin = not target.is_admin
    db.commit()
    db.refresh(target)
    return {
        "message": f"User {'promoted to' if target.is_admin else 'demoted from'} administrator",
        "user": UserOut.model_validate(target),
    }


@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Delete a user account."""
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete your own account from this endpoint",
        )

    target = user_repository.get_by_id(db, user_id)
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if target.email.lower() in _env_admin_emails():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Users in MEDINTEL_ADMIN_EMAILS cannot be deleted via the UI",
        )

    if is_admin_user(target) and _count_all_admins(db) <= 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete the last administrator",
        )

    user_repository.delete_user(db, target)
    return {"message": "User deleted"}


@router.post("/{user_id}/reset-password")
def reset_user_password(
    user_id: int,
    _admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Generate a password reset token for a user."""
    target = user_repository.get_by_id(db, user_id)
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    raw_token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
    target.reset_token = token_hash
    target.reset_token_expires = datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(hours=1)
    db.commit()

    return {
        "message": "Password reset token generated",
        "reset_token": raw_token,
    }
