import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Testphase: immer zum Dashboard weiterleiten
  // TODO: Vor Launch wieder aktivieren:
  // if (user) redirect('/dashboard');
  // else redirect('/login');
  redirect('/dashboard');
}
