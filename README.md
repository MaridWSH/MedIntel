# Claritas / MedIntel

Claritas is a closed-beta research-reading product for browsing, searching, and reviewing AI-generated summaries of open-access PubMed Central papers. It is a research aid, not clinical advice, a medical device, peer review, or a substitute for the source paper.

## Architecture

- Next.js 16 / React 19 frontend
- FastAPI / SQLAlchemy backend
- PostgreSQL for accounts and paper metadata
- Qdrant plus BGE-M3 embeddings for semantic retrieval
- A separate four-agent synthesis pipeline in `/root/papers/pipeline`

The web repository consumes versioned pipeline JSON. It does not call a generative model in user requests.

## Local development

Requirements: Node.js 20.9+, npm 10+, Python 3.12, Docker, and Docker Compose.

1. Copy `.env.example` to `.env` and set local values. Generate secrets with `python3 -c "import secrets; print(secrets.token_hex(32))"`.
2. Start PostgreSQL, Qdrant, and the API:

   ```bash
   docker compose up --build postgres qdrant backend
   ```

3. Create `.env.local` with the browser-visible API URL:

   ```dotenv
   NEXT_PUBLIC_API_BASE=http://localhost:8000/api
   ```

4. Start the frontend:

   ```bash
   npm ci
   npm run dev
   ```

The API does not automatically load `backend/.env` when run directly. Export variables in the shell, use an environment manager, or use Docker Compose.

## Data and semantic indexing

After importing versioned, verification-passed pipeline results into PostgreSQL, rebuild the vector index. The beta hardening release changed the passage from AI-only fields to source title + abstract + AI TLDR + metadata, so existing vectors must be rebuilt.

```bash
docker compose run --rm index-embeddings python -m backend.index_embeddings --recreate
```

The authenticated ingestion and backfill HTTP endpoints are maintenance operations. Only emails listed in `MEDINTEL_ADMIN_EMAILS` can invoke them.

## AI pipeline

The linked pipeline requires its provider credential at runtime; credentials must never be committed:

```bash
cd /root/papers
cp .env.example .env  # load it with your environment manager
export MEDINTEL_LLM_API_KEY='...'
python3 -m pipeline.main --paper PMC8893046 --concurrency 1
```

Pipeline version `2026-07-14.2` treats older/unversioned results as incomplete. It publishes only complete outputs that pass the recomputed source-fidelity gate; failures are written to `pipeline_outputs/errors` for inspection and retry, and any older result for the failed paper is removed from the publishable directory. Ingestion independently rechecks the version, verification decision, source hash, prompt hashes, and generation-model provenance before inserting or updating a paper.

Before processing the full corpus, run a representative, clinician-reviewed evaluation set and record factuality, quote-grounding, false-pass, false-reject, latency, and cost metrics. The pipeline’s own verifier score is not an independent clinical-quality evaluation.

## Verification

```bash
npm run check

python3 -m venv backend/.venv
backend/.venv/bin/pip install -r backend/requirements-dev.txt
cd backend && .venv/bin/python -m pytest -q && cd ..

cd /root/papers
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt pytest
MEDINTEL_LLM_API_KEY=test .venv/bin/python -m pytest -q tests
```

## Production requirements

- Set `MEDINTEL_ENV=production`.
- Set a unique `MEDINTEL_SECRET_KEY` of at least 32 characters; startup fails closed otherwise.
- Set `MEDINTEL_SECURE_COOKIES=true` and serve frontend/API over HTTPS on the same site.
- Restrict `MEDINTEL_ALLOWED_ORIGINS` and configure `MEDINTEL_ADMIN_EMAILS`.
- Configure and test SMTP plus `MEDINTEL_RESET_URL`.
- Apply `backend/migrations/001_beta_hardening.sql` to existing PostgreSQL, or `001_beta_hardening_sqlite.sql` once to an existing local SQLite database.
- Keep `MEDINTEL_PIPELINE_VERSION=2026-07-14.2` and `MEDINTEL_REQUIRE_CURRENT_PIPELINE=true`; production hides stale AI output and readiness fails until a verified current corpus is loaded.
- Back up PostgreSQL and Qdrant, and test restoration.
- Route structured API/pipeline logs to monitored storage and alert on 5xx, readiness, latency, pipeline gate failures, and model cost.
- Use `/api/health` for liveness and `/api/ready` for database/vector-index readiness.
- Complete the external-beta items in `MVP_READINESS.md`.

Detailed endpoints are documented in `API_DOCS.md`; semantic indexing is documented in `SEMANTIC_SEARCH.md`.
