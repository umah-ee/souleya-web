export interface Profile {
  id: string;
  email: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  banner_pos_x: number;
  banner_pos_y: number;
  location: string | null;
  location_lat: number | null;
  location_lng: number | null;
  soul_level: number;
  is_first_light: boolean;
  is_admin: boolean;
  is_mentor: boolean;
  mentor_bio: string | null;
  mentor_tagline: string | null;
  specializations: string[];
  mentor_website: string | null;
  mentor_social: Record<string, string>;
  seeds_balance: number;
  connections_count: number;
  pulses_count: number;
  interests: string[];
  birthday: string | null;
  posts_visibility: 'public' | 'circle';
  referral_code: string;
  onboarding_completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileData {
  username?: string;
  display_name?: string;
  bio?: string;
  location?: string;
  avatar_url?: string;
  banner_url?: string;
  banner_pos_x?: number;
  banner_pos_y?: number;
  location_lat?: number;
  location_lng?: number;
  interests?: string[];
  birthday?: string;
  posts_visibility?: 'public' | 'circle';
  mentor_bio?: string;
  mentor_tagline?: string;
  specializations?: string[];
  mentor_website?: string;
  mentor_social?: Record<string, string>;
}

export const SOUL_LEVEL_NAMES: Record<number, string> = {
  1: 'Soul Spark',
  2: 'Awakened Soul',
  3: 'Harmony Keeper',
  4: 'Zen Master',
  5: 'Soul Mentor',
};
