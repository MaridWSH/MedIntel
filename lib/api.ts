const API_BASE_URL = "https://med.aidashnews.tech/";

// Token storage
export const setAccessToken = (token: string) => {
  localStorage.setItem("access_token", token);
};

export const getAccessToken = () => localStorage.getItem("access_token");

export const clearTokens = () => {
  localStorage.removeItem("access_token");
};

// Fetch with auto auth header and 401 handling
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
  });
  if (response.status === 401) {
    clearTokens();
  }
  return response;
}

// Login
export async function loginUser(email: string, password: string) {
  const res = await fetch(`${API_BASE_URL}api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json();
    let message = "Invalid credentials";
    if (Array.isArray(err.detail)) {
      message = err.detail.map((d: any) => d.msg).join(", ");
    } else if (typeof err.detail === "string") {
      message = err.detail;
    }
    throw new Error(message);
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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  if (!res.ok) {
    const err = await res.json();
    let message = "Registration failed";
    if (Array.isArray(err.detail)) {
      message = err.detail.map((d: any) => d.msg).join(", ");
    } else if (typeof err.detail === "string") {
      message = err.detail;
    } else if (err.detail) {
      message = JSON.stringify(err.detail);
    }
    throw new Error(message);
  }

  return res.json();
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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    const err = await res.json();
    let message = "Failed to send reset link";
    if (Array.isArray(err.detail)) {
      message = err.detail.map((d: any) => d.msg).join(", ");
    } else if (typeof err.detail === "string") {
      message = err.detail;
    } else if (err.detail) {
      message = JSON.stringify(err.detail);
    }
    throw new Error(message);
  }

  return res.json();
}

export async function resetPassword(resetToken: string, newPassword: string) {
  const res = await fetch(`${API_BASE_URL}api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reset_token: resetToken, new_password: newPassword }),
  });

  if (!res.ok) {
    const err = await res.json();
    let message = "Failed to reset password";
    if (Array.isArray(err.detail)) {
      message = err.detail.map((d: any) => d.msg).join(", ");
    } else if (typeof err.detail === "string") {
      message = err.detail;
    } else if (err.detail) {
      message = JSON.stringify(err.detail);
    }
    throw new Error(message);
  }

  return res.json();
}

// Logout
export async function logoutUser() {
  await apiFetch("api/auth/logout", { method: "POST" });
  clearTokens();
  window.location.href = "/login";
}