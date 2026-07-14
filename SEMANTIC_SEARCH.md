# MedIntel Semantic Search

This document describes the semantic search module added to the MedIntel backend. It explains what each component does, why it exists, and how to use it.

---

## Overview

Semantic search finds papers by **meaning**, not just keyword matches. A user query and each paper are converted into dense vectors (embeddings) using the **BGE-M3** model. Similarity is computed in **Qdrant**, a vector database, and the top results are returned.

### Architecture

```
User Query
    │
    ▼
Normalize Query
    │
    ▼
Embedding Generation  (BGE-M3, loaded once)
    │
    ▼
Vector Search         (Qdrant)
    │
    ▼
Retrieve Paper IDs
    │
    ▼
Load Metadata from PostgreSQL
    │
    ▼
Return Ranked Results
```

### Why this approach?

- **Meaning-aware**: Finds conceptually related papers even when terminology differs.
- **Scalable**: Qdrant supports millions of vectors and sub-second search.
- **Independent**: Does not modify the ingestion, OCR, XML parsing, or LLM extraction pipelines.

---

## Files and modules

### `backend/services/embedding_service.py`

Responsibilities:
- Load **BAAI/bge-m3** exactly once and cache it in memory.
- Generate dense embeddings for queries and paper passages.
- Support batch embedding for efficient indexing.
- Provide sync and async APIs.

Key classes and functions:

| Name | Purpose |
|------|---------|
| `EmbeddingService` | Protocol (interface) for embedding services. |
| `SentenceTransformerEmbeddingService` | Concrete BGE-M3 implementation. |
| `normalize_text()` | Cleans raw text before embedding. |
| `encode_query()` | Module-level helper that embeds a query via the singleton. |
| `encode_papers()` | Module-level helper that embeds a batch of papers via the singleton. |
| `encode_passage_for_paper()` | Module-level helper that embeds one paper via the singleton. |
| `get_embedding_service()` | Returns the singleton service so the model is loaded only once. |
| `get_model_info()` | Returns model name, dimension, and batch size. |

For the first version, each paper is represented as **one document**. The embedding text contains:

```
Title + TLDR + Study Type + Specialty Tags
```

Detailed summaries are intentionally excluded.

### `backend/services/qdrant_service.py`

Responsibilities:
- Create and configure the Qdrant collection.
- Insert, update, and delete vectors.
- Search vectors by cosine similarity.
- Search vectors with metadata filters.

Key classes and functions:

| Name | Purpose |
|------|---------|
| `PaperEmbeddingPayload` | Dataclass for a paper plus its embedding vector. |
| `SemanticSearchResult` | Dataclass for one search result from Qdrant. |
| `get_qdrant_client()` | Creates a Qdrant client from environment variables. |
| `ensure_collection()` | Creates the collection if it does not exist. |
| `upsert_papers()` | Inserts or replaces vectors in batches. |
| `update_paper()` | Updates a single vector and payload. |
| `update_vectors_only()` | Updates only vectors, preserving payloads. |
| `delete_papers()` | Deletes vectors by paper ID. |
| `search_similar()` | Pure vector similarity search. |
| `search_with_filter()` | Vector search with metadata filters. |
| `count_papers()` | Returns the number of indexed vectors. |

### `backend/services/semantic_search_service.py`

Responsibilities:
- Normalize user queries.
- Generate query embeddings (**only the query** is embedded during search).
- Search Qdrant.
- Retrieve paper IDs from search results.
- Load paper metadata from PostgreSQL/SQLite.
- Return ranked results enriched with full paper rows.

Key classes and functions:

| Name | Purpose |
|------|---------|
| `SemanticSearchService` | Orchestrates the full search pipeline with injected dependencies. |
| `normalize_query()` | Cleans the query before embedding. |
| `get_semantic_search_service()` | Factory that wires default implementations. |
| `index_papers()` | Reads papers from the DB and indexes them into Qdrant. |
| `build_paper_payload()` | Converts a Paper row into a vector payload. |

**Important performance rule**: paper embeddings are computed during indexing, never during search. Searching only does:

```
Query → Embedding → Qdrant Search → Results
```

### `backend/repositories/paper_repository.py`

Implements the Repository Pattern for paper metadata.

| Name | Purpose |
|------|---------|
| `PaperRepository` | Protocol defining DB access. |
| `SQLAlchemyPaperRepository` | PostgreSQL/SQLite implementation. |

### `backend/repositories/vector_repository.py`

Implements the Repository Pattern for the vector store.

| Name | Purpose |
|------|---------|
| `VectorRepository` | Protocol defining vector storage/search. |
| `QdrantVectorRepository` | Qdrant implementation that wraps `qdrant_service`. |

### `backend/api/dependencies.py`

Provides FastAPI dependency injection wiring:

| Name | Purpose |
|------|---------|
| `get_paper_repository()` | Returns a `SQLAlchemyPaperRepository` for the request. |
| `get_vector_repository()` | Returns a `QdrantVectorRepository` for the request. |
| `get_semantic_search_service()` | Returns a configured `SemanticSearchService`. |

### `backend/routers/search.py`

