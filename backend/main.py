"""MedIntel Backend API — FastAPI application."""

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.api.v1 import admin, auth, papers, user
from app.core.database import Base, engine, get_db
from app.db.models import Paper
from app.schemas import HealthResponse

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MedIntel API",
    description="Clinical literature synthesis API — serves processed nutrition papers.",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    redirect_slashes=False,  # ponytail: trailing-slash 307 breaks CORS preflight — browsers refuse redirects on OPTIONS
)

# CORS — allow frontend dev server and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "https://med.aidashnews.tech",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(auth.router, prefix="/api")
app.include_router(papers.router, prefix="/api")
app.include_router(user.router, prefix="/api")
app.include_router(admin.router, prefix="/api")


@app.get("/api/health", response_model=HealthResponse, tags=["health"])
def health(db: Session = Depends(get_db)):
    """Health check — returns status and paper count."""
    count = db.query(Paper).count()
    return HealthResponse(status="ok", papers_count=count)
