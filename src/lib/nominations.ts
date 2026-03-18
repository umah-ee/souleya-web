import { apiFetch } from './api';

export interface Nomination {
  id: string;
  nominee_id: string;
  status: 'voting' | 'approved' | 'rejected' | 'expired';
  eligible_voters: number;
  votes_for: number;
  votes_against: number;
  souleya_decision: string | null;
  voting_ends_at: string;
  created_at: string;
  resolved_at: string | null;
  nominee?: {
    id: string;
    display_name: string | null;
    username: string | null;
    avatar_url: string | null;
    soul_level: number;
    is_first_light: boolean;
  };
  user_vote?: boolean | null;
}

export async function fetchActiveNominations(userId?: string): Promise<Nomination[]> {
  const params = userId ? `?userId=${userId}` : '';
  return apiFetch(`/nominations/active${params}`);
}

export async function fetchNomination(id: string, userId?: string): Promise<Nomination> {
  const params = userId ? `?userId=${userId}` : '';
  return apiFetch(`/nominations/${id}${params}`);
}

export async function voteOnNomination(
  nominationId: string,
  vote: boolean,
): Promise<{ voted: boolean }> {
  return apiFetch(`/nominations/${nominationId}/vote`, {
    method: 'POST',
    body: JSON.stringify({ vote }),
  });
}
