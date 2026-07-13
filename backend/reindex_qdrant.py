"""Re-index every paper in the database into Qdrant.

Run from the repo root with backend/ on the path:

    set -a; . backend/.env; set +a
    PYTHONPATH=backend python3 backend/reindex_qdrant.py

Recreates the collection from scratch so a partially-populated or
wrong-dimension index can't linger. Safe to re-run.
"""

from __future__ import annotations

import logging
import os
import sys
import time

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("reindex")

from database import SessionLocal  # noqa: E402
from models import Paper  # noqa: E402
from services import qdrant_service  # noqa: E402
from services.embedding_service import get_embedding_service  # noqa: E402
from services.qdrant_service import PaperEmbeddingPayload  # noqa: E402

BATCH = int(os.environ.get("MEDINTEL_EMBEDDING_BATCH_SIZE", "64"))


def main() -> int:
    collection = qdrant_service.QDRANT_COLLECTION_NAME
    dim = qdrant_service.EMBEDDING_DIMENSION
    log.info("collection=%s dim=%s batch=%s", collection, dim, BATCH)

    client = qdrant_service.get_qdrant_client()

    if qdrant_service.collection_exists(client):
        log.info("dropping existing collection %s", collection)
        qdrant_service.delete_collection(client)
    qdrant_service.ensure_collection(client)

    embedder = get_embedding_service()
    db = SessionLocal()
    try:
        papers = db.query(Paper).all()
        total = len(papers)
        log.info("embedding %s papers", total)

        started = time.time()
        done = 0
        for i in range(0, total, BATCH):
            chunk = papers[i : i + BATCH]
            vectors = embedder.encode_papers(chunk, batch_size=BATCH)

            payloads = []
            for paper, vec in zip(chunk, vectors):
                tags: list[str] = []
                if paper.specialty_tags:
                    try:
                        import json

                        parsed = json.loads(paper.specialty_tags)
                        if isinstance(parsed, list):
                            tags = [str(t) for t in parsed]
                    except (ValueError, TypeError):
                        pass

                payloads.append(
                    PaperEmbeddingPayload(
                        paper_id=paper.id,
                        embedding=vec,
                        title=paper.title or "",
                        tldr=paper.tldr or "",
                        study_type=paper.study_type or "",
                        specialty_tags=tags,
                    )
                )

            qdrant_service.upsert_papers(payloads, client=client, batch_size=BATCH)
            done += len(chunk)
            elapsed = time.time() - started
            rate = done / elapsed if elapsed else 0
            log.info("%s/%s (%.0f/s, %.0fs elapsed)", done, total, rate, elapsed)

        indexed = qdrant_service.count_papers(client)
        log.info("DONE — %s points in %s", indexed, collection)
        return 0 if indexed == total else 1
    finally:
        db.close()


if __name__ == "__main__":
    sys.exit(main())
