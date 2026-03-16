import { apiFetch } from './api';

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  actor_id: string | null;
  actor_avatar_url?: string | null;
  actor_display_name?: string | null;
  is_read: boolean;
  created_at: string;
}

export async function fetchNotifications(page = 1, limit = 20) {
  return apiFetch<{ data: Notification[]; total: number }>(
    `/notifications?page=${page}&limit=${limit}`,
  );
}

export async function fetchUnreadCount() {
  return apiFetch<{ count: number }>('/notifications/unread-count');
}

export async function markNotificationRead(id: string) {
  return apiFetch(`/notifications/${id}/read`, { method: 'PATCH' });
}

export async function markAllNotificationsRead() {
  return apiFetch('/notifications/read-all', { method: 'PATCH' });
}
