"""Admin router — user management, paper management, ingest, backfill, reindex, stats."""

from __future__ import annotations

import json
import logging
import math
import os
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, text
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import hash_password, require_admin
from app.db.models import Paper, SavedPaper, User
from app.schemas import (
    AdminBackfillResponse,
    AdminHealthResponse,
    AdminIngestResponse,
    AdminPaperUpdate,
    AdminPasswordResetRequest,
    AdminReindexRequest,
    AdminReindexResponse,
    AdminSingleReindexResponse,
    AdminStatsResponse,
    BackfillRequest,
    IngestRequest,
    PaperListItem,
    PaperListResponse,
    UserAdminOut,
    UserAdminUpdate,
)
from app.services.embedding_service import get_embedding_service
from app.services.paper_metadata_service import RESULTS_DIR, _parse_md_title, _parse_xml_metadata
from app.services.qdrant_service import (
    count_papers,
    delete_papers,
    ensure_collection,
    get_qdrant_client,
    update_paper,
    upsert_papers,
)
from app.services.semantic_search_service import build_paper_payload

router = APIRouter(prefix="/admin", tags=["admin"])
logger = logging.getLogger(__name__)


def _index_papers(papers: list[Paper]) -> int:
    """Embed and upsert a list of papers into Qdrant."""
    if not papers:
        return 0
    embedding_service = get_embedding_service()
    payloads = [build_paper_payload(paper, embedding_service) for paper in papers]
    return upsert_papers(payloads, client=get_qdrant_client(), batch_size=100)


def _index_single_paper(paper: Paper) -> None:
    """Embed and upsert a single paper into Qdrant."""
    payload = build_paper_payload(paper, get_embedding_service())
    update_paper(payload, client=get_qdrant_client())


# ── Users ─────────────────────────────────────────────────────────────────────


@router.get("/users", response_model=list[UserAdminOut])
def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """List all users with saved-paper counts."""
    users = db.query(User).offset(skip).limit(limit).all()
    saved_counts = {
        row[0]: row[1]
        for row in db.query(SavedPaper.user_id, func.count(SavedPaper.id))
        .group_by(SavedPaper.user_id)
        .all()
    }
    return [
        UserAdminOut(
            id=u.id,
            email=u.email,
            name=u.name,
            is_admin=u.is_admin,
            created_at=u.created_at,
            saved_papers_count=saved_counts.get(u.id, 0),
        )
        for u in users
    ]


@router.get("/users/{user_id}", response_model=UserAdminOut)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Get a single user by ID."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    saved_count = (
        db.query(SavedPaper).filter(SavedPaper.user_id == user_id).count()
    )
    return UserAdminOut(
        id=user.id,
        email=user.email,
        name=user.name,
        is_admin=user.is_admin,
        created_at=user.created_at,
        saved_papers_count=saved_count,
    )


