import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Preise | Souleya',
  description: 'Souleya Mitgliedschaft – 20 EUR/Monat oder 200 EUR/Jahr. Circles, Studio, Events, Mentoren und mehr.',
};

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={16} height={16} className="shrink-0 mt-0.5" style={{ color: 'var(--gold-text)' }}>
      <path d="M5 12l5 5l10 -10" />
    </svg>
  );
}

export default function PreisePage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      {/* ── Hero ── */}
      <div className="text-center mb-14">
        <h1
          className="font-heading text-3xl md:text-4xl italic mb-3"
          style={{ color: 'var(--text-h)' }}
        >
          Einfach. Ehrlich. Fair.
        </h1>
        <p className="text-base max-w-xl mx-auto" style={{ color: 'var(--text-sec)' }}>
          Ein Preis, alles drin. Keine versteckten Kosten, kein Kleingedrucktes.
        </p>
      </div>

      {/* ── Pricing Cards ── */}
      <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-16">

        {/* Monatlich */}
        <div
          className="rounded-2xl border p-7 flex flex-col"
          style={{
            background: 'var(--glass)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderColor: 'var(--glass-border)',
          }}
        >
          <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>
            Monatlich
          </p>
          <p className="font-heading text-3xl italic mb-1" style={{ color: 'var(--text-h)' }}>
            20 € <span className="text-base font-normal" style={{ color: 'var(--text-muted)' }}>/ Monat</span>
          </p>
          <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>
            Monatlich kündbar, keine Mindestlaufzeit
          </p>

          <ul className="space-y-3 text-sm mb-8 flex-1" style={{ color: 'var(--text-body)' }}>
            {[
              'Voller Zugang zu allem',
              'Circles, Chat, Events, Studio',
              'Seeds verdienen und einsetzen',
              'Jederzeit kündbar',
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <CheckIcon />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <Link
            href="/login"
            className="block text-center text-sm font-medium py-3 rounded-full border transition-all hover:shadow-md"
            style={{
              borderColor: 'var(--glass-border)',
              color: 'var(--text-body)',
            }}
          >
            Jetzt starten
          </Link>
        </div>

        {/* Jährlich – hervorgehoben */}
        <div
          className="rounded-2xl border p-7 flex flex-col relative overflow-hidden"
          style={{
            background: 'var(--glass)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderColor: 'var(--gold-text)',
            boxShadow: '0 0 40px rgba(200, 169, 110, 0.12)',
          }}
        >
          {/* Diagonales Spar-Banner – rechte obere Ecke */}
          <div
            className="absolute z-10 font-medium text-xs uppercase tracking-wider text-center"
            style={{
              top: '28px',
              right: '-42px',
              width: '200px',
              padding: '8px 0',
              background: 'linear-gradient(135deg, #A8894E, #C8A96E, #D4BC8B)',
              color: '#fff',
              transform: 'rotate(45deg)',
              boxShadow: '0 2px 8px rgba(168, 137, 78, 0.4)',
              letterSpacing: '0.08em',
            }}
          >
            Spare 40 €
          </div>

          {/* 2 Monate geschenkt Hinweis */}
          <div
            className="text-center rounded-xl py-3 px-4 mb-5 mt-2"
            style={{ background: 'var(--gold-bg)' }}
          >
            <p className="font-heading text-lg italic" style={{ color: 'var(--gold-text)' }}>
              2 Monate geschenkt
            </p>
          </div>

          <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: 'var(--gold-text)' }}>
            Jährlich
          </p>
          <div className="flex items-baseline gap-3 mb-1">
            <p className="font-heading text-3xl italic" style={{ color: 'var(--text-h)' }}>
              200 €
            </p>
            <p className="text-base line-through" style={{ color: 'var(--text-muted)' }}>
              240 €
            </p>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>/ Jahr</span>
          </div>
          <div className="mb-6" />

          <ul className="space-y-3 text-sm mb-8 flex-1" style={{ color: 'var(--text-body)' }}>
            {[
              '12 Monate Wachstum mit Gleichgesinnten',
              'Hunderte Events, Sessions und Begegnungen',
              'Entwicklung auf allen Ebenen – ohne Unterbrechung',
              'Sabbatical-Modus: bis zu 2 Monate pausieren',
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <CheckIcon />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <Link
            href="/login"
            className="block text-center text-sm font-medium py-3 rounded-full transition-all hover:shadow-md"
            style={{
              background: 'var(--gold-text)',
              color: '#fff',
            }}
          >
            Jahresabo wählen
          </Link>
        </div>
      </div>

      {/* ── Mentor-CTA ── */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="font-heading text-2xl italic mb-4" style={{ color: 'var(--text-h)' }}>
          Für Mentoren und Coaches
        </h2>
        <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-body)' }}>
          Du bist Coach, Therapeut oder Mentor? Bei Souleya erreichst du Menschen, die wirklich
          wachsen wollen. Du bestimmst deine Preise, wir kümmern uns um die Plattform.
        </p>
        <a
          href="mailto:hello@souleya.com?subject=Mentor bei Souleya"
          className="inline-block text-sm font-medium px-6 py-3 rounded-full border transition-all hover:shadow-md"
          style={{
            borderColor: 'var(--gold-text)',
            color: 'var(--gold-text)',
          }}
        >
          Kontakt aufnehmen
        </a>
      </div>

      {/* ── FAQ – nur 3 Fragen ── */}
      <div className="max-w-2xl mx-auto">
        <h2 className="font-heading text-2xl italic mb-6 text-center" style={{ color: 'var(--text-h)' }}>
          Häufige Fragen
        </h2>
        <div className="space-y-4 text-sm" style={{ color: 'var(--text-body)' }}>
          {[
            {
              q: 'Kann ich jederzeit kündigen?',
              a: 'Ja. Das Monatsabo ist monatlich kündbar, ohne Mindestlaufzeit. Beim Jahresabo kannst du 4 Wochen vor Ablauf kündigen.',
            },
            {
              q: 'Kann ich mein Abo pausieren?',
              a: 'Ja, mit dem Sabbatical-Modus kannst du bis zu 2 Monate pro Jahr pausieren – ohne Kosten und ohne Statusverlust.',
            },
            {
              q: 'Was sind Seeds?',
              a: 'Seeds sind Souleyas interne Währung. Du verdienst sie durch Aktivität und kannst damit Premium-Inhalte wie Mentoren-Sessions oder Kurse freischalten.',
            },
          ].map(({ q, a }) => (
            <div
              key={q}
              className="rounded-2xl border p-5"
              style={{
                background: 'var(--glass)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderColor: 'var(--glass-border)',
              }}
            >
              <p className="font-medium mb-2" style={{ color: 'var(--text-h)' }}>{q}</p>
              <p>{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
