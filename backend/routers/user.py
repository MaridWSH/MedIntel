"""User router — saved papers, dashboard stats."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import Paper, SavedPaper, User
from schemas import SavedPaperOut, SavedPapersListResponse, SavePaperResponse

router = APIRouter(prefix="/user", tags=["user"])


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
    # Check paper exists
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")

    # Check if already saved
    existing = (
        db.query(SavedPaper)
        .filter(SavedPaper.user_id == current_user.id, SavedPaper.paper_id == paper_id)
        .first()
    )
    if existing:
        return SavePaperResponse(message="Paper already saved", paper_id=paper_id)

    # Save it
    saved = SavedPaper(user_id=current_user.id, paper_id=paper_id)
    db.add(saved)
    db.commit()

    return SavePaperResponse(message="Paper saved", paper_id=paper_id)


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
    saved = (
        db.query(SavedPaper)
        .filter(SavedPaper.user_id == current_user.id, SavedPaper.paper_id == paper_id)
        .first()
    )
    if not saved:
        raise HTTPException(status_code=404, detail="Paper not in saved library")

    db.delete(saved)
    db.commit()

    return SavePaperResponse(message="Paper removed from library", paper_id=paper_id)


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
    saved = (
        db.query(SavedPaper)
        .filter(SavedPaper.user_id == current_user.id)
        .order_by(SavedPaper.saved_at.desc())
        .all()
    )
    return SavedPapersListResponse(
        items=[SavedPaperOut.model_validate(s) for s in saved],
        total=len(saved),
    )


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
    saved = (
        db.query(SavedPaper)
        .filter(SavedPaper.user_id == current_user.id, SavedPaper.paper_id == paper_id)
        .first()
    )
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
    saved_count = (
        db.query(SavedPaper)
        .filter(SavedPaper.user_id == current_user.id)
        .count()
    )
    total_papers = db.query(Paper).count()

    return {
        "saved_papers": saved_count,
        "total_papers_available": total_papers,
        "member_since": current_user.created_at.isoformat(),
    }
