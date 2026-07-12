"""MedIntel Backend API — FastAPI application."""

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .models import Paper
from .routers import auth, papers
from .schemas import HealthResponse

# Create all tables on startup
Base.metadata.create_all(bind=engine)

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

# Mount routers
app.include_router(auth.router, prefix="/api")
app.include_router(papers.router, prefix="/api")


@app.get("/api/health", response_model=HealthResponse, tags=["health"])
def health(db: Session = Depends(get_db)):
    """Health check — returns status and paper count."""
    count = db.query(Paper).count()
    return HealthResponse(status="ok", papers_count=count)
