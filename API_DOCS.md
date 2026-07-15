# MedIntel API Documentation

**Base URL:** `https://med.aidashnews.tech/api` (production) / `http://localhost:8000/api` (local development)

**Version:** 0.1.0

---

## Overview

The MedIntel API provides access to 5,865+ processed clinical research papers. Papers are extracted from PubMed Central (PMC) and enriched via an LLM pipeline that generates summaries, key findings, mind maps, and verification scores.

Search is powered by a **hybrid retrieval system**:
- **Semantic search**: Qdrant vector store with BAAI/bge-m3 embeddings.
- **Keyword search**: PostgreSQL Full Text Search (`tsvector`, `websearch_to_tsquery`, `ts_rank_cd`) with a GIN index.
- **Ranking**: Reciprocal Rank Fusion (RRF) over parallel semantic and keyword results.
- **Filtering**: Applied after retrieval; OR within a field, AND across fields.
- **Sorting & Pagination**: Relevance, newest, oldest, highest evidence, title; with `page` and `page_size`.

**Interactive docs (Swagger UI):** https://med.aidashnews.tech/docs

**Alternative docs (ReDoc):** https://med.aidashnews.tech/redoc

---

## Authentication

Most endpoints are public (paper listing, search, detail). User registration and login are available for future features.

### Register

Create a new account.

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "securepassword123"
}
```

**Response (201 Created):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2026-07-06T01:45:57.196978"
  }
}
```

### Login

Authenticate and receive a JWT token.

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2026-07-06T01:45:57.196978"
  }
}
```

### Get Current User

Returns the authenticated user. Requires `Authorization: Bearer <token>` header.

```http
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (200 OK):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "created_at": "2026-07-06T01:45:57.196978"
}
```

---

## Papers

### List Papers

Paginated list of all papers with optional filters.

```http
GET /api/papers?page=1&per_page=20&study_type=RCT&sort=id
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | int | 1 | Page number (≥1) |
| `per_page` | int | 20 | Items per page (1–100) |
| `study_type` | string | — | Filter by study type (e.g., `RCT`, `cohort`, `meta-analysis`, `systematic_review`, `narrative_review`, `cross-sectional`, `case_report`, `guidelines`, `other`) |
| `specialty` | string | — | Filter by specialty tag (e.g., `nutrition`, `cardiology`, `veterinary_medicine`) |
| `sort` | string | `id` | Sort order: `id` (ascending) or `-id` (descending) |

**Response (200 OK):**
```json
{
  "items": [
    {
      "id": "PMC10000023",
      "tldr": "In this year-long field experiment in heifers...",
      "study_type": "other",
      "specialty_tags": [
        "veterinary medicine",
        "parasitology",
        "livestock production"
      ],
      "overall_evidence_level": "low",
      "sample_size": "N=30"
    }
  ],
  "total": 5865,
  "page": 1,
  "per_page": 20,
  "pages": 294
}
```

### Get Paper Detail

Full detail for a single paper by PMC ID.

```http
GET /api/papers/PMC10000089
```

**Response (200 OK):**
```json
{
  "id": "PMC10000089",
  "tldr": "This narrative review argues that artificial insemination center bulls need a dedicated welfare assessment protocol...",
  "detailed_summary": "Background: This paper is a narrative review addressing animal welfare assessment...",
  "study_type": "narrative_review",
  "specialty_tags": [
    "veterinary_medicine",
    "animal_welfare",
    "theriogenology",
    "reproductive_medicine",
    "livestock_medicine"
  ],
  "pico_summary": null,
  "key_findings": {
    "findings": [
      {
        "claim": "There is a lack of published information on bull welfare assessment...",
        "evidence_strength": "low",
        "finding_type": "primary_outcome",
        "statistical_support": "80 articles were included and reviewed",
        "source_quote": "Unfortunately, there is a lack of such summarized information...",
        "limitations_noted": true
      }
    ],
    "overall_evidence_level": "low",
    "sample_size": "80 articles",
    "follow_up_duration": null
  },
  "mind_map": {
    "root": "Welfare Assessment Protocols for Bulls in AI Centers",
    "children": [
      {
        "id": "1",
        "label": "Housing Requirements",
        "node_type": "category",
        "children": []
      }
    ]
  },
  "verification": {
    "numerical_claims": [],
    "numerical_accuracy_score": 1.0,
    "factual_claims": [],
    "factual_accuracy_score": 1.0,
    "overall_accuracy_score": 1.0,
    "critical_errors": [],
    "recommendations": [],
    "passed": true
  },
  "processing_time": 103.1,
  "has_errors": false
}
```

### Search Papers

Full-text search across paper summaries (legacy keyword search). For hybrid semantic + keyword search, use `POST /api/search`.

