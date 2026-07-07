"""Pydantic schemas for request/response validation."""

from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, EmailStr, Field


# ── Auth ──────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    email: str = Field(..., min_length=3, max_length=255)
    name: str = Field(..., min_length=1, max_length=255)
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    name: str
    created_at: datetime

    class Config:
        from_attributes = True


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class RegisterResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class ForgotPasswordRequest(BaseModel):
    email: str


class ForgotPasswordResponse(BaseModel):
    message: str
    reset_token: str  # In production, this would be sent via email, not returned


class ResetPasswordRequest(BaseModel):
    reset_token: str
    new_password: str = Field(..., min_length=6)


class ResetPasswordResponse(BaseModel):
    message: str


class LogoutResponse(BaseModel):
    message: str


# ── Papers ────────────────────────────────────────────────────────────────────

class PaperListItem(BaseModel):
    id: str
    tldr: str
    study_type: str
    specialty_tags: list[str]
    overall_evidence_level: Optional[str] = None
    sample_size: Optional[str] = None


class PaperDetail(BaseModel):
    id: str
    tldr: str
    detailed_summary: str
    study_type: str
    specialty_tags: list[str]
    pico_summary: Optional[Any] = None
    key_findings: Optional[Any] = None
    mind_map: Optional[Any] = None
    verification: Optional[Any] = None
    processing_time: float
    has_errors: bool


class PaperListResponse(BaseModel):
    items: list[PaperListItem]
    total: int
    page: int
    per_page: int
    pages: int


class SearchResponse(BaseModel):
    items: list[PaperListItem]
    total: int
    page: int
    per_page: int
    pages: int
    query: str


class IngestRequest(BaseModel):
    source_dir: str = "/root/papers/pipeline_outputs/results"
    limit: Optional[int] = None


class IngestResponse(BaseModel):
    ingested: int
    skipped: int
    errors: int
    total_in_db: int


# ── Health ────────────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str = "ok"
    papers_count: int = 0
