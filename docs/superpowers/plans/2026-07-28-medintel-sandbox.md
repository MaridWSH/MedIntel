# MedIntel Sandbox Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a second, isolated instance of the MedIntel/CiteRounds project on `med.90days.online` with a public GitHub repo and a self-hosted GitHub Actions runner so every push to `main` auto-deploys to the sandbox domain.

**Architecture:** A new public GitHub repo (`medintel-sandbox`) is cloned onto this server at `/opt/medintel-sandbox`. An isolated Docker Compose stack (Next.js frontend, FastAPI backend, Postgres, Qdrant) runs on non-default ports. Caddy terminates HTTPS for `med.90days.online` and proxies to the sandbox frontend. A self-hosted GitHub Actions runner registered to the new repo picks up deploy jobs and rebuilds/restarts the stack on every `main` push.

**Tech Stack:** Next.js 16, FastAPI, PostgreSQL 16, Qdrant 1.18, Docker Compose, Caddy, GitHub Actions self-hosted runner, `gh` CLI.

## Global Constraints
- New repo must be public initially and preserve full git history.
- Every push to `main` must auto-deploy to `med.90days.online`.
- Backend must be isolated from production (separate Postgres on `5433`, Qdrant on `6334`, backend on `8001`, frontend on `3001`).
- Sandbox must be seeded from production data.
- No SSH keys in GitHub secrets; use a self-hosted runner on this server.
- `med.90days.online` already points to this server's IP.
- Production `citerounds.com` must remain untouched.
- No secrets committed to GitHub; `.env.sandbox` lives only on the server.

---

## File Structure

Files to create:
- `docker-compose.sandbox.yml` — isolated sandbox stack with custom ports/network.
- `.env.sandbox` — server-side env file template (values filled on the server, never committed).
- `.github/workflows/deploy.yml` — self-hosted runner deploy workflow.
- `Caddyfile` or `/etc/caddy/sites/med.90days.online` — reverse proxy config.
- `app/lib/site.ts` — single source of truth for `SITE_URL` in the frontend.

Files to modify:
- `app/layout.tsx` — replace hardcoded `https://citerounds.com` with `process.env.NEXT_PUBLIC_SITE_URL`.
- `app/robots.ts` — replace hardcoded sitemap/host with env-driven site URL.
- `app/sitemap.ts` — replace hardcoded `SITE_URL` with `process.env.NEXT_PUBLIC_SITE_URL`.
- `next.config.js` — derive CSP `connect-src` from env-driven API origin.
- `backend/auth.py` — optionally support `MEDINTEL_COOKIE_DOMAIN` for explicit cookie scoping.

---

### Task 1: Create the new GitHub repo and push full history

**Files:**
- Create: none (remote GitHub repo)
- Modify: `.git/config` indirectly via `gh repo create`

**Interfaces:**
- Consumes: current repo at `/root/MedIntel`.
- Produces: remote repo `https://github.com/<owner>/medintel-sandbox.git`.

- [ ] **Step 1: Verify `gh` CLI authentication**

```bash
gh auth status
```
Expected: Shows logged-in user and scopes.

- [ ] **Step 2: Create the new public repo with full history**

```bash
cd /root/MedIntel
gh repo create medintel-sandbox --public --source=. --push
```
Expected: Output confirms repo created and code pushed to `origin` of new repo.

- [ ] **Step 3: Verify the repo on GitHub**

```bash
gh repo view medintel-sandbox --web
```
Expected: Browser opens to the new repo showing full commit history.

- [ ] **Step 4: Commit**

No local code changes to commit yet.

---

### Task 2: Add frontend site URL helper and refactor hardcoded domains

**Files:**
- Create: `app/lib/site.ts`
- Modify: `app/layout.tsx`, `app/robots.ts`, `app/sitemap.ts`, `next.config.js`

**Interfaces:**
- Consumes: `process.env.NEXT_PUBLIC_SITE_URL` and `process.env.NEXT_PUBLIC_API_BASE`.
- Produces: `getSiteUrl()`, `getApiBase()` helpers used by metadata, sitemap, robots, and CSP.

- [ ] **Step 1: Create `app/lib/site.ts`**

