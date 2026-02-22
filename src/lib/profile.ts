import { apiFetch } from './api';
import { createClient } from './supabase/client';
import type { Profile, UpdateProfileData } from '../types/profile';

export async function fetchProfile(): Promise<Profile> {
  return apiFetch<Profile>('/users/me');
}

export async function updateProfile(data: UpdateProfileData): Promise<Profile> {
  return apiFetch<Profile>('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function uploadAvatar(file: File): Promise<string> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Nicht angemeldet');

  // Dateiname: userId/avatar.ext (upsert ersetzt vorhandenes Bild)
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${user.id}/avatar.${ext}`;

  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, file, {
      upsert: true,
      contentType: file.type,
    });

  if (error) throw new Error(`Upload fehlgeschlagen: ${error.message}`);

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);

  // Cache-Busting: Timestamp anhaengen damit Browser neues Bild laedt
  return `${data.publicUrl}?t=${Date.now()}`;
}
