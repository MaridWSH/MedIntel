# MedIntel Backend — Project Documentation

## Table of Contents

- [Project Overview](#project-overview)
- [What the Backend Does](#what-the-backend-does)
- [Technology Stack](#technology-stack)
- [Database](#database)
- [Indexing & Search](#indexing--search)
- [Authentication](#authentication)
- [Public Endpoints](#public-endpoints)
  - [Health](#health)
  - [Auth](#auth)
  - [Papers](#papers)
  - [User](#user)
- [Admin Endpoints](#admin-endpoints)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
- [Admin Setup](#admin-setup)
- [Ingestion Flow](#ingestion-flow)
- [Backfill Flow](#backfill-flow)

---

## Project Overview

MedIntel is a clinical literature synthesis platform. The backend is a **FastAPI** application that:

1. Stores clinical/medical papers in a relational database.
2. Serves paper metadata, summaries, and full text to a frontend.
3. Provides semantic (vector) search over the paper catalogue.
4. Allows users to save papers to their personal library.
5. Provides admin endpoints to manage users, papers, ingestion, and search indexing.

The backend exposes a REST API consumed by the MedIntel frontend (Next.js app running at `http://localhost:3000` or production).

---

## What the Backend Does

| Feature | Description |
|---------|-------------|
| **Paper catalogue** | Stores papers with titles, summaries (TLDR), detailed summaries, study types, specialty tags, clinical findings, PICO summaries, mind maps, verification scores, and metadata (journal, DOI, authors, centers). |
| **Full-text serving** | Reads markdown versions of papers and serves them as structured sections. |
| **Search** | Keyword search + semantic (vector) search powered by Qdrant. |
| **User accounts** | Registration, login, password reset, refresh tokens via HttpOnly cookies. |
| **Saved papers** | Users can save/unsave papers and view their library. |
| **Admin control** | Admins can manage users, edit/delete papers, ingest new papers, backfill metadata from XML, and rebuild the search index. |

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| **Web framework** | FastAPI |
| **Validation** | Pydantic v2 |
| **Database ORM** | SQLAlchemy 2.0 |
| **Database** | SQLite (default) or PostgreSQL |
| **Vector database** | Qdrant |
| **Embeddings** | sentence-transformers (`BAAI/bge-m3`, 1024 dimensions) |
| **Auth** | JWT access tokens + HttpOnly refresh-token cookies; Argon2 password hashing |
| **XML parsing** | defusedxml |
| **HTTP client** | httpx |
| **Server** | Uvicorn |
| **Password hashing** | passlib with Argon2 |
| **JWT library** | python-jose |

---

## Database

The database is selected via the `DATABASE_URL` environment variable.

- **Local development (default):** SQLite (`sqlite:///./medintel.db`)
- **Production:** PostgreSQL (`postgresql://user:pass@host/dbname`)

### Tables

| Table | Purpose |
|-------|---------|
| `users` | Registered users with email, name, hashed password, reset tokens, `is_admin` flag. |
| `papers` | The paper catalogue with summaries, metadata, and parsed XML fields. |
| `saved_papers` | Many-to-many link between users and saved papers. |

On startup, `Base.metadata.create_all(bind=engine)` ensures all tables exist. Existing tables are **not** altered automatically; use `migrate_add_paper_metadata_columns.py` for schema migrations.

---

## Indexing & Search

### Semantic search

1. Each paper is converted to a passage: `title + tldr + study_type + specialty_tags`.
2. The passage is embedded using **BGE-M3** (1024-dim vector).
3. The vector + payload (paper_id, title, tldr, study_type, specialty_tags) is stored in **Qdrant**.
4. During search, the user's query is embedded and Qdrant returns the most similar vectors.
5. The backend loads the full paper rows from SQL and returns ranked results.

### Keyword search

Fallback substring search over `title`, `tldr`, and `detailed_summary`. Used when semantic search is unavailable or returns nothing.

### Qdrant configuration

| Env var | Default | Purpose |
|---------|---------|---------|
| `MEDINTEL_QDRANT_URL` | `http://localhost:6333` | Qdrant server URL (`:memory:` for local in-memory mode) |
| `MEDINTEL_QDRANT_COLLECTION` | `papers` | Collection name |
| `MEDINTEL_EMBEDDING_DIMENSION` | `1024` | Embedding vector size |
| `MEDINTEL_EMBEDDING_MODEL` | `BAAI/bge-m3` | HuggingFace model name |

---

## Authentication

The API uses **HTTP Bearer JWT tokens**.

### Getting a token

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name",
    "is_admin": false,
    "created_at": "2026-07-17T00:00:00"
  }
}
```

### Using the token

Include it in the `Authorization` header for protected endpoints:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Refresh tokens

After login/register, a refresh token is set as an **HttpOnly cookie**. Call `POST /api/auth/refresh` to get a new access token without re-entering credentials.

---

## Public Endpoints

### Health

#### `GET /api/health`

Returns API status and total paper count.

**Response:**
```json
{
  "status": "ok",
  "papers_count": 5000
}
```

---

### Auth

Base path: `/api/auth`

#### `POST /api/auth/register`

Create a new user account.

**Body:**
```json
{
  "email": "user@example.com",
  "name": "User Name",
  "password": "password123"
}
```

**Response:** returns access token + user profile. Also sets refresh-token cookie.

---

#### `POST /api/auth/login`

Authenticate and get access token.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** returns access token + user profile. Also sets refresh-token cookie.

---

#### `GET /api/auth/me`

Returns the currently authenticated user's profile.

**Headers:** `Authorization: Bearer <token>`

---

#### `POST /api/auth/logout`

Clears the refresh-token cookie.

**Headers:** `Authorization: Bearer <token>`

---

#### `POST /api/auth/forgot-password`

Generates a password-reset token and emails/logs it.

**Body:**
```json
{
  "email": "user@example.com"
}
```

---

#### `POST /api/auth/reset-password`

Resets password using the token from forgot-password.

**Body:**
```json
{
  "reset_token": "abc123...",
  "new_password": "newpassword123"
}
```

---

#### `POST /api/auth/refresh`

Returns a new access token using the refresh-token cookie.

---

### Papers

Base path: `/api/papers`

#### `GET /api/papers`

Paginated paper listing.

**Query parameters:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `page` | int | 1 | Page number |
| `per_page` | int | 20 | Items per page (max 100) |
| `study_type` | string | — | Filter by study type |
| `specialty` | string | — | Filter by specialty tag |
| `evidence_level` | string | — | Filter by `high`, `moderate`, `low`, `very_low` |
| `sort` | string | `id` | Sort by `id` or `-id` |
| `summarised_only` | bool | `true` | Exclude papers without a TLDR |

---

#### `GET /api/papers/search`

Search papers.

**Query parameters:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `q` | string | required | Search query |
| `page` | int | 1 | Page number |
| `per_page` | int | 20 | Items per page (max 100) |
| `mode` | string | `auto` | `auto`, `semantic`, or `keyword` |

---

#### `GET /api/papers/facets`

Returns filter options with counts: study types and specialties.

---

#### `GET /api/papers/{paper_id}`

Get full details for a single paper.

---

#### `GET /api/papers/{paper_id}/fulltext`

Returns the paper's full text split into markdown sections.

---

### User

Base path: `/api/user`

All endpoints require authentication.

#### `POST /api/user/papers/{paper_id}/save`

Save a paper to the user's library.

---

#### `DELETE /api/user/papers/{paper_id}/save`

Remove a paper from the user's library.

---

#### `GET /api/user/saved-papers`

List all papers saved by the current user.

---

#### `GET /api/user/papers/{paper_id}/is-saved`

Check if a paper is saved.

**Response:**
```json
{
  "is_saved": true
}
```

---

#### `GET /api/user/dashboard/stats`

Returns dashboard stats for the current user.

**Response:**
```json
{
  "saved_papers": 5,
  "total_papers_available": 5000,
  "member_since": "2026-07-17T00:00:00"
}
```

---

## Admin Endpoints

Base path: `/api/admin`

All endpoints require authentication **and** `is_admin = true`.

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List users with saved-paper counts |
| GET | `/api/admin/users/{user_id}` | Get single user |
| PATCH | `/api/admin/users/{user_id}` | Update name/email/admin flag |
| DELETE | `/api/admin/users/{user_id}` | Delete user + saved papers |
| POST | `/api/admin/users/{user_id}/reset-password` | Set user's password |

**List query parameters:** `skip`, `limit`

**Update body (all optional):**
```json
{
  "name": "New Name",
  "email": "new@example.com",
  "is_admin": true
}
```

**Reset-password body:**
```json
{
  "new_password": "newpassword123"
}
```

---

### Papers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/papers` | List papers with admin filters |
| GET | `/api/admin/papers/{paper_id}` | Paper details |
| PATCH | `/api/admin/papers/{paper_id}` | Edit metadata + reindex |
| DELETE | `/api/admin/papers/{paper_id}` | Delete paper + vector |

**List query parameters:**
| Name | Type | Description |
|------|------|-------------|
| `page` | int | Page number |
| `per_page` | int | Items per page |
| `has_errors` | bool | Filter by processing errors |
| `empty_tldr` | bool | Papers without TLDR |
| `empty_summary` | bool | Papers without detailed summary |
| `no_doi` | bool | Papers without DOI |
| `study_type` | string | Filter by study type |
| `specialty` | string | Filter by specialty |

**Update body (all optional):**
```json
{
  "title": "...",
  "tldr": "...",
  "study_type": "RCT",
  "specialty_tags": ["nutrition"],
  "journal": "...",
  "doi": "...",
  "author_list": "...",
  "authors_count": 5,
  "centers": ["University"],
  "centers_count": 1,
  "citation": "...",
  "sections": ["Introduction"],
  "excerpt": "...",
  "reviewer": "..."
}
```

---

### Ingest / Backfill / Reindex

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/papers/ingest` | Ingest pipeline JSON; index only new papers |
| POST | `/api/admin/papers/backfill` | Backfill metadata from XML; reindex changed papers |
| POST | `/api/admin/papers/reindex` | Bulk reindex (optionally recreate collection) |
| POST | `/api/admin/papers/{paper_id}/reindex` | Reindex a single paper |

**Ingest body:**
```json
{
  "source_dir": "/root/papers/pipeline_outputs/results",
  "limit": 100
}
```

**Response:**
```json
{
  "ingested": 100,
  "skipped": 10,
  "errors": 0,
  "indexed": 100,
  "total_in_db": 5000
}
```

**Backfill body:**
```json
{
  "limit": 100
}
```

**Reindex body:**
```json
{
  "limit": 1000,
  "recreate": false,
  "only_missing": false
}
```

| Field | Type | Description |
|-------|------|-------------|
| `limit` | int | Maximum number of papers to process |
| `recreate` | bool | Drop and recreate the Qdrant collection first |
| `only_missing` | bool | Index only DB papers that are not yet in Qdrant |

When `only_missing` is `true`, the endpoint:
1. Scrolls all existing vectors in Qdrant to collect their paper IDs.
2. Queries the database for papers whose IDs are **not** in Qdrant.
3. Embeds and upserts only those missing papers.

**Response:**
```json
{
  "indexed": 10,
  "qdrant_total": 211,
  "missing_before": 10
}
```

---

### Stats / Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Platform statistics |
| GET | `/api/admin/health` | DB + Qdrant health |

**Stats response:**
```json
{
  "users_count": 10,
  "papers_count": 5000,
  "saved_papers_count": 120,
  "papers_with_errors": 15,
  "papers_without_tldr": 3500,
  "papers_without_summary": 3500,
  "papers_without_doi": 200,
  "qdrant_vector_count": 5000
}
```

---

## Project Structure

```
backend/
├── main.py                           # FastAPI app setup, routers, CORS
├── app/
│   ├── core/
│   │   ├── database.py               # SQLAlchemy engine/session/base
│   │   ├── security.py               # JWT, password hashing, auth dependencies
│   │   └── dependencies.py           # Semantic search dependency providers
│   ├── db/
│   │   └── models.py                 # User, Paper, SavedPaper ORM models
│   ├── schemas/
│   │   ├── auth.py                   # Auth request/response schemas
│   │   ├── papers.py                 # Paper-related schemas
│   │   ├── user.py                   # Saved-paper schemas
│   │   ├── admin.py                  # Admin request/response schemas
│   │   └── common.py                 # Health schema
│   ├── api/
│   │   └── v1/
│   │       ├── auth.py               # Register/login/me/logout/refresh/reset
│   │       ├── papers.py             # Public paper listing/search/detail/fulltext
│   │       ├── user.py               # Saved papers, dashboard stats
│   │       └── admin.py              # Admin endpoints
│   ├── services/
│   │   ├── embedding_service.py      # BGE-M3 embedding model
│   │   ├── qdrant_service.py         # Qdrant client, upsert, search, delete
│   │   ├── semantic_search_service.py    # Query/embed/search orchestration
│   │   └── paper_metadata_service.py     # XML/markdown metadata extraction
│   └── repositories/
│       ├── paper_repository.py       # SQLAlchemy paper queries
│       └── vector_repository.py      # Qdrant vector repository
├── scripts/
│   ├── migrate.py                    # DB migration script
│   ├── promote_admin.py              # CLI to promote users to admin
│   ├── import_from_api.py            # Import papers from remote API
│   ├── index_embeddings.py           # Index papers into Qdrant
│   ├── reindex_qdrant.py             # Recreate and rebuild Qdrant index
│   └── seed.py                       # Seed SQLite from pipeline JSON
└── tests/                            # Pytest test suite
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite:///./medintel.db` | Database connection string |
| `MEDINTEL_SECRET_KEY` | random dev key | JWT signing secret |
| `MEDINTEL_SECURE_COOKIES` | `false` | Use secure refresh-token cookies |
| `MEDINTEL_QDRANT_URL` | `http://localhost:6333` | Qdrant server URL |
| `MEDINTEL_QDRANT_COLLECTION` | `papers` | Qdrant collection name |
| `MEDINTEL_QDRANT_API_KEY` | — | Qdrant API key (if needed) |
| `MEDINTEL_EMBEDDING_MODEL` | `BAAI/bge-m3` | Embedding model name |
| `MEDINTEL_EMBEDDING_DIMENSION` | `1024` | Embedding vector size |
| `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_PORT`, `FROM_EMAIL` | — | SMTP config for password-reset emails |

---

## Running the Project

### Install dependencies

```bash
# If using uv
uv sync

# Or with pip
.venv\Scripts\python -m pip install -r requirements.txt
```

### Run migrations

```bash
.venv\Scripts\python scripts/migrate.py
```

### Start the server

```bash
.venv\Scripts\python -m uvicorn main:app --reload
```

The API will be available at `http://127.0.0.1:8000`.

### Interactive docs

- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`
- OpenAPI JSON: `http://127.0.0.1:8000/openapi.json`

---

## Admin Setup

Promote an existing user to admin:

```powershell
.venv\Scripts\python scripts/promote_admin.py --email your@email.com
```

After promotion, that user can access all `/api/admin/*` endpoints.

---

## Ingestion Flow

1. Admin calls `POST /api/admin/papers/ingest` with an optional `source_dir` and `limit`.
2. The backend reads pipeline JSON files from the source directory.
3. For each file, it extracts the paper ID and summary fields.
4. Missing metadata (title, journal, DOI, authors, centers, etc.) is filled from the corresponding JATS XML file.
5. New papers are inserted into the SQLite/PostgreSQL database.
6. Only the newly inserted papers are embedded and upserted into Qdrant.
7. The response reports how many were ingested, skipped, errored, and indexed.

---

## Backfill Flow

1. Admin calls `POST /api/admin/papers/backfill`.
2. The backend queries papers missing metadata.
3. For each paper, it parses the JATS XML (or markdown title as fallback).
4. Missing fields are filled in the database.
5. Papers that changed are reindexed in Qdrant.
6. The response reports updated, skipped, and error counts.

---

## Notes for the Team

- The SQLite database file is `medintel.db` in the backend root.
- Qdrant must be running for semantic search to work (`http://localhost:6333` by default).
- The first call to semantic search may be slow because it loads the BGE-M3 model into memory.
- JWT access tokens expire after 24 hours; refresh tokens expire after 7 days.
- `Base.metadata.create_all()` creates tables but does not alter existing ones; run `scripts/migrate.py` when the schema changes.
