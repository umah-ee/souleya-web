import { NextResponse } from 'next/server';
import { findRaum } from '@/lib/raeume';
import { newsletterSubscribeWithMagicLink } from '@/lib/raeume-mail';
import { signMagicToken } from '@/lib/raeume-auth';

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
  if (!raum) {
    return NextResponse.json({ ok: false, error: 'raum_not_found' }, { status: 404 });
  }

  // Magic-Link konstruieren — nutzt den Origin der Anfrage, damit Dev und
  // Production beide funktionieren ohne separate Konfiguration.
  const origin = new URL(request.url).origin;
  const next = `/raeume/${raum.slug}`;
  const token = signMagicToken(email);
  const magicUrl = `${origin}/api/raeume/magic?e=${encodeURIComponent(email)}&t=${encodeURIComponent(token)}&next=${encodeURIComponent(next)}`;

  try {
    const result = await newsletterSubscribeWithMagicLink(email, magicUrl, raum.question);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    if (
      msg === 'mail_not_configured' ||
      msg === 'audience_not_configured' ||
      msg === 'magic_link_secret_not_configured'
    ) {
      return NextResponse.json({ ok: false, error: msg }, { status: 503 });
    }
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
