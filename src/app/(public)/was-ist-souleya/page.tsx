import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Was ist Souleya? – Community-App für persönliches Wachstum',
  description:
    'Souleya ist die Community-App für persönliches Wachstum, Spiritualität und mentale Gesundheit. Circles, Mentoring, Kurse und Events – alles in einer App. Jetzt entdecken.',
  openGraph: {
    title: 'Was ist Souleya? – Community-App für persönliches Wachstum',
    description:
      'Eine Plattform, die Community, Mentoring und Events für persönliche Weiterentwicklung vereint.',
    url: 'https://souleya.com/was-ist-souleya',
  },
};

function SectionHeading({ label, title }: { label: string; title: string }) {
  return (
    <div className="mb-8">
      <p
        className="text-xs font-medium uppercase tracking-wide mb-2"
        style={{ color: 'var(--gold-text)' }}
      >
        {label}
      </p>
      <h2
        className="font-heading text-2xl md:text-3xl italic"
        style={{ color: 'var(--text-h)' }}
      >
        {title}
      </h2>
    </div>
  );
}

function FeatureCard({ title, text, href, linkText }: { title: string; text: string; href: string; linkText: string }) {
  return (
    <div
      className="rounded-[8px] border p-6"
      style={{
        background: 'var(--glass)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderColor: 'var(--glass-border)',
      }}
    >
      <h3 className="font-heading text-lg italic mb-2" style={{ color: 'var(--text-h)' }}>
        {title}
      </h3>
      <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-body)' }}>
        {text}
      </p>
      <Link
        href={href}
        className="text-sm font-medium transition-opacity hover:opacity-80"
        style={{ color: 'var(--gold-text)' }}
      >
        {linkText} →
      </Link>
    </div>
  );
}

