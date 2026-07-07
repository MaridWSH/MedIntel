"""Papers router — list, detail, search, ingest."""

import json
import math
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import Paper, User
from ..schemas import (
    IngestRequest,
    IngestResponse,
    PaperDetail,
    PaperListItem,
    PaperListResponse,
    SearchResponse,
)

router = APIRouter(prefix="/papers", tags=["papers"])


# ── Helpers ───────────────────────────────────────────────────────────────────

def _to_json(raw: str):
    """Parse a JSON string, returning None on failure."""
    try:
        return json.loads(raw) if raw else None
    except (json.JSONDecodeError, TypeError):
        return None


def _paper_to_list_item(paper: Paper) -> PaperListItem:
    """Convert a Paper ORM row to a compact list item."""
    findings = _to_json(paper.key_findings) or {}
    return PaperListItem(
        id=paper.id,
        tldr=paper.tldr,
        study_type=paper.study_type,
        specialty_tags=json.loads(paper.specialty_tags) if paper.specialty_tags else [],
        overall_evidence_level=findings.get("overall_evidence_level"),
        sample_size=findings.get("sample_size"),
    )


def _paper_to_detail(paper: Paper) -> PaperDetail:
    """Convert a Paper ORM row to a full detail response."""
    return PaperDetail(
        id=paper.id,
        tldr=paper.tldr,
        detailed_summary=paper.detailed_summary,
        study_type=paper.study_type,
        specialty_tags=json.loads(paper.specialty_tags) if paper.specialty_tags else [],
        pico_summary=_to_json(paper.pico_summary),
        key_findings=_to_json(paper.key_findings),
        mind_map=_to_json(paper.mind_map),
        verification=_to_json(paper.verification),
        processing_time=paper.processing_time,
        has_errors=paper.has_errors,
    )


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("", response_model=PaperListResponse)
def list_papers(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    study_type: str | None = None,
    specialty: str | None = None,
    sort: str = Query("id", pattern="^(id|-id)$"),
    db: Session = Depends(get_db),
):
    """Paginated paper listing with optional filters."""
    query = db.query(Paper)

    if study_type:
        query = query.filter(Paper.study_type == study_type)

    if specialty:
        # SQLite: filter where specialty_tags JSON contains the tag
        query = query.filter(Paper.specialty_tags.contains(specialty))

    total = query.count()
    pages = max(1, math.ceil(total / per_page))

    order = Paper.id.desc() if sort == "-id" else Paper.id
    items = query.order_by(order).offset((page - 1) * per_page).limit(per_page).all()

    return PaperListResponse(
        items=[_paper_to_list_item(p) for p in items],
        total=total,
        page=page,
        per_page=per_page,
        pages=pages,
    )


@router.get("/search", response_model=SearchResponse)
def search_papers(
    q: str = Query(..., min_length=1, description="Search query"),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Full-text search across paper tldr and detailed_summary."""
    pattern = f"%{q}%"
    query = db.query(Paper).filter(
        or_(
            Paper.tldr.ilike(pattern),
            Paper.detailed_summary.ilike(pattern),
        )
    )

    total = query.count()
    pages = max(1, math.ceil(total / per_page))
    items = query.offset((page - 1) * per_page).limit(per_page).all()

    return SearchResponse(
        items=[_paper_to_list_item(p) for p in items],
        total=total,
        page=page,
        per_page=per_page,
        pages=pages,
        query=q,
    )


@router.get("/{paper_id}", response_model=PaperDetail)
def get_paper(paper_id: str, db: Session = Depends(get_db)):
    """Get full paper detail by PMC ID."""
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    return _paper_to_detail(paper)


@router.post("/ingest", response_model=IngestResponse)
def ingest_papers(
    body: IngestRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Ingest pipeline JSON results into the database. Requires auth."""
    source_dir = Path(body.source_dir)
    if not source_dir.exists():
        raise HTTPException(status_code=400, detail=f"Source directory not found: {source_dir}")

    files = sorted(source_dir.glob("*.json"))
    if body.limit:
        files = files[:body.limit]

    ingested = 0
    skipped = 0
    errors = 0

    for f in files:
        try:
            data = json.loads(f.read_text(encoding="utf-8"))
            paper_id = data.get("paper_id", f.stem)

            # Skip if already exists
            if db.query(Paper).filter(Paper.id == paper_id).first():
                skipped += 1
                continue

            summary = data.get("summary") or {}
            key_findings_raw = data.get("key_findings")
            mind_map_raw = data.get("mind_map")
            verification_raw = data.get("verification")

            paper = Paper(
                id=paper_id,
                tldr=summary.get("tldr", ""),
                detailed_summary=summary.get("detailed_summary", ""),
                study_type=summary.get("study_type", ""),
                specialty_tags=json.dumps(summary.get("specialty_tags", [])),
                pico_summary=json.dumps(summary.get("pico_summary")) if summary.get("pico_summary") else "null",
                key_findings=json.dumps(key_findings_raw) if key_findings_raw else "null",
                mind_map=json.dumps(mind_map_raw) if mind_map_raw else "null",
                verification=json.dumps(verification_raw) if verification_raw else "null",
                processing_time=data.get("processing_time_seconds", 0.0) or 0.0,
                has_errors=bool(data.get("errors")),
            )
            db.add(paper)
            ingested += 1

        except Exception:
            errors += 1

    db.commit()
    total_in_db = db.query(Paper).count()

    return IngestResponse(
        ingested=ingested,
        skipped=skipped,
        errors=errors,
        total_in_db=total_in_db,
    )
