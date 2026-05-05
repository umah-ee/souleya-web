import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';
import { readSessionCookie, SESSION_COOKIE } from '@/lib/raeume-auth';

/**
 * POST /api/raeume/comments
 * Body: { slug, text, display_name, is_anonymous, parent_id? }
 *
 * Cookie-Auth via SESSION_COOKIE (Magic-Link aus subscribe-newsletter).
 * Inserts laufen mit Service-Role-Key, damit RLS nicht blockiert.
 */
export async function POST(request: Request) {
  // Auth via Räume-Session-Cookie
  const store = await cookies();
  const session = readSessionCookie(store.get(SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ ok: false, error: 'not_authenticated' }, { status: 401 });
  }

  let body: {
    slug?: unknown;
    text?: unknown;
    display_name?: unknown;
    is_anonymous?: unknown;
    parent_id?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_body' }, { status: 400 });
  }

  const slug = typeof body.slug === 'string' ? body.slug.trim() : '';
  const text = typeof body.text === 'string' ? body.text.trim() : '';
  const displayNameRaw = typeof body.display_name === 'string' ? body.display_name.trim() : '';
  const isAnonymous = body.is_anonymous === true;
  const parentId = typeof body.parent_id === 'string' && body.parent_id ? body.parent_id : null;

  if (!slug) {
    return NextResponse.json({ ok: false, error: 'missing_slug' }, { status: 400 });
  }
  if (!text || text.length > 5000) {
    return NextResponse.json({ ok: false, error: 'invalid_text' }, { status: 400 });
  }
  const displayName = isAnonymous ? 'Anonym' : displayNameRaw;
  if (!displayName) {
    return NextResponse.json({ ok: false, error: 'missing_name' }, { status: 400 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ ok: false, error: msg }, { status: 503 });
  }

  // Raum auflösen (nur veröffentlichte Räume akzeptieren Kommentare)
  const { data: room, error: roomErr } = await admin
    .from('rooms')
    .select('id')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (roomErr || !room) {
    return NextResponse.json({ ok: false, error: 'raum_not_found' }, { status: 404 });
  }

  // Optional: Parent muss zum gleichen Raum gehören
  if (parentId) {
    const { data: parent } = await admin
      .from('room_comments')
      .select('id, room_id')
      .eq('id', parentId)
      .single();
    if (!parent || parent.room_id !== room.id) {
      return NextResponse.json({ ok: false, error: 'invalid_parent' }, { status: 400 });
    }
  }

  const { error: insertErr } = await admin.from('room_comments').insert({
    room_id: room.id,
    parent_id: parentId,
    email: session.email,
    display_name: displayName,
    is_anonymous: isAnonymous,
    text,
  });

  if (insertErr) {
    return NextResponse.json({ ok: false, error: insertErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
