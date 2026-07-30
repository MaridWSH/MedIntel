# Project Reorganization — Refactor Report

This document records the folder/file reorganization performed before implementing the Admin Dashboard, Admin Management, and Analytics features.

No API behavior, database behavior, authentication behavior, or UI behavior was intentionally changed.

---

## Goals

- Move from a flat backend layout to a feature/responsibility-oriented architecture.
- Separate routers, services, repositories, schemas, models, and core concerns.
- Split the monolithic frontend API client into domain modules.
- Introduce a shared admin shell for `/admin/*` pages.
- Preserve all existing behavior and keep all tests passing.

---

## Backend changes

### Files moved

| Original location | New location | Reason |
|---|---|---|
| `backend/auth.py` | `backend/core/auth.py` | Centralize security/auth utilities under `core/`. |
| `backend/database.py` | `backend/database/session.py` | Make `database/` a package; re-export via `database/__init__.py`. |
| `backend/models.py` | `backend/database/models/user.py`, `paper.py`, `feedback.py`, `__init__.py` | Split models by domain. |
| `backend/schemas.py` | `backend/schemas/auth.py`, `papers.py`, `feedback.py`, `user.py`, `health.py`, `__init__.py` | Split Pydantic schemas by domain; `__init__.py` preserves `from schemas import …`. |

### Files created

| File | Purpose |
|---|---|
| `backend/core/__init__.py` | Re-exports all public auth/security symbols. |
| `backend/database/__init__.py` | Re-exports `Base`, `engine`, `get_db`, `SessionLocal`. |
| `backend/database/models/__init__.py` | Re-exports all models. |
| `backend/database/models/user.py` | `User` model. |
| `backend/database/models/paper.py` | `Paper` model. |
| `backend/database/models/feedback.py` | `SavedPaper`, `ResearchSurveySubmission`, `ProductFeedbackSubmission` models. |
| `backend/schemas/auth.py` | Auth/account Pydantic schemas. |
| `backend/schemas/papers.py` | Paper/search/ingest Pydantic schemas. |
| `backend/schemas/feedback.py` | Research/product feedback Pydantic schemas. |
| `backend/schemas/user.py` | Saved-paper Pydantic schemas. |
| `backend/schemas/health.py` | Health/readiness Pydantic schemas. |
| `backend/repositories/catalogue.py` | Paper-catalogue database queries. |
| `backend/repositories/feedback.py` | Feedback submission database queries. |
| `backend/repositories/users.py` | User/saved-paper database queries. |
| `backend/routers/admin/__init__.py` | Admin routers package. |
| `backend/routers/admin/feedback.py` | Admin-only feedback listing endpoints (same URL paths as before). |
| `backend/services/papers.py` | Paper parsing, formatting, and validation helpers extracted from `routers/papers.py`. |
| `backend/services/ingest.py` | Pipeline ingestion and metadata backfill logic extracted from `routers/papers.py`. |
| `backend/services/feedback.py` | Feedback submission logic and response formatting. |
| `backend/services/users.py` | User registration, login, account deletion, saved-paper business logic. |

### Files deleted

- `backend/auth.py`
- `backend/database.py`
- `backend/models.py`
- `backend/schemas.py`

### Architecture changes

#### Before

- `routers/papers.py` was 1,035 lines and contained HTTP routing, XML parsing, JSON reshaping, pipeline validation, ingestion, backfill, keyword/semantic search, and response building.
- `routers/feedback.py` mixed public submission endpoints with admin-only listing.
- `routers/user.py` contained inline SQL queries.
- `repositories/` was only used by semantic search.

#### After

- `routers/papers.py` is now a thin HTTP router.
- `services/papers.py` owns XML/markdown parsing, JSON reshaping, pipeline validation, and response formatting.
- `services/ingest.py` owns ingestion and backfill business logic.
- `repositories/catalogue.py` owns catalogue SQL queries.
- `routers/feedback.py` only has public submission endpoints.
- `routers/admin/feedback.py` has admin-only listing endpoints, mounted at the same `/api/feedback/...` paths.
- `services/feedback.py` + `repositories/feedback.py` handle feedback logic.
- `services/users.py` + `repositories/users.py` handle user logic.

