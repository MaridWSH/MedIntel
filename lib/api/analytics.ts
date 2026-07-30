import { apiErrorMessage, apiFetch } from './client';

export type AnalyticsPeriod = '1d' | '7d' | '30d' | '90d' | '1y';
export type AnalyticsEventType = 'PAGE_VIEW' | 'SIGNUP' | 'LOGIN' | 'LOGOUT' | 'PAPER_VIEW' | 'PAPER_SEARCH';

export interface AnalyticsOverview {
  total_users: number;
  new_users_today: number;
  new_users_this_week: number;
  new_users_this_month: number;
  active_users_today: number;
  active_users_this_week: number;
  active_users_this_month: number;
  total_visitors: number;
  visitors_today: number;
  visitors_this_week: number;
  visitors_this_month: number;
  page_views_today: number;
}

export interface TimeSeriesPoint {
  date: string;
  count: number;
}

export interface AnalyticsTimeSeries {
  period: AnalyticsPeriod;
  data: TimeSeriesPoint[];
}

async function readAnalytics<T>(endpoint: string, fallback: string): Promise<T> {
  const response = await apiFetch(endpoint);
  if (!response.ok) {
    throw new Error(apiErrorMessage(await response.json().catch(() => null), fallback));
  }
  return response.json();
}

export function fetchAnalyticsOverview() {
  return readAnalytics<AnalyticsOverview>('admin/analytics/overview', 'Could not load analytics overview');
}

export function fetchUserGrowth(period: AnalyticsPeriod) {
  return readAnalytics<AnalyticsTimeSeries>(`admin/analytics/users?period=${period}`, 'Could not load user growth');
}

export function fetchVisitorGrowth(period: AnalyticsPeriod) {
  return readAnalytics<AnalyticsTimeSeries>(`admin/analytics/visitors?period=${period}`, 'Could not load visitor growth');
}

export function fetchEventGrowth(period: AnalyticsPeriod, eventType?: AnalyticsEventType) {
  const qs = new URLSearchParams({ period });
  if (eventType) qs.set('event_type', eventType);
  return readAnalytics<AnalyticsTimeSeries>(`admin/analytics/events?${qs}`, 'Could not load event analytics');
}
