"""Fetch paper list data from a remote API endpoint and store it in the backend database.

Usage:
    python -m backend.import_from_api
    python -m backend.import_from_api --base-url https://med.aidashnews.tech/api/papers
    python -m backend.import_from_api --per-page 50
"""

from __future__ import annotations

import json
import os
from argparse import ArgumentParser
from typing import Any

import httpx
from sqlalchemy.orm import Session

from database import Base, SessionLocal, engine
from models import Paper


DEFAULT_BASE_URL = "https://med.aidashnews.tech/api/papers"


def normalize_specialty_tags(raw: Any) -> str:
    if raw is None:
        return json.dumps([])
    if isinstance(raw, str):
        try:
            parsed = json.loads(raw)
            if isinstance(parsed, list):
                return json.dumps(parsed)
        except json.JSONDecodeError:
            return json.dumps([raw])
    if isinstance(raw, list):
        return json.dumps([str(tag) for tag in raw])
    return json.dumps([str(raw)])


def build_key_findings(item: dict[str, Any]) -> str:
    findings: dict[str, Any] = {}
    if item.get("overall_evidence_level") is not None:
        findings["overall_evidence_level"] = item["overall_evidence_level"]
    if item.get("sample_size") is not None:
        findings["sample_size"] = item["sample_size"]
    return json.dumps(findings) if findings else "null"


def upsert_paper(db: Session, item: dict[str, Any]) -> None:
    paper_id = item.get("id")
    if not paper_id:
        return

    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if paper is None:
        paper = Paper(id=paper_id)
        db.add(paper)

    paper.title = item.get("title", "") or ""
    paper.tldr = item.get("tldr", "") or ""
    paper.study_type = item.get("study_type", "") or ""
    paper.specialty_tags = normalize_specialty_tags(item.get("specialty_tags"))
    paper.key_findings = build_key_findings(item)
    paper.processing_time = 0.0
    paper.has_errors = False

    # Leave fields unset if they are not present in the source response.
    if getattr(item, "get", None):
        paper.detailed_summary = item.get("detailed_summary", paper.detailed_summary or "")
        paper.pico_summary = json.dumps(item.get("pico_summary")) if item.get("pico_summary") else paper.pico_summary
        paper.mind_map = json.dumps(item.get("mind_map")) if item.get("mind_map") else paper.mind_map
        paper.verification = json.dumps(item.get("verification")) if item.get("verification") else paper.verification


def fetch_all_papers(base_url: str, per_page: int = 20) -> list[dict[str, Any]]:
    results: list[dict[str, Any]] = []
    page = 1

    with httpx.Client(timeout=30.0) as client:
        while True:
            response = client.get(
                base_url,
                params={"page": page, "per_page": per_page, "sort": "id"},
            )
            response.raise_for_status()
            payload = response.json()
            items = payload.get("items") or []
            if not items:
                break

            results.extend(items)
            if len(items) < per_page:
                break
            page += 1

    return results


def main() -> None:
    parser = ArgumentParser(description="Fetch remote paper list data and store it in the local database.")
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL, help="Remote paper list endpoint URL")
    parser.add_argument("--per-page", type=int, default=20, help="Page size for remote pagination")
    parser.add_argument("--commit-batch", type=int, default=100, help="DB commit batch size")
    args = parser.parse_args()

    Base.metadata.create_all(bind=engine)

    print(f"Fetching papers from: {args.base_url}")
    items = fetch_all_papers(args.base_url, per_page=args.per_page)
    print(f"Fetched {len(items)} items")

    db = SessionLocal()
    try:
        for idx, item in enumerate(items, start=1):
            upsert_paper(db, item)
            if idx % args.commit_batch == 0:
                db.commit()
                print(f"Committed {idx} papers")

        db.commit()
        print(f"Finished committing {len(items)} papers")
    finally:
        db.close()


if __name__ == "__main__":
    main()