### Import changes

All files were updated to use the new paths:

- `from auth import …` → `from core.auth import …`
- `from models import …` → `from database.models import …`
- `from database import …` → preserved via `database/__init__.py`
- `from schemas import …` → preserved via `schemas/__init__.py`

### Tests updated

- `backend/tests/test_auth_security.py`
- `backend/tests/test_feedback.py`
- `backend/tests/test_papers_ingest.py`
- `backend/tests/test_search_endpoint.py`
- `backend/tests/test_semantic_search_service.py`

These were updated to import from the new module locations. `test_papers_ingest.py` was also adjusted so the Windows `os.path.realpath` monkeypatch accepts `**kwargs` and avoids recursion when `Path.resolve()` calls the patched function.

---

## Frontend changes

### Files moved

| Original location | New location | Reason |
|---|---|---|
| `lib/api.ts` (monolithic) | `lib/api/client.ts`, `auth.ts`, `user.ts`, `feedback.ts`, `index.ts` | Domain-separated API clients. |

### Files created

| File | Purpose |
|---|---|
| `lib/api/client.ts` | Shared `apiFetch`, `apiErrorMessage`, `endpointUrl`, `clearTokens`, token refresh. |
| `lib/api/auth.ts` | Login, register, me, logout, forgot/reset password, delete account. |
| `lib/api/user.ts` | Saved papers, dashboard stats. |
| `lib/api/feedback.ts` | Research/product feedback submission and admin response fetching. |
| `lib/api/index.ts` | Backward-compatible re-export so `import { … } from '@/lib/api'` still works. |
| `lib/api/admin.ts` | Placeholder for upcoming admin API client. |
| `lib/api/analytics.ts` | Placeholder for upcoming analytics API client. |
| `components/admin/AdminNav.tsx` | Sidebar/top navigation for admin pages. |
| `components/admin/AdminShell.tsx` | Shared layout wrapper including `SiteHeader` and `AdminNav`. |
| `app/admin/layout.tsx` | Shared admin metadata and `AdminShell` wrapper. |
| `app/admin/page.tsx` | Admin dashboard landing page with links. |
| `app/admin/users/page.tsx` | User management placeholder page. |
| `app/admin/analytics/page.tsx` | Analytics placeholder page. |
| `components/analytics/.gitkeep` | Placeholder directory for analytics-specific chart components. |
| `hooks/.gitkeep` | Placeholder directory for shared hooks. |
| `providers/.gitkeep` | Placeholder directory for context providers. |

### Files deleted

- `lib/api.ts`
- `app/admin/responses/layout.tsx` (merged into shared admin layout)

### UI changes

- `app/admin/responses/page.tsx` was integrated into the shared `AdminShell`:
  - Removed `TopUtilityStrip`, `SiteHeader`, and `SiteFooter` from the page.
  - The page now renders inside `AdminShell`, which provides the header and navigation.
  - Existing content and behavior are preserved.

- New admin pages (`/admin`, `/admin/users`, `/admin/analytics`) are available and share the same shell.

### Import changes

All existing `import { … } from '@/lib/api'` imports continue to work because `lib/api/index.ts` re-exports the full public API.

---

## Verification

All checks were executed successfully after the refactor:

### Backend

```bash
cd backend
python -m pytest -q
```

Result: **31 passed, 2 warnings**

### Frontend

```bash
npm run check
# equivalent to: npm run lint && npm run typecheck && npm run build
```

Results:
- `npm run lint` ✅
- `npm run typecheck` ✅
- `npm run build` ✅ (all 24 routes generated successfully)

### Smoke tests

A local backend instance was started and the following were verified:

- `GET /api/health` → returns `{"status":"ok","papers_count":0}`
- `POST /api/auth/register` → returns user + access token
- `POST /api/feedback/research-methods` → stores anonymous survey response
- `GET /api/feedback/research-methods` without auth → returns `401 Not authenticated`

---

## Final folder tree (high-level)

