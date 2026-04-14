import type { Metadata } from 'next';
import ReflexionQuiz from './ReflexionQuiz';

export const metadata: Metadata = {
  title: 'Wie verbunden bist du wirklich? | Souleya',
  description:
    '8 ehrliche Fragen. Kein richtig oder falsch. Finde heraus, wie verbunden du wirklich bist.',
  openGraph: {
    title: 'Wie verbunden bist du wirklich?',
    description:
      '8 ehrliche Fragen. Kein richtig oder falsch. Nur du und ein Moment der Klarheit.',
    type: 'website',
    siteName: 'Souleya',
    images: [
      {
        url: 'https://souleya.com/souleya-quiz-og.png',
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wie verbunden bist du wirklich?',
    description:
      '8 ehrliche Fragen. Kein richtig oder falsch. Nur du und ein Moment der Klarheit.',
    images: ['https://souleya.com/souleya-quiz-og.png'],
  },
};

export default function ReflexionPage() {
  return <ReflexionQuiz />;
}
