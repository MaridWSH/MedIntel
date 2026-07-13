import { Paper, PaperListResponse, PaperSearchResponse, PaperListParams, PaperSearchParams } from './types';

const BASE_API = 'https://med.aidashnews.tech/api';

async function fetchAPI<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
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

/** GET /api/papers — List all papers (paginated) */
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

/** GET /api/papers/search — Semantic search papers by query */
export async function searchPapers(params: PaperSearchParams) {
  const qs = buildQueryString({
    q: params.q,
    page: params.page ?? 1,
    per_page: params.per_page ?? 20,
  });
  return fetchAPI<PaperSearchResponse>(`${BASE_API}/papers/search${qs}`);
}

/** GET /api/papers/{paper_id} — Get single paper details */
export async function getPaperById(paperId: string) {
  return fetchAPI<Paper>(`${BASE_API}/papers/${encodeURIComponent(paperId)}`);
}

/** Helper: auto-paginate and get ALL papers */
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

