// Frontend analytics instrumentation. Generates a persistent visitor_id and a
// per-session session_id, then sends privacy-safe events to the backend.

import { endpointUrl } from './api/client';

const VISITOR_ID_KEY = 'citerounds_visitor_id';
const SESSION_ID_KEY = 'citerounds_session_id';

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getVisitorId(): string {
  if (typeof window === 'undefined') return '';
  let id = window.localStorage.getItem(VISITOR_ID_KEY);
  if (!id) {
    id = generateId();
    window.localStorage.setItem(VISITOR_ID_KEY, id);
  }
  return id;
}

export function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = window.sessionStorage.getItem(SESSION_ID_KEY);
  if (!id) {
    id = generateId();
    window.sessionStorage.setItem(SESSION_ID_KEY, id);
  }
  return id;
}

function trackingHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'x-visitor-id': getVisitorId(),
    'x-session-id': getSessionId(),
  };
}

export function doNotTrack(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    navigator.doNotTrack === '1' ||
    navigator.doNotTrack === 'yes' ||
    (window as Window & { doNotTrack?: string }).doNotTrack === '1'
  );
}

export async function trackEvent(payload: {
  event_type: string;
  path?: string;
  paper_id?: string;
  metadata?: Record<string, unknown>;
}) {
  if (typeof window === 'undefined' || doNotTrack()) return;

  const body = {
    event_type: payload.event_type,
    path: payload.path ?? window.location.pathname,
    visitor_id: getVisitorId(),
    session_id: getSessionId(),
    paper_id: payload.paper_id,
    metadata_json: payload.metadata || {},
  };

  try {
    await fetch(endpointUrl('analytics/event'), {
      method: 'POST',
      headers: trackingHeaders(),
      credentials: 'include',
      body: JSON.stringify(body),
    });
  } catch {
    // Fail silently — analytics must not break core functionality.
  }
}

export function trackPageView(path?: string) {
  return trackEvent({ event_type: 'PAGE_VIEW', path });
}

export function trackPaperView(paperId: string) {
  return trackEvent({ event_type: 'PAPER_VIEW', paper_id: paperId });
}

export function trackPaperSearch(query: string) {
  return trackEvent({
    event_type: 'PAPER_SEARCH',
    metadata: { query },
  });
}

export function trackSignup() {
  return trackEvent({ event_type: 'SIGNUP' });
}

export function trackLogin() {
  return trackEvent({ event_type: 'LOGIN' });
}

export function trackLogout() {
  return trackEvent({ event_type: 'LOGOUT' });
}