```typescript
export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  if (!url) {
    // Safe fallback for local dev; never used in production builds.
    return 'http://localhost:3000';
  }
  return url.replace(/\/$/, '');
}

export function getApiBase(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE;
  if (base) {
    return base.replace(/\/$/, '');
  }
  return `${getSiteUrl()}/api`;
}
```

- [ ] **Step 2: Modify `app/layout.tsx`**

Replace:
```typescript
export const metadata: Metadata = {
  metadataBase: new URL('https://citerounds.com'),
```
With:
```typescript
import { getSiteUrl } from './lib/site';

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
```

Replace all other occurrences of `'https://citerounds.com'` in `app/layout.tsx` with `${siteUrl}` (including `openGraph.url`, JSON-LD `@id`, `url`, and `target`).

- [ ] **Step 3: Modify `app/robots.ts`**

Replace file contents with:
```typescript
import type { MetadataRoute } from 'next';
import { getSiteUrl } from './lib/site';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/account/', '/dashboard/'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
```

- [ ] **Step 4: Modify `app/sitemap.ts`**

Replace:
```typescript
const SITE_URL = 'https://citerounds.com';
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || `${SITE_URL}/api`).replace(/\/$/, '');
```
With:
```typescript
import { getSiteUrl, getApiBase } from './lib/site';

const SITE_URL = getSiteUrl();
const API_BASE = getApiBase();
```

- [ ] **Step 5: Modify `next.config.js`**

Replace the `apiOrigin` IIFE with env-driven derivation:
```javascript
const apiOrigin = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_SITE_URL || 'https://citerounds.com').origin;
  } catch {
    return 'https://citerounds.com';
  }
})();
```

- [ ] **Step 6: Run typecheck and build**

```bash
npm run typecheck
NEXT_PUBLIC_SITE_URL=https://med.90days.online NEXT_PUBLIC_API_BASE=https://med.90days.online/api npm run build
```
Expected: `typecheck` passes; `build` completes without errors.

- [ ] **Step 7: Commit**

```bash
git add app/lib/site.ts app/layout.tsx app/robots.ts app/sitemap.ts next.config.js
git commit -m "refactor: make site URL and API base env-driven for sandbox deploys"
```

---

### Task 3: Make backend cookie domain configurable

**Files:**
- Modify: `backend/auth.py`
- Modify: `backend/routers/auth.py`

**Interfaces:**
- Consumes: `MEDINTEL_COOKIE_DOMAIN` env var.
- Produces: auth cookies scoped to `MEDINTEL_COOKIE_DOMAIN` when set.

- [ ] **Step 1: Modify `backend/auth.py`**

Add near the top with other env reads:
```python
COOKIE_DOMAIN = os.getenv("MEDINTEL_COOKIE_DOMAIN")
```

- [ ] **Step 2: Modify `backend/routers/auth.py`**

In `_set_auth_cookies`, add `domain=COOKIE_DOMAIN` to both `response.set_cookie` calls:
```python
response.set_cookie(
    ACCESS_TOKEN_COOKIE,
    access_token,
    httponly=True,
    secure=SECURE_COOKIES,
    samesite="lax",
    path="/api",
    domain=COOKIE_DOMAIN,
    max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
)
response.set_cookie(
    REFRESH_TOKEN_COOKIE,
    refresh_token,
    httponly=True,
    secure=SECURE_COOKIES,
    samesite="lax",
    path="/api/auth",
    domain=COOKIE_DOMAIN,
    max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
)
```

In `_clear_auth_cookies`, add `domain=COOKIE_DOMAIN` to both `response.delete_cookie` calls:
```python
response.delete_cookie(ACCESS_TOKEN_COOKIE, path="/api", domain=COOKIE_DOMAIN)
response.delete_cookie(REFRESH_TOKEN_COOKIE, path="/api/auth", domain=COOKIE_DOMAIN)
```

- [ ] **Step 3: Commit**

```bash
git add backend/auth.py backend/routers/auth.py
git commit -m "feat: support MEDINTEL_COOKIE_DOMAIN for sandbox auth cookies"
```

---

### Task 4: Create the sandbox Docker Compose stack

**Files:**
- Create: `docker-compose.sandbox.yml`

