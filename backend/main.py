"""MedIntel Backend API — FastAPI application."""

import os
import json
import logging
import time
import uuid

from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text as sql_text
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from models import Paper
from routers import auth, feedback, papers, search, user
from schemas import HealthResponse, ReadinessResponse
from services.qdrant_service import collection_exists

# MVP bootstrap. Production schema changes must be applied with a migration
# before deploying; create_all only creates missing tables.
Base.metadata.create_all(bind=engine)

environment = os.getenv("MEDINTEL_ENV", "development").strip().lower()
docs_enabled = os.getenv(
    "MEDINTEL_ENABLE_DOCS", "false" if environment == "production" else "true"
).lower() == "true"
allowed_origins = [
    origin.strip().rstrip("/")
    for origin in os.getenv(
        "MEDINTEL_ALLOWED_ORIGINS",
        "http://localhost:3000,http://localhost:3001,"
        "http://127.0.0.1:3000,http://127.0.0.1:3001,"
        "https://med.aidashnews.tech",
    ).split(",")
    if origin.strip()
]
logger = logging.getLogger("medintel.api")

app = FastAPI(
    title="MedIntel API",
    description="Clinical literature synthesis API — serves processed nutrition papers.",
    version="0.1.0",
    docs_url="/docs" if docs_enabled else None,
    redoc_url="/redoc" if docs_enabled else None,
    openapi_url="/openapi.json" if docs_enabled else None,
    redirect_slashes=False,  # ponytail: trailing-slash 307 breaks CORS preflight — browsers refuse redirects on OPTIONS
)

# CORS — allow frontend dev server and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.middleware("http")
async def request_observability(request: Request, call_next):
    """Attach a request ID and emit one structured completion log per request."""
    request_id = uuid.uuid4().hex
    started = time.monotonic()
    try:
        response = await call_next(request)
    except Exception:
        logger.exception(
            json.dumps(
                {
                    "event": "request_failed",
                    "request_id": request_id,
                    "method": request.method,
                    "path": request.url.path,
                    "duration_ms": round((time.monotonic() - started) * 1000),
                }
            )
        )
        raise
    response.headers["X-Request-ID"] = request_id
    logger.info(
        json.dumps(
            {
                "event": "request_completed",
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "status": response.status_code,
                "duration_ms": round((time.monotonic() - started) * 1000),
            }
        )
    )
    return response

# Mount routers
app.include_router(auth.router, prefix="/api")
app.include_router(feedback.router, prefix="/api")
app.include_router(papers.router, prefix="/api")
app.include_router(search.router, prefix="/api")
app.include_router(user.router, prefix="/api")


@app.get("/api/health", response_model=HealthResponse, tags=["health"])
def health(db: Session = Depends(get_db)):
    """Health check — returns status and paper count."""
    count = db.query(Paper).count()
    return HealthResponse(status="ok", papers_count=count)


@app.get("/api/ready", response_model=ReadinessResponse, tags=["health"])
def readiness(db: Session = Depends(get_db)):
    """Deployment readiness check for the database and semantic index."""
    try:
        db.execute(sql_text("SELECT 1"))
        vector_ready = collection_exists()
        corpus_ready = papers.current_corpus_count(db) > 0
    except Exception as exc:
        logger.exception("Readiness check failed")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="A required backend dependency is unavailable",
        ) from exc
    if not vector_ready:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Semantic-search collection is not initialized",
        )
    if not corpus_ready:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="No verified results from the current pipeline version are loaded",
        )
    return ReadinessResponse(status="ready", database="ok", vector_index="ok")
