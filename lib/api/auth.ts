import { apiErrorMessage, apiFetch, clearTokens, endpointUrl } from './client';

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
