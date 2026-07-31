"""Pydantic schemas for the paper catalogue, search, and ingestion."""

from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class MindMapNode(BaseModel):
    id: str = ""
    label: str = ""
    node_type: str = ""
    children: list["MindMapNode"] = []


class MindMapOut(BaseModel):
    nodes: list[MindMapNode] = []
    source: str = ""


class KeyFindingClinical(BaseModel):
    """Primary clinical finding with extracted statistical values. ponytail: best-effort parse."""

    headline: str = ""
    reduction: Optional[str] = None
    hr: Optional[float] = None
    ci: Optional[str] = None
    p_value: Optional[float] = None
    nnt: Optional[float] = None
    n: Optional[int] = None


class KeyFindingItem(BaseModel):
    claim: str = ""
    evidence_strength: str = ""
    finding_type: str = ""
    statistical_support: str = ""
    source_quote: str = ""
    limitations_noted: bool = False


class KeyFindingsOut(BaseModel):
    signal: str = ""
    practice_points: list[str] = []
    findings: list[KeyFindingItem] = []
    overall_evidence_level: Optional[str] = None
    sample_size: Optional[str] = None


class VerificationDomains(BaseModel):
    numerical: float = 0.0
    factual: float = 0.0
    overall: float = 0.0


class VerificationOut(BaseModel):
    score: float = 0.0
    grade: str = ""
    domains: VerificationDomains = VerificationDomains()
    bias_flags: list[str] = []
    limitations: list[str] = []
    passed: bool = False


class PaperListItem(BaseModel):
    id: str
    title: str
    tldr: str
    study_type: str
    specialty_tags: list[str]
    journal: str = ""
    doi: str = ""
    author_list: str = ""
    authors_count: int = 0
    centers_count: int = 0
    overall_evidence_level: Optional[str] = None
    sample_size: Optional[str] = None
    # 52% of the catalogue has no pipeline output at all — title and metadata
    # only. Surfacing that lets callers avoid presenting an empty shell as a
    # real result.
    has_summary: bool = True


class FullTextSection(BaseModel):
    """One section of the source paper, addressable by anchor."""

    id: str          # slug, used as the scroll anchor
    title: str
    level: int       # 2 = top-level section, 3 = subsection
    content: str     # markdown body


class FullTextResponse(BaseModel):
    paper_id: str
    title: str
    sections: list[FullTextSection]
    available: bool = True


class FacetValue(BaseModel):
    value: str
    count: int


class FacetsResponse(BaseModel):
    """Filter options that actually exist in the catalogue, with their counts."""

    study_types: list[FacetValue]
    specialties: list[FacetValue]


class PaperDetail(BaseModel):
    id: str
    title: str
    tldr: str
    detailed_summary: str
    study_type: str
    specialty_tags: list[str]
    journal: str = ""
    doi: str = ""
    author_list: str = ""
    authors_count: int = 0
    centers: list[str] = []
    centers_count: int = 0
    pico_summary: Optional[Any] = None
    # ponytail: typed structured fields
    has_errors: bool
    mind_map: Optional[MindMapOut] = None
    key_finding: Optional[KeyFindingClinical] = None
    key_findings: Optional[KeyFindingsOut] = None
    verification: Optional[VerificationOut] = None
    citation: str = ""
    sections: list[str] = []
    excerpt: str = ""
    reviewer: str = ""
    processing_time: float


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


class SemanticSearchRequest(BaseModel):
    """Request body for semantic search."""

    query: str = Field(
        ...,
        min_length=1,
        max_length=500,
        description="Free-text search query",
        json_schema_extra={"example": "obesity"},
    )
    top_k: int = Field(
        10,
        ge=1,
        le=100,
        description="Number of results to return",
        json_schema_extra={"example": 5},
    )
    filters: dict[str, Any] | None = Field(
        None,
        description="Optional metadata filters (e.g., {'study_type': 'RCT'})",
        json_schema_extra={"example": {"study_type": "other"}},
    )

    @field_validator("filters")
    @classmethod
    def validate_filters(cls, filters: dict[str, Any] | None):
        if filters is None:
            return None
        allowed = {"study_type", "specialty_tags"}
        unsupported = set(filters) - allowed
        if unsupported:
            raise ValueError(f"Unsupported filters: {sorted(unsupported)}")
        for field, value in filters.items():
            values = value if isinstance(value, list) else [value]
            if not values or len(values) > 20 or not all(
                isinstance(item, str) and 0 < len(item) <= 100 for item in values
            ):
                raise ValueError(
                    f"Filter {field!r} must be a string or a list of up to 20 strings"
                )
        return filters


class SemanticSearchResult(BaseModel):
    """One paper returned by semantic search."""

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


class SemanticSearchResponse(BaseModel):
    """Response from the semantic search endpoint."""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "query": "obesity",
                "top_k": 5,
                "total": 1,
                "items": [],
            }
        }
    )

    query: str
    top_k: int
    total: int
    items: list[SemanticSearchResult]


class IngestRequest(BaseModel):
    source_dir: str = "/root/papers/pipeline_outputs/results"
    limit: int | None = Field(None, ge=1, le=10000)


class IngestResponse(BaseModel):
    ingested: int
    skipped: int
    errors: int
    total_in_db: int


class BackfillRequest(BaseModel):
    limit: int | None = Field(None, ge=1, le=10000)


class BackfillResponse(BaseModel):
    updated: int
    skipped_no_xml: int
    skipped_already_filled: int
    errors: int