```http
GET /api/papers/search?q=welfare&page=1&per_page=20
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `q` | string | — | **Required.** Search query (min 1 char) |
| `page` | int | 1 | Page number (≥1) |
| `per_page` | int | 20 | Items per page (1–100) |

**Response (200 OK):**
```json
{
  "items": [
    {
      "id": "PMC10000089",
      "tldr": "This narrative review argues that artificial insemination center bulls need a dedicated welfare assessment protocol...",
      "study_type": "narrative_review",
      "specialty_tags": [
        "veterinary_medicine",
        "animal_welfare"
      ],
      "overall_evidence_level": "low",
      "sample_size": "80 articles"
    }
  ],
  "total": 11,
  "page": 1,
  "per_page": 20,
  "pages": 1,
  "query": "welfare"
}
```

---

## Hybrid Search

### Search Papers (Hybrid)

**Endpoint:** `POST /api/search`

Combines **semantic search** (Qdrant + BGE-M3 embeddings) and **keyword search** (PostgreSQL Full Text Search with `websearch_to_tsquery` and `ts_rank_cd`) in parallel. Results are merged, deduplicated, ranked with **Reciprocal Rank Fusion**, filtered, sorted, and paginated. Also returns **dynamic facet counts** for each filterable field, computed over the current result set with the standard "exclude the facet itself" rule (e.g., selecting a specialty does not hide other specialties from that facet).

Filters are applied **after** hybrid retrieval. Within one filter field values are combined with `OR`. Across different filter fields they are combined with `AND`.

**Browse without a query:** `query` is optional. If `query` is empty or omitted **and** at least one filter is provided, the endpoint skips semantic and keyword search and returns papers that match the filters only. With no query and no filters the request is rejected with HTTP 422.

```http
POST /api/search
Content-Type: application/json

{
  "query": "nutrition in obesity",
  "page": 1,
  "page_size": 20,
  "sort": "relevance",
  "filters": {
    "specialties": ["Nutrition", "Endocrinology"],
    "study_types": ["RCT"],
    "evidence_levels": ["high"],
    "years": {
      "from": 2020,
      "to": 2025
    }
  }
}
```

**Filter-only request:**
```http
POST /api/search
Content-Type: application/json

{
  "query": "",
  "page": 1,
  "page_size": 20,
  "sort": "newest",
  "filters": {
    "study_types": ["RCT"],
    "evidence_levels": ["high"]
  }
}
```

**Body Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `query` | string | `null` | **Optional.** Free-text search query. When omitted, only filters are applied. |
| `page` | int | 1 | Page number (≥1) |
| `page_size` | int | 20 | Items per page (1–100) |
| `sort` | string | `"relevance"` | Sort strategy: `relevance`, `newest`, `oldest`, `highest_evidence`, `title` |
| `filters` | object | `null` | Optional filters applied after retrieval |
| `filters.specialties` | string[] | `null` | OR filter by specialty tag |
| `filters.study_types` | string[] | `null` | OR filter by study type |
| `filters.evidence_levels` | string[] | `null` | OR filter by evidence level (`high`, `moderate`, `low`, `very_low`) |
| `filters.journals` | string[] | `null` | OR filter by journal name |
| `filters.languages` | string[] | `null` | OR filter by language code |
| `filters.authors` | string[] | `null` | OR filter by author substring |
| `filters.years` | object | `null` | Inclusive publication year range: `{ "from": 2020, "to": 2025 }` |
| `facets_enabled` | bool | `true` | Whether to include dynamic facet counts in the response |
| `semantic_weight` | float | `0.7` | Weight of semantic vs keyword in RRF (0.0–1.0) |
| `rrf_k` | int | `60` | Reciprocal Rank Fusion constant |

**Response (200 OK):**

```json
{
  "query": "nutrition in obesity",
  "page": 1,
  "page_size": 20,
  "total": 342,
  "filters": {
    "specialties": ["Nutrition"]
  },
  "facets": {
    "specialty": [
      { "value": "Nutrition", "count": 120 },
      { "value": "Endocrinology", "count": 85 },
      { "value": "Cardiology", "count": 42 }
    ],
    "study_type": [
      { "value": "RCT", "count": 98 },
      { "value": "cohort_study", "count": 67 }
    ],
    "evidence_level": [
      { "value": "high", "count": 54 },
      { "value": "moderate", "count": 120 }
    ],
    "publication_year": [
      { "value": 2023, "count": 45 },
      { "value": 2022, "count": 38 }
    ],
    "journal": [
      { "value": "Journal of Nutrition", "count": 12 }
    ],
    "language": [
      { "value": "en", "count": 340 },
      { "value": "ar", "count": 2 }
    ]
  },
  "items": [
    {
      "paper_id": "PMC123",
      "title": "...",
      "tldr": "...",
      "study_type": "RCT",
      "specialty_tags": ["Nutrition", "Endocrinology"],
      "publication_year": 2023,
      "journal": "Journal of Nutrition",
      "language": "en",
      "author_list": "Smith J, Doe A",
      "evidence_level": "high",
      "processing_time": 45.2,
      "has_errors": false,
      "semantic_score": 0.84,
      "keyword_score": 0.72,
      "final_score": 0.89
    }
  ]
}
```

**Facet behavior:**
- Each facet is computed over the current result set (query + all filters **except** the facet itself).
- Buckets are sorted by count descending, then value ascending.
- `facets` is `null` when `facets_enabled` is `false` or when facet computation fails.
- Facet results are cached in-memory for 60 seconds (LRU, max 256 entries).

**Notes:**
- `semantic_score` and `keyword_score` are the raw scores from each retrieval system. `final_score` is the Reciprocal Rank Fusion score used for ranking.
- When `sort` is `"relevance"`, results are ordered by `final_score` descending.
- When `sort` is `"highest_evidence"`, results are ordered by evidence level (high → very low) then `final_score`.

### Ingest Papers (Admin)

Trigger ingestion of pipeline JSON results into the database. Requires authentication.

```http
POST /api/papers/ingest
Authorization: Bearer <token>
Content-Type: application/json

