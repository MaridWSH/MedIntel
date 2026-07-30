import { apiFetch } from './client';

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
