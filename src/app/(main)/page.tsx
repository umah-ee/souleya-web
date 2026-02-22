import { createClient } from '@/lib/supabase/server';
import FeedClient from './FeedClient';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return <FeedClient user={user} />;
}
