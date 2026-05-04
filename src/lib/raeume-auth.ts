/**
 * Räume Magic-Link-Auth + Session-Cookie.
 *
 * Magic-Link-Token: HMAC-SHA256(secret, email + ':magic')
 * Session-Cookie:   base64url(email).HMAC-SHA256(secret, b64 + ':session')
 *
 * Der Cookie ist HttpOnly und 90 Tage gültig. Sobald gesetzt, kann der User
 * direkt im Räume-Detail mitschreiben — neuer Magic-Link ist erst nach Logout
 * (Cookie löschen) nötig.
 */

import crypto from 'crypto';

export const SESSION_COOKIE = 'souleya_raeume';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 90; // 90 Tage

function secret(): string {
  const s = process.env.MAGIC_LINK_SECRET;
  if (!s) throw new Error('magic_link_secret_not_configured');
  return s;
}

function normalize(email: string): string {
  return email.trim().toLowerCase();
}

function hmac(secretValue: string, input: string): string {
  return crypto.createHmac('sha256', secretValue).update(input).digest('base64url');
}

function safeEqual(a: string, b: string): boolean {
  try {
    const ab = Buffer.from(a);
    const bb = Buffer.from(b);
    if (ab.length !== bb.length) return false;
    return crypto.timingSafeEqual(ab, bb);
  } catch {
    return false;
  }
}

/* ───────────────── Magic-Link-Token ───────────────── */

export function signMagicToken(email: string): string {
  return hmac(secret(), `${normalize(email)}:magic`);
}

export function verifyMagicToken(email: string, token: string): boolean {
  const expected = signMagicToken(email);
  return safeEqual(token, expected);
}

/* ───────────────── Session-Cookie ───────────────── */

export function buildSessionCookieValue(email: string): string {
  const b64 = Buffer.from(normalize(email)).toString('base64url');
  const sig = hmac(secret(), `${b64}:session`);
  return `${b64}.${sig}`;
}

export function readSessionCookie(value: string | undefined): { email: string } | null {
  if (!value) return null;
  const [b64, sig] = value.split('.');
  if (!b64 || !sig) return null;
  let expected: string;
  try {
    expected = hmac(secret(), `${b64}:session`);
  } catch {
    return null;
  }
  if (!safeEqual(sig, expected)) return null;
  try {
    const email = Buffer.from(b64, 'base64url').toString('utf-8');
    return { email };
  } catch {
    return null;
  }
}

export function sessionCookieOptions(): {
  httpOnly: true;
  sameSite: 'lax';
  secure: boolean;
  path: '/';
  maxAge: number;
} {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}
