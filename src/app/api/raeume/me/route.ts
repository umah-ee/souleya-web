import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { readSessionCookie, SESSION_COOKIE, sessionCookieOptions } from '@/lib/raeume-auth';

export async function GET() {
  const store = await cookies();
  const session = readSessionCookie(store.get(SESSION_COOKIE)?.value);
  if (!session) return NextResponse.json({ ok: true, email: null });
  return NextResponse.json({ ok: true, email: session.email });
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, '', { ...sessionCookieOptions(), maxAge: 0 });
  return response;
}
