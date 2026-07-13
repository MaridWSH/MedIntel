"""MedIntel Backend API — FastAPI application."""

import os
from pathlib import Path

# Load environment variables from .env before any module imports them.
# dotenv is an optional dependency; if it is not installed, the app falls back
# to environment variables set externally.
try:
    from dotenv import load_dotenv

    load_dotenv(Path(__file__).parent.parent / ".env")
except ImportError:
    pass

import logging
import time

from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import Base, SessionLocal, engine, get_db
from models import Paper
from routers import auth, papers, search
from schemas import HealthResponse
from services.embedding_service import get_embedding_service
from services.fts_service import backfill_search_vectors, install_fts_trigger

# ---------------------------------------------------------------------------
# Logging configuration
# ---------------------------------------------------------------------------

LOG_LEVEL = os.environ.get("MEDINTEL_LOG_LEVEL", "INFO").upper()
LOG_FILE = os.environ.get("MEDINTEL_LOG_FILE", "logs/medintel.log")
LOG_PATH = Path(LOG_FILE)
if not LOG_PATH.is_absolute():
    # Resolve relative paths against the backend directory so logs are always
    # written to the same place regardless of where uvicorn is started.
    LOG_PATH = Path(__file__).parent / LOG_PATH
LOG_DIR = LOG_PATH.parent
LOG_DIR.mkdir(parents=True, exist_ok=True)

# Line-buffered file stream so request logs are flushed immediately.
_file_stream = open(LOG_PATH, "a", encoding="utf-8", buffering=1)

_formatter = logging.Formatter(
    "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
_file_handler = logging.StreamHandler(stream=_file_stream)
_file_handler.setFormatter(_formatter)
_console_handler = logging.StreamHandler()
_console_handler.setFormatter(_formatter)

# Attach file handler to the root logger so all module-level logs
# (services, repositories, etc.) are written to the log file.
root_logger = logging.getLogger()
root_logger.setLevel(getattr(logging, LOG_LEVEL, logging.INFO))
root_logger.addHandler(_file_handler)
root_logger.addHandler(_console_handler)

logger = logging.getLogger(__name__)
logger.setLevel(getattr(logging, LOG_LEVEL, logging.INFO))
logger.addHandler(_file_handler)
logger.addHandler(_console_handler)
logger.propagate = False

# ---------------------------------------------------------------------------
# FastAPI application
# ---------------------------------------------------------------------------

# Create all tables on startup
Base.metadata.create_all(bind=engine)

# Install / patch the PostgreSQL FTS trigger and backfill any missing vectors.
install_fts_trigger()
with SessionLocal() as _session:
    backfill_search_vectors(_session)

app = FastAPI(
    title="MedIntel API",
    description="Clinical literature synthesis API — serves processed nutrition papers.",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Startup: preload embedding model so the first search is fast
# ---------------------------------------------------------------------------

@app.on_event("startup")
def preload_embedding_model():
    """Load the embedding model at startup to avoid delay on first request."""
    t_start = time.perf_counter()
    try:
        service = get_embedding_service()
        service.warm_up()
        logger.info("Embedding model preloaded in %.3fs", time.perf_counter() - t_start)
    except Exception:
        logger.exception("Failed to preload embedding model")
        raise

# ---------------------------------------------------------------------------
# Request/response logging middleware
# ---------------------------------------------------------------------------

@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log every request, response status, and processing time."""
    start_time = time.time()
    method = request.method
    path = request.url.path
    client = request.client.host if request.client else "unknown"

    try:
        response = await call_next(request)
        duration = time.time() - start_time
        logger.info(
            "Request %s %s from %s completed %s in %.3fs",
            method,
            path,
            client,
            response.status_code,
            duration,
        )
        return response
    except Exception as exc:
        duration = time.time() - start_time
        logger.exception(
            "Request %s %s from %s failed after %.3fs",
            method,
            path,
            client,
            duration,
        )
        raise


# Mount routers
app.include_router(auth.router, prefix="/api")
app.include_router(papers.router, prefix="/api")
app.include_router(search.router, prefix="/api")


@app.get("/api/health", response_model=HealthResponse, tags=["health"])
def health(db: Session = Depends(get_db)):
    """Health check — returns status and paper count."""
    count = db.query(Paper).count()
    return HealthResponse(status="ok", papers_count=count)
