"""Pipeline ingestion and metadata backfill services.

These functions are kept separate from the HTTP router so they can be tested and
reused without FastAPI dependencies.
"""

from __future__ import annotations

import json
import logging
import os
from pathlib import Path

from sqlalchemy import or_
from sqlalchemy.orm import Session

from database.models import Paper
from schemas import BackfillRequest, BackfillResponse, IngestRequest, IngestResponse
from services.papers import CURRENT_PIPELINE_VERSION, parse_md_title, parse_xml_metadata, pipeline_rejection_reason

logger = logging.getLogger(__name__)
RESULTS_DIR = Path("/root/papers/pipeline_outputs/results")


def ingest_papers(body: IngestRequest, db: Session, current_user) -> IngestResponse:
    """Ingest pipeline JSON results into the database.

    Requires a current admin user (passed from the router).
    """
    # Restrict to allowed base directory to prevent path traversal
    ALLOWED_BASE = Path(os.path.realpath(str(RESULTS_DIR)))

    if body.source_dir:
        candidate = Path(os.path.realpath(body.source_dir))
        if not str(candidate).startswith(str(ALLOWED_BASE) + os.sep) and candidate != ALLOWED_BASE:
            from fastapi import HTTPException, status

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: source_dir must be within {ALLOWED_BASE}",
            )
        source_dir = candidate
    else:
        source_dir = RESULTS_DIR

    if not source_dir.exists():
        from fastapi import HTTPException

        raise HTTPException(status_code=400, detail=f"Source directory not found: {source_dir}")

    files = sorted(source_dir.glob("*.json"))
    if body.limit:
        files = files[: body.limit]

    ingested = 0
    skipped = 0
    errors = 0

    for f in files:
        try:
            data = json.loads(f.read_text(encoding="utf-8"))
            rejection_reason = pipeline_rejection_reason(data, f.stem)
            if rejection_reason:
                logger.warning("Skipping pipeline result %s: %s", f, rejection_reason)
                skipped += 1
                continue

            paper_id = data["paper_id"]
            summary = data.get("summary") or {}
            key_findings_raw = data.get("key_findings")
            mind_map_raw = data.get("mind_map")
            verification_raw = data.get("verification")

            # ponytail: XML fallback — fill gaps in title/journal/authors/centers
            xml_meta = parse_xml_metadata(paper_id)

            title = summary.get("title", "") or xml_meta.get("title", "") or parse_md_title(paper_id)
            centers_list = xml_meta.get("centers", [])

            with db.begin_nested():
                paper = db.query(Paper).filter(Paper.id == paper_id).first()
                if paper is None:
                    paper = Paper(id=paper_id)
                    db.add(paper)

                # AI-derived fields are replaced on every accepted regeneration.
                paper.title = title or paper.title or ""
                paper.tldr = summary.get("tldr", "")
                paper.detailed_summary = summary.get("detailed_summary", "")
                paper.study_type = summary.get("study_type", "")
                paper.specialty_tags = json.dumps(summary.get("specialty_tags", []))
                paper.pico_summary = (
                    json.dumps(summary.get("pico_summary"))
                    if summary.get("pico_summary")
                    else "null"
                )
                paper.key_findings = json.dumps(key_findings_raw)
                paper.mind_map = json.dumps(mind_map_raw) if mind_map_raw else "null"
                paper.verification = json.dumps(verification_raw)
                paper.processing_time = data.get("processing_time_seconds", 0.0) or 0.0
                paper.has_errors = False
                paper.pipeline_version = data["pipeline_version"]
                paper.source_sha256 = data["source_sha256"]
                paper.prompt_sha256 = json.dumps(data["prompt_sha256"], sort_keys=True)
                paper.generation_models = json.dumps(data["models"], sort_keys=True)

                # Preserve existing bibliographic metadata if its XML source is
                # temporarily unavailable during a regeneration.
                paper.journal = xml_meta.get("journal") or paper.journal or ""
                paper.doi = xml_meta.get("doi") or paper.doi or ""
                paper.author_list = xml_meta.get("author_list") or paper.author_list or ""
                paper.authors_count = xml_meta.get("authors_count") or paper.authors_count or 0
                paper.centers = (
                    json.dumps(centers_list) if centers_list else paper.centers or "[]"
                )
                paper.centers_count = xml_meta.get("centers_count") or paper.centers_count or 0
                paper.citation = xml_meta.get("citation") or paper.citation or ""
                paper.sections = (
                    json.dumps(xml_meta.get("sections", []))
                    if xml_meta.get("sections")
                    else paper.sections or "[]"
                )
                paper.excerpt = xml_meta.get("excerpt") or paper.excerpt or ""
                paper.reviewer = xml_meta.get("reviewer") or paper.reviewer or ""
                db.flush()
            ingested += 1

        except Exception:
            logger.exception("Failed to ingest pipeline result %s", f)
            errors += 1

    db.commit()
    total_in_db = db.query(Paper).count()

    return IngestResponse(
        ingested=ingested,
        skipped=skipped,
        errors=errors,
        total_in_db=total_in_db,
    )


def backfill_metadata(body: BackfillRequest, db: Session, current_user) -> BackfillResponse:
    """Backfill missing metadata (journal, doi, authors, centers, title) from XML."""
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

    for paper in papers:
        xml_meta = parse_xml_metadata(paper.id)
        md_title = parse_md_title(paper.id) if not xml_meta else ""
        if not xml_meta and not md_title:
            skipped_no_xml += 1
            continue

        if not xml_meta and md_title:
            # ponytail: only have markdown title — use it, no other metadata available
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
            paper.centers_count = xml_meta.get("centers_count")
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
        else:
            skipped_already_filled += 1

    db.commit()

    return BackfillResponse(
        updated=updated,
        skipped_no_xml=skipped_no_xml,
        skipped_already_filled=skipped_already_filled,
        errors=errors,
    )
