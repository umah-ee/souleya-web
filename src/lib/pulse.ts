import { apiFetch } from './api';
import type { Pulse, PulseComment, PulsePoll, CreatePulseData } from '../types/pulse';

// ── Feed laden (paginiert) ──────────────────────────────────
export async function fetchFeed(page = 1, limit = 20) {
  const res = await apiFetch<{ data: Pulse[]; total: number; hasMore: boolean }>(
    `/pulse?page=${page}&limit=${limit}`,
  );
  return { pulses: res.data, total: res.total, hasMore: res.hasMore };
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
