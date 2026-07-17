"""Admin-related Pydantic schemas."""

from datetime import datetime

from pydantic import BaseModel, Field


class UserAdminOut(BaseModel):
    id: int
    email: str
    name: str
    is_admin: bool
    created_at: datetime
    saved_papers_count: int = 0

    class Config:
        from_attributes = True


class UserAdminUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=255)
    email: str | None = Field(None, min_length=3, max_length=255)
    is_admin: bool | None = None


class AdminPasswordResetRequest(BaseModel):
    new_password: str = Field(..., min_length=6)


class AdminPaperUpdate(BaseModel):
    title: str | None = None
    tldr: str | None = None
    detailed_summary: str | None = None
    study_type: str | None = None
    specialty_tags: list[str] | None = None
    journal: str | None = None
    doi: str | None = None
    author_list: str | None = None
    authors_count: int | None = None
    centers: list[str] | None = None
    centers_count: int | None = None
    citation: str | None = None
    sections: list[str] | None = None
    excerpt: str | None = None
    reviewer: str | None = None


class AdminPaperListFilters(BaseModel):
    has_errors: bool | None = None
    empty_tldr: bool | None = None
    empty_summary: bool | None = None
    no_doi: bool | None = None
    study_type: str | None = None
    specialty: str | None = None


class AdminStatsResponse(BaseModel):
    users_count: int
    papers_count: int
    saved_papers_count: int
    papers_with_errors: int
    papers_without_tldr: int
    papers_without_summary: int
    papers_without_doi: int
    qdrant_vector_count: int | None = None


class AdminHealthResponse(BaseModel):
    status: str
    database: str
    qdrant: str


class AdminReindexRequest(BaseModel):
    limit: int | None = Field(None, ge=1)
    recreate: bool = False
    only_missing: bool = False


class AdminReindexResponse(BaseModel):
    indexed: int
    qdrant_total: int
    missing_before: int | None = None


class AdminSingleReindexResponse(BaseModel):
    paper_id: str
    indexed: bool


class AdminIngestResponse(BaseModel):
    ingested: int
    skipped: int
    errors: int
    indexed: int
    total_in_db: int


class AdminBackfillResponse(BaseModel):
    updated: int
    skipped_no_xml: int
    skipped_already_filled: int
    errors: int
