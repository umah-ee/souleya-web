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
          Monatlich kündbar oder spare mit dem Jahresabo.
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
            20 EUR <span className="text-base font-normal" style={{ color: 'var(--text-muted)' }}>/ Monat</span>
          </p>
          <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>
            monatlich kündbar, keine Mindestlaufzeit
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

        {/* Jährlich */}
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
            Spare 40 EUR
          </span>

          <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: 'var(--gold-text)' }}>
            Jährlich
          </p>
          <p className="font-heading text-3xl italic mb-1" style={{ color: 'var(--text-h)' }}>
            200 EUR <span className="text-base font-normal" style={{ color: 'var(--text-muted)' }}>/ Jahr</span>
          </p>
          <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>
            entspricht 16,67 EUR/Monat – 2 Monate gratis
          </p>

          <ul className="space-y-3 text-sm mb-8 flex-1" style={{ color: 'var(--text-body)' }}>
            {[
              'Alles aus dem Monatsabo',
              '2 Monate geschenkt',
              'Sabbatical-Modus (bis zu 2 Monate pausieren)',
              'Dein Engagement für deine Reise',
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

      {/* ── Emotionale Benefits ── */}
      <section className="max-w-3xl mx-auto mb-16">
        <h2 className="font-heading text-2xl italic mb-8 text-center" style={{ color: 'var(--text-h)' }}>
          Was dich bei Souleya erwartet
        </h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {[
            {
              title: 'Verbindung, die bleibt',
              desc: 'Finde Gleichgesinnte, die deinen Weg verstehen – und verliere sie nicht nach dem nächsten Retreat.',
            },
            {
              title: 'Wachstum in deinem Tempo',
              desc: 'Kurse, Mentoren und Sessions, die dich da abholen, wo du gerade stehst. Kein Druck, kein Vergleich.',
            },
            {
              title: 'Ein Ort, an dem du gesehen wirst',
              desc: 'Keine Algorithmen, kein Lärm. Eine Community, die dich trägt – so wie du bist.',
            },
            {
              title: 'Dein Beitrag zählt',
              desc: 'Mit Seeds belohnst du Inhalte, die dich berühren, und unterstützt Mentoren direkt.',
            },
          ].map(({ title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border p-6"
              style={{
                background: 'var(--glass)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderColor: 'var(--glass-border)',
              }}
            >
              <p className="font-medium mb-2" style={{ color: 'var(--text-h)' }}>{title}</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-body)' }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Social Proof / Zugehörigkeit ── */}
      <section className="max-w-2xl mx-auto mb-16 text-center">
        <h2 className="font-heading text-2xl italic mb-6" style={{ color: 'var(--text-h)' }}>
          Souleya ist für Menschen, die …
        </h2>
        <div className="space-y-3 text-sm" style={{ color: 'var(--text-body)' }}>
          {[
            '… nach einem Retreat nicht wieder allein sein wollen.',
            '… echte Verbindungen suchen, nicht Follower.',
            '… wachsen wollen, aber nicht alleine.',
            '… einen sicheren Raum brauchen, um sie selbst zu sein.',
          ].map((line) => (
            <p key={line} className="leading-relaxed">{line}</p>
          ))}
        </div>
      </section>

      {/* ── Was ist alles drin? ── */}
      <section className="max-w-3xl mx-auto mb-16">
        <h2 className="font-heading text-2xl italic mb-6 text-center" style={{ color: 'var(--text-h)' }}>
          Was ist alles drin?
        </h2>
        <div
          className="rounded-2xl border p-6 sm:p-8"
          style={{
            background: 'var(--glass)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderColor: 'var(--glass-border)',
          }}
        >
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4 text-sm" style={{ color: 'var(--text-body)' }}>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide mb-3" style={{ color: 'var(--gold-text)' }}>
                Im Monatsbeitrag enthalten
              </p>
              <ul className="space-y-2.5">
                {[
                  'Circles (Community-Gruppen)',
                  'Pulse (Feed und Posts)',
                  'Chat und Direktnachrichten',
                  'Events (Online und Live)',
                  'Basis-Seminare und ausgewählte Mentoren-Inhalte',
                  'Seeds durch Aktivität verdienen',
                  'VIP-Status (Enso-Ring) aufbauen',
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <CheckIcon />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide mb-3" style={{ color: 'var(--gold-text)' }}>
                Premium-Inhalte (Seeds oder Einzelkauf)
              </p>
              <ul className="space-y-2.5">
                {[
                  'Tiefe 1:1-Mentor-Sessions',
                  'Mehrstündige Intensiv-Workshops',
                  'Strukturierte Premium-Kurse',
                  'Exklusives Premium-Material',
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <CheckIcon />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

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
              q: 'Gibt es eine kostenlose Version?',
              a: 'Souleya ist eine Gemeinschaft, kein Freemium-Produkt. Für 20 EUR im Monat bekommst du vollen Zugang – zu allem. Ohne Einschränkungen, ohne Upselling.',
            },
            {
              q: 'Was sind Seeds?',
              a: 'Seeds sind Souleyas interne Währung. Du verdienst sie durch Aktivität – zum Beispiel durch Einladungen, Posts oder Engagement. Damit kannst du Premium-Inhalte wie Mentoren-Sessions oder Kurse freischalten.',
            },
            {
              q: 'Kann ich das Abo pausieren?',
              a: 'Ja, mit dem Sabbatical-Modus kannst du dein Abo bis zu 2 Monate pro Jahr pausieren – ohne Kosten und ohne Statusverlust.',
            },
            {
              q: 'Was passiert mit meinen Daten, wenn ich kündige?',
              a: 'Du kannst deine Daten jederzeit exportieren. Nach Kündigung werden sie gemäss unserer Datenschutzerklärung gelöscht.',
            },
            {
              q: 'Was kostet das Jahresabo?',
              a: '200 EUR pro Jahr – das sind 2 Monate gratis im Vergleich zum Monatsabo. Du kannst 4 Wochen vor Ablauf kündigen.',
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
