import Link from 'next/link';
import { sortedRaeume } from '@/lib/raeume-db';

export default async function HomeIntro() {
  // Featured-Card nur zeigen, wenn ein aktiver Call-Raum existiert
  const raeume = await sortedRaeume();
  const top = raeume[0];
  const showFeatured = top && top.type === 'call' && !top.ended;

  return (
    <div className="home-intro">
      {showFeatured && (
        <section className="home-featured">
          <div className="home-featured-badge">
            <span className="home-featured-dot" aria-hidden="true" />
            Impuls #01 · Call Raum · Anmeldung offen
          </div>
          <h2>Du hast genug Menschen um dich. Nur keinen der dich versteht.</h2>
          <p className="home-featured-sub">
            Die normalen Gespräche fühlen sich leer an. Und du weißt nicht wem du das sagen sollst.
          </p>
          <div className="home-featured-tags">
            500 Kontakte im Handy. Und trotzdem niemanden den du um Mitternacht anrufen würdest.
          </div>
          <Link className="home-featured-link" href={`/raeume/${top.slug}`}>
            Lesen →
          </Link>
        </section>
      )}

      <section className="home-recognize">
        <div className="home-recognize-badge">Erkennst du dich wieder?</div>
        <p>
          500 Kontakte im Handy. Und trotzdem niemanden den du um Mitternacht anrufen würdest. Nicht weil du keine Freunde hast. Sondern weil sich irgendwann etwas verschoben hat und keiner von euch weiß wann genau.
        </p>
        <p>
          Kein Streit, kein Bruch. Einfach ein leises Auseinanderdriften. Weil du dich verändert hast. Und die Gespräche nicht mitgekommen sind.
        </p>
      </section>

      <section className="home-whatis">
        <div className="home-whatis-divider" />
        <p>
          Souleya ist ein Ort für Menschen die ehrlich reden wollen. Über das was sie bewegt, was sie verändert hat, was sie sich wünschen.
        </p>
        <p>
          Jede Woche ein neuer Impuls, eine Frage, und die Möglichkeit darüber zu sprechen. In kleinen Runden, mit Menschen die das genauso fühlen.
        </p>
        <Link className="home-whatis-link" href="/raeume">
          Alle Räume ansehen →
        </Link>
      </section>
    </div>
  );
}