```
D:\CiteRoundes\MedIntel
├── app/
│   ├── admin/
│   │   ├── analytics/
│   │   │   └── page.tsx
│   │   ├── responses/
│   │   │   └── page.tsx
│   │   ├── users/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── account/
│   ├── dashboard/
│   ├── feedback/
│   ├── forgot-password/
│   ├── login/
│   ├── paper/
│   ├── pricing/
│   ├── register/
│   ├── research-survey/
│   ├── reset-password/
│   ├── search/
│   ├── error.tsx
│   ├── globals.css
│   ├── icon.svg
│   ├── layout.tsx
│   ├── loading.tsx
│   ├── not-found.tsx
│   ├── page.tsx
│   ├── robots.ts
│   └── sitemap.ts
├── backend/
│   ├── api/
│   │   ├── __init__.py
│   │   └── dependencies.py
│   ├── core/
│   │   ├── __init__.py
│   │   └── auth.py
│   ├── database/
│   │   ├── __init__.py
│   │   ├── session.py
│   │   └── models/
│   │       ├── __init__.py
│   │       ├── feedback.py
│   │       ├── paper.py
│   │       └── user.py
│   ├── migrations/
│   ├── repositories/
│   │   ├── __init__.py
│   │   ├── catalogue.py
│   │   ├── feedback.py
│   │   ├── paper_repository.py
│   │   ├── users.py
│   │   └── vector_repository.py
│   ├── routers/
│   │   ├── admin/
│   │   │   ├── __init__.py
│   │   │   └── feedback.py
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── feedback.py
│   │   ├── papers.py
│   │   ├── search.py
│   │   └── user.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── feedback.py
│   │   ├── health.py
│   │   ├── papers.py
│   │   └── user.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── embedding_service.py
│   │   ├── feedback.py
│   │   ├── ingest.py
│   │   ├── papers.py
│   │   ├── qdrant_service.py
│   │   ├── semantic_search_service.py
│   │   └── users.py
│   ├── tests/
│   ├── import_from_api.py
│   ├── index_embeddings.py
│   ├── main.py
│   ├── reindex_qdrant.py
│   └── seed.py
├── components/
│   ├── admin/
│   │   ├── AdminNav.tsx
│   │   └── AdminShell.tsx
│   ├── analytics/
│   ├── paper/
│   ├── site/
│   └── ui/
├── hooks/
├── lib/
│   ├── api/
│   │   ├── admin.ts
│   │   ├── analytics.ts
│   │   ├── auth.ts
│   │   ├── client.ts
│   │   ├── feedback.ts
│   │   ├── index.ts
│   │   └── user.ts
│   └── papers/
├── providers/
└── types/
```

---

## Remaining technical debt / next steps

1. **Password-reset email logic** still lives inside `routers/auth.py`. It could be extracted into `services/auth.py` or `services/password_reset.py` for consistency.
2. **`verify_password` in `services/users.py` is only used by `login_user`**. It is fine there, but the cookie-setting logic in `services/users.py` still touches HTTP concerns (cookies). A future refactor could move cookie handling entirely back to the router and have the service return tokens.
3. **`is_admin` column** is not yet added to the `User` model. This is planned for the Admin Management implementation phase.
4. **Analytics event table** is not yet created. This is planned for the Analytics implementation phase.
5. **Admin menu in `SiteHeader`** is not yet shown. It will be wired once `is_admin` is exposed by `/api/auth/me`.
6. **Frontend hooks/providers** directories are empty placeholders. They will be populated when implementing auth providers and analytics instrumentation.
7. **`recharts`** dependency is not yet installed. It will be added during the Analytics charts implementation.

---

## Notes

- The refactor was performed incrementally; backend tests were run after each major chunk.
- No new runtime dependencies were introduced.
- No existing API route paths were changed.
- No database tables or columns were changed.

---

# Admin And Analytics Implementation

This section documents the Admin and Analytics work added after the project reorganization.

## Database Schema

### `users.is_admin`

Added a boolean admin flag to the existing `users` table.

```sql
ALTER TABLE users
ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT false;
```

SQLite uses `INTEGER NOT NULL DEFAULT 0` for the same field.

Purpose:

- Allows admin permissions to be stored in the database.
- Keeps `MEDINTEL_ADMIN_EMAILS` as a bootstrap/override mechanism.
- Existing env-admin users remain admins even if `is_admin` is false.

### `analytics_events`

Created a new analytics event table.