{
  "source_dir": "/root/papers/pipeline_outputs/results",
  "limit": 100
}
```

**Body Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `source_dir` | string | `/root/papers/pipeline_outputs/results` | Directory containing pipeline JSON files |
| `limit` | int | null | Max number of files to ingest (null = all) |

**Response (200 OK):**
```json
{
  "ingested": 95,
  "skipped": 5,
  "errors": 0,
  "total_in_db": 5865
}
```

---

## Health Check

```http
GET /api/health
```

**Response (200 OK):**
```json
{
  "status": "ok",
  "papers_count": 5865
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "detail": "Error message describing what went wrong"
}
```

**Common HTTP status codes:**

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created (registration) |
| 400 | Bad request (invalid parameters) |
| 401 | Unauthorized (missing or invalid token) |
| 404 | Not found (paper or user not found) |
| 409 | Conflict (email already registered) |
| 422 | Validation error (missing required fields) |

---

## Frontend Integration Examples

### Next.js (App Router)

**Fetch paper list:**
```typescript
// app/papers/page.tsx
async function getPapers(page: number = 1, perPage: number = 20) {
  const res = await fetch(
    `https://med.aidashnews.tech/api/papers?page=${page}&per_page=${perPage}`,
    { next: { revalidate: 60 } } // Revalidate every 60s
  );
  if (!res.ok) throw new Error('Failed to fetch papers');
  return res.json();
}

