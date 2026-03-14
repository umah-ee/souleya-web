import type { Metadata } from 'next';
import HeroSlider from '@/components/public/HeroSlider';
import JourneySection from '@/components/public/JourneySection';
import FeaturesGrid from '@/components/public/FeaturesGrid';
import HowItWorks from '@/components/public/HowItWorks';
import OriginSoulSection from '@/components/public/OriginSoulSection';
import FaqAccordion from '@/components/public/FaqAccordion';
import CtaFinal from '@/components/public/CtaFinal';

export const metadata: Metadata = {
  title: 'Souleya – Deine Community für Wachstum',
  description:
    'Souleya ist die Community-Plattform für persönliches Wachstum, Gesundheit und Spiritualität. Werde Origin Soul und sei von Anfang an dabei.',
  openGraph: {
    title: 'Souleya – Wachstum kennt kein Ende',
    description:
      'Die Community für persönliches Wachstum, Gesundheit und Spiritualität. Sichere dir jetzt deinen Origin Soul Platz.',
    url: 'https://souleya.com',
  },
};

export default function HomePage() {
  return (
    <>
      <HeroSlider />
      <JourneySection />
      <FeaturesGrid />
      <HowItWorks />
      <OriginSoulSection />
      <FaqAccordion />
      <CtaFinal />
    </>
  );
}
