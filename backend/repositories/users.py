"""User account repository — database access."""

from __future__ import annotations

from sqlalchemy.orm import Session

from database.models import SavedPaper, User


def get_by_id(db: Session, user_id: int) -> User | None:
    """Fetch a user by ID."""
    return db.query(User).filter(User.id == user_id).first()


def get_by_email(db: Session, email: str) -> User | None:
    """Fetch a user by email (case-insensitive)."""
    return db.query(User).filter(User.email == email.lower()).first()


def create_user(db: Session, *, email: str, name: str, hashed_password: str) -> User:
    """Create and persist a new user."""
    user = User(email=email.lower(), name=name, hashed_password=hashed_password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user: User) -> None:
    """Delete a user and their saved-paper records."""
    db.query(SavedPaper).filter(SavedPaper.user_id == user.id).delete()
    db.delete(user)
    db.commit()


def count_saved_papers(db: Session, user_id: int) -> int:
    """Count papers saved by the user."""
    return db.query(SavedPaper).filter(SavedPaper.user_id == user_id).count()


def list_saved_papers(db: Session, user_id: int) -> list[tuple[SavedPaper, object]]:
    """Return saved-paper rows joined with papers, ordered by saved_at desc."""
    from database.models import Paper

    return (
        db.query(SavedPaper, Paper)
        .join(Paper, Paper.id == SavedPaper.paper_id)
        .filter(SavedPaper.user_id == user_id)
        .order_by(SavedPaper.saved_at.desc())
        .all()
    )


def save_paper(db: Session, user_id: int, paper_id: str) -> SavedPaper:
    """Create a saved-paper record."""
    saved = SavedPaper(user_id=user_id, paper_id=paper_id)
    db.add(saved)
    db.commit()
    db.refresh(saved)
    return saved


def find_saved_paper(db: Session, user_id: int, paper_id: str) -> SavedPaper | None:
    """Return a saved-paper record or None."""
    return (
        db.query(SavedPaper)
        .filter(SavedPaper.user_id == user_id, SavedPaper.paper_id == paper_id)
        .first()
    )


def remove_saved_paper(db: Session, saved: SavedPaper) -> None:
    """Delete a saved-paper record."""
    db.delete(saved)
    db.commit()


def email_exists(db: Session, email: str) -> bool:
    """Check whether an email is already registered."""
    return db.query(User).filter(User.email == email.lower()).first() is not None
