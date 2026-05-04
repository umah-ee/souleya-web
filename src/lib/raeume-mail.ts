/**
 * Räume Mailroutine — portiert aus Dev/souleya-impuls/api/subscribe.js.
 *
 * Bündelt die Resend-Audience-Operationen und alle HTML-Mail-Templates für
 * den Call- und Magic-Link-Flow auf souleya-web.
 */

import type { CallRaum } from './raeume';

const RESEND_BASE = 'https://api.resend.com';

export type SubscribeStatus = 'confirmed' | 'waitlist';

export type CallSubscribeResult = {
  status: SubscribeStatus;
  duplicate: boolean;
  position?: number;
};

function from(): string {
  return process.env.RESEND_FROM || 'Souleya <call@souleya.com>';
}

function authHeaders() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('mail_not_configured');
  return { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
}

/* ───────────────── Resend Audience-Helpers ───────────────── */

export async function listContacts(audienceId: string): Promise<Array<{ email?: string }>> {
  const r = await fetch(`${RESEND_BASE}/audiences/${audienceId}/contacts`, {
    headers: authHeaders(),
    cache: 'no-store',
  });
  if (!r.ok) throw new Error(`list contacts ${r.status}`);
  const body = (await r.json()) as { data?: Array<{ email?: string }> };
  return Array.isArray(body.data) ? body.data : [];
}

export async function addToAudience(audienceId: string, email: string): Promise<void> {
  const r = await fetch(`${RESEND_BASE}/audiences/${audienceId}/contacts`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ email }),
  });
  // 409 = bereits Mitglied — kein Fehler
  if (!r.ok && r.status !== 409) {
    const body = (await r.json().catch(() => ({}))) as { message?: string };
    throw new Error(`add contact ${r.status}: ${body.message ?? ''}`);
  }
}

async function getOrCreateAudience(name: string): Promise<string> {
  const headers = authHeaders();
  const list = await fetch(`${RESEND_BASE}/audiences`, { headers, cache: 'no-store' });
  const body = (await list.json()) as { data?: Array<{ id: string; name: string }> };
  const found = (body.data ?? []).find((a) => a.name === name);
  if (found) return found.id;
  const created = await fetch(`${RESEND_BASE}/audiences`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ name }),
  });
  const cb = (await created.json()) as { id?: string; message?: string };
  if (!created.ok || !cb.id) throw new Error(`create audience ${created.status}: ${cb.message ?? ''}`);
  return cb.id;
}

/* ───────────────── Mail-Versand ───────────────── */

export async function sendMail(to: string, subject: string, html: string): Promise<void> {
  const r = await fetch(`${RESEND_BASE}/emails`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ from: from(), to, subject, html }),
  });
  if (!r.ok) {
    const body = (await r.json().catch(() => ({}))) as { message?: string };
    throw new Error(`send mail ${r.status}: ${body.message ?? ''}`);
  }
}

async function notifyOps(subject: string, email: string, status: string): Promise<void> {
  const ops = process.env.OPS_EMAIL;
  if (!ops) return;
  try {
    const html = mailShell(`
      <h1 style="font-size:18px;font-weight:400;margin:0 0 16px;">${escapeHtml(subject)}</h1>
      <p style="margin:0 0 8px;"><strong>${escapeHtml(email)}</strong></p>
      <p style="font-size:13px;color:#7A6E5A;margin:0;">${escapeHtml(status)}</p>
    `);
    await sendMail(ops, `${subject}: ${email}`, html);
  } catch {
    // fire-and-forget — never block the user signup
  }
}

/* ───────────────── Public API: Call-Subscribe ───────────────── */

