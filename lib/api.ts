const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE || 'https://med.aidashnews.tech/api').replace(/\/$/, '');

function apiErrorMessage(payload: unknown, fallback: string): string {
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

// Authentication is stored by the API in HttpOnly cookies. Keeping bearer
// tokens out of localStorage prevents injected browser scripts from reading
// long-lived credentials.
export const clearTokens = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token'); // Remove tokens from pre-cookie releases.
  }
};

function endpointUrl(endpoint: string) {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${path}`;
}

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

// Login
export async function loginUser(email: string, password: string) {
  const res = await fetch(endpointUrl('auth/login'), {
    method: "POST",
    credentials: 'include',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error(apiErrorMessage(await res.json().catch(() => null), 'Invalid credentials'));
  }

  clearTokens();
  return res.json();
}

// Register
export async function registerUser(userData: {
  email: string;
  name: string;
  password: string;
}) {
  const res = await fetch(endpointUrl('auth/register'), {
    method: "POST",
    credentials: 'include',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  if (!res.ok) {
    throw new Error(apiErrorMessage(await res.json().catch(() => null), 'Registration failed'));
  }

  return res.json();
}

// Get current user
export async function fetchCurrentUser() {
  const res = await apiFetch("auth/me");
  if (!res.ok) return null;
  return res.json();
}

export async function forgotPassword(email: string) {
  const res = await fetch(endpointUrl('auth/forgot-password'), {
    method: "POST",
    credentials: 'include',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    throw new Error(apiErrorMessage(await res.json().catch(() => null), 'Failed to send reset link'));
  }

  return res.json();
}

export async function resetPassword(resetToken: string, newPassword: string) {
  const res = await fetch(endpointUrl('auth/reset-password'), {
    method: "POST",
    credentials: 'include',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reset_token: resetToken, new_password: newPassword }),
  });

  if (!res.ok) {
    throw new Error(apiErrorMessage(await res.json().catch(() => null), 'Failed to reset password'));
  }

  return res.json();
}

// Logout
export async function logoutUser() {
  await apiFetch("auth/logout", { method: "POST" });
  clearTokens();
  window.location.href = "/login";
}

export async function deleteAccount() {
  const res = await apiFetch('user/account', { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete account');
  clearTokens();
  return res.json();
}

// ── Saved Papers ──────────────────────────────────────────────────────────────

export async function savePaper(paperId: string) {
  const res = await apiFetch(`user/papers/${paperId}/save`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to save paper");
  return res.json();
}

export async function unsavePaper(paperId: string) {
  const res = await apiFetch(`user/papers/${paperId}/save`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to unsave paper");
  return res.json();
}

export async function isPaperSaved(paperId: string): Promise<boolean> {
  const res = await apiFetch(`user/papers/${paperId}/is-saved`);
  if (!res.ok) return false;
  const data = await res.json();
  return data.is_saved;
}

export async function listSavedPapers() {
  const res = await apiFetch("user/saved-papers");
  if (!res.ok) throw new Error("Failed to list saved papers");
  return res.json();
}

export async function getDashboardStats() {
  const res = await apiFetch("user/dashboard/stats");
  if (!res.ok) throw new Error("Failed to get dashboard stats");
  return res.json();
}

/*
 * semanticSearch() / keywordSearch() lived here and called /search and
 * /keyword-search. Neither endpoint has ever existed — both 404'd on every call.
 * Semantic search now runs inside GET /api/papers/search (see searchPapers in
 * lib/papers), which does vector search with a keyword fallback server-side.
 */
