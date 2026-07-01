export type ValidationStatus = "validated" | "pending" | "preprint";

export interface Paper {
  id: string;
  journal: string;
  date: string;
  title: string;
  status: ValidationStatus;
  tldr: string;
  hrValue: string;
  pValue: string;
  gradeLabel: string;
  tags: string[];
  citations: number;
  publishedYear: number;
  timeAgo: string;
  viewHref: string;
  /** id referencing STUDY_TYPES in lib/data.ts */
  studyType: string;
  /** id referencing EVIDENCE_LEVELS in lib/data.ts */
  evidenceLevel: string;
}

export interface FilterOption {
  id: string;
  label: string;
  count: number;
}

export type SortOption =
  | "relevance"
  | "newest"
  | "most-cited"
  | "grade"
  | "practice-changing";

export const SORT_LABELS: Record<SortOption, string> = {
  relevance: "Relevance",
  newest: "Newest first",
  "most-cited": "Most cited",
  grade: "Highest GRADE",
  "practice-changing": "Practice-changing first",
};

export const STATUS_META: Record<
  ValidationStatus,
  { label: string; isValidated: boolean }
> = {
  validated: { label: "VALIDATED", isValidated: true },
  pending: { label: "PENDING REVIEW", isValidated: false },
  preprint: { label: "NOT PEER REVIEWED", isValidated: false },
};