export async function callSubscribe(
  raum: CallRaum,
  email: string,
): Promise<CallSubscribeResult> {
  const callId = process.env.RESEND_AUDIENCE_CALL_ID;
  if (!callId) throw new Error('audience_not_configured');

  const callList = await listContacts(callId);
  const seatsTaken = callList.length;
  const alreadyInCall = callList.some(
    (c) => c.email && c.email.toLowerCase() === email.toLowerCase(),
  );
  if (alreadyInCall) {
    return { status: 'confirmed', duplicate: true };
  }

  if (seatsTaken < raum.callMaxSlots) {
    await addToAudience(callId, email);
    await sendMail(email, callConfirmedSubject(), callConfirmedHtml(raum));
    await notifyOps(
      'Neue Anmeldung (bestätigt)',
      email,
      `Bestätigt · Platz ${seatsTaken + 1}/${raum.callMaxSlots}`,
    );
    return { status: 'confirmed', duplicate: false };
  }

  const waitlistId = await getOrCreateAudience('souleya-call-waitlist');
  const waitlist = await listContacts(waitlistId);
  const alreadyOnWaitlist = waitlist.some(
    (c) => c.email && c.email.toLowerCase() === email.toLowerCase(),
  );
  if (alreadyOnWaitlist) {
    return { status: 'waitlist', duplicate: true };
  }

  await addToAudience(waitlistId, email);
  await sendMail(email, callWaitlistSubject(), callWaitlistHtml());
  await notifyOps(
    'Neue Anmeldung (Warteliste)',
    email,
    `Warteliste · Position ${waitlist.length + 1}`,
  );
  return { status: 'waitlist', duplicate: false, position: waitlist.length + 1 };
}

/**
 * Live-Plätze aus der Resend-Audience holen (für UI-Anzeige).
 * Liefert null, wenn ENV nicht konfiguriert oder Resend unerreichbar — Aufrufer
 * fällt dann auf den Mock-Wert in raeume.ts zurück.
 */
export async function getCallSeatsTaken(): Promise<number | null> {
  const callId = process.env.RESEND_AUDIENCE_CALL_ID;
  const key = process.env.RESEND_API_KEY;
  if (!callId || !key) return null;
  try {
    const list = await listContacts(callId);
    return list.length;
  } catch {
    return null;
  }
}

/* ───────────────── Public API: Newsletter + Magic-Link ───────────────── */

export async function newsletterSubscribeWithMagicLink(
  email: string,
  magicUrl: string,
  raumQuestion: string,
): Promise<{ duplicate: boolean }> {
  const newsletterId = process.env.RESEND_AUDIENCE_NEWSLETTER_ID;
  if (!newsletterId) throw new Error('audience_not_configured');

  const list = await listContacts(newsletterId);
  const duplicate = list.some(
    (c) => c.email && c.email.toLowerCase() === email.toLowerCase(),
  );
  if (!duplicate) {
    await addToAudience(newsletterId, email);
    await notifyOps('Neuer Räume-Login', email, 'Newsletter + Magic-Link');
  }
  // Magic-Link immer schicken (auch bei Duplikat) — sonst kann eingetragener
  // User nie wieder reinkommen
  await sendMail(email, magicLinkSubject(), magicLinkHtml(magicUrl, raumQuestion));
  return { duplicate };
}

/* ───────────────── Mail-Templates ───────────────── */

function callConfirmedSubject(): string {
  return 'Du bist dabei.';
}

function callConfirmedHtml(raum: CallRaum): string {
  return mailShell(`
    <h1 style="font-size:24px;font-weight:400;font-style:italic;margin:0 0 24px;color:#1E180C;">Super, du bist dabei.</h1>
    <p>Am ${escapeHtml(raum.callMailDate)} treffen wir uns zum Souleya Gespräch. Kleine Runde, ${raum.callDurationMin} Minuten, eine Frage.</p>
    <p style="margin-top:24px;font-style:italic;color:#7A6014;border-left:3px solid #C8A96E;padding:8px 0 8px 16px;">${escapeHtml(raum.question)}</p>
    <p>Du musst nichts vorbereiten. Komm einfach so wie du bist.</p>
    <p style="text-align:center;margin:32px 0;">
      <a href="${raum.callCalendarLink}" style="display:inline-block;background:#C8A96E;color:#fff;padding:14px 28px;border-radius:24px;text-decoration:none;font-size:15px;">
        Termin im Kalender öffnen
      </a>
    </p>
    <p style="font-size:13px;color:#7A6E5A;text-align:center;">
      Falls der Button nicht geht: <a href="${raum.callCalendarLink}" style="color:#9A7218;">${raum.callCalendarLink}</a>
    </p>
    <p style="margin-top:32px;">Bis bald.<br>Steffi und Andreas</p>
  `);
}

