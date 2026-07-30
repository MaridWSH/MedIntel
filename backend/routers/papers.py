"""Papers router — list, detail, search, ingest, backfill.

Business logic lives in services.papers, services.ingest, and repositories.papers.
This router only handles HTTP concerns.
"""

import logging
import math

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session

from core.auth import get_current_admin
from database import get_db
from database.models import Paper, User
from repositories import catalogue as paper_repository
from schemas import (
    BackfillRequest,
    BackfillResponse,
    FacetValue,
    FacetsResponse,
    FullTextResponse,
    IngestRequest,
    IngestResponse,
    PaperDetail,
    PaperListResponse,
    SearchResponse,
)
from services import ingest as ingest_service
from services.papers import paper_to_detail, paper_to_list_item, parse_markdown_sections, to_json

router = APIRouter(prefix="/papers", tags=["papers"])
logger = logging.getLogger(__name__)


# ponytail: cap on how deep semantic results go. Vector search is ranked, not
# exhaustive — beyond a few hundred hits relevance is noise, so we retrieve a
# fixed window and paginate within it rather than pretending to have a real total.
SEMANTIC_MAX_RESULTS = 200


@router.get("", response_model=PaperListResponse)
def list_papers(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    study_type: str | None = None,
    specialty: str | None = None,
    evidence_level: str | None = Query(
        None, pattern="^(high|moderate|low|very_low)$"
    ),
    sort: str = Query("id", pattern="^(id|-id)$"),
    summarised_only: bool = Query(
        True,
        description="Exclude papers the pipeline never summarised (52% of rows).",
    ),
    db: Session = Depends(get_db),
):
    """Paginated paper listing with optional filters.

    Defaults to summarised papers only. Of the 7,184 rows, 3,765 have no tldr and
    no summary — listing them advertised a catalogue twice its real size and sent
    readers to pages with nothing on them.
    """
    items, total, pages = paper_repository.list_papers(
        db,
        page=page,
        per_page=per_page,
        study_type=study_type,
        specialty=specialty,
        evidence_level=evidence_level,
        sort=sort,
        summarised_only=summarised_only,
    )

    return PaperListResponse(
        items=[paper_to_list_item(p) for p in items],
        total=total,
        page=page,
        per_page=per_page,
        pages=pages,
    )


@router.get("/search", response_model=SearchResponse)
def search_papers(
    q: str = Query(..., min_length=1, max_length=500, description="Search query"),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    mode: str = Query("auto", pattern="^(auto|semantic|keyword)$"),
    request: Request = None,
    db: Session = Depends(get_db),
):
    """Search papers.

    `auto` (default) runs semantic search and falls back to keyword matching if
    the vector store is unavailable or returns nothing — so a natural-language
    question or a typo still finds papers, which plain substring matching cannot do.
    """
    from services import analytics as analytics_service
    from services.papers import has_summary
    from services.semantic_search_service import get_semantic_search_service

    matches: list[Paper] | None = None

    if mode in ("auto", "semantic"):
        try:
            service = get_semantic_search_service(db)
            results = service.search(query=q, top_k=SEMANTIC_MAX_RESULTS)
            matches = [
                r.paper
                for r in results
                if not paper_repository.REQUIRE_CURRENT_PIPELINE or has_summary(r.paper)
            ]
        except Exception:
            logger.exception("Semantic search failed for %r — falling back to keyword", q)
            matches = None

    if mode == "keyword" or (mode == "auto" and not matches):
        matches = paper_repository.keyword_search(db, q)

    matches = matches or []

    total = len(matches)
    pages = max(1, math.ceil(total / per_page)) if total else 1
    start = (page - 1) * per_page
    items = matches[start : start + per_page]

    analytics_service.track_backend_event(
        db,
        event_type=analytics_service.analytics_repository.PAPER_SEARCH,
        path=request.url.path if request else "/api/papers/search",
        metadata={"query": q, "mode": mode},
    )

    return SearchResponse(
        items=[paper_to_list_item(p) for p in items],
        total=total,
        page=page,
        per_page=per_page,
        pages=pages,
        query=q,
    )


# Declared before /{paper_id} so "facets" isn't matched as a paper id.
@router.get("/facets", response_model=FacetsResponse)
def get_facets(db: Session = Depends(get_db)):
    """Filter options that exist in the summarised catalogue, with counts.

    Derived from the data rather than hardcoded in the client: the UI's fixed list
    offered study types that match nothing ("cohort_study" vs the stored "cohort")
    and omitted the largest real ones.
    """
    study_type_rows, raw_specialty_tags = paper_repository.get_facet_data(db)

    study_types = [
        FacetValue(value=value, count=count)
        for value, count in study_type_rows
        if value
    ]

    # specialty_tags is a JSON array in a text column, so it has to be counted in
    # Python. The summarised catalogue is a few thousand rows — cheap enough.
    tag_counts: dict[str, int] = {}
    for raw in raw_specialty_tags:
        for tag in to_json(raw) or []:
            if not isinstance(tag, str) or not tag.strip():
                continue
            # Tags arrive both as "public_health" and "public health".
            key = tag.strip().lower().replace("_", " ")
            tag_counts[key] = tag_counts.get(key, 0) + 1

    specialties = [
        FacetValue(value=value, count=count)
        for value, count in sorted(tag_counts.items(), key=lambda kv: kv[1], reverse=True)
        if count >= 5  # long tail of one-off tags is noise in a filter list
    ]

    return FacetsResponse(study_types=study_types, specialties=specialties)


@router.get("/{paper_id}/fulltext", response_model=FullTextResponse)
def get_paper_fulltext(paper_id: str, db: Session = Depends(get_db)):
    """Full text of the source paper, split into anchored sections.

    The pipeline failed to summarise ~52% of the catalogue, but it still wrote
    markdown for most of those papers. Serving it means a paper with no AI
    summary is still worth opening, and gives the section nav something real to
    scroll to.
    """
    paper = paper_repository.get_by_id(db, paper_id)
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")

    available, md = paper_repository.get_fulltext_markdown_path(paper_id)
    if not available:
        return FullTextResponse(
            paper_id=paper_id,
            title=paper.title or "",
            sections=[],
            available=False,
        )

    sections = parse_markdown_sections(md)
    return FullTextResponse(
        paper_id=paper_id,
        title=paper.title or "",
        sections=sections,
        available=bool(sections),
    )


@router.get("/{paper_id}", response_model=PaperDetail)
def get_paper(paper_id: str, db: Session = Depends(get_db)):
    """Get full paper detail by PMC ID."""
    paper = paper_repository.get_by_id(db, paper_id)
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    return paper_to_detail(paper)


@router.post("/ingest", response_model=IngestResponse)
def ingest_papers(
    body: IngestRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Ingest pipeline JSON results into the database. Requires auth.

    For fields missing from the pipeline JSON (title, journal, doi, authors, centers),
    falls back to parsing the corresponding JATS XML file from the source directory.
    """
    return ingest_service.ingest_papers(body, db, current_user)


@router.post("/backfill", response_model=BackfillResponse)
def backfill_metadata(
    body: BackfillRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Backfill missing metadata (journal, doi, authors, centers, title) from XML.

    For papers already in the DB that are missing these fields, look up the
    corresponding JATS XML and fill in the gaps. Requires auth.
    """
    return ingest_service.backfill_metadata(body, db, current_user)
