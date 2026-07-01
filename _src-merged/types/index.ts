export interface Paper {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  year: number;
  doi: string;
  volume?: string;
  pages?: string;
  specialties: string[];
  studyType: string;
  evidenceLevel: string;
  isValidated: boolean;
  reviewedBy?: string;
  stats?: PaperStats;
  tldr?: string;
  pico?: PICO;
}

export interface PaperStats {
  hazardRatio?: number;
  confidenceInterval?: [number, number];
  pValue?: string;
  grade?: string;
  sampleSize?: number;
}

export interface PICO {
  population: string;
  intervention: string;
  comparator: string;
  outcome: string;
}

export interface SearchFilters {
  specialties: string[];
  studyTypes: string[];
  dateRange: { from: string; to: string };
  evidenceLevel: string;
  language: "en" | "ar" | "both";
}

export interface User {
  id: string;
  email: string;
  name: string;
  specialty?: string;
  institution?: string;
  plan: "free" | "pro" | "institution";
}
