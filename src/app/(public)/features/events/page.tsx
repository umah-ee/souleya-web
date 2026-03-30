import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Events – Retreats, Workshops & Community-Treffen für persönliches Wachstum',
  description:
    'Souleya Events bringen dich vom Bildschirm ins echte Leben: Meditationsabende, Yoga-Sessions, Breathwork-Workshops, Retreats und Community-Treffen in deiner Nähe.',
  openGraph: {
    title: 'Events – Treffen & Workshops bei Souleya',
    description:
      'Meditationsabende, Yoga-Sessions, Retreats und Workshops für persönliches Wachstum in deiner Nähe.',
    url: 'https://souleya.com/features/events',
  },
};

const EVENT_TYPES = [
  {
    name: 'Meditationsabende',
    text: 'Gemeinsame Stille, geführte Meditationen und achtsamer Austausch – in einer kleinen Gruppe, die dich trägt.',
  },
  {
    name: 'Yoga-Sessions',
    text: 'Von Morning Flow bis Deep Stretch – Yoga-Treffen für alle Level. In Parks, Studios oder bei jemandem zu Hause.',
  },
  {
    name: 'Breathwork-Workshops',
    text: 'Erlebe die Kraft des bewussten Atems: Box Breathing, Wim Hof oder holotropes Atmen – angeleitet von erfahrenen Trainern.',
  },
  {
    name: 'Retreats & Wochenenden',
    text: 'Mehrtägige Auszeiten für tiefe Transformation – Meditation, Yoga, Naturerfahrung und Gemeinschaft an besonderen Orten.',
  },
  {
    name: 'Community-Treffen',
    text: 'Lockere Treffen zum Kennenlernen, Austauschen und Vernetzen. Kein Programm, kein Druck – einfach da sein.',
  },
  {
    name: 'Vorträge & Impulse',
    text: 'Mentoren und Gastredner teilen ihr Wissen zu Themen wie Resilienz, Achtsamkeit, Ernährung oder Persönlichkeitsentwicklung.',
  },
];

export default function EventsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      {/* ── Hero ── */}
      <div className="text-center mb-16">
        <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: 'var(--gold-text)' }}>
          Events
        </p>
        <h1
          className="font-heading text-3xl md:text-4xl italic mb-4"
          style={{ color: 'var(--text-h)' }}
        >
          Vom Bildschirm ins echte Leben.
        </h1>
        <p className="text-base max-w-xl mx-auto leading-relaxed" style={{ color: 'var(--text-sec)' }}>
          Events bei Souleya sind Orte der Begegnung – Meditationsabende, Yoga-Sessions,
          Workshops und Retreats. In deiner Nähe, mit Menschen aus deiner Community.
        </p>
      </div>

      {/* ── Was sind Events? ── */}
      <section className="mb-16">
        <h2 className="font-heading text-2xl italic mb-4" style={{ color: 'var(--text-h)' }}>
          Mehr als Veranstaltungen
        </h2>
        <div className="space-y-4 text-sm leading-relaxed" style={{ color: 'var(--text-body)' }}>
          <p>
            Souleya Events sind keine anonymen Großveranstaltungen. Es sind Treffen innerhalb
            deiner Community – mit Menschen, die du schon aus den Circles und dem Chat kennst.
            Das macht den Unterschied: Du gehst nicht zu Fremden, sondern triffst Gleichgesinnte,
            mit denen du bereits eine Verbindung hast.
          </p>
          <p>
            Jedes Mitglied kann eigene Events erstellen – vom kleinen Meditationskreis im Park
            bis zum organisierten Workshop. Die Discover-Funktion zeigt dir Events in deiner
            Nähe, sortiert nach Entfernung und Thema. So findest du schnell das passende
            Angebot für persönliches Wachstum, Spiritualität oder Gesundheit in deiner Stadt.
          </p>
        </div>
      </section>

      {/* ── Event-Typen ── */}
      <section className="mb-16">
        <h2 className="font-heading text-2xl italic mb-6" style={{ color: 'var(--text-h)' }}>
          Was dich erwartet
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {EVENT_TYPES.map((type) => (
            <div
              key={type.name}
              className="rounded-[8px] border p-5"
              style={{
                background: 'var(--glass)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderColor: 'var(--glass-border)',
              }}
            >
              <h3 className="font-medium text-sm mb-2" style={{ color: 'var(--text-h)' }}>
                {type.name}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-body)' }}>
                {type.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Qualität ── */}
      <section className="mb-16">
        <h2 className="font-heading text-2xl italic mb-4" style={{ color: 'var(--text-h)' }}>
          Qualität durch Community
        </h2>
        <div className="space-y-4 text-sm leading-relaxed" style={{ color: 'var(--text-body)' }}>
          <p>
            Nach jedem Event können Teilnehmende eine Bewertung abgeben – mit Sternebewertung
            und persönlichem Kommentar. So entsteht ein Qualitätsfilter, der von der Community
            selbst gesteuert wird. Events von Mitgliedern mit höherem Soul Level werden in der
            Suche bevorzugt angezeigt.
          </p>
          <p>
            Mentoren können zusätzlich kostenpflichtige Workshops und Retreats anbieten, die über
            das Studio-System gebucht werden. Die Bezahlung läuft über Seeds (das
            Belohnungssystem von Souleya) oder per Direktzahlung – transparent und fair.
          </p>
        </div>
      </section>

      {/* ── Wie finde ich Events? ── */}
      <section className="mb-16">
        <h2 className="font-heading text-2xl italic mb-4" style={{ color: 'var(--text-h)' }}>
          Events in deiner Nähe finden
        </h2>
        <div className="space-y-4 text-sm leading-relaxed" style={{ color: 'var(--text-body)' }}>
          <p>
            In der Discover-Ansicht siehst du Events auf einer Karte und als Liste – gefiltert
            nach Entfernung, Thema und Datum. Ob Meditationsabend in Berlin, Yoga-Morgen in
            München oder Breathwork-Workshop in Hamburg – du findest Community-Treffen für
            persönliches Wachstum überall in Deutschland, Österreich und der Schweiz.
          </p>
          <p>
            Du kannst Events bookmarken, Freunde einladen und mit einem Klick teilnehmen.
            Für jedes Event wird automatisch ein Gruppenchat erstellt, damit sich Teilnehmende
            vorab austauschen können.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="text-center">
        <h2 className="font-heading text-2xl italic mb-3" style={{ color: 'var(--text-h)' }}>
          Triff deine Community
        </h2>
        <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: 'var(--text-sec)' }}>
          Registriere dich kostenlos und entdecke Events für persönliches Wachstum in deiner Nähe.
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
          <Link href="/features/studio" className="hover:underline" style={{ color: 'var(--gold-text)' }}>Studio</Link>
          <Link href="/preise" className="hover:underline" style={{ color: 'var(--gold-text)' }}>Preise</Link>
        </div>
      </section>
    </div>
  );
}
