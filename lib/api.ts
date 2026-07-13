const API_BASE_URL = "http://localhost:8000/";

// Token storage
export const setAccessToken = (token: string) => {
  localStorage.setItem("access_token", token);
};

export const getAccessToken = () => localStorage.getItem("access_token");

export const clearTokens = () => {
  localStorage.removeItem("access_token");
};

// Deduplicate concurrent refresh attempts so only one /auth/refresh request
// is in flight at a time.
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const res = await fetch(`${API_BASE_URL}api/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) return null;

  const data = await res.json();
  if (data.access_token) {
    setAccessToken(data.access_token);
    return data.access_token;
  }
  return null;
}

async function getRefreshedToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

// Fetch with auto auth header, credential cookies, 401 refresh and 429 handling.
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (response.status === 429) {
    const err = await response.json().catch(() => ({ detail: "Too many requests" }));
    throw new Error(err.detail || "Too many requests. Please try again later.");
  }

  if (response.status === 401) {
    const newToken = await getRefreshedToken();
    if (newToken) {
      headers["Authorization"] = `Bearer ${newToken}`;
      const retry = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: "include",
      });
      if (retry.status === 401) {
        clearTokens();
      }
      return retry;
    }
    clearTokens();
  }

  return response;
}

function extractErrorMessage(err: any, fallback: string): string {
  if (Array.isArray(err.detail)) {
    return err.detail.map((d: any) => d.msg).join(", ");
  }
  if (typeof err.detail === "string") {
    return err.detail;
  }
  if (err.detail) {
    return JSON.stringify(err.detail);
  }
  return fallback;
}

// Login
export async function loginUser(email: string, password: string) {
  const res = await fetch(`${API_BASE_URL}api/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(err, "Invalid credentials"));
  }

  const data = await res.json();
  setAccessToken(data.access_token);
  return data;
}

// Register
export async function registerUser(userData: {
  email: string;
  name: string;
  password: string;
}) {
  const res = await fetch(`${API_BASE_URL}api/auth/register`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(err, "Registration failed"));
  }

  const data = await res.json();
  setAccessToken(data.access_token);
  return data;
}

// Get current user
export async function fetchCurrentUser() {
  const res = await apiFetch("api/auth/me");
  if (!res.ok) return null;
  return res.json();
}

export async function forgotPassword(email: string) {
  const res = await fetch(`${API_BASE_URL}api/auth/forgot-password`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(err, "Failed to send reset link"));
  }

  return res.json();
}

export async function resetPassword(resetToken: string, newPassword: string) {
  const res = await fetch(`${API_BASE_URL}api/auth/reset-password`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reset_token: resetToken, new_password: newPassword }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(err, "Failed to reset password"));
  }

  return res.json();
}

// Logout
export async function logoutUser() {
  await apiFetch("api/auth/logout", { method: "POST" });
  clearTokens();
  window.location.href = "/login";
}
