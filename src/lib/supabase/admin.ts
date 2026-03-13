import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Admin Client mit Service-Role-Key.
 * Nur fuer serverseitige Admin-Operationen (z.B. Activity-Log schreiben).
 * NICHT fuer normale Abfragen – dafuer createClient() aus server.ts nutzen.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY ist nicht gesetzt. Bitte in .env.local eintragen.',
    );
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
