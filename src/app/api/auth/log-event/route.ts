import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * POST /api/auth/log-event
 *
 * Loggt eine Aktivitaet in user_activity_log.
 * Authentifizierung via Supabase Session (Cookies).
 * Insert via Service-Role-Client (umgeht RLS fuer zuverlaessiges Logging).
 */
export async function POST(request: NextRequest) {
  try {
    // 1. User aus Session lesen
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    // 2. Body parsen
    const body = await request.json();
    const { activity_type, title, description, metadata } = body;

    if (!activity_type || !title) {
      return NextResponse.json(
        { error: 'activity_type und title sind erforderlich' },
        { status: 400 },
      );
    }

    // 3. Via Admin-Client in user_activity_log einfuegen
    const admin = createAdminClient();
    const { error: insertError } = await admin.from('user_activity_log').insert({
      user_id: user.id,
      activity_type,
      title,
      description: description || null,
      metadata: metadata || {},
    });

    if (insertError) {
      console.error('Activity-Log Fehler:', insertError.message);
      // Trotzdem 200 zurueckgeben – Logging darf nie den Flow blockieren
      return NextResponse.json({ logged: false });
    }

    return NextResponse.json({ logged: true });
  } catch (err) {
    console.error('Activity-Log Fehler:', err);
    return NextResponse.json({ logged: false });
  }
}