Fields:

| Field | Purpose |
|---|---|
| `id` | Primary key. |
| `event_type` | Event name, such as `PAGE_VIEW`, `SIGNUP`, `LOGIN`, `LOGOUT`, `PAPER_VIEW`, `PAPER_SEARCH`. |
| `user_id` | Nullable registered user ID. Null for anonymous visitors. |
| `visitor_id` | Nullable anonymous visitor identifier generated by the frontend. |
| `session_id` | Nullable browser session identifier generated by the frontend. |
| `path` | Page/API path related to the event. |
| `paper_id` | Optional paper ID for paper-related events. |
| `metadata_json` | Limited JSON metadata. Sensitive values are filtered. |
| `created_at` | Event timestamp. |

Important privacy behavior:

- No raw IP addresses are stored.
- No passwords, tokens, emails, or private data are stored in analytics metadata.
- Client metadata keys like `password`, `token`, `access_token`, `refresh_token`, `ip`, and `email` are stripped.
- Do Not Track (`DNT: 1`) and Global Privacy Control (`Sec-GPC: 1`) are respected.

## Anonymous Visitors

Anonymous visitors are identified by a generated frontend `visitor_id` stored in `localStorage`.

Sessions are identified by a generated `session_id` stored in `sessionStorage`.

This means:

- One visitor viewing `/`, `/search`, and `/paper/abc` creates 3 page views.
- The same activity counts as 1 unique visitor, because all events share the same `visitor_id`.
- A new browser session gets a new `session_id`, while the same browser keeps the same `visitor_id`.

## Unique Visitors

Unique visitors are calculated from:

```sql
COUNT(DISTINCT analytics_events.visitor_id)
```

The system does not use `users.count()` as visitor count.

Registered users and visitors are separate concepts:

- Registered users come from the `users` table.
- Visitors come from distinct `visitor_id` values in `analytics_events`.

## Active Users

Active users are registered users who generated at least one authenticated analytics event during a period.

They are calculated with distinct user IDs:

```sql
COUNT(DISTINCT analytics_events.user_id)
```

Where:

- `user_id IS NOT NULL`
- `created_at >= selected_period_start`

This avoids counting rows/events as users.

## Analytics Indexes

Indexes added:

| Index | Reason |
|---|---|
| `(event_type, created_at)` | Speeds event time-series queries filtered by event type. |
| `(created_at)` | Speeds period filtering for all analytics queries. |
| `(user_id)` | Speeds active-user distinct counts and authenticated event lookups. |
| `(visitor_id)` | Speeds unique visitor counts. |
| `(session_id)` | Supports future session-level analytics and lookup. |

These indexes match the actual query patterns used by the analytics overview and time-series endpoints.

## Backend Endpoints

All backend endpoints use the existing FastAPI stack and existing auth system.

### Public Analytics Event Ingestion

#### `POST /api/analytics/event`

Records a frontend analytics event.

Authentication:

- Not required.
- Supports anonymous visitors.

Request body:

```json
{
  "event_type": "PAGE_VIEW",
  "path": "/search",
  "visitor_id": "visitor-id",
  "session_id": "session-id",
  "paper_id": null,
  "metadata_json": {}
}
```

Supported `event_type` values:

- `PAGE_VIEW`
- `SIGNUP`
- `LOGIN`
- `LOGOUT`
- `PAPER_VIEW`
- `PAPER_SEARCH`

Response:

```json
{
  "id": 1,
  "event_type": "PAGE_VIEW",
  "user_id": null,
  "visitor_id": "visitor-id",
  "session_id": "session-id",
  "path": "/search",
  "paper_id": null,
  "created_at": "2026-07-30T00:00:00"
}
```

Notes:

- Returns `204` if Do Not Track is enabled.
- Returns `422` if the event type is invalid.
- Does not store raw IP addresses.

### Admin Analytics Endpoints

All `/api/admin/analytics/*` endpoints require:

- Authentication.
- Admin authorization through `is_admin` or `MEDINTEL_ADMIN_EMAILS`.

Normal users receive `403`.

#### `GET /api/admin/analytics/overview`

Returns summary statistics.

Response:

