import FadeUp from './FadeUp';

export default function JourneySection() {
  return (
    <section className="section--apricot py-20 px-6">
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 md:gap-16">
        {/* ── Problem ── */}
        <FadeUp>
          <div>
            <span
              className="inline-block text-xs font-medium uppercase tracking-wide px-3 py-1 rounded-full mb-4"
              style={{ background: 'var(--gold-bg)', color: 'var(--gold-text)' }}
            >
              Erkennst du dich wieder?
            </span>
            <h2
              className="font-heading text-xl italic mb-4 leading-relaxed"
              style={{ color: 'var(--text-h)' }}
            >
              „Die Inspiration verblasst, weil die Verbindung fehlt."
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-body)' }}>
              So viele Menschen öffnen sich in Workshops, Retreats oder im Mentoring für neue
              Wege, für Heilung, für Bewusstsein. Sie wachsen, fühlen sich getragen – und gehen
              dann zurück in ihren Alltag. Plötzlich ist da wieder Stille. Kein Raum für
              Austausch. Keine Menschen, die wirklich verstehen.
            </p>
          </div>
        </FadeUp>

        {/* ── Lösung ── */}
        <FadeUp delay={200}>
          <div>
            <span
              className="inline-block text-xs font-medium uppercase tracking-wide px-3 py-1 rounded-full mb-4"
              style={{ background: 'var(--gold-bg)', color: 'var(--gold-text)' }}
            >
              Dann bist du hier genau richtig.
            </span>
            <h2
              className="font-heading text-xl italic mb-4 leading-relaxed"
              style={{ color: 'var(--text-h)' }}
            >
              „Damit dein Weg nicht nach dem Workshop endet, sondern dort erst richtig beginnt."
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-body)' }}>
              Souleya ist die Community-App für persönliches Wachstum, Spiritualität und
              mentale Gesundheit. Ein lebendiges Feld aus Gleichgesinnten, aus Unterstützung,
              aus echtem Miteinander – mit Meditation, Yoga, Breathwork und Mentoring.
              Für Menschen, die nicht nur lernen, sondern leben wollen – gemeinsam.
            </p>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