FastAPI router exposing semantic search.

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/search` | POST | Semantic search with query, top_k, and optional filters. |

### `backend/index_embeddings.py`

Standalone command to populate Qdrant from the existing database.

```bash
python -m backend.index_embeddings
python -m backend.index_embeddings --limit 1000
python -m backend.index_embeddings --batch-size 64 --recreate
```

This command:
1. Reads every paper from PostgreSQL/SQLite.
2. Generates embeddings with BGE-M3.
3. Stores vectors in Qdrant.

The ingestion pipeline will call this command later. The ingestion pipeline itself is not modified.

---

## Environment variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `MEDINTEL_EMBEDDING_MODEL` | `BAAI/bge-m3` | Sentence-transformer model name. |
| `MEDINTEL_EMBEDDING_DIMENSION` | `1024` | Expected vector dimension. |
| `MEDINTEL_QUERY_INSTRUCTION` | retrieval instruction | Prefix for query embedding. |
| `MEDINTEL_EMBEDDING_BATCH_SIZE` | `32` | Default encoding batch size. |
| `MEDINTEL_QDRANT_URL` | `http://localhost:6333` | Qdrant server URL. |
| `MEDINTEL_QDRANT_API_KEY` | `None` | Optional Qdrant API key. |
| `MEDINTEL_QDRANT_COLLECTION` | `papers` | Qdrant collection name. |

---

## API usage

### Request

```http
POST /api/search
Content-Type: application/json

{
  "query": "diabetes management",
  "top_k": 10,
  "filters": {"study_type": "RCT"}
}
```

### Response

```json
{
  "query": "diabetes management",
  "top_k": 10,
  "total": 3,
  "items": [
    {
      "id": "PMC10000089",
      "title": "...",
      "tldr": "...",
      "study_type": "RCT",
      "specialty_tags": ["endocrinology", "nutrition"],
      "score": 0.823
    }
  ]
}
```

---

## Running with Docker Compose

A complete environment with PostgreSQL, Qdrant, and the backend is provided via `docker-compose.yaml`.

### 1. Configure environment

```bash
cp .env.example .env
# Edit .env if needed; defaults work for Docker Compose
```

### 2. Start services

```bash
docker compose up -d
```

This starts:
- PostgreSQL on port `5432`
- Qdrant on port `6333`
- FastAPI backend on port `8000`

### 3. Index papers

After the papers are in PostgreSQL (via your existing ingestion pipeline), run the indexing job:

```bash
docker compose run --rm index-embeddings
```

This reads every paper from PostgreSQL, generates BGE-M3 embeddings, and stores them in Qdrant.

### 4. View API docs

Open Swagger UI:

```
http://localhost:8000/docs
```

Or ReDoc:

```
http://localhost:8000/redoc
```

---

## Indexing workflow (without Docker)

1. Make sure Qdrant is running:

   ```bash
   docker run -p 6333:6333 qdrant/qdrant
   ```

2. Run the indexing command:

   ```bash
   python -m backend.index_embeddings
   ```

3. The collection is created automatically if it does not exist.

---

## API endpoint

### `POST /api/search`

Search papers semantically.

#### Request body

```json
{
  "query": "diabetes management",
  "top_k": 10,
  "filters": {"study_type": "RCT"}
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `query` | string | Yes | Free-text search query |
| `top_k` | integer | No | Number of results (default: 10, max: 100) |
| `filters` | object | No | Metadata filters, e.g., `{"study_type": "RCT"}` |

#### Response

```json
{
  "query": "diabetes management",
  "top_k": 10,
  "total": 3,
  "items": [
    {
      "id": "PMC10000089",
      "title": "...",
      "tldr": "...",
      "study_type": "RCT",
      "specialty_tags": ["endocrinology", "nutrition"],
      "score": 0.823
    }
  ]
}
```

### Testing with Swagger UI

1. Start the backend.
2. Open `http://localhost:8000/docs`.
3. Find the `semantic-search` section.
4. Click `POST /api/search`, then **Try it out**.
5. Enter a JSON body and click **Execute**.

### Testing with Postman

1. Create a new `POST` request to `http://localhost:8000/api/search`.
2. In the **Body** tab, choose **raw** and **JSON**.
3. Paste:

   ```json
   {
     "query": "diabetes management",
     "top_k": 5
   }
   ```

4. Click **Send**.

### Testing with cURL

```bash
curl -X POST http://localhost:8000/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "diabetes management",
    "top_k": 5,
    "filters": {"study_type": "RCT"}
  }'
```

---

## Testing

Unit tests use fake embedding and repository implementations so they do not require Qdrant or BGE-M3.

```bash
python -m pytest backend/tests -v
```

Test files:
- `backend/tests/test_embedding_service.py`
- `backend/tests/test_semantic_search_service.py`

---

## Design principles

- **SOLID**: Services depend on repository protocols, not concrete classes.
- **Dependency Injection**: FastAPI injects repositories and services at request time.
- **Type Hints**: All public functions use type annotations.
- **Async**: Query embedding supports async execution via thread pool.
- **Logging**: All modules log errors and important lifecycle events.
- **Error Handling**: Qdrant and embedding failures raise `RuntimeError` with context.

---

## Constraints respected

- No LangChain, LlamaIndex, or Haystack.
- Plain Python + FastAPI + SQLAlchemy + Qdrant + sentence-transformers.
- Ingestion pipeline is untouched.
- No hybrid search, BM25, or RAG.
- Only semantic search is implemented.

---

## Authentication summary

The backend also implements auth flows for login, registration, and password recovery.

- `POST /auth/register`
  - Rate limited.
  - Creates a new user record.
  - Returns `access_token` and user data in JSON.
  - Sets short-lived `access_token` and longer-lived `refresh_token` HttpOnly cookies.

- `POST /auth/login`
  - Rate limited.
  - Verifies email and password.
  - Returns `access_token` and user data in JSON.
  - Sets short-lived `access_token` and longer-lived `refresh_token` HttpOnly cookies.

- `POST /auth/forgot-password`
  - Rate limited.
  - If the email exists, generates a reset token and stores it on the user.
  - Returns a generic success message whether or not the email exists.
  - In this implementation, the reset token is logged for testing and should be emailed in production.

- `POST /auth/refresh`
  - Reads the refresh token from the cookie.
  - Returns a new access token and rotates the refresh token cookie.

- `POST /auth/logout`
  - Deletes both authentication cookies.
