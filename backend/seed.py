"""Seed script — load pipeline JSON results into SQLite.

Usage:
    python -m backend.seed                     # Load all
    python -m backend.seed --limit 100         # Load first 100
    python -m backend.seed --source /path/dir  # Custom source directory
"""

import argparse
import json
import sys
import time
from pathlib import Path

# Allow running from project root
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from database import Base, SessionLocal, engine
from models import Paper

DEFAULT_SOURCE = "/root/papers/pipeline_outputs/results"


def seed(source_dir: str, limit: int | None = None):
    """Load pipeline JSON results from source_dir into the SQLite papers table."""
    source = Path(source_dir)
    if not source.exists():
        print(f"ERROR: Source directory not found: {source}")
        return

    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)

    files = sorted(source.glob("*.json"))
    if limit:
        files = files[:limit]

    total = len(files)
    print(f"Source: {source}")
    print(f"Files to ingest: {total}")

    db = SessionLocal()
    start = time.monotonic()
    ingested = 0
    skipped = 0
    errors = 0

    try:
        for i, f in enumerate(files):
            try:
                data = json.loads(f.read_text(encoding="utf-8"))
                paper_id = data.get("paper_id", f.stem)

                # Skip if already in DB
                if db.query(Paper).filter(Paper.id == paper_id).first():
                    skipped += 1
                    if (i + 1) % 500 == 0:
                        print(f"  [{i+1}/{total}] ok={ingested} skip={skipped} err={errors}")
                    continue

                summary = data.get("summary") or {}
                key_findings_raw = data.get("key_findings")
                mind_map_raw = data.get("mind_map")
                verification_raw = data.get("verification")

                paper = Paper(
                    id=paper_id,
                    title=summary.get("title", ""),
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

                # Commit in batches of 100
                if (i + 1) % 100 == 0:
                    db.commit()

                ingested += 1

            except Exception as e:
                errors += 1
                print(f"  ERROR processing {f.name}: {e}")

            if (i + 1) % 500 == 0:
                elapsed = time.monotonic() - start
                rate = (i + 1) / elapsed if elapsed > 0 else 0
                print(f"  [{i+1}/{total}] ok={ingested} skip={skipped} err={errors} rate={rate:.0f}/s")

        # Final commit
        db.commit()

    except Exception as e:
        print(f"FATAL: {e}")
        db.rollback()
    finally:
        db.close()

    elapsed = time.monotonic() - start
    total_in_db = 0
    db2 = SessionLocal()
    try:
        total_in_db = db2.query(Paper).count()
    finally:
        db2.close()

    print(f"\n{'='*60}")
    print(f"Done in {elapsed:.1f}s")
    print(f"  Ingested: {ingested}")
    print(f"  Skipped:  {skipped}")
    print(f"  Errors:   {errors}")
    print(f"  Total in DB: {total_in_db}")


def main():
    """Parse CLI arguments and run the seed process."""
    parser = argparse.ArgumentParser(description="Seed MedIntel papers into SQLite")
    parser.add_argument("--source", default=DEFAULT_SOURCE, help="Directory with pipeline JSON results")
    parser.add_argument("--limit", type=int, default=None, help="Only ingest N files")
    args = parser.parse_args()
    seed(args.source, args.limit)


if __name__ == "__main__":
    main()
