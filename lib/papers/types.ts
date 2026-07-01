export interface Paper {
  slug: string;
  journal: string;
  citation: string;
  doi: string;
  centers: number;
  authors: number;
  title: string;
  authorList: string;
  validated: boolean;
  reviewer: {
    name: string;
    specialty: string;
    institution: string;
    years: number;
    papers: number;
    score: string;
    member: string;
  };
  stats: {
    hr: string;
    ci: string;
    pValue: string;
    grade: string;
  };
  tldr: {
    summary: string;
    picot: {
      population: string;
      intervention: string;
      comparator: string;
      outcome: string;
    };
    meta: {
      synthesised: string;
      sources: string;
      validatedBy: string;
      cme: string;
    };
  };
  mindmap: {
    nodes: {
      id: string;
      label: string;
      sublabel: string;
      x: number;
      y: number;
      w: number;
      h: number;
      accent?: string;
    }[];
    source: {
      ref: string;
      quote: string;
      cite: string;
    };
  };
  infographic: {
    headline: string;
    placeboRate: string;
    semaRate: string;
    reduction: string;
    footer: string;
  };
  appraisal: {
    score: number;
    domains: {
      name: string;
      score: number;
      rob: string;
      color: 'teal' | 'amber';
    }[];
    biasFlags: {
      title: string;
      severity: string;
      description: string;
      raised: boolean;
    }[];
    limitations: string[];
  };
  relevance: {
    signal: string;
    summary: string;
    confidence: string;
    specialties: string[];
    evidenceGrade: string;
    evidenceDescription: string;
    practicePoints: {
      title: string;
      description: string;
      type: 'positive' | 'caution';
    }[];
  };
  sections: {
    id: string;
    label: string;
    range: string;
  }[];
  excerpt: string;
  citations: Record<string, string>;
}
