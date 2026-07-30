// Domain-separated API clients.
// Import directly from a domain module when possible; this index preserves
// backward-compatible `import { ... } from '@/lib/api'` usage.

export {
  clearTokens,
  apiErrorMessage,
  apiFetch,
  endpointUrl,
} from './client';

export {
  deleteAccount,
  fetchCurrentUser,
  forgotPassword,
  loginUser,
  logoutUser,
  registerUser,
  resetPassword,
} from './auth';

export {
  FeedbackResponsesError,
  fetchFeedbackResponses,
  submitProductFeedback,
  submitResearchSurvey,
  type ProductFeedbackPayload,
  type ProductFeedbackResponse,
  type ResearchSurveyPayload,
  type ResearchSurveyResponse,
} from './feedback';

export {
  getDashboardStats,
  isPaperSaved,
  listSavedPapers,
  savePaper,
  unsavePaper,
} from './user';

export {
  fetchAnalyticsOverview,
  fetchEventGrowth,
  fetchUserGrowth,
  fetchVisitorGrowth,
  type AnalyticsEventType,
  type AnalyticsOverview,
  type AnalyticsPeriod,
  type AnalyticsTimeSeries,
  type TimeSeriesPoint,
} from './analytics';
