# MedIntel Sandbox Deployment Design

## Goal
Create a deployable, isolated copy of the current MedIntel / CiteRounds project for the domain `med.90days.online`, backed by a new public GitHub repo and a self-hosted GitHub Actions runner so other developers can push to `main` and auto-deploy their changes directly to `med.90days.online` for testing.

## Decisions
- **New repo**: public GitHub repo with full git history (to be made private later for dev-only access).
- **Deploy trigger**: every push to `main` auto-deploys to `med.90days.online`.
- **Backend isolation**: separate Postgres and Qdrant instances on non-default ports, seeded from production data.
- **Deployment method**: self-hosted GitHub Actions runner on this server (the domain already points to this server's IP).
- **Reverse proxy**: Caddy to terminate HTTPS and forward traffic to the sandbox frontend.

## Architecture Overview

```
                                  +------------------+
                                  | med.90days.online |
                                  +---------+--------+
                                            |
                                            v
                                  +---------+--------+
                                  |  Caddy (443)     |
                                  |  auto HTTPS      |
                                  +---------+--------+
                                            |
                                            v
                                  +---------+--------+
                                  |  Next.js 16      |
                                  |  host:3001       |
                                  +---------+--------+
                                            |
                                            | internal Docker network
                                            v
+-------------------+           +-----------+-----------+
| Postgres          | <-------> |  FastAPI backend      |
| host:5433         |           |  internal:8000        |
| internal:5432     |           |  host:8001            |
+-------------------+           +-----------+-----------+
                                          |
                                          v
                                +---------+--------+
                                | Qdrant           |
                                | host:6334        |
                                | internal:6333    |
                                +------------------+
```

- All sandbox services live in a dedicated directory on this server (e.g., `/opt/medintel-sandbox`).
- The production `citerounds.com` stack remains untouched.

## Components

### 1. GitHub Repository
- Name: `medintel-sandbox` (or owner-preferred name under the current GitHub account).
- Visibility: public initially; the owner will make it private later and grant dev access.
- Contents: exact copy of the current monorepo with full git history.

### 2. Server Directory
- Path: `/opt/medintel-sandbox`.
- Owned by a dedicated deploy user (e.g., `runner-sandbox`).
- Checked out by the self-hosted runner.

### 3. Docker Compose Sandbox Stack
- `docker-compose.sandbox.yml` defines:
  - `frontend`: Next.js 16, internal port `3000`, host port `3001`.
  - `backend`: FastAPI, internal port `8000`, host port `8001`.
  - `postgres`: Postgres 15+, internal port `5432`, host port `5433`.
  - `qdrant`: Qdrant, internal port `6333`, host port `6334`.
- Services communicate over an isolated Docker network named `medintel-sandbox`.

### 4. Reverse Proxy
- Caddy runs on the host, listens on 443 for `med.90days.online`, proxies to `localhost:3001`, and handles HTTPS certificates automatically.

### 5. Self-Hosted Runner
- A GitHub Actions runner registered only to the sandbox repo.
- Runs as `runner-sandbox` with Docker permissions limited to managing the sandbox compose stack.
- Communicates with GitHub via outbound HTTPS; no inbound SSH required.

### 6. Environment File
- `.env.sandbox` on the server contains DB URLs, secrets, domain, and API base.
- Never committed to GitHub.

## Deployment & Data Flow

### Initial Setup
1. Create the new GitHub repo and push the full project history.
2. Clone the repo into `/opt/medintel-sandbox` on this server.
3. Install and register a self-hosted runner for the repo.
4. Copy production data:
   - Dump production Postgres and restore into sandbox Postgres on host port `5433`.
   - Replicate or re-index Qdrant vectors into sandbox Qdrant on host port `6334`.
5. Update hardcoded `citerounds.com` references to use `process.env.NEXT_PUBLIC_SITE_URL` and backend env-driven config.
6. Start Caddy and the sandbox compose stack.

### Normal Deploy Flow
1. Developer pushes/merges to `main` on the sandbox repo.
2. GitHub schedules the `deploy.yml` workflow.
3. The self-hosted runner on this server picks up the job.
4. The runner pulls the latest code, applies backend migrations, rebuilds images, and restarts the sandbox stack.
5. Health checks confirm the backend (`:8001/health`) and frontend (`:3001`) respond.

### Runtime Data Flow
- `https://med.90days.online` → Caddy (443) → `localhost:3001` → Next.js frontend container.
- Frontend → `http://backend:8000` (internal Docker network).
- Backend → `postgres:5432` and `qdrant:6333` (internal Docker network).

## Domain & Config Changes

### Frontend
- Introduce `NEXT_PUBLIC_SITE_URL=https://med.90days.online` in `.env.sandbox`.
- Refactor the following files to read `process.env.NEXT_PUBLIC_SITE_URL` instead of hardcoding `https://citerounds.com`:
  - `app/layout.tsx` (`metadataBase`, OpenGraph, JSON-LD)
  - `app/robots.ts`
  - `app/sitemap.ts`
  - `app/page.tsx` and other pages that reference the API base
- Set `NEXT_PUBLIC_API_BASE` to `/api` or `https://med.90days.online/api`.

### Backend
- Backend CORS allowed origins use `MEDINTEL_ALLOWED_ORIGINS` and include `https://med.90days.online`.
- Auth cookie domain reads from `MEDINTEL_COOKIE_DOMAIN=med.90days.online`.
- `FROM_EMAIL` defaults to `noreply@med.90days.online` via env var.

## GitHub Actions Workflow

File: `.github/workflows/deploy.yml`

```yaml
name: Deploy to med.90days.online
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: self-hosted
    steps:
      - name: Checkout latest code
        uses: actions/checkout@v4

      - name: Deploy sandbox
        run: |
          cd /opt/medintel-sandbox
          git pull origin main
          cp .env.sandbox .env
          cd backend && alembic upgrade head && cd ..
          docker compose -f docker-compose.sandbox.yml down
          docker compose -f docker-compose.sandbox.yml up -d --build

      - name: Health check
        run: |
          curl -f http://localhost:8001/health || exit 1
          curl -f http://localhost:3001 || exit 1
```

## Dev Workflow
1. Developers clone the sandbox repo, create a feature branch, and open a PR or push directly to `main`.
2. Every merge/push to `main` triggers an auto-deploy within 1–2 minutes.
3. Production `citerounds.com` is unaffected.

## Security & Isolation
- Sandbox DB and vector DB use non-default host ports (`5433`, `6334`) and an isolated Docker network.
- The self-hosted runner runs as a limited user with Docker permissions scoped to the sandbox compose stack.
- `.env.sandbox` lives only on the server and is never committed.
- Later: make the repo private, enable branch protection, and require PR reviews before merging to `main`.

## Rollback
If a deploy breaks the sandbox, revert the offending commit on `main`. The runner will redeploy the previous version automatically.

## Open Questions / TODO
- Confirm final GitHub repo owner/name before creation.
- Confirm whether the current server already has Caddy/nginx installed or needs it installed.
- Confirm available disk space for the duplicated Postgres and Qdrant datasets.
