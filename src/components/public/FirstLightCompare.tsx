'use client';

import { useState } from 'react';

/**
 * FirstLightCompare – Kompakte Vergleichskarten (Early / First Light / Regulaer)
 * Direkt unter dem Fortschrittsbalken im Hero.
 * Standardmaessig zugeklappt, per Akkordeon aufklappbar.
 */

interface Feature {
  included: boolean;
  text: string;
}

interface Tier {
  key: string;
  spots: string;
  title: string;
  soulBadge: string;
  highlight?: boolean;
  muted?: boolean;
  recommendLabel?: string;
  features: Feature[];
}

const TIERS: Tier[] = [
  {
    key: 'early',
    spots: 'Plätze 1 – 200',
    title: 'First Light Early',
    soulBadge: 'Startet auf Soul 3',
    highlight: true,
    recommendLabel: 'Empfohlen',
    features: [
      { included: true, text: 'Sofort Event-Recht ab Launch – eigene Events vom ersten Tag an' },
      { included: true, text: 'Sichtbarkeit im allgemeinen Feed ab Tag 1' },
      { included: true, text: 'Permanenter First-Light-Status auf deinem Profil' },
      { included: true, text: '33 Seeds beim Start + Referral-Link sofort aktiv' },
      { included: true, text: 'Reputation aufbauen, bevor alle anderen starten' },
    ],
  },
  {
    key: 'firstlight',
    spots: 'Plätze 201 – 500',
    title: 'First Light',
    soulBadge: 'Startet auf Soul 2',
    features: [
      { included: true, text: 'Event-Recht nach 1 aktivem Monat (Soul 3 durch Teilnahme)' },
      { included: true, text: 'Permanenter First-Light-Status auf deinem Profil' },
      { included: true, text: '33 Seeds beim Start + Referral-Link aktiv' },
      { included: true, text: 'Vor dem grossen Ansturm dabei – nie wieder vergeben nach Launch' },
      { included: false, text: 'Kein sofortiges Event-Recht ab Launch' },
    ],
  },
  {
    key: 'regular',
    spots: 'Ab Launch',
    title: 'Regulär',
    soulBadge: 'Startet auf Soul 1',
    muted: true,
    features: [
      { included: false, text: 'Kein First-Light-Status – wird nach Launch nicht mehr vergeben' },
      { included: false, text: 'Event-Recht erst nach regulaerem Weg zu Soul 3' },
      { included: false, text: 'Kein Startbonus – ohne Seeds-Vorsprung' },
      { included: false, text: 'Reputation aufbauen waehrend andere etabliert sind' },
      { included: false, text: 'Kein permanenter Sonderstatus' },
    ],
  },
];

export default function FirstLightCompare() {
  const [openKey, setOpenKey] = useState<string | null>(null);

  const toggle = (key: string) => {
    setOpenKey((prev) => (prev === key ? null : key));
  };

  return (
    <div className="mt-6 w-full max-w-lg mx-auto">
      {/* Headline */}
      <p
        className="text-center text-xs font-medium mb-3"
        style={{ color: 'rgba(255,255,255,0.5)' }}
      >
        Warum die ersten 500 Plätze nicht gleich sind
      </p>

      {/* Accordion Cards */}
      <div className="flex flex-col gap-2">
        {TIERS.map((tier) => {
          const isOpen = openKey === tier.key;

          return (
            <div
              key={tier.key}
              className="rounded-xl overflow-hidden transition-all"
              style={{
                background: tier.highlight
                  ? 'rgba(200, 169, 110, 0.10)'
                  : 'rgba(255, 255, 255, 0.04)',
                border: tier.highlight
                  ? '1px solid rgba(200, 169, 110, 0.30)'
                  : '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              {/* Header (immer sichtbar, klickbar) */}
              <button
                onClick={() => toggle(tier.key)}
                className="w-full flex items-center justify-between px-4 py-3 border-none bg-transparent cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  {/* Spots Pill */}
                  <span
                    className="text-[9px] font-label font-medium tracking-wider uppercase px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{
                      background: tier.muted ? 'rgba(255,255,255,0.05)' : 'rgba(200,169,110,0.12)',
                      color: tier.muted ? 'rgba(255,255,255,0.3)' : 'var(--gold-text, #C8A96E)',
                      border: tier.muted
                        ? '1px solid rgba(255,255,255,0.08)'
                        : '1px solid rgba(200,169,110,0.20)',
                    }}
                  >
                    {tier.spots}
                  </span>

                  {/* Title + Soul Badge */}
                  <div>
                    <span
                      className="text-sm font-medium"
                      style={{
                        color: tier.muted ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.9)',
                      }}
                    >
                      {tier.title}
                    </span>
                    <span
                      className="ml-2 text-[10px]"
                      style={{
                        color: tier.muted ? 'rgba(255,255,255,0.2)' : 'var(--gold-text, #C8A96E)',
                      }}
                    >
                      {tier.soulBadge}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Empfohlen Badge */}
                  {tier.recommendLabel && (
                    <span
                      className="text-[8px] font-label tracking-wider uppercase px-2 py-0.5 rounded-full hidden sm:inline-block"
                      style={{
                        color: 'var(--gold-text, #C8A96E)',
                        background: 'rgba(200,169,110,0.15)',
                        border: '1px solid rgba(200,169,110,0.25)',
                      }}
                    >
                      {tier.recommendLabel}
                    </span>
                  )}

                  {/* Chevron */}
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-transform duration-200 flex-shrink-0"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    <path d="M6 9l6 6l6 -6" />
                  </svg>
                </div>
              </button>

              {/* Expandable Content */}
              <div
                className="overflow-hidden transition-all duration-300 ease-out"
                style={{
                  maxHeight: isOpen ? '400px' : '0',
                  opacity: isOpen ? 1 : 0,
                }}
              >
                <div className="px-4 pb-4 pt-1 flex flex-col gap-2">
                  {tier.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span
                        className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[9px]"
                        style={{
                          background: f.included
                            ? 'rgba(200, 169, 110, 0.18)'
                            : 'rgba(255, 255, 255, 0.05)',
                          color: f.included
                            ? 'var(--gold-text, #C8A96E)'
                            : 'rgba(255, 255, 255, 0.2)',
                        }}
                      >
                        {f.included ? '✓' : '–'}
                      </span>
                      <span
                        className="text-xs leading-relaxed"
                        style={{
                          color: f.included
                            ? 'rgba(255, 255, 255, 0.7)'
                            : 'rgba(255, 255, 255, 0.3)',
                        }}
                      >
                        {f.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
