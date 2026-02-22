import { createClient } from '@/lib/supabase/server';
import DiscoverClient from './DiscoverClient';

export default async function DiscoverPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return <DiscoverClient userId={user?.id ?? null} />;
}
