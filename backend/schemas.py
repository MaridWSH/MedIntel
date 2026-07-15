"""Pydantic schemas for request/response validation."""

from datetime import datetime
import re
from typing import Any, Literal, Optional

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator


# ── Auth ──────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    email: EmailStr = Field(..., description="User email address used for login and account recovery.")
    name: str = Field(..., min_length=2, max_length=255, description="Display name for the user account.")
    password: str = Field(..., min_length=8, max_length=128, description="Password for the new account.")

    @field_validator("name")
    @classmethod
    def name_must_not_be_email(cls, value: str) -> str:
        if "@" in value:
            raise ValueError("Name must not be an email address.")
        return value

    @field_validator("name")
    @classmethod
    def name_must_be_valid(cls, value: str) -> str:
        cleaned = value.strip()
        if not re.match(r"^[A-Za-z0-9\s\-'\.]+$", cleaned):
            raise ValueError("Name can only contain letters, numbers, spaces, hyphens, apostrophes, and periods.")
        return cleaned

    @field_validator("password")
    @classmethod
    def password_must_be_strong(cls, value: str) -> str:
        if not re.search(r"[A-Z]", value):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not re.search(r"[a-z]", value):
            raise ValueError("Password must contain at least one lowercase letter.")
        if not re.search(r"[0-9]", value):
            raise ValueError("Password must contain at least one digit.")
        return value


class UserLogin(BaseModel):
    email: EmailStr = Field(..., description="Registered email address.")
    password: str = Field(..., description="Account password.")


class UserOut(BaseModel):
    id: int
    email: str
    name: str
    created_at: datetime

    class Config:
        from_attributes = True

    class Config:
        from_attributes = True


class TokenOut(BaseModel):
    access_token: str = Field(..., description="JWT access token for authenticated requests.")
    token_type: str = Field("bearer", description="OAuth2 token type.")


class LoginResponse(BaseModel):
    access_token: str = Field(..., description="JWT access token returned after successful login.")
    token_type: str = Field("bearer", description="OAuth2 token type.")
    user: UserOut = Field(..., description="Authenticated user profile data.")


class RegisterResponse(BaseModel):
    access_token: str = Field(..., description="JWT access token returned after successful registration.")
    token_type: str = Field("bearer", description="OAuth2 token type.")
    user: UserOut = Field(..., description="Profile data for the newly registered user.")


class ForgotPasswordRequest(BaseModel):
    email: str


class ForgotPasswordResponse(BaseModel):
    message: str


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
    title: str
    tldr: str
    study_type: str
    specialty_tags: list[str]
    overall_evidence_level: Optional[str] = None
    sample_size: Optional[str] = None


class PaperDetail(BaseModel):
    id: str
    title: str
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


# ── Hybrid Search ────────────────────────────────────────────────────────────


SortOption = Literal["relevance", "newest", "oldest", "highest_evidence", "title"]


class YearRange(BaseModel):
    """Inclusive publication-year range filter."""

    from_: int | None = Field(None, alias="from", ge=1900, le=2200)
    to: int | None = Field(None, ge=1900, le=2200)

    model_config = {"populate_by_name": True}


class HybridSearchFilters(BaseModel):
    """Filters applied AFTER hybrid retrieval.

    Same-field values are OR-combined.
    Different fields are AND-combined.
    """

    specialties: list[str] | None = None
    study_types: list[str] | None = None
    evidence_levels: list[str] | None = None
    journals: list[str] | None = None
    languages: list[str] | None = None
    authors: list[str] | None = None
    years: YearRange | None = None


class HybridSearchItem(BaseModel):
    """One result in a hybrid search response."""

    paper_id: str
    title: str
    tldr: str
    study_type: str
    specialty_tags: list[str]
    publication_year: int | None = None
    journal: str = ""
    language: str = ""
    author_list: str = ""
    evidence_level: str = ""
    processing_time: float = 0.0
    has_errors: bool = False

    semantic_score: float | None = None
    keyword_score: float | None = None
    final_score: float


class FacetBucket(BaseModel):
    """One value/count pair inside a facet."""

    value: str | int
    count: int


class Facets(BaseModel):
    """Dynamic facet counts for a search result set."""

    specialty: list[FacetBucket] | None = None
    study_type: list[FacetBucket] | None = None
    evidence_level: list[FacetBucket] | None = None
    publication_year: list[FacetBucket] | None = None
    journal: list[FacetBucket] | None = None
    language: list[FacetBucket] | None = None


class HybridSearchResponse(BaseModel):
    """Hybrid search response."""

    query: str | None = None
    page: int
    page_size: int
    total: int
    filters: HybridSearchFilters | None = None
    facets: Facets | None = None
    items: list[HybridSearchItem]


class HybridSearchRequest(BaseModel):
    """Hybrid (semantic + keyword) search request."""

    query: str | None = Field(
        None,
        description="Free-text query. If omitted, only filters are applied.",
        example="nutrition in obesity",
    )
    page: int = Field(1, ge=1, description="1-based page number")
    page_size: int = Field(20, ge=1, le=100, description="Items per page")
    sort: SortOption = Field("relevance", description="Sort strategy")
    filters: HybridSearchFilters | None = None

    # Advanced tuning (optional) — controls hybrid balance.
    semantic_weight: float | None = Field(
        None, ge=0.0, le=1.0,
        description="Override semantic weight in [0,1]. keyword_weight = 1 - semantic_weight.",
    )
    rrf_k: int | None = Field(
        None, ge=1, le=100,
        description="Reciprocal Rank Fusion constant k. Default 60.",
    )
    facets_enabled: bool = Field(
        True,
        description="Compute and return dynamic facet counts for the result set.",
    )

    @model_validator(mode="after")
    def require_query_or_filters(self):
        # Browse mode (no query, no filters) is allowed: returns all papers.
        return self


# ── Legacy semantic search schemas (kept for backward compatibility) ─────────


class SemanticSearchRequest(BaseModel):
    """Request body for semantic search (legacy)."""

    query: str = Field(..., min_length=1, description="Free-text search query", example="obesity")
    top_k: int = Field(5, ge=1, le=100, description="Number of results to return")
    filters: dict[str, Any] | None = Field(
        None, description="Optional metadata filters (e.g., {'study_type': 'RCT'})",
    )
    score_threshold: float | None = Field(
        None, ge=0.0, le=1.0,
        description="Minimum cosine similarity score.",
    )


class SemanticSearchResult(BaseModel):
    """One paper returned by semantic search (legacy)."""

    id: str
    title: str
    tldr: str
    study_type: str
    specialty_tags: list[str]
    journal: str = ""
    doi: str = ""
    author_list: str = ""
    authors_count: int | None = None
    centers_count: int | None = None
    overall_evidence_level: Optional[str] = None
    sample_size: Optional[str] = None
    score: float
    processing_time: float = 0.0
    has_errors: bool = False


class SemanticSearchResponse(BaseModel):
    """Response from the semantic search endpoint (legacy)."""

    query: str
    top_k: int
    total: int
    items: list[SemanticSearchResult]


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
