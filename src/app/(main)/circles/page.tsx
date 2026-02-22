import { createClient } from '@/lib/supabase/server';
import CirclesClient from './CirclesClient';

export default async function CirclesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return <CirclesClient user={user} />;
}
