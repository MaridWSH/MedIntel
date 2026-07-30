function resolveApiBase(): string {
  const explicit = process.env.NEXT_PUBLIC_API_BASE;
  // In the browser during local development, route API calls through a
  // same-origin Next.js rewrite (`/backend-api/*` -> local backend). This keeps
  // auth cookies first-party so SameSite=Lax cookies are always sent, avoiding
  // the cross-site (localhost:3000 -> 127.0.0.1:8000) cookie blocking that
  // caused /api/auth/me and /api/auth/refresh to return 401.
  const isLocal =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1');

  if (isLocal) {
    if (explicit && explicit.startsWith('/')) {
      // Relative, same-origin base (the dev proxy path).
      return explicit.replace(/\/$/, '');
    }
    // Same-origin proxy: Next rewrites /api/:path* -> backend /api/:path*.
    // Using the identical /api path keeps the backend's cookie Path=/api
    // matching, so first-party auth cookies are always sent.
    return '/api';
  }

  if (explicit) {
    return explicit.replace(/\/$/, '');
  }
  // Production / server-side rendering default.
  return 'https://citerounds.com/api';
}

const API_BASE_URL = resolveApiBase();

export function apiErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== 'object' || !('detail' in payload)) return fallback;
  const detail = (payload as { detail?: unknown }).detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (!item || typeof item !== 'object' || !('msg' in item)) return '';
        const message = (item as { msg?: unknown }).msg;
        return typeof message === 'string' ? message : '';
      })
      .filter(Boolean);
    if (messages.length) return messages.join(', ');
  }
  return detail ? JSON.stringify(detail) : fallback;
}

export function endpointUrl(endpoint: string) {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${path}`;
}

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

// Authentication is stored by the API in HttpOnly cookies. Keeping bearer
// tokens out of localStorage prevents injected browser scripts from reading
// long-lived credentials.
export const clearTokens = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token'); // Remove tokens from pre-cookie releases.
  }
};

let refreshRequest: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  if (!refreshRequest) {
    refreshRequest = fetch(endpointUrl('auth/refresh'), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => response.ok)
      .catch(() => false)
      .finally(() => {
        refreshRequest = null;
      });
  }
  return refreshRequest;
}

// Fetch with cookie credentials and one refresh/retry on an expired access token.
export async function apiFetch(
  endpoint: string,
  options: RequestInit = {},
  retryAfterRefresh = true,
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  const response = await fetch(endpointUrl(endpoint), {
    ...options,
    headers,
    credentials: 'include',
  });

  if (
    response.status === 401 &&
    retryAfterRefresh &&
    !endpoint.replace(/^\//, '').startsWith('auth/refresh')
  ) {
    const refreshed = await refreshSession();
    if (refreshed) {
      return apiFetch(endpoint, options, false);
    }
    clearTokens();
  }
  return response;
}
