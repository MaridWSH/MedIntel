"""Public analytics event ingestion endpoint."""

from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session

from database import get_db
from schemas import AnalyticsEventCreate, AnalyticsEventOut
from services import analytics as analytics_service

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.post("/event", response_model=AnalyticsEventOut, status_code=status.HTTP_201_CREATED)
def track_event(
    body: AnalyticsEventCreate,
    request: Request,
    db: Session = Depends(get_db),
):
    """Record an analytics event from the frontend.

    Accepts visitor_id and session_id from the client so anonymous traffic can
    be tracked without authentication. Respects Do Not Track headers.
    """
    event = analytics_service.ingest_client_event(body, request, db)
    return AnalyticsEventOut.model_validate(event)
