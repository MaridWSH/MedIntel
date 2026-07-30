import { apiFetch } from './client';

export interface ResearchSurveyPayload {
  professional_role: string;
  specialty: string;
  years_experience: string;
  sources: string[];
  sources_other: string;
  papers_needed: string;
  most_time_consuming: string;
  most_time_consuming_other: string;
  biggest_problem: string;
  biggest_problem_other: string;
  trust_level: string;
  trust_reason: string;
  website: string;
}

export interface ProductFeedbackPayload {
  overall_rating: number;
  ease_of_use_rating: number;
  search_rating: number | null;
  summary_rating: number | null;
  features_used: string[];
  most_useful: string;
  problems_encountered: string;
  improvements: string;
  feature_requests: string;
  would_recommend: string;
  contact_email: string | null;
  website: string;
}

export interface ResearchSurveyResponse {
  id: number;
  professional_role: string;
  specialty: string;
  years_experience: string;
  sources: string[];
  sources_other: string;
  papers_needed: string;
  most_time_consuming: string;
  most_time_consuming_other: string;
  biggest_problem: string;
  biggest_problem_other: string;
  trust_level: string;
  trust_reason: string;
  created_at: string;
}

export interface ProductFeedbackResponse {
  id: number;
  overall_rating: number;
  ease_of_use_rating: number;
  search_rating: number | null;
  summary_rating: number | null;
  features_used: string[];
  most_useful: string;
  problems_encountered: string;
  improvements: string;
  feature_requests: string;
  would_recommend: string;
  contact_email: string;
  created_at: string;
}

export class FeedbackResponsesError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'FeedbackResponsesError';
    this.status = status;
  }
}

export async function submitResearchSurvey(payload: ResearchSurveyPayload) {
  const res = await apiFetch('feedback/research-methods', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(
      (await res.json().catch(() => null))?.detail || 'Could not submit the survey',
    );
  }
  return res.json();
}

export async function submitProductFeedback(payload: ProductFeedbackPayload) {
  const res = await apiFetch('feedback/product', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(
      (await res.json().catch(() => null))?.detail || 'Could not submit your feedback',
    );
  }
  return res.json();
}

export async function fetchFeedbackResponses(limit = 500): Promise<{
  research: ResearchSurveyResponse[];
  product: ProductFeedbackResponse[];
}> {
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 500);
  const [researchResponse, productResponse] = await Promise.all([
    apiFetch(`feedback/research-methods?limit=${safeLimit}`),
    apiFetch(`feedback/product?limit=${safeLimit}`),
  ]);

  const failedResponse = [researchResponse, productResponse].find((response) => !response.ok);
  if (failedResponse) {
    const fallback = failedResponse.status === 403
      ? 'Administrator access is required to view responses.'
      : failedResponse.status === 401
        ? 'Sign in with an administrator account to view responses.'
        : 'Could not load survey responses.';
    const payload = await failedResponse.json().catch(() => null);
    throw new FeedbackResponsesError(
      payload?.detail || fallback,
      failedResponse.status,
    );
  }

  return {
    research: await researchResponse.json(),
    product: await productResponse.json(),
  };
}