**Interfaces:**
- Consumes: `.env.sandbox` at runtime.
- Produces: isolated containers on custom ports and Docker network `medintel-sandbox`.

- [ ] **Step 1: Create `docker-compose.sandbox.yml`**

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: medintel-sandbox-postgres
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-medintel_sandbox}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?POSTGRES_PASSWORD is required}
      POSTGRES_DB: ${POSTGRES_DB:-medintel_sandbox}
    volumes:
      - postgres_sandbox_data:/var/lib/postgresql/data
    ports:
      - "127.0.0.1:5433:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-medintel_sandbox} -d ${POSTGRES_DB:-medintel_sandbox}"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - medintel-sandbox

  qdrant:
    image: qdrant/qdrant:v1.18.2
    container_name: medintel-sandbox-qdrant
    ports:
      - "127.0.0.1:6334:6333"
      - "127.0.0.1:6335:6334"
    volumes:
      - qdrant_sandbox_data:/qdrant/storage
    healthcheck:
      test: ["CMD-SHELL", "bash -c ':> /dev/tcp/127.0.0.1/6333'"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - medintel-sandbox

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: medintel-sandbox-backend
    environment:
      DATABASE_URL: postgresql+psycopg2://${POSTGRES_USER:-medintel_sandbox}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB:-medintel_sandbox}
      MEDINTEL_QDRANT_URL: http://qdrant:6333
      MEDINTEL_QDRANT_COLLECTION: ${MEDINTEL_QDRANT_COLLECTION:-papers_sandbox}
      MEDINTEL_EMBEDDING_MODEL: ${MEDINTEL_EMBEDDING_MODEL:-BAAI/bge-m3}
      MEDINTEL_SECRET_KEY: ${MEDINTEL_SECRET_KEY:?MEDINTEL_SECRET_KEY is required}
      MEDINTEL_SECURE_COOKIES: ${MEDINTEL_SECURE_COOKIES:-true}
      MEDINTEL_ENV: ${MEDINTEL_ENV:-staging}
      MEDINTEL_ALLOWED_ORIGINS: ${MEDINTEL_ALLOWED_ORIGINS:-https://med.90days.online}
      MEDINTEL_ADMIN_EMAILS: ${MEDINTEL_ADMIN_EMAILS:-}
      MEDINTEL_ENABLE_DOCS: ${MEDINTEL_ENABLE_DOCS:-false}
      MEDINTEL_RESET_URL: ${MEDINTEL_RESET_URL:-https://med.90days.online/reset-password}
      MEDINTEL_PIPELINE_VERSION: ${MEDINTEL_PIPELINE_VERSION:-2026-07-14.2}
      MEDINTEL_REQUIRE_CURRENT_PIPELINE: ${MEDINTEL_REQUIRE_CURRENT_PIPELINE:-true}
      MEDINTEL_COOKIE_DOMAIN: ${MEDINTEL_COOKIE_DOMAIN:-med.90days.online}
      FROM_EMAIL: ${FROM_EMAIL:-noreply@med.90days.online}
      SMTP_HOST: ${SMTP_HOST:-}
      SMTP_PORT: ${SMTP_PORT:-587}
      SMTP_USER: ${SMTP_USER:-}
      SMTP_PASSWORD: ${SMTP_PASSWORD:-}
    ports:
      - "127.0.0.1:8001:8000"
    depends_on:
      postgres:
        condition: service_healthy
      qdrant:
        condition: service_healthy
    command: >
      uvicorn main:app --host 0.0.0.0 --port 8000
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/health"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - medintel-sandbox

  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: medintel-sandbox-frontend
    environment:
      NEXT_PUBLIC_SITE_URL: ${NEXT_PUBLIC_SITE_URL:-https://med.90days.online}
      NEXT_PUBLIC_API_BASE: ${NEXT_PUBLIC_API_BASE:-https://med.90days.online/api}
    ports:
      - "127.0.0.1:3001:3000"
    depends_on:
      backend:
        condition: service_healthy
    command: >
      node_modules/.bin/next start -p 3000
    networks:
      - medintel-sandbox

  index-embeddings:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql+psycopg2://${POSTGRES_USER:-medintel_sandbox}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB:-medintel_sandbox}
      MEDINTEL_QDRANT_URL: http://qdrant:6333
      MEDINTEL_QDRANT_COLLECTION: ${MEDINTEL_QDRANT_COLLECTION:-papers_sandbox}
      MEDINTEL_EMBEDDING_MODEL: ${MEDINTEL_EMBEDDING_MODEL:-BAAI/bge-m3}
    depends_on:
      postgres:
        condition: service_healthy
      qdrant:
        condition: service_healthy
    command: >
      python -m backend.index_embeddings --batch-size 100
    profiles:
      - indexing
    networks:
      - medintel-sandbox

volumes:
  postgres_sandbox_data:
  qdrant_sandbox_data:

networks:
  medintel-sandbox:
    name: medintel-sandbox
```

- [ ] **Step 2: Verify compose syntax**

```bash
docker compose -f docker-compose.sandbox.yml config
```
Expected: No errors; note that required env vars may cause failure until `.env.sandbox` exists (this is expected).

- [ ] **Step 3: Commit**

```bash
git add docker-compose.sandbox.yml
git commit -m "feat: add isolated docker compose stack for med.90days.online sandbox"
```

---

### Task 5: Create a production-ready frontend Dockerfile

**Files:**
- Create: `Dockerfile`

**Interfaces:**
- Consumes: project root with Next.js 16, npm packages.
- Produces: container image running `next start`.

- [ ] **Step 1: Check if `Dockerfile` already exists**

```bash
ls -la /root/MedIntel/Dockerfile
```
If it exists, inspect it and skip this task if it already builds and runs Next.js 16 properly.

- [ ] **Step 2: Create `Dockerfile`**

```dockerfile
# syntax=docker/dockerfile:1
FROM node:20-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_API_BASE
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_API_BASE=${NEXT_PUBLIC_API_BASE}
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
```

- [ ] **Step 3: Enable standalone output in `next.config.js`**

Add `output: 'standalone'` to `nextConfig`:
```javascript
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  output: 'standalone',
  poweredByHeader: false,
  // ... rest unchanged
};
```

- [ ] **Step 4: Commit**

```bash
git add Dockerfile next.config.js
git commit -m "feat: add production Dockerfile with standalone Next.js output"
```

---

### Task 6: Create the server-side environment file

**Files:**
- Create: `.env.sandbox` on the server (not in the repo)

**Interfaces:**
- Consumes: `.env.example` as a template.
- Produces: `.env.sandbox` at `/opt/medintel-sandbox/.env.sandbox`.

- [ ] **Step 1: Generate a secret key**

```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```
Save the output for the next step.

- [ ] **Step 2: Create `/opt/medintel-sandbox/.env.sandbox`**

After the repo is cloned to `/opt/medintel-sandbox` (Task 7), create this file:

```bash
sudo mkdir -p /opt/medintel-sandbox
sudo chown -R $(whoami):$(whoami) /opt/medintel-sandbox
```

Then create `.env.sandbox`:
```env
NEXT_PUBLIC_SITE_URL=https://med.90days.online
NEXT_PUBLIC_API_BASE=https://med.90days.online/api

POSTGRES_USER=medintel_sandbox
POSTGRES_PASSWORD=<generate a strong password>
POSTGRES_DB=medintel_sandbox

MEDINTEL_QDRANT_URL=http://qdrant:6333
MEDINTEL_QDRANT_COLLECTION=papers_sandbox
MEDINTEL_EMBEDDING_MODEL=BAAI/bge-m3
MEDINTEL_EMBEDDING_DIMENSION=1024
MEDINTEL_QUERY_INSTRUCTION="Represent this sentence for searching relevant scientific papers: "
MEDINTEL_EMBEDDING_BATCH_SIZE=32
MEDINTEL_EMBEDDING_MAX_CHARS=12000
MEDINTEL_QDRANT_TIMEOUT_SECONDS=10

MEDINTEL_ENV=staging
MEDINTEL_SECRET_KEY=<secret from step 1>
MEDINTEL_SECURE_COOKIES=true
MEDINTEL_ALLOWED_ORIGINS=https://med.90days.online
MEDINTEL_TRUSTED_PROXY_NETWORKS=127.0.0.1/32,::1/128
MEDINTEL_ADMIN_EMAILS=
MEDINTEL_ACCESS_TOKEN_MINUTES=15
MEDINTEL_ENABLE_DOCS=false
MEDINTEL_PIPELINE_VERSION=2026-07-14.2
MEDINTEL_REQUIRE_CURRENT_PIPELINE=true
MEDINTEL_COOKIE_DOMAIN=med.90days.online

SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
FROM_EMAIL=noreply@med.90days.online
MEDINTEL_RESET_URL=https://med.90days.online/reset-password
```

Set permissions:
```bash
chmod 600 /opt/medintel-sandbox/.env.sandbox
```

- [ ] **Step 3: Do not commit this file**

Ensure `.gitignore` already ignores `.env*`; if not, add it.

---

### Task 7: Clone the new repo on the server and set up the sandbox directory

**Files:**
- Modify: `.git/config` in `/opt/medintel-sandbox`

**Interfaces:**
- Consumes: remote `https://github.com/<owner>/medintel-sandbox.git`.
- Produces: local checkout at `/opt/medintel-sandbox`.

- [ ] **Step 1: Create sandbox directory and clone**

```bash
sudo mkdir -p /opt
sudo git clone https://github.com/<owner>/medintel-sandbox.git /opt/medintel-sandbox
sudo chown -R runner-sandbox:runner-sandbox /opt/medintel-sandbox
```
Use the actual GitHub owner in the URL.

- [ ] **Step 2: Verify the checkout**

```bash
cd /opt/medintel-sandbox
git log --oneline -5
```
Expected: Shows recent commits including the sandbox refactor commits.

- [ ] **Step 3: Copy `.env.sandbox` into place**

If not already created in Task 6:
```bash
cp /path/to/.env.sandbox /opt/medintel-sandbox/.env.sandbox
chmod 600 /opt/medintel-sandbox/.env.sandbox
```

---

### Task 8: Seed sandbox Postgres from production

**Files:**
- None (operates on Docker volumes).

**Interfaces:**
- Consumes: production Postgres running in the production Docker Compose stack.
- Produces: seeded sandbox Postgres volume `medintel-sandbox_postgres_sandbox_data`.

- [ ] **Step 1: Identify production Postgres connection**

Find the production container name:
```bash
docker ps --format "table {{.Names}}\t{{.Ports}}" | grep postgres
```
Expected: A container like `medintel-postgres` listening on `127.0.0.1:5432`.

- [ ] **Step 2: Dump production Postgres**

```bash
mkdir -p /tmp/medintel-sandbox-seed
docker exec -e PGPASSWORD=<prod_password> medintel-postgres \
  pg_dump -U medintel -d medintel -Fc -f /tmp/medintel-prod.dump
docker cp medintel-postgres:/tmp/medintel-prod.dump /tmp/medintel-sandbox-seed/
```

- [ ] **Step 3: Start sandbox Postgres**

```bash
cd /opt/medintel-sandbox
docker compose -f docker-compose.sandbox.yml up -d postgres
```
Wait until healthy:
```bash
docker compose -f docker-compose.sandbox.yml ps postgres
```

- [ ] **Step 4: Restore the dump into sandbox Postgres**

```bash
docker cp /tmp/medintel-sandbox-seed/medintel-prod.dump medintel-sandbox-postgres:/tmp/medintel-prod.dump
docker exec -e PGPASSWORD=<sandbox_password> medintel-sandbox-postgres \
  pg_restore -U medintel_sandbox -d medintel_sandbox --no-owner --no-privileges /tmp/medintel-prod.dump
```

- [ ] **Step 5: Verify row counts**

```bash
docker exec -e PGPASSWORD=<sandbox_password> medintel-sandbox-postgres \
  psql -U medintel_sandbox -d medintel_sandbox -c "SELECT COUNT(*) FROM users;"
```
Expected: Non-zero count matching production.

---

### Task 9: Seed sandbox Qdrant from production

**Files:**
- None (operates on Docker volumes).

**Interfaces:**
- Consumes: production Qdrant collection (`papers`).
- Produces: sandbox Qdrant collection (`papers_sandbox`).

- [ ] **Step 1: Identify production Qdrant collection**

The default collection name is `papers` (from `.env.example`).

- [ ] **Step 2: Snapshot the production collection**

```bash
curl -X POST "http://127.0.0.1:6333/collections/papers/snapshots"
```
List snapshots:
```bash
curl "http://127.0.0.1:6333/collections/papers/snapshots"
```
Download the latest snapshot:
```bash
SNAPSHOT_URL=$(curl -s "http://127.0.0.1:6333/collections/papers/snapshots" | jq -r '.result[-1].url')
curl -o /tmp/medintel-sandbox-seed/papers.snapshot "http://127.0.0.1:6333$SNAPSHOT_URL"
```

- [ ] **Step 3: Start sandbox Qdrant**

```bash
cd /opt/medintel-sandbox
docker compose -f docker-compose.sandbox.yml up -d qdrant
```
Wait until healthy.

- [ ] **Step 4: Create target collection and restore snapshot**

Create the collection first (use the same vector params as production):
```bash
curl -X PUT "http://127.0.0.1:6334/collections/papers_sandbox" \
  -H "Content-Type: application/json" \
  -d '{
    "vectors": {
      "size": 1024,
      "distance": "Cosine"
    }
  }'
```

Upload the snapshot and recover:
```bash
curl -X POST "http://127.0.0.1:6334/collections/papers_sandbox/snapshots/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "snapshot=@/tmp/medintel-sandbox-seed/papers.snapshot"
```

- [ ] **Step 5: Verify vector count**

```bash
curl "http://127.0.0.1:6334/collections/papers_sandbox"
```
Expected: `points_count` matches production.

---

### Task 10: Install and configure Caddy as reverse proxy

**Files:**
- Create: `/etc/caddy/sites/med.90days.online`
- Modify: `/etc/caddy/Caddyfile` (if exists)

**Interfaces:**
- Consumes: sandbox frontend on `localhost:3001`.
- Produces: HTTPS termination for `med.90days.online`.

- [ ] **Step 1: Install Caddy**

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install -y caddy
```

- [ ] **Step 2: Create Caddy site config**

```bash
sudo mkdir -p /etc/caddy/sites
sudo tee /etc/caddy/sites/med.90days.online <<'EOF'
med.90days.online {
    reverse_proxy localhost:3001
    encode gzip
    header {
        X-Content-Type-Options nosniff
        X-Frame-Options DENY
        Referrer-Policy no-referrer
    }
}
EOF
```

- [ ] **Step 3: Include the site in main Caddyfile**

If `/etc/caddy/Caddyfile` exists:
```bash
echo 'import sites/*' | sudo tee -a /etc/caddy/Caddyfile
```
Otherwise create it:
```bash
echo 'import sites/*' | sudo tee /etc/caddy/Caddyfile
```

- [ ] **Step 4: Reload Caddy**

```bash
sudo systemctl reload caddy
```

- [ ] **Step 5: Verify HTTPS**

```bash
curl -I https://med.90days.online
```
Expected: HTTP 200 and valid certificate (may show connection refused until frontend is up).

---

### Task 11: Install and register the self-hosted GitHub Actions runner

**Files:**
- None (system-level install).

**Interfaces:**
- Consumes: new GitHub repo.
- Produces: running runner service connected to the repo.

- [ ] **Step 1: Create runner user**

```bash
sudo useradd -m -s /bin/bash runner-sandbox
sudo usermod -aG docker runner-sandbox
```

- [ ] **Step 2: Download the runner**

```bash
RUNNER_VERSION="2.320.0"  # check https://github.com/actions/runner/releases for latest
sudo -u runner-sandbox mkdir -p /home/runner-sandbox/actions-runner
cd /home/runner-sandbox/actions-runner
sudo -u runner-sandbox curl -o actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz -L https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz
sudo -u runner-sandbox tar xzf actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz
```

- [ ] **Step 3: Get registration token from GitHub**

```bash
cd /root/MedIntel
gh api repos/<owner>/medintel-sandbox/actions/runners/registration-token --method POST --jq .token
```
Save the token.

- [ ] **Step 4: Configure the runner**

```bash
cd /home/runner-sandbox/actions-runner
sudo -u runner-sandbox ./config.sh --url https://github.com/<owner>/medintel-sandbox --token <TOKEN> --name medintel-sandbox-runner --work _work --labels self-hosted,linux,x64,sandbox --unattended
```

- [ ] **Step 5: Install and start the runner service**

```bash
sudo ./svc.sh install runner-sandbox
sudo ./svc.sh start
```

- [ ] **Step 6: Verify runner is online**

```bash
gh api repos/<owner>/medintel-sandbox/actions/runners --jq '.runners[] | {name, status, labels}'
```
Expected: `status` is `online`.

---

### Task 12: Create the GitHub Actions deploy workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

**Interfaces:**
- Consumes: self-hosted runner, `/opt/medintel-sandbox/.env.sandbox`.
- Produces: deployed sandbox stack on every `main` push.

- [ ] **Step 1: Create `.github/workflows/deploy.yml`**

```yaml
name: Deploy to med.90days.online

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: self-hosted
    steps:
      - name: Deploy sandbox
        run: |
          set -e
          cd /opt/medintel-sandbox
          git pull origin main
          cp .env.sandbox .env
          docker compose -f docker-compose.sandbox.yml down
          docker compose -f docker-compose.sandbox.yml up -d --build
          docker compose -f docker-compose.sandbox.yml exec -T backend alembic upgrade head

      - name: Health check
        run: |
          set -e
          sleep 10
          curl -f http://127.0.0.1:8001/api/health || exit 1
          curl -f http://127.0.0.1:3001 || exit 1
          echo "Sandbox deployed successfully"
```

- [ ] **Step 2: Commit and push**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add self-hosted runner deploy workflow for med.90days.online"
git push origin main
```

- [ ] **Step 3: Verify workflow trigger**

Open the Actions tab in the new repo and confirm the workflow ran/queued.

---

### Task 13: First sandbox deploy and end-to-end verification

**Files:**
- None (verification only).

**Interfaces:**
- Consumes: full sandbox stack, Caddy, GitHub Actions workflow.
- Produces: working `https://med.90days.online`.

- [ ] **Step 1: Trigger the deploy workflow**

Either push a small change to `main` or run the workflow steps manually on the server:
```bash
cd /opt/medintel-sandbox
git pull origin main
cp .env.sandbox .env
docker compose -f docker-compose.sandbox.yml up -d --build
```

- [ ] **Step 2: Wait for containers**

```bash
docker compose -f docker-compose.sandbox.yml ps
```
Expected: All services show `healthy` or `Up`.

- [ ] **Step 3: Verify backend health**

```bash
curl -f http://127.0.0.1:8001/api/health
```
Expected: HTTP 200 with JSON health response.

- [ ] **Step 4: Verify frontend**

```bash
curl -f http://127.0.0.1:3001
```
Expected: HTTP 200 with HTML.

- [ ] **Step 5: Verify public HTTPS site**

```bash
curl -f https://med.90days.online
```
Expected: HTTP 200, HTML served, certificate valid.

- [ ] **Step 6: Verify auto-deploy**

Make a trivial visible change in the sandbox repo (e.g., update a footer string), push to `main`, wait for the Actions run to complete, then refresh `https://med.90days.online`.
Expected: Change appears within 2 minutes.

---

## Self-Review

**Spec coverage:**
- New public repo with full history → Task 1.
- Auto-deploy on `main` push → Tasks 12 and 13.
- Isolated backend with same features → Tasks 4, 8, 9.
- Self-hosted runner instead of SSH → Task 11.
- Caddy reverse proxy for `med.90days.online` → Task 10.
- Domain/config changes → Tasks 2 and 3.
- Seeding from production → Tasks 8 and 9.

**Placeholder scan:**
- No TBD/TODO.
- All commands include exact paths/ports.
- `<owner>` and `<secret>` placeholders are unavoidable for environment-specific values but are clearly called out as values to fill at execution time.

**Type consistency:**
- `getSiteUrl()` and `getApiBase()` are used consistently across refactored frontend files.
- `MEDINTEL_COOKIE_DOMAIN` is read in `backend/auth.py` and used in `backend/routers/auth.py`.

**Gaps identified:**
- The user did not specify whether production is currently running via Docker Compose on this server; Task 8 assumes a production container named `medintel-postgres` exists and is reachable. Adjust container names if production is named differently.
- If the production DB is not accessible from this server, seeding must be done via a dump provided by the user.
