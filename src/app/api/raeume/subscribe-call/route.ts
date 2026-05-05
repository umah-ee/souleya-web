import { NextResponse } from 'next/server';
import { findRaum } from '@/lib/raeume-db';
import { callSubscribe } from '@/lib/raeume-mail';

export async function POST(request: Request) {
  let body: { email?: unknown; slug?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_body' }, { status: 400 });
  }

  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const slug = typeof body.slug === 'string' ? body.slug : '';

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 400 });
  }

  const raum = await findRaum(slug);
  if (!raum || raum.type !== 'call' || raum.ended) {
    return NextResponse.json({ ok: false, error: 'raum_not_available' }, { status: 404 });
  }

  try {
    const result = await callSubscribe(raum, email);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    if (msg === 'mail_not_configured' || msg === 'audience_not_configured') {
      return NextResponse.json({ ok: false, error: msg }, { status: 503 });
    }
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