export default function WasIstSouleyaPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      {/* ── Hero ── */}
      <div className="text-center mb-16">
        <h1
          className="font-heading text-3xl md:text-4xl italic mb-4"
          style={{ color: 'var(--text-h)' }}
        >
          Was ist Souleya?
        </h1>
        <p
          className="text-base max-w-xl mx-auto leading-relaxed"
          style={{ color: 'var(--text-sec)' }}
        >
          Eine Community-App für Menschen, die persönlich wachsen wollen –
          mit echten Verbindungen, erfahrenen Mentoren und Kursen. Alles an einem Ort.
        </p>
      </div>

      {/* ── Das Problem ── */}
      <section className="mb-16">
        <SectionHeading label="Das Problem" title="Warum es Souleya gibt" />
        <div className="space-y-4 text-sm leading-relaxed" style={{ color: 'var(--text-body)' }}>
          <p>
            Viele Menschen interessieren sich für persönliche Weiterentwicklung, Spiritualität
            oder mentale Gesundheit. Sie besuchen Workshops, lesen Bücher über Achtsamkeit,
            probieren Meditation oder Yoga aus – und machen dabei wertvolle Erfahrungen.
          </p>
          <p>
            Doch dann kehren sie zurück in ihren Alltag. Die Inspiration verblasst, weil
            die Verbindung fehlt. Es gibt keinen Raum für den Austausch mit Gleichgesinnten,
            keine Community, die den Weg mitgeht. Das Retreat ist vorbei, der Workshop
            beendet – und plötzlich ist da wieder Stille.
          </p>
          <p>
            Bestehende Plattformen lösen dieses Problem nicht: Social Media ist laut und
            oberflächlich, Messenger-Gruppen verlaufen im Sand, und spezialisierte Apps
            decken immer nur einen Teilbereich ab – entweder Meditation oder Kurse oder
            Community, aber nie alles zusammen.
          </p>
        </div>
      </section>

      {/* ── Die Lösung ── */}
      <section className="mb-16">
        <SectionHeading label="Die Lösung" title="Community, Mentoring und Events – vereint in einer App" />
        <div className="space-y-4 text-sm leading-relaxed" style={{ color: 'var(--text-body)' }}>
          <p>
            Souleya ist eine Community-Plattform, die persönliches Wachstum, Spiritualität und
            Gesundheit an einem Ort zusammenbringt. Statt dich nach einem Workshop allein zu
            lassen, bleibt die Verbindung bestehen – in thematischen Gruppen, mit Mentoren
            und bei echten Treffen.
          </p>
          <p>
            Die App verbindet drei Säulen: <strong>Circles</strong> für den Community-Austausch
            in thematischen Gruppen, <strong>Studio</strong> für Online-Kurse und 1:1-Mentoring
            mit erfahrenen Begleitern, und <strong>Events</strong> für echte Begegnungen vor
            Ort – von Meditationsabenden über Yoga-Sessions bis hin zu Retreats und Workshops.
          </p>
          <p>
            So entsteht ein geschützter Raum für alle, die sich mit Themen wie Meditation,
            Achtsamkeit, Breathwork, Ernährung, Yoga, Resilienz oder Persönlichkeitsentwicklung
            beschäftigen – egal ob Anfänger oder erfahrene Praktizierende.
          </p>
        </div>
      </section>

      {/* ── Die drei Säulen ── */}
      <section className="mb-16">
        <SectionHeading label="Features" title="Drei Säulen für deinen Weg" />
        <div className="grid gap-6 md:grid-cols-3">
          <FeatureCard
            title="Circles"
            text="Thematische Community-Gruppen für Meditation, Yoga, Breathwork, Ernährung und mehr. Tausche dich mit Gleichgesinnten aus, teile Erfahrungen und wachse gemeinsam – in deinem Tempo."
            href="/features/circles"
            linkText="Mehr über Circles"
          />
          <FeatureCard
            title="Studio"
            text="Online-Kurse und 1:1-Sessions mit erfahrenen Mentoren. Von geführten Meditationen über Coaching für mentale Gesundheit bis hin zu Intensiv-Workshops für persönliche Transformation."
            href="/features/studio"
            linkText="Mehr über Studio"
          />
          <FeatureCard
            title="Events"
            text="Vom Bildschirm ins echte Leben: Meditationsabende, Yoga-Sessions, Breathwork-Workshops und Retreats in deiner Nähe. Community-Treffen, die echte Verbindungen schaffen."
            href="/features/events"
            linkText="Mehr über Events"
          />
        </div>
      </section>

      {/* ── Für wen ── */}
      <section className="mb-16">
        <SectionHeading label="Zielgruppe" title="Für wen ist Souleya?" />
        <div className="space-y-4 text-sm leading-relaxed" style={{ color: 'var(--text-body)' }}>
          <p>
            Souleya ist für alle Menschen, die sich persönlich weiterentwickeln möchten –
            unabhängig davon, wo sie auf ihrem Weg stehen. Ob du gerade erst mit Meditation
            beginnst, seit Jahren Yoga praktizierst oder nach einer Community für Spiritualität
            und inneres Wachstum suchst.
          </p>
          <ul className="space-y-2 pl-4">
            <li className="flex items-start gap-2">
              <span style={{ color: 'var(--gold-text)' }}>·</span>
              <span>Menschen, die nach einem Workshop oder Retreat die <strong>Verbindung nicht verlieren</strong> wollen</span>
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: 'var(--gold-text)' }}>·</span>
              <span>Praktizierende von <strong>Meditation, Yoga, Breathwork oder Achtsamkeit</strong>, die Gleichgesinnte suchen</span>
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: 'var(--gold-text)' }}>·</span>
              <span>Menschen, die sich für <strong>mentale Gesundheit, Resilienz und Stressbewältigung</strong> interessieren</span>
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: 'var(--gold-text)' }}>·</span>
              <span>Alle, die <strong>persönliches Wachstum</strong> nicht allein, sondern in einer Gemeinschaft erleben wollen</span>
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: 'var(--gold-text)' }}>·</span>
              <span><strong>Mentoren und Coaches</strong>, die ihre Expertise mit einer engagierten Community teilen möchten</span>
            </li>
          </ul>
        </div>
      </section>

      {/* ── So funktioniert's ── */}
      <section className="mb-16">
        <SectionHeading label="Einstieg" title="So funktioniert Souleya" />
        <div className="space-y-4 text-sm leading-relaxed" style={{ color: 'var(--text-body)' }}>
          <p>
            Der Einstieg ist einfach: Registriere dich kostenlos mit deiner E-Mail-Adresse.
            Du erhältst einen Zugangscode – kein Passwort nötig. Nach der Anmeldung richtest
            du dein Profil ein, wählst deine Interessen und verbindest dich mit Gleichgesinnten.
          </p>
          <p>
            Innerhalb der App verdienst du <strong>Seeds</strong> – eine Art Guthaben oder
            Credits, die du durch Engagement sammelst: Beiträge schreiben, Freunde einladen
            oder an Events teilnehmen. Diese Seeds kannst du für Premium-Kurse, Mentor-Sessions
            oder besondere Workshops einsetzen. 1 Seed entspricht 0,01 €.
          </p>
          <p>
            Die Mitgliedschaft kostet 20 € im Monat (monatlich kündbar) oder 200 € im Jahr
            (2 Monate gratis). Darin enthalten ist der volle Zugang zu Circles, Chat, Events
            und Studio. Premium-Inhalte wie 1:1-Mentor-Sessions oder Intensiv-Kurse können
            zusätzlich mit Seeds oder per Einzelkauf freigeschaltet werden.
          </p>
        </div>
      </section>

      {/* ── Warum Souleya ── */}
      <section className="mb-16">
        <SectionHeading label="Vorteile" title="Was Souleya von anderen Plattformen unterscheidet" />
        <div className="space-y-4 text-sm leading-relaxed" style={{ color: 'var(--text-body)' }}>
          <p>
            Anders als reine Meditations-Apps (wie Headspace oder Calm), die nur geführte
            Übungen bieten, verbindet Souleya den persönlichen Weg mit einer echten Gemeinschaft.
            Anders als Social Media bietet Souleya einen geschützten Raum ohne Algorithmen,
            Werbung oder Ablenkung.
          </p>
          <p>
            Das <strong>Soul Level System</strong> macht deinen Fortschritt sichtbar: Vom
            ersten Schritt (Soul Spark) über regelmäßiges Engagement (Awakened Soul, Harmony
            Keeper) bis hin zum erfahrenen Begleiter (Zen Master, Soul Mentor). Dein Enso-Ring –
            der offene Kreis in deinem Profil – wächst mit dir und zeigt deinen Weg.
          </p>
          <p>
            Souleya startet im Sommer 2026. Die ersten 500 Mitglieder erhalten den permanenten
            <strong> First Light</strong> Status – ein Zeichen, dass sie von Anfang an dabei
            waren. Dieser Status wird nach dem Launch nie wieder vergeben.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="text-center">
        <svg viewBox="0 0 100 100" className="w-10 h-10 mx-auto mb-4">
          <defs>
            <linearGradient id="wis-enso" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A8894E" />
              <stop offset="100%" stopColor="#D4BC8B" />
            </linearGradient>
          </defs>
          <circle
            cx="50" cy="50" r="36" fill="none" stroke="url(#wis-enso)"
            strokeWidth="8" strokeLinecap="round"
            strokeDasharray="196 30" strokeDashoffset="15"
          />
        </svg>
        <h2
          className="font-heading text-2xl italic mb-3"
          style={{ color: 'var(--text-h)' }}
        >
          Bereit für den ersten Schritt?
        </h2>
        <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: 'var(--text-sec)' }}>
          Registriere dich jetzt kostenlos und sichere dir deinen Platz in der Community.
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
        <div className="mt-8 flex flex-wrap justify-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
          <Link href="/preise" className="hover:underline" style={{ color: 'var(--gold-text)' }}>Preise</Link>
          <Link href="/ueber-uns" className="hover:underline" style={{ color: 'var(--gold-text)' }}>Über uns</Link>
          <Link href="/features/circles" className="hover:underline" style={{ color: 'var(--gold-text)' }}>Circles</Link>
          <Link href="/features/studio" className="hover:underline" style={{ color: 'var(--gold-text)' }}>Studio</Link>
          <Link href="/features/events" className="hover:underline" style={{ color: 'var(--gold-text)' }}>Events</Link>
        </div>
      </section>
    </div>
  );
}
