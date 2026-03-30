import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Circles – Community-Gruppen für Meditation, Yoga & persönliches Wachstum',
  description:
    'Souleya Circles sind thematische Community-Gruppen für Meditation, Yoga, Breathwork, Achtsamkeit und persönliche Entwicklung. Finde Gleichgesinnte und wachse gemeinsam.',
  openGraph: {
    title: 'Circles – Community-Gruppen bei Souleya',
    description:
      'Thematische Gruppen für Meditation, Yoga, Breathwork und mehr. Finde Gleichgesinnte und wachse gemeinsam.',
    url: 'https://souleya.com/circles',
  },
};

const CIRCLE_THEMES = [
  {
    name: 'Meditation & Achtsamkeit',
    text: 'Tägliche Praxis, geführte Meditationen, Achtsamkeitsübungen und der Austausch über innere Stille – von Anfängern bis Fortgeschrittenen.',
  },
  {
    name: 'Yoga & Bewegung',
    text: 'Hatha, Vinyasa, Yin oder Kundalini – finde deinen Stil und Menschen, die ihn mit dir teilen. Tipps, Erfahrungen und gemeinsame Praxis.',
  },
  {
    name: 'Breathwork & Atemarbeit',
    text: 'Von Box Breathing über Wim Hof bis holotropes Atmen. Erfahrungsberichte, Techniken und die Kraft des bewussten Atems.',
  },
  {
    name: 'Mentale Gesundheit & Resilienz',
    text: 'Stressbewältigung, emotionale Intelligenz, innere Blockaden lösen – ein sicherer Raum für Austausch über psychische Gesundheit und Selbstfürsorge.',
  },
  {
    name: 'Ernährung & Gesundheit',
    text: 'Achtsame Ernährung, Heilfasten, Ayurveda, pflanzliche Ernährung – alles rund um einen ganzheitlichen Lebensstil.',
  },
  {
    name: 'Spiritualität & Energiearbeit',
    text: 'Chakren, Schamanismus, Energiearbeit, Bewusstseinserweiterung – für alle, die sich auf einer tieferen Ebene mit sich und der Welt verbinden wollen.',
  },
];

export default function CirclesPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      {/* ── Hero ── */}
      <div className="text-center mb-16">
        <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: 'var(--gold-text)' }}>
          Circles
        </p>
        <h1
          className="font-heading text-3xl md:text-4xl italic mb-4"
          style={{ color: 'var(--text-h)' }}
        >
          Deine Community. Dein Thema.
        </h1>
        <p className="text-base max-w-xl mx-auto leading-relaxed" style={{ color: 'var(--text-sec)' }}>
          Circles sind thematische Gruppen bei Souleya – ein geschützter Raum für Menschen,
          die den gleichen Weg gehen. Kein Algorithmus, keine Werbung. Nur echte Verbindungen.
        </p>
      </div>

      {/* ── Was sind Circles? ── */}
      <section className="mb-16">
        <h2 className="font-heading text-2xl italic mb-4" style={{ color: 'var(--text-h)' }}>
          Was sind Circles?
        </h2>
        <div className="space-y-4 text-sm leading-relaxed" style={{ color: 'var(--text-body)' }}>
          <p>
            Ein Circle ist eine Community-Gruppe zu einem bestimmten Thema – zum Beispiel
            Meditation, Yoga, Breathwork oder persönliche Entwicklung. Innerhalb deines Circles
            tauschst du dich mit Gleichgesinnten aus, teilst Erfahrungen, stellst Fragen und
            unterstützt dich gegenseitig auf eurem Weg.
          </p>
          <p>
            Anders als in sozialen Netzwerken geht es in Circles nicht um Reichweite oder Likes.
            Es geht um echten Austausch in einer überschaubaren Gemeinschaft. Jeder Circle hat
            sein eigenes Tempo und seine eigene Dynamik – du gehst mit, wann und wie es für
            dich passt.
          </p>
          <p>
            Dein persönlicher Circle ist dein innerer Kreis bei Souleya: die Menschen, mit denen
            du verbunden bist. Darüber hinaus gibt es thematische Gruppenchats für den Austausch
            über bestimmte Themen – offen für alle Mitglieder.
          </p>
        </div>
      </section>

      {/* ── Themen ── */}
      <section className="mb-16">
        <h2 className="font-heading text-2xl italic mb-6" style={{ color: 'var(--text-h)' }}>
          Themen, die verbinden
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {CIRCLE_THEMES.map((theme) => (
            <div
              key={theme.name}
              className="rounded-[8px] border p-5"
              style={{
                background: 'var(--glass)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderColor: 'var(--glass-border)',
              }}
            >
              <h3 className="font-medium text-sm mb-2" style={{ color: 'var(--text-h)' }}>
                {theme.name}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-body)' }}>
                {theme.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Wie es funktioniert ── */}
      <section className="mb-16">
        <h2 className="font-heading text-2xl italic mb-4" style={{ color: 'var(--text-h)' }}>
          So findest du deinen Circle
        </h2>
        <div className="space-y-4 text-sm leading-relaxed" style={{ color: 'var(--text-body)' }}>
          <p>
            Nach der Registrierung wählst du deine Interessen aus – Meditation, Yoga,
            Persönlichkeitsentwicklung oder andere Themen. Souleya schlägt dir passende
            Menschen in deiner Nähe vor. Sende eine Verbindungsanfrage, und sobald sie
            angenommen wird, seid ihr Teil eures gemeinsamen Circles.
          </p>
          <p>
            Im Pulse-Feed siehst du Beiträge der Menschen in deinem Circle – Gedanken,
            Erfahrungen, Fragen, Impulse. Du kannst kommentieren, reagieren und
            dich inspirieren lassen. So entsteht echte Nähe, auch digital.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="text-center">
        <h2 className="font-heading text-2xl italic mb-3" style={{ color: 'var(--text-h)' }}>
          Finde deine Gemeinschaft
        </h2>
        <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: 'var(--text-sec)' }}>
          Registriere dich kostenlos und verbinde dich mit Menschen, die deinen Weg teilen.
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
          <Link href="/studio" className="hover:underline" style={{ color: 'var(--gold-text)' }}>Studio</Link>
          <Link href="/events" className="hover:underline" style={{ color: 'var(--gold-text)' }}>Events</Link>
          <Link href="/preise" className="hover:underline" style={{ color: 'var(--gold-text)' }}>Preise</Link>
        </div>
      </section>
    </div>
  );
}