```json
{
  "total_users": 0,
  "new_users_today": 0,
  "new_users_this_week": 0,
  "new_users_this_month": 0,
  "active_users_today": 0,
  "active_users_this_week": 0,
  "active_users_this_month": 0,
  "total_visitors": 0,
  "visitors_today": 0,
  "visitors_this_week": 0,
  "visitors_this_month": 0,
  "page_views_today": 0
}
```

How values are calculated:

- `total_users`: `COUNT(users.id)`.
- `new_users_today`: users created since UTC start of today.
- `new_users_this_week`: users created since UTC start of the current week.
- `new_users_this_month`: users created since UTC start of current month.
- `active_users_*`: distinct authenticated `user_id` values from `analytics_events`.
- `total_visitors`: distinct `visitor_id` values ever recorded.
- `visitors_*`: distinct `visitor_id` values during the period.
- `page_views_today`: count of `PAGE_VIEW` events since UTC start of today.

#### `GET /api/admin/analytics/users?period=30d`

Returns daily new-user registrations.

Supported periods:

- `1d`
- `7d`
- `30d`
- `90d`
- `1y`

Response:

```json
{
  "period": "30d",
  "data": [
    { "date": "2026-07-20", "count": 15 },
    { "date": "2026-07-21", "count": 21 }
  ]
}
```

Implementation:

- Uses SQL date grouping.
- Does not load all user rows into Python memory.

#### `GET /api/admin/analytics/visitors?period=30d`

Returns daily unique visitors.

Response:

```json
{
  "period": "30d",
  "data": [
    { "date": "2026-07-20", "count": 10 },
    { "date": "2026-07-21", "count": 18 }
  ]
}
```

Implementation:

- Uses `COUNT(DISTINCT visitor_id)` grouped by date.
- Does not count page views as unique visitors.

#### `GET /api/admin/analytics/events?period=30d&event_type=PAGE_VIEW`

Returns daily event counts.

Query parameters:

- `period`: `1d`, `7d`, `30d`, `90d`, `1y`.
- `event_type`: optional event filter.

Response:

```json
{
  "period": "30d",
  "data": [
    { "date": "2026-07-20", "count": 100 },
    { "date": "2026-07-21", "count": 140 }
  ]
}
```

Used by frontend charts for:

- Signups: `event_type=SIGNUP`
- Page views: `event_type=PAGE_VIEW`

#### `GET /api/admin/analytics/events/list?period=30d&page=1&per_page=50`

Returns paginated raw analytics events for admin inspection.

Response:

```json
{
  "items": [
    {
      "id": 1,
      "event_type": "PAGE_VIEW",
      "user_id": null,
      "visitor_id": "visitor-id",
      "session_id": "session-id",
      "path": "/search",
      "paper_id": null,
      "created_at": "2026-07-30T00:00:00"
    }
  ],
  "total": 1,
  "page": 1,
  "per_page": 50,
  "pages": 1
}
```

No sensitive metadata is returned.

### Admin User Management Endpoints

All `/api/admin/users/*` endpoints require admin authorization.

#### `GET /api/admin/users/me`

Returns the current admin user.

Response:

```json
{
  "id": 1,
  "email": "admin@example.com",
  "name": "Admin",
  "is_admin": true,
  "created_at": "2026-07-30T00:00:00"
}
```

#### `GET /api/admin/users?q=doctor&page=1&per_page=20`

Lists registered users with search and pagination.

Response:

```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "per_page": 20,
  "pages": 1
}
```

Search matches:

- `email`
- `name`

#### `GET /api/admin/users/{user_id}`

Returns one user by ID.

#### `PATCH /api/admin/users/{user_id}/admin`

Promotes or demotes a user's database admin status.

Safety rules:

- An admin cannot demote themselves.
- Env-admins in `MEDINTEL_ADMIN_EMAILS` cannot be demoted through the UI.
- The last administrator cannot be removed.

#### `DELETE /api/admin/users/{user_id}`

Deletes a user account.

Safety rules:

- An admin cannot delete themselves.
- Env-admins in `MEDINTEL_ADMIN_EMAILS` cannot be deleted through the UI.
- The last administrator cannot be deleted.

#### `POST /api/admin/users/{user_id}/reset-password`

