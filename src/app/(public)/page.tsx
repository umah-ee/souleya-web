import type { Metadata } from 'next';
import TopicHero from '@/components/public/TopicHero';
import FirstLightDetailSection from '@/components/public/FirstLightDetailSection';
import JourneySection from '@/components/public/JourneySection';
import FeaturesGrid from '@/components/public/FeaturesGrid';
import HowItWorks from '@/components/public/HowItWorks';
import FaqAccordion from '@/components/public/FaqAccordion';
import CtaFinal from '@/components/public/CtaFinal';

export const metadata: Metadata = {
  title: 'Souleya – Community für persönliches Wachstum, Gesundheit & Spiritualität',
  description:
    'Souleya ist deine App für persönliche Weiterentwicklung, Spiritualität, Mentoring & echte Community – mit Circles, Kursen und Events. Jetzt kostenlos registrieren.',
  openGraph: {
    title: 'Souleya – Community für persönliches Wachstum, Gesundheit & Spiritualität',
    description:
      'Deine App für persönliche Weiterentwicklung, Spiritualität, Mentoring & echte Community – mit Circles, Kursen und Events.',
    url: 'https://souleya.com',
  },
};

export default function HomePage() {
  return (
    <>
      <TopicHero />
      <FirstLightDetailSection />
      <JourneySection />
      <FeaturesGrid />
      <HowItWorks />
      <FaqAccordion />
      <CtaFinal />
    </>
  );
}
