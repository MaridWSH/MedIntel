export interface Paper {
  id: string;
  title: string;
  tldr: string;
  detailed_summary: string;
  study_type: string;
  specialty_tags: string[];
  pico_summary: Record<string, unknown>;
  key_findings: Record<string, unknown>;
  mind_map: Record<string, unknown>;
  verification: Record<string, unknown>;
  processing_time: number;
  has_errors: boolean;

  // Production queryable columns (backfilled from pipeline)
  publication_year?: number | null;
  journal?: string;
  language?: string;
  author_list?: string;
  authors_count?: number | null;
  centers_count?: number | null;
  doi?: string;
  evidence_level?: string;

  // Legacy fields (optional) — لو الـ API بعتها أو عايز تضيفها بعدين
  slug?: string;
  citation?: string;
  centers?: number | string;
  authors?: number | string;
  authorList?: string;
  validated?: boolean;
  stats?: { hr: string | number; ci: string; pValue: string; grade: string };

  // Sidebar / UI fields (optional)
  citations?: Record<string, string>;
  sections?: { id: string; label: string; range: string }[];
  excerpt?: string;
  reviewer?: {
    name: string;
    specialty?: string;
    institution?: string;
    years?: string;
    papers?: string;
    score?: string;
    member?: string;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface PaperListResponse extends PaginatedResponse<Paper> {}

// ── Hybrid search types ──────────────────────────────────────────────

export type SortOption = "relevance" | "newest" | "oldest" | "highest_evidence" | "title";

export interface YearRange {
  from?: number;
  to?: number;
}

export interface HybridSearchFilters {
  specialties?: string[] | null;
  study_types?: string[] | null;
  evidence_levels?: string[] | null;
  journals?: string[] | null;
  languages?: string[] | null;
  authors?: string[] | null;
  years?: YearRange | null;
}

export interface HybridSearchItem {
  paper_id: string;
  title: string;
  tldr: string;
  study_type: string;
  specialty_tags: string[];
  publication_year: number | null;
  journal: string;
  language: string;
  author_list: string;
  evidence_level: string;
  processing_time: number;
  has_errors: boolean;
  semantic_score: number;
  keyword_score: number;
  final_score: number;
}

export interface HybridSearchRequest {
  query: string;
  page?: number;
  page_size?: number;
  sort?: SortOption;
  filters?: HybridSearchFilters | null;
}

export interface HybridSearchResponse {
  query: string;
  page: number;
  page_size: number;
  total: number;
  filters: HybridSearchFilters | null;
  items: HybridSearchItem[];
}

export interface PaperListParams {
  page?: number;
  per_page?: number;
  study_type?: string | null;
  specialty?: string | null;
  sort?: "id" | "-id";
}