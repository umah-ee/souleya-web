import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import TopicHero from '@/components/public/TopicHero';
import FirstLightDetailSection from '@/components/public/FirstLightDetailSection';

// Below-fold Komponenten lazy laden — nicht im initialen JS-Bundle
const JourneySection = dynamic(() => import('@/components/public/JourneySection'));
const FeaturesGrid = dynamic(() => import('@/components/public/FeaturesGrid'));
const HowItWorks = dynamic(() => import('@/components/public/HowItWorks'));
const FaqAccordion = dynamic(() => import('@/components/public/FaqAccordion'));
const CtaFinal = dynamic(() => import('@/components/public/CtaFinal'));

// Default Hero-Bild (Thema "wachstum") für LCP-Preload — responsive
const HERO_IMG_MOBILE = 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=800&h=450&fit=crop&fm=webp&q=75';
const HERO_IMG_DESKTOP = 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=1600&h=900&fit=crop&fm=webp&q=75';

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
      {/* Preload LCP-Bild: responsive — Mobile bekommt kleineres WebP */}
      <link
        rel="preload"
        as="image"
        imageSrcSet={`${HERO_IMG_MOBILE} 800w, ${HERO_IMG_DESKTOP} 1600w`}
        imageSizes="100vw"
      />
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
