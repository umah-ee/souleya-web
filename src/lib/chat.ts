import { apiFetch } from './api';
import { createClient } from './supabase/client';
import type {
  ChannelOverview, ChannelDetail, Channel,
  Message, ReactionSummary, UnreadCount, PollResult,
  ReadStatusMember,
} from '../types/chat';

// ══════════════════════════════════════════════════════════════
// CHANNELS
// ══════════════════════════════════════════════════════════════

export async function fetchChannels() {
  return apiFetch<ChannelOverview[]>('/chat/channels');
}

export async function fetchChannel(channelId: string) {
  return apiFetch<ChannelDetail>(`/chat/channels/${channelId}`);
}

export async function createDirectChannel(partnerId: string) {
  return apiFetch<{ id: string; created: boolean }>('/chat/channels/direct', {
    method: 'POST',
    body: JSON.stringify({ partner_id: partnerId }),
  });
}

export async function createGroupChannel(data: {
  name: string;
  description?: string;
  avatar_url?: string;
  max_members?: number;
  member_ids: string[];
}) {
  return apiFetch<Channel>('/chat/channels/group', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateChannel(channelId: string, data: {
  name?: string;
  description?: string;
  avatar_url?: string;
  max_members?: number;
}) {
  return apiFetch<Channel>(`/chat/channels/${channelId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// ── Mitglieder ────────────────────────────────────────────────

export async function addChannelMember(channelId: string, userId: string) {
  return apiFetch<{ success: boolean }>(`/chat/channels/${channelId}/members/${userId}`, {
    method: 'POST',
  });
}

export async function removeChannelMember(channelId: string, userId: string) {
  return apiFetch<{ success: boolean }>(`/chat/channels/${channelId}/members/${userId}`, {
    method: 'DELETE',
  });
}

// ══════════════════════════════════════════════════════════════
// MESSAGES
// ══════════════════════════════════════════════════════════════

export async function fetchMessages(channelId: string, page = 1, limit = 50) {
  return apiFetch<{ data: Message[]; total: number; hasMore: boolean }>(
    `/chat/channels/${channelId}/messages?page=${page}&limit=${limit}`,
  );
}

export async function sendMessage(channelId: string, data: {
  type: 'text' | 'image' | 'voice' | 'location' | 'seeds' | 'poll';
  content?: string;
  metadata?: Record<string, unknown>;
  reply_to?: string;
}) {
  return apiFetch<Message>(`/chat/channels/${channelId}/messages`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function editMessage(messageId: string, content: string) {
  return apiFetch<Message>(`/chat/messages/${messageId}`, {
    method: 'PATCH',
    body: JSON.stringify({ content }),
  });
}

export async function deleteMessage(messageId: string) {
  return apiFetch<{ success: boolean }>(`/chat/messages/${messageId}`, {
    method: 'DELETE',
  });
}

// ══════════════════════════════════════════════════════════════
// REACTIONS
// ══════════════════════════════════════════════════════════════

export async function addReaction(messageId: string, emoji: string) {
  return apiFetch<{ success: boolean }>(`/chat/messages/${messageId}/reactions`, {
    method: 'POST',
    body: JSON.stringify({ emoji }),
  });
}

export async function removeReaction(messageId: string, emoji: string) {
  return apiFetch<{ success: boolean }>(
    `/chat/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`,
    { method: 'DELETE' },
  );
}

export async function fetchReactions(messageId: string) {
  return apiFetch<ReactionSummary[]>(`/chat/messages/${messageId}/reactions`);
}

// ══════════════════════════════════════════════════════════════
// READ STATUS
// ══════════════════════════════════════════════════════════════

export async function markChannelAsRead(channelId: string) {
  return apiFetch<{ success: boolean }>(`/chat/channels/${channelId}/read`, {
    method: 'POST',
  });
}

export async function fetchUnreadCounts() {
  return apiFetch<UnreadCount[]>('/chat/unread');
}

export async function fetchReadStatus(channelId: string) {
  return apiFetch<ReadStatusMember[]>(`/chat/channels/${channelId}/read-status`);
}

export async function muteChannel(channelId: string, until: string) {
  return apiFetch<{ success: boolean }>(`/chat/channels/${channelId}/mute`, {
    method: 'POST',
    body: JSON.stringify({ until }),
  });
}

export async function unmuteChannel(channelId: string) {
  return apiFetch<{ success: boolean }>(`/chat/channels/${channelId}/mute`, {
    method: 'DELETE',
  });
}

export async function searchMessages(channelId: string, query: string, page = 1) {
  return apiFetch<{ data: Message[]; total: number; hasMore: boolean }>(
    `/chat/channels/${channelId}/messages/search?q=${encodeURIComponent(query)}&page=${page}`,
  );
}

// ══════════════════════════════════════════════════════════════
// FORWARD
// ══════════════════════════════════════════════════════════════

export async function forwardMessage(messageId: string, targetChannelId: string) {
  return apiFetch<Message>(`/chat/messages/${messageId}/forward`, {
    method: 'POST',
    body: JSON.stringify({ target_channel_id: targetChannelId }),
  });
}

// ══════════════════════════════════════════════════════════════
// PIN
// ══════════════════════════════════════════════════════════════

export async function pinMessage(messageId: string) {
  return apiFetch<{ success: boolean }>(`/chat/messages/${messageId}/pin`, { method: 'POST' });
}

export async function unpinMessage(messageId: string) {
  return apiFetch<{ success: boolean }>(`/chat/messages/${messageId}/pin`, { method: 'DELETE' });
}

export async function fetchPinnedMessages(channelId: string) {
  return apiFetch<Message[]>(`/chat/channels/${channelId}/pinned`);
}

// ══════════════════════════════════════════════════════════════
// POLLS
// ══════════════════════════════════════════════════════════════

export async function createPoll(channelId: string, data: {
  question: string;
  options: string[];
  multiple_choice?: boolean;
  is_anonymous?: boolean;
  expires_at?: string;
}) {
  return apiFetch<Message>(`/chat/channels/${channelId}/polls`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function votePoll(pollId: string, optionId: string) {
  return apiFetch<PollResult>(`/chat/polls/${pollId}/vote`, {
    method: 'POST',
    body: JSON.stringify({ option_id: optionId }),
  });
}

export async function getPollResults(pollId: string) {
  return apiFetch<PollResult>(`/chat/polls/${pollId}`);
}

// ══════════════════════════════════════════════════════════════
// SEEDS TRANSFER
// ══════════════════════════════════════════════════════════════

export async function transferSeeds(channelId: string, data: {
  amount: number;
  message?: string;
  to_user_id?: string;
}) {
  return apiFetch<{ success: boolean; message_id: string; new_balance: number }>(
    `/chat/channels/${channelId}/seeds`,
    { method: 'POST', body: JSON.stringify(data) },
  );
}

// ══════════════════════════════════════════════════════════════
// VOICE UPLOAD
// ══════════════════════════════════════════════════════════════

export async function uploadVoiceMessage(blob: Blob, userId: string): Promise<string> {
  const supabase = createClient();
  const ext = blob.type.includes('mp4') ? 'mp4' : 'webm';
  const path = `${userId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from('chat-voice')
    .upload(path, blob, { contentType: blob.type.split(';')[0] || 'audio/webm', upsert: false });

  if (error) throw new Error(`Upload fehlgeschlagen: ${error.message}`);

  const { data: { publicUrl } } = supabase.storage
    .from('chat-voice')
    .getPublicUrl(path);

  return publicUrl;
}

// ══════════════════════════════════════════════════════════════
// IMAGE UPLOAD
// ══════════════════════════════════════════════════════════════

export async function uploadChatImage(file: File, userId: string): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${userId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from('chat-images')
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) throw new Error(`Upload fehlgeschlagen: ${error.message}`);

  const { data: { publicUrl } } = supabase.storage
    .from('chat-images')
    .getPublicUrl(path);

  return publicUrl;
}

// ── Video/Audio Calls ─────────────────────────────────────────
export async function initiateCall(channelId: string, video = false) {
  return apiFetch<{ roomId: string; channelId: string; video: boolean }>(
    `/chat/channels/${channelId}/call`,
    { method: 'POST', body: JSON.stringify({ video }) },
  );
}

export async function endCallMessage(channelId: string, durationSeconds: number, video = false) {
  return apiFetch(`/chat/channels/${channelId}/call-end`, {
    method: 'POST',
    body: JSON.stringify({ duration_seconds: durationSeconds, video }),
  });
}