Generates a password reset token for a user.

Response:

```json
{
  "message": "Password reset token generated",
  "reset_token": "..."
}
```

## Frontend Analytics Implementation

### Files Added Or Updated

| File | Purpose |
|---|---|
| `lib/analytics.ts` | Frontend event tracking helpers and visitor/session ID generation. |
| `providers/AnalyticsProvider.tsx` | Tracks page views on route changes and exposes visitor/session IDs. |
| `lib/api/analytics.ts` | Admin analytics API client. |
| `app/admin/analytics/page.tsx` | Analytics dashboard with summary cards, period selector, charts, loading/error/empty states. |
| `components/site/SiteHeader.tsx` | Shows Admin menu item when current user has `is_admin`. |

### Dashboard UI

Route:

```text
/admin/analytics
```

Shows summary cards for:

- Total Users
- New Users Today
- Active Users Today
- Total Visitors
- Visitors Today
- Page Views Today

Charts:

- User Growth
- Visitor Growth
- Signups
- Page Views

Period selector:

- Today
- Last 7 Days
- Last 30 Days
- Last 90 Days
- Last Year

States:

- Loading skeletons while data loads.
- Error panel with Retry button.
- Empty chart state when there is no data.
- Responsive grid for desktop, tablet, and mobile.

### Frontend Tracking

The frontend sends `PAGE_VIEW` events automatically from `AnalyticsProvider`.

The frontend stores:

- `visitor_id` in `localStorage`.
- `session_id` in `sessionStorage`.

It respects Do Not Track and will not send events when DNT is enabled.

## How To Test

### Backend

```bash
cd backend
python -m pytest -q
```

Expected result:

```text
47 passed
```

### Frontend

```bash
npm run check
```

This runs:

- ESLint
- TypeScript typecheck
- Next.js production build

### Manual API Test

Start the backend:

```bash
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

Create a page view:

```bash
curl -X POST http://127.0.0.1:8000/api/analytics/event \
  -H "Content-Type: application/json" \
  -d '{"event_type":"PAGE_VIEW","path":"/search","visitor_id":"visitor-1","session_id":"session-1"}'
```

Then sign in as an admin and visit:

```text
/admin/analytics
```

---

# Local Dev Auth Persistence, Same-Origin Proxy + Data Seeding (2026-07-30)

This section documents fixes for local development so login/admin state survives backend restarts, papers load, and the browser can authenticate against the local backend.

## Problem

After logging in locally, the browser failed on the very next authenticated call:

```text
GET  /api/auth/me       -> 401 Unauthorized
POST /api/auth/refresh  -> 401 Unauthorized
POST /api/analytics/event -> ERR_BLOCKED_BY_CLIENT   (browser ad/privacy blocker)
```

Consequences:

- `fetchCurrentUser()` returned `null`, so the header treated the session as logged-out.
- `user.is_admin` was falsy, so the Admin menu item and `/admin` dashboard did not appear.

## Root cause — two separate issues

### 1. Random JWT secret per boot (fixed first)

`MEDINTEL_SECRET_KEY` from `.env` was not loaded into the running backend process, so `core/auth.py` fell back to a random per-boot key. Every restart invalidated existing cookies.

### 2. Cross-site cookies blocked by the browser (the real cause of the persistent 401s)

Even with a stable secret, the 401s continued. The actual root cause:

- Frontend origin: `http://localhost:3000`
- API origin: `http://127.0.0.1:8000`
- Browsers treat `localhost` and `127.0.0.1` as **different registrable domains**, making XHR/fetch between them **cross-site**.
- Auth cookies are set with `SameSite=Lax`, which browsers **do not send on cross-site XHR/fetch**.

So immediately after a successful login, `/api/auth/me` and `/api/auth/refresh` arrived **without the auth cookie** and returned 401. Clearing cookies or switching browsers did not help because the restriction is inherent to the cross-site topology.

## Fix A — backend loads `.env` itself

Added **`backend/env_loader.py`**, imported first in **`backend/main.py`**:

```python
import env_loader  # noqa: F401 — loads project .env before any backend imports
```