function callWaitlistSubject(): string {
  return 'Schade — aber wir machen einen zweiten Termin.';
}

function callWaitlistHtml(): string {
  return mailShell(`
    <h1 style="font-size:24px;font-weight:400;font-style:italic;margin:0 0 24px;color:#1E180C;">Schade — der Raum ist leider schon voll.</h1>
    <p>Aber: wir haben so viele Registrierungen bekommen, dass wir uns schon für einen zweiten Termin entschieden haben.</p>
    <p>Sobald das Datum steht, schicken wir dir eine Mail mit dem Link. Du musst nichts weiter tun.</p>
    <p style="margin-top:32px;">Bis bald.<br>Steffi und Andreas</p>
  `);
}

function magicLinkSubject(): string {
  return 'Dein Link zu Souleya.';
}

function magicLinkHtml(magicUrl: string, raumQuestion: string): string {
  return mailShell(`
    <h1 style="font-size:24px;font-weight:400;font-style:italic;margin:0 0 16px;color:#1E180C;">Schön, dass du mitschreiben willst.</h1>
    <p>Klick auf den Link und du kannst deinen Gedanken im Raum hinterlassen. Kein Passwort nötig.</p>
    <p style="margin-top:16px;font-style:italic;color:#7A6014;border-left:3px solid #C8A96E;padding:8px 0 8px 16px;">${escapeHtml(raumQuestion)}</p>
    <p style="text-align:center;margin:32px 0;">
      <a href="${magicUrl}" style="display:inline-block;background:#C8A96E;color:#fff;padding:14px 28px;border-radius:24px;text-decoration:none;font-size:15px;">
        Jetzt mitschreiben
      </a>
    </p>
    <p style="font-size:13px;color:#7A6E5A;text-align:center;">
      Falls der Button nicht geht: <a href="${magicUrl}" style="color:#9A7218;">${magicUrl}</a>
    </p>
    <p style="font-size:13px;color:#9A9080;text-align:center;font-style:italic;margin-top:24px;">
      Du bleibst eingeloggt — beim nächsten Besuch musst du keinen neuen Link anfordern.
    </p>
    <p style="margin-top:32px;">Bis gleich.<br>Steffi und Andreas</p>
  `);
}

export function mailShell(inner: string): string {
  return `<!DOCTYPE html>
<html lang="de"><head><meta charset="UTF-8"><title>Souleya</title></head>
<body style="margin:0;padding:0;background:#F5EFE6;font-family:Georgia,'Times New Roman',serif;color:#1E180C;line-height:1.7;">
  <div style="max-width:560px;margin:0 auto;padding:32px 28px;">
    <div style="text-align:center;margin-bottom:24px;">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="48" height="48">
        <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#A8894E"/><stop offset="100%" stop-color="#D4BC8B"/></linearGradient></defs>
        <circle cx="50" cy="50" r="36" fill="none" stroke="url(#g)" stroke-width="9" stroke-linecap="round" stroke-dasharray="196 30" stroke-dashoffset="15"/>
      </svg>
      <div style="font-size:18px;letter-spacing:1.5px;margin-top:8px;">Souleya</div>
    </div>
    ${inner}
    <div style="margin-top:48px;padding-top:24px;border-top:1px solid rgba(200,169,110,0.3);font-size:11px;color:#7A6E5A;text-align:center;line-height:1.6;">
      Souleya · umah.ee OÜ · Sakala tn 7-2, 10141 Tallinn, Estland<br>
      <a href="mailto:hello@souleya.com" style="color:#9A7218;">hello@souleya.com</a> · <a href="https://souleya.com" style="color:#9A7218;">souleya.com</a>
    </div>
  </div>
</body></html>`;
}

export function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
