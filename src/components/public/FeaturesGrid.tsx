import FadeUp from './FadeUp';
import PhotoCredit from '@/components/shared/PhotoCredit';
import { getCreditForUrl } from '@/lib/unsplash-credits';

const FEATURES = [
  {
    image: 'https://images.unsplash.com/photo-1722963220475-979db2dbf216?w=600&h=400&fit=crop&fm=webp&q=80',
    label: 'Community',
    heading: 'Circles',
    alt: 'Menschen in einer Gemeinschaft – Circles für Meditation, Yoga und Achtsamkeit',
    description:
      'Thematische Gruppen für Meditation, Ernährung, Yoga, Breathwork und mehr. Gemeinsam wachsen – in deinem Tempo, in einer Gemeinschaft, die dich trägt.',
  },
  {
    image: 'https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=600&h=400&fit=crop&fm=webp&q=80',
    label: 'Wissen',
    heading: 'Studio',
    alt: 'Mentoring und Kurse – persönliche Weiterentwicklung mit erfahrenen Mentoren',
    description:
      'Kurse und 1:1-Sessions von erfahrenen Mentoren. Lerne in deinem Tempo – von Mindset über innere Balance bis hin zu tiefem persönlichem Wachstum.',
  },
  {
    image: 'https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?w=600&h=400&fit=crop&fm=webp&q=80',
    label: 'Begegnung',
    heading: 'Events',
    alt: 'Community-Events und Treffen – echte Begegnungen für persönliches Wachstum',
    description:
      'Vom Bildschirm ins echte Leben: Ein Ort für neue Begegnungen und vertraute Kontakte. Komm einfach so, wie du bist und spüre: Ich gehe diesen Weg nicht allein.',
  },
];

export default function FeaturesGrid() {
  return (
    <section id="features" className="section--dark py-20 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: 'var(--gold-text)' }}>
            Was dich erwartet
          </p>
          <h2 className="font-heading text-2xl md:text-3xl italic mb-3" style={{ color: 'var(--text-h)' }}>
            Drei Säulen für dein Wachstum
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Alles, was du für deinen Weg brauchst – in einer App.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {FEATURES.map((f, i) => (
            <FadeUp key={f.heading} delay={i * 150}>
              <div
                className="rounded-2xl border overflow-hidden group"
                style={{
                  background: 'var(--glass)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderColor: 'var(--glass-border)',
                }}
              >
                <div className="aspect-[3/2] overflow-hidden relative">
                  <img
                    src={f.image}
                    alt={f.alt}
                    width={600}
                    height={400}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                  {(() => { const c = getCreditForUrl(f.image); return c ? <PhotoCredit credit={c} /> : null; })()}
                </div>
                <div className="p-5">
                  <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: 'var(--gold-text)' }}>
                    {f.label}
                  </p>
                  <h3 className="font-heading text-lg italic mb-2" style={{ color: 'var(--text-h)' }}>
                    {f.heading}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-body)' }}>
                    {f.description}
                  </p>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
