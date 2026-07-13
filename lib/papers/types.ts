/**
 * These interfaces mirror backend/schemas.py exactly. Earlier versions typed the
 * structured fields as `Record<string, unknown>`, which let components read keys
 * the API never sends — those mismatches rendered as blank cards and hardcoded
 * placeholder values rather than failing loudly. Keep in step with the schema.
 */

/** verification.domains — accuracy sub-scores, each 0..1 (NOT 0..10). */
export interface VerificationDomains {
  numerical: number;
  factual: number;
  overall: number;
}

/** verification — `score` is 0..1. `grade` is A–F, derived from score server-side. */
export interface Verification {
  score: number;
  grade: string;
  domains: VerificationDomains;
  bias_flags: string[];
  limitations: string[];
  passed: boolean;
}

export interface KeyFindingItem {
  claim: string;
  evidence_strength: string;
  finding_type: string;
  statistical_support: string;
  source_quote: string;
  limitations_noted: boolean;
}

/** key_findings (plural) — narrative findings. practice_points are plain strings. */
export interface KeyFindings {
  signal: string;
  practice_points: string[];
  findings: KeyFindingItem[];
  overall_evidence_level?: string | null;
  sample_size?: string | null;
}

/**
 * key_finding (singular) — primary finding with stats parsed out of the text.
 * Distinct from `key_findings`: the stats live here and nowhere else.
 */
export interface KeyFindingClinical {
  headline: string;
  reduction?: string | null;
  hr?: number | null;
  ci?: string | null;
  p_value?: number | null;
  nnt?: number | null;
  n?: number | null;
}

export interface MindMapNode {
  id: string;
  label: string;
  node_type: string;
  children: MindMapNode[];
}

export interface MindMap {
  nodes: MindMapNode[];
  source: string;
}

export interface Paper {
  id: string;
  title: string;
  tldr: string;
  detailed_summary: string;
  study_type: string;
  specialty_tags: string[];

  journal: string;
  doi: string;
  author_list: string;
  authors_count: number;
  centers: string[];
  centers_count: number;

  pico_summary: Record<string, string> | null;
  key_finding: KeyFindingClinical | null;
  key_findings: KeyFindings | null;
  mind_map: MindMap | null;
  verification: Verification | null;

  /** A single pre-formatted citation string — not a map of citation styles. */
  citation: string;
  /** Section titles as plain strings, e.g. "1. Introduction". */
  sections: string[];
  /** The paper's abstract. */
  excerpt: string;
  /** Editor/reviewer names, comma-separated; empty for ~84% of papers. */
  reviewer: string;

  processing_time: number;
  has_errors: boolean;

  // Present on list/search responses only.
  overall_evidence_level?: string | null;
  sample_size?: string | null;
  /** False when the pipeline produced no tldr/summary for this paper. */
  has_summary?: boolean;
}

/** One section of the source paper, addressable by anchor. */
export interface FullTextSection {
  id: string;
  title: string;
  /** 2 = section, 3 = subsection. */
  level: number;
  content: string;
}

export interface FullText {
  paper_id: string;
  title: string;
  sections: FullTextSection[];
  available: boolean;
}

export interface FacetValue {
  value: string;
  count: number;
}

/** Filter options that exist in the catalogue. Never hardcode these in the UI. */
export interface Facets {
  study_types: FacetValue[];
  specialties: FacetValue[];
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
  evidence_level?: string | null;
  sort?: 'id' | '-id';
}

export interface PaperSearchParams {
  q: string;
  page?: number;
  per_page?: number;
}
