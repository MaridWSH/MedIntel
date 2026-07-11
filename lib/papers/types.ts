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

  // Legacy fields (optional) — لو الـ API بعتها أو عايز تضيفها بعدين
  slug?: string;
  journal?: string;
  citation?: string;
  doi?: string;
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

export interface PaperSearchResponse extends PaginatedResponse<Paper> {
  query: string;
}

export interface PaperListParams {
  page?: number;
  per_page?: number;
  study_type?: string | null;
  specialty?: string | null;
  sort?: 'id' | '-id';
}

export interface PaperSearchParams {
  q: string;
  page?: number;
  per_page?: number;
}