- Reads the project-root `.env` into `os.environ` with `setdefault` (real env vars from Docker/systemd still win).
- Runs **before** `database/session.py` reads `DATABASE_URL` and `core/auth.py` reads `MEDINTEL_SECRET_KEY` at import time.
- **Excludes `DATABASE_URL`** from auto-loading: the committed `.env` targets Docker Postgres, while the live local backend serves from local SQLite (`backend/medintel.db`). Loading it would point the local server at a non-running Postgres and drop local data. Override `DATABASE_URL` explicitly in the process environment when a different DB is wanted.

Result: the JWT secret is stable across restarts and `MEDINTEL_ADMIN_EMAILS` is visible to the app.

## Fix B — same-origin API proxy (eliminates the cross-site cookie problem)

The browser now calls the API on the frontend's **own origin** (`http://localhost:3000/api/*`), and Next.js rewrites those requests server-side to the FastAPI backend. First-party requests always carry `SameSite=Lax` cookies, so `auth/me` and `auth/refresh` succeed.

### `next.config.js` — added a dev rewrite

```js
async rewrites() {
  const target = (process.env.API_PROXY_TARGET || 'http://127.0.0.1:8000').replace(/\/$/, '');
  return [
    { source: '/api/:path*', destination: `${target}/api/:path*` },
  ];
},
```

- Active in local dev; the production domain still uses the absolute API base.
- The proxy path is `/api` on purpose: the backend sets cookies with `Path=/api`, so keeping the identical path makes first-party cookies match exactly.

### `lib/api/client.ts` — local browser defaults to the relative base

```ts
if (isLocal) {
  if (explicit && explicit.startsWith('/')) return explicit.replace(/\/$/, '');
  return '/api'; // same-origin proxy path
}
```

`isLocal` is true when `window.location.hostname` is `localhost` or `127.0.0.1`. Server-side rendering and production fall back to `NEXT_PUBLIC_API_BASE` / `https://citerounds.com/api`.

Verified through the proxy (`http://localhost:3000/api/...`):

- `POST /api/auth/login` -> `200`, `is_admin: true`
- `GET  /api/auth/me` -> `200`, `is_admin: true`
- `GET  /api/admin/users` -> `200`

Note: `ERR_BLOCKED_BY_CLIENT` on `/api/analytics/event` is a browser ad/privacy extension blocking the call; it is unrelated to auth and is now routed through the same-origin proxy anyway.

## Data seeding — local DB populated from production

The local SQLite `papers` table was empty (`papers_count: 0`). Seeded it via the existing importer against the production list endpoint:

```powershell
cd backend
$env:DATABASE_URL = "sqlite:///./medintel.db"   # force local SQLite
python import_from_api.py --per-page 100 --commit-batch 500
```

Result:

```text
Fetched 4507 items
Finished committing 4507 papers
```

The list endpoint still returned `total=0` afterward. Direct DB inspection showed all 4507 rows present (with title/tldr) but with an **empty `pipeline_version`**. Because `.env` now loads, `MEDINTEL_REQUIRE_CURRENT_PIPELINE=true` and the catalogue filter `pipeline_version == '2026-07-14.2'` excluded every row.

### Fix — backfilled the pipeline version on the imported rows (no filter/logic changes)

```python
# matched CURRENT_PIPELINE_VERSION ('2026-07-14.2')
db.query(Paper).filter(Paper.pipeline_version != CURRENT_PIPELINE_VERSION) \
  .update({Paper.pipeline_version: CURRENT_PIPELINE_VERSION})
```

Before: `0` rows matched. After: **4507** rows match, and `GET /api/papers` returns `total=4507`.

Note: `import_from_api.py` imports **paper list** fields (title, tldr, study_type, specialty_tags, evidence level, sample size, etc.). Heavy per-paper detail (`detailed_summary`, `mind_map`, `verification`) is not part of the list response and was not imported.

## Admin account for local testing

- Email: `jamm7198@gmail.com`, Password: `password1234`
- Granted admin by setting `users.is_admin = 1` in the local SQLite DB (works independently of the env admin list; the email is also in `MEDINTEL_ADMIN_EMAILS`).

## Operational note — start commands

Backend (loads `.env` via `env_loader`, served on the standard port):

