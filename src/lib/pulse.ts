import { apiFetch } from './api';
import { createClient } from './supabase/client';
import type { Pulse, PulseComment, PulsePoll, CreatePulseData } from '../types/pulse';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

// ── Feed laden (paginiert) ──────────────────────────────────
export async function fetchFeed(page = 1, limit = 20) {
  const res = await apiFetch<{ data: Pulse[]; total: number; hasMore: boolean }>(
    `/pulse?page=${page}&limit=${limit}`,
  );
  return { pulses: res.data, total: res.total, hasMore: res.hasMore };
}

// ── Eigene Pulses laden (paginiert) ────────────────────────
export async function fetchMyPulses(page = 1, limit = 50) {
  return apiFetch<{ data: Pulse[]; total: number; hasMore: boolean }>(
    `/pulse/mine?page=${page}&limit=${limit}`,
  );
}

// ── Pulse erstellen (erweitert: Bilder, Orte, Metadata, Umfragen) ──
export async function createPulse(data: CreatePulseData): Promise<Pulse> {
  return apiFetch<Pulse>('/pulse', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ── Like togglen ────────────────────────────────────────────
export async function toggleLike(
  pulseId: string,
  currentlyLiked: boolean,
): Promise<{ liked: boolean; likes_count: number }> {
  if (currentlyLiked) {
    return apiFetch(`/pulse/${pulseId}/like`, { method: 'DELETE' });
  } else {
    return apiFetch(`/pulse/${pulseId}/like`, { method: 'POST' });
  }
}

// ── Poll abstimmen ──────────────────────────────────────────
export async function votePoll(pulseId: string, optionId: string): Promise<PulsePoll> {
  return apiFetch<PulsePoll>(`/pulse/${pulseId}/vote`, {
    method: 'POST',
    body: JSON.stringify({ option_id: optionId }),
  });
}

// ── Pulse loeschen ──────────────────────────────────────────
export async function deletePulse(pulseId: string) {
  await apiFetch(`/pulse/${pulseId}`, { method: 'DELETE' });
}

// ── Kommentare laden ────────────────────────────────────────
export async function fetchComments(pulseId: string): Promise<PulseComment[]> {
  return apiFetch<PulseComment[]>(`/pulse/${pulseId}/comments`);
}

// ── Kommentar hinzufuegen ───────────────────────────────────
export async function addComment(pulseId: string, content: string): Promise<PulseComment> {
  return apiFetch<PulseComment>(`/pulse/${pulseId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

// ── Bild hochladen (ueber API → Supabase Storage) ───────────
export async function uploadPulseImage(file: File): Promise<string> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (!token) throw new Error('Nicht angemeldet');

  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_URL}/pulse/upload-image`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Upload fehlgeschlagen: ${res.status}`);
  }

  const data = await res.json();
  return data.url;
}
