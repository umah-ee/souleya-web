import { TOPICS } from './TopicHeroData';

const HERO_TOPIC_ID = 'beziehungen';

export default function TopicHero() {
  const topic = TOPICS[HERO_TOPIC_ID];

  return (
    <>
      {/* ═══ HERO ═══ */}
      <section id="anmeldung" className="th-hero">
        <div className="th-hero-img-wrap">
          <img
            src={topic.img}
            alt={`${topic.name} – Community für persönliches Wachstum bei Souleya`}
            className="th-hero-img"
            fetchPriority="high"
          />
        </div>
      </section>

      {/* Helle Zwischensektion — Atemsekunde */}
      <div className="th-breathe">
        <div className="th-breathe-inner">
          <svg viewBox="0 0 100 100" className="th-breathe-enso">
            <defs>
              <linearGradient id="breathe-enso" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A8894E" />
                <stop offset="100%" stopColor="#D4BC8B" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="36" fill="none" stroke="url(#breathe-enso)" strokeWidth="8" strokeLinecap="round" strokeDasharray="196 30" strokeDashoffset="15" />
          </svg>
          <h2 className="th-breathe-heading">
            Dein Weg beginnt mit einem<br /><em>ersten Schritt.</em>
          </h2>
          <p className="th-breathe-text">
            Souleya verbindet dich mit Menschen, die den gleichen Weg gehen — <br className="hidden sm:block" />
            offen, ehrlich und auf Augenhoehe.
          </p>
        </div>
      </div>
    </>
  );
}
