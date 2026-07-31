"""User router — saved papers, dashboard stats.

Business logic lives in services.users and repositories.users.
This router only handles HTTP concerns.
"""

from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from core.auth import get_current_user
from database import get_db
from database.models import User
from repositories.catalogue import current_corpus_count, REQUIRE_CURRENT_PIPELINE
from repositories.users import count_saved_papers, find_saved_paper
from schemas import DeleteAccountResponse, SavedPapersListResponse, SavePaperResponse
from services.users import (
    delete_account as delete_user_account,
    list_saved_papers_for_user,
    save_paper_for_user,
    unsave_paper_for_user,
)

router = APIRouter(prefix="/user", tags=["user"])


@router.delete("/account", response_model=DeleteAccountResponse)
def delete_account(
    response: Response,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Permanently delete the current account and its saved-paper records."""
    return delete_user_account(db, current_user, response)


@router.post(
    "/papers/{paper_id}/save",
    response_model=SavePaperResponse,
    summary="Save a paper",
)
def save_paper(
    paper_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Save a paper to the user's library."""
    return save_paper_for_user(db, current_user, paper_id)


@router.delete(
    "/papers/{paper_id}/save",
    response_model=SavePaperResponse,
    summary="Unsave a paper",
)
def unsave_paper(
    paper_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Remove a paper from the user's library."""
    return unsave_paper_for_user(db, current_user, paper_id)


@router.get(
    "/saved-papers",
    response_model=SavedPapersListResponse,
    summary="List saved papers",
)
def list_saved_papers(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all papers saved by the current user."""
    return list_saved_papers_for_user(db, current_user)


@router.get(
    "/papers/{paper_id}/is-saved",
    summary="Check if paper is saved",
)
def is_paper_saved(
    paper_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Check if a paper is in the user's saved library."""
    saved = find_saved_paper(db, current_user.id, paper_id)
    return {"is_saved": saved is not None}


@router.get(
    "/dashboard/stats",
    summary="Dashboard statistics",
)
def dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get dashboard statistics for the current user."""
    saved_count = count_saved_papers(db, current_user.id)
    total_papers = (
        current_corpus_count(db)
        if REQUIRE_CURRENT_PIPELINE
        else db.query(Paper).filter(Paper.tldr != "", Paper.tldr.isnot(None)).count()
    )

    return {
        "saved_papers": saved_count,
        "total_papers_available": total_papers,
        "member_since": current_user.created_at.isoformat(),
    }
