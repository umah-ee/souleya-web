import { NextResponse } from 'next/server';
import {
  verifyMagicToken,
  buildSessionCookieValue,
  sessionCookieOptions,
  SESSION_COOKIE,
} from '@/lib/raeume-auth';

/**
 * GET /api/raeume/magic?e=<email>&t=<token>&next=<path>
 *
 * Wird aus der Magic-Link-Mail aufgerufen. Bei gültigem Token:
 *   - setzt Session-Cookie (90 Tage)
 *   - redirected zur ?next-Seite (Default: /raeume)
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const email = (url.searchParams.get('e') ?? '').trim();
  const token = url.searchParams.get('t') ?? '';
  const nextRaw = url.searchParams.get('next') ?? '/raeume';
  // Nur relative Pfade als next zulassen — verhindert offenen Redirect
  const next = nextRaw.startsWith('/') && !nextRaw.startsWith('//') ? nextRaw : '/raeume';

  if (!email || !/^\S+@\S+\.\S+$/.test(email) || !token) {
    return errorPage(400, 'Etwas fehlt im Link.', 'Wahrscheinlich ist der Link beim Kopieren auseinandergebrochen. Klick einfach noch mal in der Mail.');
  }

  let valid = false;
  try {
    valid = verifyMagicToken(email, token);
  } catch {
    return errorPage(500, 'Hoppla.', 'Auf unserer Seite läuft gerade etwas nicht. Schreib uns kurz an hello@souleya.com.');
  }

  if (!valid) {
    return errorPage(403, 'Link ungültig.', 'Der Link funktioniert leider nicht mehr. Falls du Fragen hast — schreib uns an hello@souleya.com.');
  }

  const cookieValue = buildSessionCookieValue(email);
  const response = NextResponse.redirect(new URL(next, url.origin));
  response.cookies.set(SESSION_COOKIE, cookieValue, sessionCookieOptions());
  return response;
}

function errorPage(status: number, headline: string, body: string): Response {
  const html = `<!DOCTYPE html>
<html lang="de"><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Souleya</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Georgia, 'Times New Roman', serif; background: linear-gradient(180deg, #F5EFE6 0%, #EDE4D3 40%, #D8CFBE 80%, #C9C2B2 100%); background-attachment: fixed; min-height: 100vh; color: #1E180C; line-height: 1.7; display: flex; align-items: center; justify-content: center; padding: 24px; }
  .card { background: rgba(245,239,230,0.6); backdrop-filter: blur(12px); border: 1px solid rgba(200,169,110,0.2); border-radius: 24px; padding: 48px 36px; max-width: 480px; text-align: center; box-shadow: 0 8px 32px rgba(30,24,12,0.06); }
  .ring { width: 56px; height: 56px; margin: 0 auto 20px; display: block; }
  h1 { font-size: 26px; font-weight: 400; margin-bottom: 12px; line-height: 1.3; font-style: italic; }
  p { font-size: 16px; color: #3E3020; margin-bottom: 24px; }
  a.home { display: inline-block; font-size: 13px; color: #7A6014; text-decoration: none; padding: 8px 16px; border: 1px solid #C8A96E; border-radius: 24px; }
  a.home:hover { background: rgba(200,169,110,0.12); }
</style>
</head><body>
<div class="card">
  <svg class="ring" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#A8894E"/><stop offset="100%" stop-color="#D4BC8B"/></linearGradient></defs>
    <circle cx="50" cy="50" r="36" fill="none" stroke="url(#g)" stroke-width="9" stroke-linecap="round" stroke-dasharray="196 30" stroke-dashoffset="15"/>
  </svg>
  <h1>${escape(headline)}</h1>
  <p>${escape(body)}</p>
  <a class="home" href="/raeume">Zu den Räumen</a>
</div>
</body></html>`;
  return new Response(html, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

function escape(s: string): string {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
