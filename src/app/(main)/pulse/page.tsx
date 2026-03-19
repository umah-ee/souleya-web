import { createClient } from '@/lib/supabase/server';
import PulseClient from './PulseClient';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Profil-Daten fuer Begruessungs-Header + Empfehlungen
  let displayName: string | null = null;
  let locationLat: number | null = null;
  let locationLng: number | null = null;
  let interests: string[] = [];
  let soulLevel = 1;
  let birthday: string | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, location_lat, location_lng, interests, soul_level, birthday')
      .eq('id', user.id)
      .single();

    if (profile) {
      displayName = profile.display_name;
      locationLat = profile.location_lat;
      locationLng = profile.location_lng;
      interests = profile.interests ?? [];
      soulLevel = profile.soul_level ?? 1;
      birthday = profile.birthday ?? null;
    }
  }

  return (
    <PulseClient
      user={user}
      displayName={displayName}
      locationLat={locationLat}
      locationLng={locationLng}
      interests={interests}
      soulLevel={soulLevel}
      birthday={birthday}
    />
  );
}
