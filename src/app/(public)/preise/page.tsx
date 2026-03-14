import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Preise | Souleya',
  description: 'Souleya Mitgliedschaft – Kostenlos starten, Premium für 20 EUR/Monat. Mentoren, Kurse, Events und mehr.',
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
      <div className="text-center mb-14">
        <h1
          className="font-heading text-3xl md:text-4xl italic mb-3"
          style={{ color: 'var(--text-h)' }}
        >
          Einfach. Ehrlich. Fair.
        </h1>
        <p className="text-base max-w-xl mx-auto" style={{ color: 'var(--text-sec)' }}>
          Starte kostenlos und entscheide selbst, wann du bereit bist für mehr.
          Keine versteckten Kosten, kein Kleingedrucktes.
        </p>
      </div>

      {/* ── Pricing Cards ── */}
      <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-16">

        {/* Kostenlos */}
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
            Kostenlos
          </p>
          <p className="font-heading text-3xl italic mb-1" style={{ color: 'var(--text-h)' }}>
            0 EUR
          </p>
          <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>
            für immer
          </p>

          <ul className="space-y-3 text-sm mb-8 flex-1" style={{ color: 'var(--text-body)' }}>
            {[
              'Profil erstellen und verwalten',
              'Community entdecken',
              'Beiträge lesen und liken',
              'Öffentliche Events sehen',
              'Direktnachrichten (begrenzt)',
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
            Kostenlos starten
          </Link>
        </div>

        {/* Premium */}
        <div
          className="rounded-2xl border p-7 flex flex-col relative overflow-hidden"
          style={{
            background: 'var(--glass)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderColor: 'var(--gold-text)',
            boxShadow: '0 0 40px rgba(200, 169, 110, 0.08)',
          }}
        >
          {/* Badge */}
          <span
            className="absolute top-4 right-4 text-[10px] font-medium uppercase tracking-wide px-3 py-1 rounded-full"
            style={{ background: 'var(--gold-bg)', color: 'var(--gold-text)' }}
          >
            Empfohlen
          </span>

          <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: 'var(--gold-text)' }}>
            Premium
          </p>
          <p className="font-heading text-3xl italic mb-1" style={{ color: 'var(--text-h)' }}>
            20 EUR <span className="text-base font-normal" style={{ color: 'var(--text-muted)' }}>/ Monat</span>
          </p>
          <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>
            oder 200 EUR/Jahr (2 Monate gratis)
          </p>

          <ul className="space-y-3 text-sm mb-8 flex-1" style={{ color: 'var(--text-body)' }}>
            {[
              'Alles aus der kostenlosen Version',
              'Unbegrenzte Nachrichten und Chats',
              'Circles erstellen und beitreten',
              'Events erstellen und teilnehmen',
              'Studio: Kurse und Mentoren-Sessions',
              'Seeds verdienen und einsetzen',
              'Erweiterte Profilfunktionen',
              'Prioritäts-Support',
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
            Jetzt Premium werden
          </Link>
        </div>
      </div>

      {/* ── Mentor-Modell ── */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="font-heading text-2xl italic mb-4" style={{ color: 'var(--text-h)' }}>
          Für Mentoren und Coaches
        </h2>
        <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-body)' }}>
          Du bist Coach, Therapeut oder Mentor? Bei Souleya erreichst du Menschen, die wirklich
          wachsen wollen. Du bestimmst deine Preise, wir kümmern uns um die Plattform. Faire
          Konditionen, keine Einstiegshürden.
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

      {/* ── FAQ ── */}
      <div className="max-w-2xl mx-auto">
        <h2 className="font-heading text-2xl italic mb-6 text-center" style={{ color: 'var(--text-h)' }}>
          Häufige Fragen
        </h2>
        <div className="space-y-4 text-sm" style={{ color: 'var(--text-body)' }}>
          {[
            {
              q: 'Kann ich wirklich kostenlos starten?',
              a: 'Ja, Souleya ist kostenlos nutzbar. Du kannst die Community erkunden, Beiträge lesen und dein Profil einrichten – ganz ohne Zahlungsdaten.',
            },
            {
              q: 'Was passiert mit meinen Daten, wenn ich kündige?',
              a: 'Du kannst deine Daten jederzeit exportieren. Nach Kündigung werden sie gemäss unserer Datenschutzerklärung gelöscht.',
            },
            {
              q: 'Kann ich das Abo pausieren?',
              a: 'Ja, mit dem Sabbatical-Modus kannst du dein Abo bis zu 2 Monate pro Jahr pausieren – ohne Kosten und ohne Statusverlust.',
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
