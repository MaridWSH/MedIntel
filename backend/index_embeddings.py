"""Index paper embeddings into Qdrant.

Usage:
    python -m backend.index_embeddings
    python -m backend.index_embeddings --limit 1000
    python -m backend.index_embeddings --batch-size 64 --recreate

This command reads every paper from PostgreSQL (or the configured SQLAlchemy
engine), generates a dense embedding with BGE-M3, and stores the vector in
Qdrant. It does not modify the ingestion pipeline.
"""

from __future__ import annotations

import argparse
import sys
import time
from pathlib import Path

# Allow running from project root
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from database import Base, SessionLocal, engine
from models import Paper
from services.qdrant_service import (
    collection_exists,
    count_papers,
    delete_collection,
    ensure_collection,
)
from services.semantic_search_service import index_papers


def index(
    batch_size: int = 100,
    limit: int | None = None,
    recreate: bool = False,
) -> int:
    """Read papers from the database and index their embeddings into Qdrant.

    Args:
        batch_size: Number of papers to embed and upsert per batch.
        limit: Optional maximum number of papers to index.
        recreate: If True, drop and recreate the Qdrant collection first.

    Returns:
        Number of papers indexed.
    """
    # Ensure database tables exist
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        total_in_db = db.query(Paper).count()
        print(f"Papers in database: {total_in_db}")
        if total_in_db == 0:
            print("No papers found. Nothing to index.")
            return 0

        if recreate and collection_exists():
            print("Recreating Qdrant collection...")
            delete_collection()

        ensure_collection()
        print("Indexing started...")
        start = time.monotonic()
        indexed = index_papers(db, batch_size=batch_size, limit=limit)
        elapsed = time.monotonic() - start

        total_in_qdrant = count_papers()
        print(f"\n{'='*60}")
        print(f"Indexed {indexed} papers in {elapsed:.1f}s")
        print(f"Total vectors in Qdrant: {total_in_qdrant}")
        return indexed
    finally:
        db.close()


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Index MedIntel paper embeddings into Qdrant"
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=100,
        help="Number of papers to embed and upsert per batch (default: 100)",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Only index N papers (default: all)",
    )
    parser.add_argument(
        "--recreate",
        action="store_true",
        help="Drop and recreate the Qdrant collection before indexing",
    )
    args = parser.parse_args()

    index(batch_size=args.batch_size, limit=args.limit, recreate=args.recreate)


if __name__ == "__main__":
    main()