```powershell
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

(or `backend\run_dev.ps1`)

Frontend:

```powershell
npm run dev
```

Then open `http://localhost:3000`, sign in as the admin, and the Admin dashboard is available at `/admin`.

---

# Local Dev Auth Persistence + Data Seeding (2026-07-30)

This section documents fixes for local development so login/admin state survives backend restarts and the local database is populated.

## Problem

After any backend restart, already-logged-in browsers began failing with:

```text
GET  /api/auth/me       -> 401 Unauthorized
POST /api/auth/refresh  -> 401 Unauthorized
```

Consequences:

- `fetchCurrentUser()` returned `null`, so the header treated the session as logged-out.
- `user.is_admin` was falsy, so the Admin menu item and `/admin` dashboard did not appear.

### Root cause

`MEDINTEL_SECRET_KEY` (from `.env`) was not being loaded into the running backend process. With no env secret, `core/auth.py` fell back to a random per-boot key:

```python
SECRET_KEY = secrets.token_hex(32)
```

A freshly-generated key cannot verify cookies signed by the previous process, so every restart invalidated existing `access_token` / `refresh_token` cookies.

## Fix — backend loads `.env` itself

Added **`backend/env_loader.py`** and imported it first in **`backend/main.py`**:

```python
import env_loader  # noqa: F401 — loads project .env before any backend imports
```

`env_loader`:

- Reads the project root `.env` into `os.environ` using `setdefault`, so real environment variables from Docker/systemd still win.
- Parses values, strips surrounding quotes, and ignores comments/blank lines.
- Does this **before** `database/session.py` reads `DATABASE_URL` and `core/auth.py` reads `MEDINTEL_SECRET_KEY` at import time.

### Persistence-layer exception

`DATABASE_URL` is intentionally excluded from auto-loading inside `env_loader`:

- The committed `.env` targets Docker Postgres:
  `postgresql+psycopg2://medintel:medintel@localhost:5432/medintel`
- The live local backend is serving from local SQLite (`backend/medintel.db`).
- Loading that `DATABASE_URL` into the local server would point it at a non-running Postgres and drop all local data.

Result: the backend uses the real secret + admin list from `.env` while staying on local SQLite. Override `DATABASE_URL` explicitly via the process environment when a different DB is desired.

## What this fixes

- JWT secret is now stable (`MEDINTEL_SECRET_KEY=48452...`) across restarts, so login cookies remain valid.
- `MEDINTEL_ADMIN_EMAILS=jamm7198@gmail.com` is now visible to the app, enabling env-based admin.
- `/api/auth/me` returns `200 { "is_admin": true }` for the admin account, so `SiteHeader` renders the Admin link and `/admin` opens.

## Data seeding — local DB populated from production

The local SQLite `papers` table was empty (`papers_count: 0`). Seeded it by running the existing importer against the production list endpoint:

```powershell
cd backend
$env:DATABASE_URL = "sqlite:///./medintel.db"   # force local SQLite
python import_from_api.py --per-page 100 --commit-batch 500
```

Result:

```text
Fetched 4507 items
Finished committing 4507 papers
```

`GET /api/health` now returns:

```json
{"status":"ok","papers_count":4507}
```

Note: `import_from_api.py` imports the **paper list** fields (title, tldr, study_type, specialty_tags, evidence level, sample size, etc.) returned by `/api/papers`. Heavy per-paper detail (full `detailed_summary`, `mind_map`, `verification`) is not part of the list response and was not imported.

## Admin account for local testing

Created a local admin account:

- Email: `jamm7198@gmail.com`
- Password: `password1234`
- Granted admin by setting `users.is_admin = 1` in the local SQLite DB (the DB flag works independently of the env admin list).

Verified live:

- `POST /api/auth/login` -> `is_admin: true`
- `GET  /api/auth/me` (cookie) -> `200`, `is_admin: true`
- `GET  /api/admin/users` -> `200`

## Operational note

The previously-running uvicorn process was started **before** `env_loader` existed, so it still holds a random in-memory secret. A one-time restart is required to activate the fix:

```powershell
cd backend
uvicorn main:app --host 127.0.0.1 --port 8000
```

After the restart, clear cookies for `localhost:3000`, sign in, and the Admin dashboard will be available.
