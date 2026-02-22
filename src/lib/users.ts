import { apiFetch } from './api';

export interface UserSearchResult {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  vip_level: number;
  is_origin_soul: boolean;
  connections_count: number;
}

export interface PublicProfile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  vip_level: number;
  is_origin_soul: boolean;
  connections_count: number;
  created_at: string;
}

export async function searchUsers(query: string, page = 1, limit = 20) {
  return apiFetch<{ data: UserSearchResult[]; total: number; hasMore: boolean }>(
    `/users/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
  );
}

export async function fetchPublicProfile(username: string): Promise<PublicProfile> {
  return apiFetch<PublicProfile>(`/users/${encodeURIComponent(username)}`);
}