export default async function PapersPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const data = await getPapers(page);

  return (
    <div>
      <h1>Papers ({data.total} total)</h1>
      <ul>
        {data.items.map((paper) => (
          <li key={paper.id}>
            <h2>{paper.id}</h2>
            <p>{paper.tldr}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

**Search papers (hybrid):**
```typescript
// app/search/page.tsx
export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q || '';
  let data = null;

  if (query) {
    const res = await fetch(
      `${API_BASE}/search`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, page: 1, page_size: 20, sort: 'relevance' }),
      }
    );
    data = await res.json();
  }

  return (
    <div>
      <form>
        <input name="q" defaultValue={query} placeholder="Search papers..." />
      </form>
      {data && (
        <div>
          <p>{data.total} results for "{data.query}"</p>
          {data.items.map((paper) => (
            <article key={paper.paper_id}>
              <h2>{paper.paper_id}</h2>
              <p>{paper.tldr}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Search with filters:**
```typescript
export async function hybridSearch(query: string, filters = {}) {
  const res = await fetch(`${API_BASE}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, page: 1, page_size: 20, sort: 'relevance', filters }),
  });
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}

// Example: RCTs about diabetes from 2020+
const results = await hybridSearch('diabetes', {
  study_types: ['RCT'],
  years: { from: 2020, to: 2025 },
});
```

### React (Client-Side with Auth)

**Login and fetch with token:**
```typescript
// lib/api.ts
const API_BASE = 'https://med.aidashnews.tech/api';

export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Login failed');
  const data = await res.json();
  localStorage.setItem('token', data.access_token);
  return data;
}

export async function getMe() {
  const token = localStorage.getItem('token');
  if (!token) return null;

  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function getPapers(page: number = 1) {
  const res = await fetch(`${API_BASE}/papers?page=${page}&per_page=20`);
  if (!res.ok) throw new Error('Failed to fetch papers');
  return res.json();
}
```

### cURL Examples

```bash
# Health check
curl https://med.aidashnews.tech/api/health

# List papers (first page)
curl "https://med.aidashnews.tech/api/papers?page=1&per_page=10"

# Filter by study type
curl "https://med.aidashnews.tech/api/papers?study_type=RCT&per_page=5"

# Hybrid search (semantic + keyword)
curl -X POST https://med.aidashnews.tech/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "diabetes",
    "page": 1,
    "page_size": 5,
    "sort": "relevance",
    "filters": {
      "study_types": ["RCT"],
      "years": {"from": 2020, "to": 2025}
    }
  }'

# Get paper detail
curl "https://med.aidashnews.tech/api/papers/PMC10000089"

# Register
curl -X POST https://med.aidashnews.tech/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","name":"Test User","password":"pass123"}'

# Login and save token
TOKEN=$(curl -s -X POST https://med.aidashnews.tech/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}' \
  | jq -r '.access_token')

# Use token
curl -H "Authorization: Bearer $TOKEN" https://med.aidashnews.tech/api/auth/me
```

---

## Data Model

### PaperListItem (Compact)

Used in list and search responses:

```typescript
interface PaperListItem {
  id: string;                    // PMC ID (e.g., "PMC10000089")
  tldr: string;                  // One-paragraph summary
  study_type: string;            // e.g., "RCT", "meta-analysis", "narrative_review"
  specialty_tags: string[];      // e.g., ["nutrition", "cardiology"]
  overall_evidence_level: string | null; // "high", "moderate", "low", "very_low"
  sample_size: string | null;    // e.g., "N=100", "80 articles"
}
```

### PaperDetail (Full)

Used in detail responses:

```typescript
interface PaperDetail extends PaperListItem {
  detailed_summary: string;      // Full structured summary
  pico_summary: PICOSummary | null;
  key_findings: KeyFindings | null;
  mind_map: MindMap | null;
  verification: Verification | null;
  processing_time: number;       // Seconds
  has_errors: boolean;
}

interface PICOSummary {
  population: string;
  intervention: string;
  comparison: string;
  outcome: string;
  study_design: string;
}

interface KeyFindings {
  findings: Finding[];
  overall_evidence_level: string;
  sample_size: string | null;
  follow_up_duration: string | null;
}

interface Finding {
  claim: string;
  evidence_strength: string;     // "high", "moderate", "low", "very_low"
  finding_type: string;          // "primary_outcome", "secondary_outcome", "safety", etc.
  statistical_support: string;
  source_quote: string;
  limitations_noted: boolean;
}

interface MindMap {
  root: string;                  // Root node label
  children: MindMapNode[];       // Recursive tree structure
}

interface MindMapNode {
  id: string;
  label: string;
  node_type: string;             // "category", "fact", "finding", etc.
  children: MindMapNode[];
}

interface Verification {
  numerical_claims: any[];
  numerical_accuracy_score: number;
  factual_claims: any[];
  factual_accuracy_score: number;
  overall_accuracy_score: number;
  critical_errors: string[];
  recommendations: string[];
  passed: boolean;
}
```

---

## Rate Limiting

Currently no rate limiting on search endpoints. Auth endpoints (`/api/auth/*`) enforce in-memory per-IP rate limits via `enforce_rate_limit` (5 requests per 60 seconds for register/login/forgot-password). For production use, consider implementing additional rate limiting at the Cloudflare level or via nginx.

---

## CORS

The API allows cross-origin requests from:
- `http://localhost:3000`
- `http://127.0.0.1:3000`

For production frontend deployment, update the CORS configuration in `backend/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Deployment Notes

- **Backend:** FastAPI running as systemd service (`medintel-backend.service`) on port 8001
- **Database:** PostgreSQL at `localhost:5432` (Docker container, database `medintel`)
- **Vector Store:** Qdrant at `http://localhost:6333` (Docker container)
- **Full Text Search:** PostgreSQL `tsvector` on `papers.search_vector` with a GIN index, maintained by a database trigger.
- **Reverse Proxy:** Docker nginx (`kwamelrent_nginx`) proxies `med.aidashnews.tech` to port 8001
- **SSL:** Terminated at Cloudflare edge (domain is proxied through Cloudflare)
- **Papers:** 5,865 papers ingested from `/root/papers/pipeline_outputs/results/`

### Managing the Backend

```bash
# Check status
systemctl status medintel-backend

# Restart
systemctl restart medintel-backend

# View logs
journalctl -u medintel-backend -f

# Re-seed papers
python3 -m backend.seed
```

---

## Support

For issues or questions, check:
- Swagger UI: https://med.aidashnews.tech/docs
- ReDoc: https://med.aidashnews.tech/redoc
- Backend logs: `journalctl -u medintel-backend -f`
