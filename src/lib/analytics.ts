/**
 * Souleya Analytics – Wrapper fuer @vercel/analytics
 *
 * - Filtert internen Traffic (is_admin, is_beta_tester) via beforeSend
 * - Speichert UTM-Parameter aus der URL in sessionStorage (ueberleben Navigation)
 * - Custom-Event-Helpers fuer einheitliches Tracking
 */

import { track } from '@vercel/analytics';

// ── UTM-Parameter aus URL lesen und in sessionStorage speichern ──

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;
const UTM_STORAGE_KEY = 'souleya_utm';

export interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

/**
 * Liest UTM-Parameter aus der aktuellen URL und speichert sie in sessionStorage.
 * Sollte einmalig beim App-Start aufgerufen werden (AnalyticsProvider).
 */
export function captureUtmParams(): UtmParams | null {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  const utm: UtmParams = {};
  let hasAny = false;

  for (const key of UTM_KEYS) {
    const val = params.get(key);
    if (val) {
      utm[key] = val;
      hasAny = true;
    }
  }

  // Auch ?ref= und ?r= als utm_source behandeln (Kurzform)
  if (!utm.utm_source) {
    const ref = params.get('ref') || params.get('r');
    if (ref) {
      utm.utm_source = ref;
      hasAny = true;
    }
  }

  if (hasAny) {
    try {
      sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utm));
    } catch {
      // Private Browsing etc.
    }
  }

  return hasAny ? utm : null;
}

/**
 * Gibt die gespeicherten UTM-Parameter zurueck (oder null).
 */
export function getStoredUtm(): UtmParams | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(UTM_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}


// ── Internal Traffic Detection ──

const INTERNAL_COOKIE = 'souleya_internal';

/**
 * Markiert den aktuellen Browser als internen Traffic.
 * Wird vom AnalyticsProvider aufgerufen wenn is_admin oder is_beta_tester.
 */
export function markAsInternal() {
  if (typeof document === 'undefined') return;
  // Cookie fuer 1 Jahr, SameSite=Lax
  document.cookie = `${INTERNAL_COOKIE}=1; path=/; max-age=31536000; SameSite=Lax`;
}

/**
 * Prueft ob der aktuelle Browser als interner Traffic markiert ist.
 */
export function isInternalTraffic(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.includes(`${INTERNAL_COOKIE}=1`);
}

/**
 * beforeSend-Filter fuer Vercel Analytics.
 * Gibt null zurueck (= Event verwerfen) wenn interner Traffic.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function analyticsBeforeSend(event: any) {
  if (isInternalTraffic()) return null;
  return event;
}


// ── Custom Event Tracking ──
// Alle Events hier zentralisieren fuer einheitliche Benennung.

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Signup abgeschlossen (Magic Link verifiziert)
 * Feuert sowohl Vercel Analytics als auch Google Analytics sign_up Event.
 */
export function trackSignup(source?: string) {
  const utm = getStoredUtm();
  track('signup', {
    source: source || utm?.utm_source || 'direct',
    medium: utm?.utm_medium || 'none',
    campaign: utm?.utm_campaign || 'none',
  });

  // Google Analytics Conversion-Event
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'sign_up', {
      method: 'magic_link',
      event_category: 'engagement',
      ...(utm?.utm_source ? { campaign_source: utm.utm_source } : {}),
      ...(utm?.utm_campaign ? { campaign_name: utm.utm_campaign } : {}),
    });
  }
}

/**
 * Login (wiederkehrender User)
 */
export function trackLogin() {
  const utm = getStoredUtm();
  track('login', {
    source: utm?.utm_source || 'direct',
    returning: true,
  });
}

/**
 * Pulse erstellt
 */
export function trackPulseCreated() {
  track('pulse_created');
}

/**
 * Event erstellt
 */
export function trackEventCreated(category?: string) {
  track('event_created', { category: category || 'unknown' });
}

/**
 * Connection Request gesendet
 */
export function trackConnectionRequest() {
  track('connection_request');
}

/**
 * Chat-Nachricht gesendet
 */
export function trackMessageSent(channelType?: string) {
  track('message_sent', { channel_type: channelType || 'unknown' });
}

/**
 * Place erstellt
 */
export function trackPlaceCreated() {
  track('place_created');
}

/**
 * Blog-Artikel geoeffnet (oeffentliche Seite)
 */
export function trackBlogView(slug: string) {
  const utm = getStoredUtm();
  track('blog_view', {
    slug,
    source: utm?.utm_source || document.referrer || 'direct',
  });
}

/**
 * CTA-Button geklickt (z.B. "Jetzt beitreten" auf Landing)
 */
export function trackCtaClick(ctaName: string, location: string) {
  const utm = getStoredUtm();
  track('cta_click', {
    cta: ctaName,
    location,
    source: utm?.utm_source || 'direct',
    campaign: utm?.utm_campaign || 'none',
  });
}

/**
 * Seite besucht (fuer oeffentliche Seiten, ergaenzt Vercel auto-tracking)
 */
export function trackPageView(page: string) {
  const utm = getStoredUtm();
  if (utm) {
    track('page_with_utm', {
      page,
      ...utm,
    });
  }
}
