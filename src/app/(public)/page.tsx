import type { Metadata } from 'next';
import HeroSlider from '@/components/public/HeroSlider';
import JourneySection from '@/components/public/JourneySection';
import FeaturesGrid from '@/components/public/FeaturesGrid';
import HowItWorks from '@/components/public/HowItWorks';
import FirstLightSection from '@/components/public/FirstLightSection';
import FaqAccordion from '@/components/public/FaqAccordion';
import CtaFinal from '@/components/public/CtaFinal';

export const metadata: Metadata = {
  title: 'Souleya – Deine Community für Wachstum',
  description:
    'Souleya ist die Community-Plattform für persönliches Wachstum, Gesundheit und Spiritualität. Werde First Light und sei von Anfang an dabei.',
  openGraph: {
    title: 'Souleya – Wachstum kennt kein Ende',
    description:
      'Die Community für persönliches Wachstum, Gesundheit und Spiritualität. Sichere dir jetzt deinen First Light Platz.',
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
      <FirstLightSection />
      <FaqAccordion />
      <CtaFinal />
    </>
  );
}
