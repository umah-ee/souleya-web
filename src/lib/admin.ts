import { apiFetch } from './api';

export interface AdminToggleResult {
  id: string;
  username: string | null;
  email: string;
  is_admin: boolean;
}

export async function toggleUserAdmin(
  userId: string,
  isAdmin: boolean,
): Promise<AdminToggleResult> {
  return apiFetch<AdminToggleResult>(`/users/${userId}/admin`, {
    method: 'PATCH',
    body: JSON.stringify({ is_admin: isAdmin }),
  });
}
