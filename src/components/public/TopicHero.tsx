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
    </>
  );
}
