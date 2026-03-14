import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Souleya – Deine Community für Wachstum',
  description:
    'Community-Plattform für Spiritualität, Gesundheit und persönliche Entwicklung. Circles, Studio, Events – alles an einem Ort.',
};

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      <div className="text-center">
        <h1
          className="font-heading text-3xl md:text-4xl italic mb-4"
          style={{ color: 'var(--text-h)' }}
        >
          Souleya
        </h1>
        <p
          className="text-lg mb-8"
          style={{ color: 'var(--text-sec)' }}
        >
          Deine Community für Wachstum. Bald mehr hier …
        </p>
      </div>
    </div>
  );
}
