import { apiFetch } from '../api';
import type {
  HybridSearchRequest,
  HybridSearchResponse,
  Paper,
  PaperListResponse,
  PaperListParams,
} from './types';

const BASE_API = 'http://localhost:8000/api';

async function fetchAPI<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`API Error ${response.status}: ${response.statusText}${errorBody ? ` — ${errorBody}` : ''}`);
  }

  return response.json();
}

function buildQueryString(params: Record<string, unknown>): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value));
    }
  });
  const qs = query.toString();
  return qs ? `?${qs}` : '';
}

/** GET /api/papers — List all papers (paginated). */
export async function listPapers(params: PaperListParams = {}) {
  const qs = buildQueryString({
    page: params.page ?? 1,
    per_page: params.per_page ?? 20,
    study_type: params.study_type,
    specialty: params.specialty,
    sort: params.sort ?? 'id',
  });
  return fetchAPI<PaperListResponse>(`${BASE_API}/papers${qs}`);
}

/** GET /api/papers/{paper_id} — Get single paper details. */
export async function getPaperById(paperId: string) {
  return fetchAPI<Paper>(`${BASE_API}/papers/${encodeURIComponent(paperId)}`);
}

/**
 * POST /api/search — Hybrid (semantic + keyword) search.
 *
 * Combines BGE-M3 semantic search with PostgreSQL full-text search, ranks via
 * Reciprocal Rank Fusion, applies filters, sorts, and returns one paginated page.
 */
export async function hybridSearch(request: HybridSearchRequest): Promise<HybridSearchResponse> {
  const response = await apiFetch('api/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(
      `API Error ${response.status}: ${response.statusText}${errorBody ? ` — ${errorBody}` : ''}`,
    );
  }

  return response.json();
}

/** Helper: auto-paginate and get ALL papers. */
export async function getAllPapers(): Promise<Paper[]> {
  const firstPage = await listPapers({ page: 1, per_page: 100 });
  if (firstPage.pages <= 1) return firstPage.items;

  const allItems = [...firstPage.items];
  for (let p = 2; p <= firstPage.pages; p++) {
    const page = await listPapers({ page: p, per_page: 100 });
    allItems.push(...page.items);
  }
  return allItems;
}