import { apiFetch } from './api';

// ── Admin ──────────────────────────────────────────────

export async function getEbook(articleId: string) {
  return apiFetch<any>(`/articles/admin/${articleId}/ebook`);
}

export async function generateEbook(articleId: string, opts?: { locale?: string; style?: string }) {
  return apiFetch<any>(`/articles/admin/${articleId}/ebook/generate`, {
    method: 'POST',
    body: JSON.stringify(opts || {}),
  });
}

export async function updateEbook(articleId: string, data: Record<string, any>) {
  return apiFetch<any>(`/articles/admin/${articleId}/ebook`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function generateEbookPdf(articleId: string) {
  return apiFetch<any>(`/articles/admin/${articleId}/ebook/generate-pdf`, {
    method: 'POST',
  });
}

export async function publishEbook(articleId: string) {
  return apiFetch<any>(`/articles/admin/${articleId}/ebook/publish`, {
    method: 'POST',
  });
}

export async function deleteEbook(articleId: string) {
  return apiFetch<any>(`/articles/admin/${articleId}/ebook`, {
    method: 'DELETE',
  });
}

export async function getEbookLeads(articleId: string, page = 1) {
  return apiFetch<{ data: any[]; total: number }>(`/articles/admin/${articleId}/ebook/leads?page=${page}`);
}

// ── Admin: Artikel ─────────────────────────────────────

export async function getAdminArticles() {
  return apiFetch<any[]>('/articles/admin');
}

export async function getAdminArticle(id: string) {
  return apiFetch<any>(`/articles/admin/${id}`);
}

// ── Public ─────────────────────────────────────────────

export async function getPublishedEbook(slug: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
  const res = await fetch(`${API_URL}/articles/slug/${slug}/ebook`);
  if (!res.ok) return null;
  return res.json();
}

export async function submitEbookLead(articleId: string, email: string, name?: string, source?: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
  const res = await fetch(`${API_URL}/articles/${articleId}/ebook/lead`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name, source }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Das hat leider nicht geklappt.');
  }
  return res.json();
}

export async function trackEbookDownload(articleId: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
  const res = await fetch(`${API_URL}/articles/${articleId}/ebook/download`, { method: 'POST' });
  if (!res.ok) return null;
  return res.json();
}
