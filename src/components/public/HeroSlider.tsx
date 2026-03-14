'use client';

import { useState, useEffect, useCallback } from 'react';
import WaitlistForm from './WaitlistForm';
import OriginCounter from './OriginCounter';

const SLIDES = [
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1600&h=1000&fit=crop',
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1600&h=1000&fit=crop',
  'https://images.unsplash.com/photo-1506869640319-fe1a24fd76cb?w=1600&h=1000&fit=crop',
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(next, 6000);
    return () => clearInterval(interval);
  }, [next]);

  return (
    <section id="anmeldung" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* ── Background Slides ── */}
      {SLIDES.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <img
            src={src}
            alt=""
            className="w-full h-full object-cover photo-gold-wash"
            loading={i === 0 ? 'eager' : 'lazy'}
          />
          <div className="absolute inset-0 photo-vignette" />
        </div>
      ))}

      {/* ── Dark Overlay ── */}
      <div className="absolute inset-0 bg-black/40" />

      {/* ── Content ── */}
      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
        {/* Enso Icon */}
        <svg
          viewBox="0 0 100 100"
          className="w-16 h-16 mx-auto mb-6"
          style={{ animation: 'enso-draw 2s ease-out forwards' }}
        >
          <defs>
            <linearGradient id="hero-enso-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A8894E" />
              <stop offset="50%" stopColor="#D4BC8B" />
              <stop offset="100%" stopColor="#A8894E" />
            </linearGradient>
          </defs>
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="none"
            stroke="url(#hero-enso-grad)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="196 30"
            transform="rotate(-30 50 50)"
          />
        </svg>

        <h1 className="font-heading text-3xl md:text-5xl italic leading-tight mb-4 text-white">
          Finde Menschen, die <em>wachsen</em> wollen – wie du
        </h1>
        <p className="text-base md:text-lg text-white/80 mb-8 leading-relaxed">
          Souleya ist die Community-App für persönliche Entwicklung, Gesundheit und Spiritualität.
          Kurse, Mentoren, Events und Gleichgesinnte – alles an einem Ort.
        </p>

        <WaitlistForm />
        <OriginCounter />
      </div>

      {/* ── Navigation Dots ── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="w-2.5 h-2.5 rounded-full transition-all"
            style={{
              background: i === current ? 'var(--gold-text)' : 'rgba(255,255,255,0.4)',
              transform: i === current ? 'scale(1.3)' : 'scale(1)',
            }}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
