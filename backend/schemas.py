"""Pydantic schemas for request/response validation."""

from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, EmailStr, Field


# ── Auth ──────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    email: str = Field(..., min_length=3, max_length=255, description="User email address used for login and account recovery.")
    name: str = Field(..., min_length=1, max_length=255, description="Display name for the user account.")
    password: str = Field(..., min_length=6, description="Password for the new account. Must be at least 6 characters.")


class UserLogin(BaseModel):
    email: str = Field(..., description="Registered email address.")
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

# Nested schemas — typed structures for the API response
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
        description="Free-text search query",
        example="obesity",
    )
    top_k: int = Field(
        10,
        ge=1,
        le=100,
        description="Number of results to return",
        example=5,
    )
    filters: dict[str, Any] | None = Field(
        None,
        description="Optional metadata filters (e.g., {'study_type': 'RCT'})",
        example={"study_type": "other"},
    )


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

    query: str
    top_k: int
    total: int
    items: list[SemanticSearchResult]

    class Config:
        json_schema_extra = {
            "example": {
                "query": "obesity",
                "top_k": 5,
                "total": 3,
                "items": [
                    {
                        "id": "PMC10000023",
                        "title": "Rotational Grazing Modifies Rhipicephalus microplus Infestation in Cattle in the Humid Tropics",
                        "tldr": "In this year-long field experiment in heifers in the humid tropics, rotational grazing with a 45-day pasture rest was associated with the lowest Rhipicephalus microplus infestation, while a 30-day rest produced the highest tick burdens. The main practical finding is that 30 days of pasture rest was not enough to reduce tick infestation, but 45 days appeared beneficial under these conditions. This is clinically relevant for cattle health and farm management because it suggests a non-chemical strategy that may help reduce acaricide use and chemical residues in milk, meat, and the environment.",
                        "study_type": "other",
                        "specialty_tags": [
                            "veterinary medicine",
                            "parasitology",
                            "livestock production",
                            "tropical medicine",
                        ],
                        "journal": "Animals : an Open Access Journal from MDPI",
                        "doi": "10.3390/ani13050915",
                        "author_list": "Gabriel Cruz-González, Juan Manuel Pinos-Rodríguez, Miguel Ángel Alonso-Díaz, Dora Romero-Salas, Jorge Genaro Vicente-Martínez, Agustin Fernández-Salas, Jesús Jarillo-Rodríguez, Epigmenio Castillo-Gallegos",
                        "authors_count": 8,
                        "centers_count": 2,
                        "overall_evidence_level": "low",
                        "sample_size": "N=30",
                        "score": 0.95,
                    },
                    {
                        "id": "PMC10000024",
                        "title": "Dietary Protein Requirement of Juvenile Dotted Gizzard Shad Konosirus punctatus Based on the Variation of Fish Meal",
                        "tldr": "In an 8-week feeding trial in juvenile dotted gizzard shad, diets containing fish meal as the sole protein source supported the best overall growth and feed utilization at an estimated dietary crude protein level of 31.75–33.82%. Both low protein and high protein diets were unfavorable: low protein was associated with poorer growth and feed utilization, while excessive protein altered digestive enzyme activity and amino acid metabolism. These findings are clinically significant for aquaculture because they provide a practical target protein range for formulating feeds for juvenile Konosirus punctatus while helping avoid inefficient protein use and unnecessary nitrogen waste.",
                        "study_type": "other",
                        "specialty_tags": [
                            "aquaculture",
                            "animal nutrition",
                            "fisheries",
                        ],
                        "journal": "Animals : an Open Access Journal from MDPI",
                        "doi": "10.3390/ani13050788",
                        "author_list": "Tao Liu, Xinzhi Weng, Jiteng Wang, Tao Han, Yuebin Wang, Xuejun Chai",
                        "authors_count": 6,
                        "centers_count": 4,
                        "overall_evidence_level": "low",
                        "sample_size": "N=300",
                        "score": 0.92,
                    },
                    {
                        "id": "PMC10000025",
                        "title": "Transcriptome-Based Evaluation of Optimal Reference Genes for Quantitative Real-Time PCR in Yak Stomach throughout the Growth Cycle",
                        "tldr": "This yak stomach study found that the most reliable RT-qPCR reference genes across growth were RPS15, MRPL39, and RPS23, while YWHAZ was the least stable overall. Using these three genes together gave RT-qPCR results that matched RNA-seq patterns for HMGCS2, whereas unstable reference genes could create misleading differences. The practical significance is that future yak stomach gene-expression studies should use these validated controls to get more accurate molecular data about digestion and nutrient metabolism.",
                        "study_type": "other",
                        "specialty_tags": [
                            "veterinary medicine",
                            "gastroenterology",
                            "molecular biology",
                            "animal science",
                            "ruminant nutrition",
                        ],
                        "journal": "Animals : an Open Access Journal from MDPI",
                        "doi": "10.3390/ani13050925",
                        "author_list": "Qi Min, Lu Yang, Yu Wang, Yili Liu, Mingfeng Jiang",
                        "authors_count": 5,
                        "centers_count": 2,
                        "overall_evidence_level": "low",
                        "sample_size": "N=15",
                        "score": 0.88,
                    },
                ],
            }
        }


class IngestRequest(BaseModel):
    source_dir: str = "/root/papers/pipeline_outputs/results"
    limit: Optional[int] = None


class IngestResponse(BaseModel):
    ingested: int
    skipped: int
    errors: int
    total_in_db: int


class BackfillRequest(BaseModel):
    limit: Optional[int] = None


class BackfillResponse(BaseModel):
    updated: int
    skipped_no_xml: int
    skipped_already_filled: int
    errors: int


# ── Health ────────────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str = "ok"
    papers_count: int = 0


# ── Saved Papers ──────────────────────────────────────────────────────────────

class SavePaperResponse(BaseModel):
    message: str
    paper_id: str


class SavedPaperOut(BaseModel):
    paper_id: str
    saved_at: datetime

    class Config:
        from_attributes = True


class SavedPapersListResponse(BaseModel):
    items: list[SavedPaperOut]
    total: int
