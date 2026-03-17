'use client';

import { useState } from 'react';

const FAQ_ITEMS = [
  {
    q: 'Was genau ist Souleya?',
    a: 'Souleya ist eine App für Menschen, die sich für persönliche Entwicklung, Gesundheit und Spiritualität interessieren. Du findest dort Gleichgesinnte (Circles), kannst Kurse bei Mentoren buchen (Studio) und an echten Treffen vor Ort teilnehmen (Events). Alles in einer App statt auf zehn verschiedenen Plattformen.',
  },
  {
    q: 'Was ist First Light?',
    a: 'First Light ist ein permanenter Status für die ersten 1.000 Menschen, die sich vor dem Launch registrieren. Du startest auf VIP-Level 2 (Awakened Soul), bekommst einen einzigartigen Enso-Ring um dein Profilbild und kannst schon vor dem Launch Seeds sammeln. Dieser Status wird nach dem Launch nie wieder vergeben.',
  },
  {
    q: 'Was sind Seeds?',
    a: 'Seeds sind die Währung innerhalb von Souleya. Du verdienst sie durch Engagement – Artikel liken, Souleya auf Social Media teilen, Freunde einladen. Mit Seeds kannst du später Kurse buchen, Mentoren bezahlen und an exklusiven Events teilnehmen. 1 Seed = 0,01 €.',
  },
  {
    q: 'Wann startet Souleya?',
    a: 'Der offizielle Launch ist für Sommer 2026 geplant. Bis dahin bauen wir die Community auf, veröffentlichen Impulse und geben dir die Möglichkeit, schon vor dem Start Seeds zu sammeln und deinen Status aufzubauen.',
  },
  {
    q: 'Kostet die Anmeldung etwas?',
    a: 'Nein. Die Registrierung ist kostenlos. Du gibst nur deine E-Mail-Adresse an und bist dabei. Nach dem Launch wird es ein Membership-Modell geben – aber als First Light hast du von Anfang an Vorteile.',
  },
  {
    q: 'Wie kann ich vorab Seeds verdienen?',
    a: 'Nach der Registrierung erhältst du Zugang zu deinem Dashboard mit einem persönlichen Empfehlungs-Link. Lade Freunde ein und verdiene Seeds, die du später in Kurse tauschen kannst.',
  },
];

export default function FaqAccordion() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="section--apricot py-20 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: 'var(--gold-text)' }}>
            Fragen &amp; Antworten
          </p>
          <h2 className="font-heading text-2xl md:text-3xl italic" style={{ color: 'var(--text-h)' }}>
            Häufige Fragen
          </h2>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = activeIndex === i;
            return (
              <div
                key={i}
                className="rounded-2xl border overflow-hidden transition-all"
                style={{
                  background: 'var(--glass)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderColor: isOpen ? 'var(--gold-text)' : 'var(--glass-border)',
                }}
              >
                <button
                  onClick={() => setActiveIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="font-medium text-sm pr-4" style={{ color: 'var(--text-h)' }}>
                    {item.q}
                  </span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4 shrink-0 transition-transform"
                    style={{
                      color: 'var(--text-muted)',
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  >
                    <path d="M6 9l6 6l6 -6" />
                  </svg>
                </button>
                <div
                  className="overflow-hidden transition-all"
                  style={{
                    maxHeight: isOpen ? '300px' : '0',
                    opacity: isOpen ? 1 : 0,
                  }}
                >
                  <p
                    className="px-5 pb-4 text-sm leading-relaxed"
                    style={{ color: 'var(--text-body)' }}
                  >
                    {item.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
