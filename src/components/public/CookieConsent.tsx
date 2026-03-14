'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type ConsentState = 'undecided' | 'necessary' | 'all';

/* ── Pixel-Loader ──
 * Pixel-IDs muessen noch eingetragen werden.
 * Sobald verfuegbar: Script-Loader aktivieren und IDs einfuegen.
 */
function loadMarketingPixels() {
  if (typeof window === 'undefined') return;
  // Meta Pixel, TikTok Pixel, Pinterest Tag – IDs werden spaeter ergaenzt
  // Scripts werden erst geladen wenn die Pixel-IDs konfiguriert sind
}

export default function CookieConsent() {
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [marketingChecked, setMarketingChecked] = useState(false);

  // Consent aus localStorage laden
  useEffect(() => {
    const stored = localStorage.getItem('souleya_cookie_consent') as ConsentState | null;
    if (stored) {
      setConsent(stored);
      if (stored === 'all') loadMarketingPixels();
    } else {
      setConsent('undecided');
    }
  }, []);

  const saveConsent = (state: ConsentState) => {
    localStorage.setItem('souleya_cookie_consent', state);
    setConsent(state);
    setShowSettings(false);
    if (state === 'all') loadMarketingPixels();
  };

  // Cookie-Einstellungen öffnen (global event)
  useEffect(() => {
    const handler = () => {
      setShowSettings(true);
      setMarketingChecked(consent === 'all');
    };
    document.addEventListener('open-cookie-settings', handler);

    // data-cookie-settings Buttons
    const btns = document.querySelectorAll('[data-cookie-settings]');
    btns.forEach((btn) => btn.addEventListener('click', handler));

    return () => {
      document.removeEventListener('open-cookie-settings', handler);
      btns.forEach((btn) => btn.removeEventListener('click', handler));
    };
  }, [consent]);

  // Nichts anzeigen solange noch geladen oder bereits entschieden
  if (consent === null || (consent !== 'undecided' && !showSettings)) return null;

  return (
    <>
      {/* ── Banner ── */}
      {consent === 'undecided' && !showSettings && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 border-t p-5"
          style={{
            background: 'var(--bg-elevated)',
            borderColor: 'var(--glass-border)',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
          }}
        >
          <div className="max-w-3xl mx-auto">
            <p className="font-medium text-sm mb-1" style={{ color: 'var(--text-h)' }}>
              Wir verwenden Cookies
            </p>
            <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--text-body)' }}>
              Wir nutzen notwendige Cookies, damit unsere Website funktioniert. Mit deiner
              Einwilligung setzen wir zusätzlich Marketing-Cookies ein, um unsere Reichweite
              zu messen (Meta, TikTok, Pinterest). Du kannst deine Einwilligung jederzeit
              widerrufen.{' '}
              <Link href="/datenschutz" className="underline" style={{ color: 'var(--gold-text)' }}>
                Datenschutzerklärung
              </Link>
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => saveConsent('all')}
                className="px-5 py-2 rounded-full text-xs font-medium transition-all hover:shadow-md"
                style={{ background: 'var(--gold-text)', color: '#fff' }}
              >
                Alle akzeptieren
              </button>
              <button
                onClick={() => saveConsent('necessary')}
                className="px-5 py-2 rounded-full text-xs font-medium border transition-colors"
                style={{ borderColor: 'var(--glass-border)', color: 'var(--text-body)' }}
              >
                Nur notwendige
              </button>
              <button
                onClick={() => { setShowSettings(true); setMarketingChecked(false); }}
                className="px-5 py-2 rounded-full text-xs font-medium transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                Einstellungen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Settings Modal ── */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div
            className="rounded-2xl border p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
            style={{
              background: 'var(--bg-elevated)',
              borderColor: 'var(--glass-border)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg italic" style={{ color: 'var(--text-h)' }}>
                Cookie-Einstellungen
              </h2>
              <button onClick={() => setShowSettings(false)} style={{ color: 'var(--text-muted)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M18 6l-12 12" /><path d="M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-xs mb-5 leading-relaxed" style={{ color: 'var(--text-body)' }}>
              Hier kannst du deine Cookie-Einstellungen anpassen. Notwendige Cookies können
              nicht deaktiviert werden, da sie für die Funktion der Website erforderlich sind.
            </p>

            {/* Notwendige Cookies */}
            <div className="rounded-xl border p-4 mb-3" style={{ borderColor: 'var(--glass-border)' }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium" style={{ color: 'var(--text-h)' }}>
                  Notwendige Cookies
                </p>
                <span
                  className="text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--gold-bg)', color: 'var(--gold-text)' }}
                >
                  Immer aktiv
                </span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Diese Cookies sind für den Betrieb der Website erforderlich und können nicht
                deaktiviert werden. Sie speichern keine personenbezogenen Daten.
              </p>
            </div>

            {/* Marketing */}
            <div className="rounded-xl border p-4 mb-5" style={{ borderColor: 'var(--glass-border)' }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium" style={{ color: 'var(--text-h)' }}>
                  Marketing &amp; Social Media
                </p>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={marketingChecked}
                    onChange={(e) => setMarketingChecked(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div
                    className="w-9 h-5 rounded-full transition-colors peer-checked:bg-[var(--gold-text)]"
                    style={{ background: marketingChecked ? 'var(--gold-text)' : 'var(--glass-border)' }}
                  >
                    <div
                      className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                      style={{ transform: marketingChecked ? 'translateX(16px)' : 'translateX(0)' }}
                    />
                  </div>
                </label>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Wir setzen Tracking-Pixel von Meta (Facebook &amp; Instagram), TikTok und
                Pinterest ein, um die Wirksamkeit unserer Marketingkampagnen zu messen. Diese
                Dienste können Daten in die USA übermitteln. Weitere Details:{' '}
                <Link href="/datenschutz" className="underline" style={{ color: 'var(--gold-text)' }}>
                  Datenschutzerklärung
                </Link>
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => saveConsent('all')}
                className="flex-1 px-4 py-2.5 rounded-full text-xs font-medium transition-all hover:shadow-md"
                style={{ background: 'var(--gold-text)', color: '#fff' }}
              >
                Alle akzeptieren
              </button>
              <button
                onClick={() => saveConsent(marketingChecked ? 'all' : 'necessary')}
                className="flex-1 px-4 py-2.5 rounded-full text-xs font-medium border transition-colors"
                style={{ borderColor: 'var(--glass-border)', color: 'var(--text-body)' }}
              >
                Auswahl speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
