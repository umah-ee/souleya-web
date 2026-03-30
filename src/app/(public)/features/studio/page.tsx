import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Studio – Online-Kurse, 1:1-Coaching & Mentoring für persönliches Wachstum',
  description:
    'Souleya Studio bietet Online-Kurse und 1:1-Mentoring für Meditation, Yoga, Persönlichkeitsentwicklung und mentale Gesundheit. Lerne von erfahrenen Mentoren.',
  openGraph: {
    title: 'Studio – Kurse & Mentoring bei Souleya',
    description:
      'Online-Kurse und 1:1-Sessions für persönliches Wachstum – von Meditation über Coaching bis Breathwork.',
    url: 'https://souleya.com/features/studio',
  },
};

const FORMATS = [
  {
    name: 'Online-Kurse',
    text: 'Strukturierte Lernpfade zu Themen wie Meditation, Achtsamkeit, Breathwork oder Persönlichkeitsentwicklung. In deinem Tempo, auf deinem Gerät – mit Videos, Übungen und begleitenden Materialien.',
  },
  {
    name: '1:1-Mentoring',
    text: 'Persönliche Sessions mit erfahrenen Mentoren per Video-Call. Ob Coaching für mentale Gesundheit, spirituelle Begleitung oder Yogapraxis – dein Mentor begleitet dich individuell auf deinem Weg.',
  },
  {
    name: 'Intensiv-Workshops',
    text: 'Tiefgehende Gruppen-Sessions zu spezifischen Themen – von Schattenarbeit über Energiearbeit bis hin zu Stressbewältigung. Kompakt, intensiv und transformierend.',
  },
];

const TOPICS = [
  'Geführte Meditation & Achtsamkeitspraxis',
  'Yoga für Anfänger und Fortgeschrittene',
  'Breathwork & bewusstes Atmen',
  'Stressbewältigung & Resilienz',
  'Persönlichkeitsentwicklung & Mindset',
  'Emotionale Intelligenz & innere Blockaden',
  'Spiritualität & Bewusstseinsarbeit',
  'Ernährung & ganzheitliche Gesundheit',
];

export default function StudioPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      {/* ── Hero ── */}
      <div className="text-center mb-16">
        <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: 'var(--gold-text)' }}>
          Studio
        </p>
        <h1
          className="font-heading text-3xl md:text-4xl italic mb-4"
          style={{ color: 'var(--text-h)' }}
        >
          Lerne von Menschen, die den Weg kennen.
        </h1>
        <p className="text-base max-w-xl mx-auto leading-relaxed" style={{ color: 'var(--text-sec)' }}>
          Im Studio findest du Online-Kurse, 1:1-Mentoring und Workshops –
          von erfahrenen Mentoren für persönliches Wachstum, Spiritualität und mentale Gesundheit.
        </p>
      </div>

      {/* ── Formate ── */}
      <section className="mb-16">
        <h2 className="font-heading text-2xl italic mb-6" style={{ color: 'var(--text-h)' }}>
          Drei Wege zum Lernen
        </h2>
        <div className="space-y-4">
          {FORMATS.map((format) => (
            <div
              key={format.name}
              className="rounded-[8px] border p-5"
              style={{
                background: 'var(--glass)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderColor: 'var(--glass-border)',
              }}
            >
              <h3 className="font-medium text-sm mb-2" style={{ color: 'var(--text-h)' }}>
                {format.name}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-body)' }}>
                {format.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Mentoren ── */}
      <section className="mb-16">
        <h2 className="font-heading text-2xl italic mb-4" style={{ color: 'var(--text-h)' }}>
          Mentoren, die begleiten
        </h2>
        <div className="space-y-4 text-sm leading-relaxed" style={{ color: 'var(--text-body)' }}>
          <p>
            Souleya-Mentoren sind keine Influencer – sie sind erfahrene Praktizierende, Coaches
            und Begleiter mit fundiertem Wissen in ihrem Bereich. Von zertifizierten
            Yogalehrerinnen über Breathwork-Trainer bis hin zu Coaches für mentale Gesundheit
            und spirituelle Begleiter.
          </p>
          <p>
            Jeder Mentor durchläuft einen Auswahlprozess und wird von der Community bewertet.
            Das Soul Level System sorgt dafür, dass Qualität sichtbar wird: Mentoren mit dem
            höchsten Level (Soul Mentor) haben durch ihre Arbeit und das Vertrauen der Community
            einen besonderen Status erreicht.
          </p>
          <p>
            Du möchtest als Mentor bei Souleya aktiv werden?{' '}
            <Link href="/mentor" className="hover:underline" style={{ color: 'var(--gold-text)' }}>
              Hier erfährst du mehr
            </Link>.
          </p>
        </div>
      </section>

      {/* ── Themen ── */}
      <section className="mb-16">
        <h2 className="font-heading text-2xl italic mb-4" style={{ color: 'var(--text-h)' }}>
          Themen im Studio
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {TOPICS.map((topic) => (
            <div key={topic} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-body)' }}>
              <span style={{ color: 'var(--gold-text)' }}>·</span>
              <span>{topic}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bezahlung ── */}
      <section className="mb-16">
        <h2 className="font-heading text-2xl italic mb-4" style={{ color: 'var(--text-h)' }}>
          Flexibel bezahlen
        </h2>
        <div className="space-y-4 text-sm leading-relaxed" style={{ color: 'var(--text-body)' }}>
          <p>
            Grundlegende Kursinhalte sind in der Mitgliedschaft enthalten. Premium-Kurse,
            1:1-Sessions und Intensiv-Workshops können mit Seeds (dem Guthaben- und
            Belohnungssystem von Souleya) oder per Einzelkauf freigeschaltet werden.
          </p>
          <p>
            Seeds verdienst du durch Engagement in der Community – Beiträge schreiben,
            Events besuchen, Freunde einladen. So wird aktive Teilnahme belohnt und du
            kannst Lerninhalte freischalten, ohne extra zu bezahlen.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="text-center">
        <h2 className="font-heading text-2xl italic mb-3" style={{ color: 'var(--text-h)' }}>
          Starte deinen Lernweg
        </h2>
        <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: 'var(--text-sec)' }}>
          Registriere dich kostenlos und entdecke Kurse und Mentoren für deinen Weg.
        </p>
        <Link
          href="/#anmeldung"
          className="inline-block px-10 py-4 rounded-full font-label text-sm font-semibold uppercase tracking-widest transition-all hover:opacity-90 hover:-translate-y-px"
          style={{
            background: 'linear-gradient(135deg, #A8894E, #C8A96E, #D4BC8B)',
            color: 'var(--dark, #1a1a1a)',
            boxShadow: '0 0 30px rgba(200,169,110,.3)',
          }}
        >
          Jetzt registrieren
        </Link>
        <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
          <Link href="/was-ist-souleya" className="hover:underline" style={{ color: 'var(--gold-text)' }}>Was ist Souleya?</Link>
          <Link href="/features/circles" className="hover:underline" style={{ color: 'var(--gold-text)' }}>Circles</Link>
          <Link href="/features/events" className="hover:underline" style={{ color: 'var(--gold-text)' }}>Events</Link>
          <Link href="/preise" className="hover:underline" style={{ color: 'var(--gold-text)' }}>Preise</Link>
        </div>
      </section>
    </div>
  );
}