@router.patch("/users/{user_id}", response_model=UserAdminOut)
def update_user(
    user_id: int,
    body: UserAdminUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Update a user's name, email, or admin status."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if body.email is not None and body.email != user.email:
        if db.query(User).filter(User.email == body.email, User.id != user_id).first():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
        user.email = body.email

    if body.name is not None:
        user.name = body.name

    if body.is_admin is not None:
        user.is_admin = body.is_admin

    db.commit()
    db.refresh(user)

    saved_count = db.query(SavedPaper).filter(SavedPaper.user_id == user_id).count()
    return UserAdminOut(
        id=user.id,
        email=user.email,
        name=user.name,
        is_admin=user.is_admin,
        created_at=user.created_at,
        saved_papers_count=saved_count,
    )


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Delete a user and all their saved papers."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    db.query(SavedPaper).filter(SavedPaper.user_id == user_id).delete()
    db.delete(user)
    db.commit()
    return None


@router.post("/users/{user_id}/reset-password", status_code=status.HTTP_200_OK)
def reset_user_password(
    user_id: int,
    body: AdminPasswordResetRequest,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Set a new password for a user without requiring the old one."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.hashed_password = hash_password(body.new_password)
    db.commit()
    return {"message": "Password updated successfully"}


# ── Papers ────────────────────────────────────────────────────────────────────


@router.get("/papers", response_model=PaperListResponse)
def list_papers_admin(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    has_errors: bool | None = None,
    empty_tldr: bool | None = None,
    empty_summary: bool | None = None,
    no_doi: bool | None = None,
    study_type: str | None = None,
    specialty: str | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """List papers with admin-only filters."""
    query = db.query(Paper)

    if has_errors is not None:
        query = query.filter(Paper.has_errors == has_errors)
    if empty_tldr is not None:
        if empty_tldr:
            query = query.filter(or_(Paper.tldr == "", Paper.tldr.is_(None)))
        else:
            query = query.filter(Paper.tldr != "", Paper.tldr.isnot(None))
    if empty_summary is not None:
        if empty_summary:
            query = query.filter(or_(Paper.detailed_summary == "", Paper.detailed_summary.is_(None)))
        else:
            query = query.filter(Paper.detailed_summary != "", Paper.detailed_summary.isnot(None))
    if no_doi is not None:
        if no_doi:
            query = query.filter(or_(Paper.doi == "", Paper.doi.is_(None)))
        else:
            query = query.filter(Paper.doi != "", Paper.doi.isnot(None))
    if study_type:
        query = query.filter(Paper.study_type == study_type)
    if specialty:
        spaced = specialty.strip().replace("_", " ")
        underscored = spaced.replace(" ", "_")
        query = query.filter(
            or_(
                Paper.specialty_tags.ilike(f"%{spaced}%"),
                Paper.specialty_tags.ilike(f"%{underscored}%"),
            )
        )

    total = query.count()
    pages = max(1, math.ceil(total / per_page)) if total else 1
    items = query.order_by(Paper.id.desc()).offset((page - 1) * per_page).limit(per_page).all()

    from app.api.v1.papers import _paper_to_list_item

    return PaperListResponse(
        items=[_paper_to_list_item(p) for p in items],
        total=total,
        page=page,
        per_page=per_page,
        pages=pages,
    )


@router.get("/papers/{paper_id}")
def get_paper_admin(
    paper_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Get full paper details by ID (admin view)."""
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paper not found")

    from app.api.v1.papers import _paper_to_detail

    return _paper_to_detail(paper)


@router.patch("/papers/{paper_id}")
def update_paper_admin(
    paper_id: str,
    body: AdminPaperUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Edit paper metadata. Changed papers are reindexed in Qdrant."""
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paper not found")

    changed = False
    fields = {
        "title": body.title,
        "tldr": body.tldr,
        "detailed_summary": body.detailed_summary,
        "study_type": body.study_type,
        "journal": body.journal,
        "doi": body.doi,
        "author_list": body.author_list,
        "authors_count": body.authors_count,
        "citation": body.citation,
        "excerpt": body.excerpt,
        "reviewer": body.reviewer,
    }
    for attr, value in fields.items():
        if value is not None:
            setattr(paper, attr, value)
            changed = True

    if body.specialty_tags is not None:
        paper.specialty_tags = json.dumps(body.specialty_tags)
        changed = True

    if body.centers is not None:
        paper.centers = json.dumps(body.centers)
        changed = True

    if body.sections is not None:
        paper.sections = json.dumps(body.sections)
        changed = True

    db.commit()
    db.refresh(paper)

    if changed:
        try:
            _index_single_paper(paper)
        except Exception:
            logger.exception("Failed to reindex paper %s after admin update", paper_id)

    from app.api.v1.papers import _paper_to_detail

    return _paper_to_detail(paper)


@router.delete("/papers/{paper_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_paper_admin(
    paper_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Delete a paper and its Qdrant vector."""
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paper not found")

    db.delete(paper)
    db.commit()

    try:
        delete_papers([paper_id], client=get_qdrant_client())
    except Exception:
        logger.exception("Failed to delete Qdrant vector for paper %s", paper_id)

    return None


# ── Ingest / Backfill / Reindex ───────────────────────────────────────────────


@router.post("/papers/ingest", response_model=AdminIngestResponse)
def ingest_papers_admin(
    body: IngestRequest,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Ingest pipeline JSON results into the database and index only newly inserted papers in Qdrant."""
    ALLOWED_BASE = os.path.realpath(str(RESULTS_DIR))

    if body.source_dir:
        candidate = os.path.realpath(body.source_dir)
        if not candidate.startswith(ALLOWED_BASE + os.sep) and candidate != ALLOWED_BASE:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: source_dir must be within {ALLOWED_BASE}",
            )
        source_dir = Path(candidate)
    else:
        source_dir = RESULTS_DIR

    if not source_dir.exists():
        raise HTTPException(status_code=400, detail=f"Source directory not found: {source_dir}")

    files = sorted(source_dir.glob("*.json"))
    if body.limit:
        files = files[:body.limit]

    ingested = 0
    skipped = 0
    errors = 0
    new_papers: list[Paper] = []

    for f in files:
        try:
            data = json.loads(f.read_text(encoding="utf-8"))
            paper_id = data.get("paper_id", f.stem)

            existing = db.query(Paper).filter(Paper.id == paper_id).first()
            if existing:
                skipped += 1
                continue

            summary = data.get("summary") or {}
            key_findings_raw = data.get("key_findings")
            mind_map_raw = data.get("mind_map")
            verification_raw = data.get("verification")

            xml_meta = _parse_xml_metadata(paper_id)

            title = summary.get("title", "") or xml_meta.get("title", "") or _parse_md_title(paper_id)
            centers_list = xml_meta.get("centers", [])

            paper = Paper(
                id=paper_id,
                title=title,
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
                journal=xml_meta.get("journal", ""),
                doi=xml_meta.get("doi", ""),
                author_list=xml_meta.get("author_list", ""),
                authors_count=xml_meta.get("authors_count", 0),
                centers=json.dumps(centers_list) if centers_list else "[]",
                centers_count=xml_meta.get("centers_count", 0),
                citation=xml_meta.get("citation", ""),
                sections=json.dumps(xml_meta.get("sections", [])),
                excerpt=xml_meta.get("excerpt", ""),
                reviewer=xml_meta.get("reviewer", ""),
            )
            db.add(paper)
            new_papers.append(paper)
            ingested += 1

        except Exception:
            errors += 1

    db.commit()

    indexed = 0
    if new_papers:
        try:
            indexed = _index_papers(new_papers)
        except Exception:
            logger.exception("Failed to index newly ingested papers in Qdrant")

    total_in_db = db.query(Paper).count()

    return AdminIngestResponse(
        ingested=ingested,
        skipped=skipped,
        errors=errors,
        indexed=indexed,
        total_in_db=total_in_db,
    )


@router.post("/papers/backfill", response_model=AdminBackfillResponse)
def backfill_metadata_admin(
    body: BackfillRequest,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Backfill missing metadata from XML for papers already in the DB."""
    query = db.query(Paper).filter(
        or_(
            Paper.title == "",
            Paper.journal == "",
            Paper.doi == "",
            Paper.authors_count == 0,
            Paper.centers_count == 0,
            Paper.citation == "",
            Paper.sections == "[]",
            Paper.excerpt == "",
        )
    )
    if body.limit:
        papers = query.limit(body.limit).all()
    else:
        papers = query.all()

    updated = 0
    skipped_no_xml = 0
    skipped_already_filled = 0
    errors = 0
    changed_papers: list[Paper] = []

    for paper in papers:
        try:
            xml_meta = _parse_xml_metadata(paper.id)
            md_title = _parse_md_title(paper.id) if not xml_meta else ""
            if not xml_meta and not md_title:
                skipped_no_xml += 1
                continue

            if not xml_meta and md_title:
                xml_meta = {"title": md_title}

            changed = False

            if not paper.title and xml_meta.get("title"):
                paper.title = xml_meta["title"]
                changed = True
            if not paper.journal and xml_meta.get("journal"):
                paper.journal = xml_meta["journal"]
                changed = True
            if not paper.doi and xml_meta.get("doi"):
                paper.doi = xml_meta["doi"]
                changed = True
            if not paper.author_list and xml_meta.get("author_list"):
                paper.author_list = xml_meta["author_list"]
                paper.authors_count = xml_meta.get("authors_count", 0)
                changed = True
            if not paper.centers_count and xml_meta.get("centers"):
                paper.centers = json.dumps(xml_meta["centers"])
                paper.centers_count = xml_meta["centers_count"]
                changed = True
            if not paper.citation and xml_meta.get("citation"):
                paper.citation = xml_meta["citation"]
                changed = True
            if (not paper.sections or paper.sections == "[]") and xml_meta.get("sections"):
                paper.sections = json.dumps(xml_meta["sections"])
                changed = True
            if not paper.excerpt and xml_meta.get("excerpt"):
                paper.excerpt = xml_meta["excerpt"]
                changed = True
            if not paper.reviewer and xml_meta.get("reviewer"):
                paper.reviewer = xml_meta["reviewer"]
                changed = True

            if changed:
                updated += 1
                changed_papers.append(paper)
            else:
                skipped_already_filled += 1
        except Exception:
            errors += 1

    db.commit()

    if changed_papers:
        try:
            _index_papers(changed_papers)
        except Exception:
            logger.exception("Failed to reindex backfilled papers in Qdrant")

    return AdminBackfillResponse(
        updated=updated,
        skipped_no_xml=skipped_no_xml,
        skipped_already_filled=skipped_already_filled,
        errors=errors,
    )


@router.post("/papers/reindex", response_model=AdminReindexResponse)
def reindex_papers_admin(
    body: AdminReindexRequest,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Bulk reindex papers into Qdrant.

    Options:
      - recreate=True: drop and recreate the collection, then index all papers.
      - only_missing=True: index only papers present in the DB but missing from Qdrant.
      - limit=N: process at most N papers.
    """
    from app.services.qdrant_service import collection_exists, delete_collection, ensure_collection, scroll_all
    from app.services.semantic_search_service import index_papers

    if body.recreate and collection_exists():
        delete_collection()
    ensure_collection()

    missing_before: int | None = None
    if body.only_missing:
        qdrant_results = scroll_all(batch_size=1000)
        qdrant_ids = {r.paper_id for r in qdrant_results}
        query = db.query(Paper).filter(~Paper.id.in_(qdrant_ids))
        if body.limit:
            query = query.limit(body.limit)
        papers = query.all()
        missing_before = len(papers)
        indexed = _index_papers(papers)
    else:
        indexed = index_papers(db, batch_size=100, limit=body.limit)

    qdrant_total = count_papers()

    return AdminReindexResponse(
        indexed=indexed,
        qdrant_total=qdrant_total,
        missing_before=missing_before,
    )


@router.post("/papers/{paper_id}/reindex", response_model=AdminSingleReindexResponse)
def reindex_single_paper_admin(
    paper_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Reindex a single paper in Qdrant."""
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paper not found")

    try:
        _index_single_paper(paper)
        return AdminSingleReindexResponse(paper_id=paper_id, indexed=True)
    except Exception as exc:
        logger.exception("Failed to reindex paper %s", paper_id)
        raise HTTPException(status_code=500, detail=f"Reindex failed: {exc}")


# ── Stats / Health ────────────────────────────────────────────────────────────


@router.get("/stats", response_model=AdminStatsResponse)
def admin_stats(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Aggregated platform statistics."""
    users_count = db.query(User).count()
    papers_count = db.query(Paper).count()
    saved_count = db.query(SavedPaper).count()
    with_errors = db.query(Paper).filter(Paper.has_errors == True).count()
    without_tldr = db.query(Paper).filter(or_(Paper.tldr == "", Paper.tldr.is_(None))).count()
    without_summary = db.query(Paper).filter(or_(Paper.detailed_summary == "", Paper.detailed_summary.is_(None))).count()
    without_doi = db.query(Paper).filter(or_(Paper.doi == "", Paper.doi.is_(None))).count()

    qdrant_count: int | None = None
    try:
        qdrant_count = count_papers()
    except Exception:
        logger.exception("Failed to count Qdrant vectors")

    return AdminStatsResponse(
        users_count=users_count,
        papers_count=papers_count,
        saved_papers_count=saved_count,
        papers_with_errors=with_errors,
        papers_without_tldr=without_tldr,
        papers_without_summary=without_summary,
        papers_without_doi=without_doi,
        qdrant_vector_count=qdrant_count,
    )


@router.get("/health", response_model=AdminHealthResponse)
def admin_health(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Extended health check covering database and Qdrant."""
    db_status = "ok"
    try:
        db.execute(text("SELECT 1"))
    except Exception as exc:
        logger.exception("Database health check failed")
        db_status = f"error: {exc}"

    qdrant_status = "ok"
    try:
        ensure_collection(get_qdrant_client())
    except Exception as exc:
        logger.exception("Qdrant health check failed")
        qdrant_status = f"error: {exc}"

    overall = "ok" if db_status == "ok" and qdrant_status == "ok" else "degraded"
    return AdminHealthResponse(status=overall, database=db_status, qdrant=qdrant_status)
