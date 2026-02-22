import { createClient } from '@/lib/supabase/server';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Testphase: Dashboard auch ohne Login zeigen
  // TODO: Vor Launch wieder aktivieren:
  // if (!user) redirect('/login');

  return <DashboardClient user={user} />;
}
