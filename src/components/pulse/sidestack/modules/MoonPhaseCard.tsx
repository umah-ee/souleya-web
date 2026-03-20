'use client';

import { useMemo } from 'react';

// ── Mondphasen-Berechnung (vereinfachte Synodische Methode) ──
// Synodischer Monat: ~29.53059 Tage
// Referenz-Neumond: 6. Januar 2000, 18:14 UTC
const SYNODIC_MONTH = 29.53059;
const REF_NEW_MOON = new Date('2000-01-06T18:14:00Z').getTime();

interface MoonPhase {
  name: string;
  icon: string;
  impulse: string;
}

const PHASES: MoonPhase[] = [
  { name: 'Neumond', icon: '\uD83C\uDF11', impulse: 'Zeit fuer einen Neuanfang. Setze klare Absichten fuer den kommenden Zyklus.' },
  { name: 'Zunehmende Sichel', icon: '\uD83C\uDF12', impulse: 'Deine Ideen keimen. Gib ihnen Raum und naehre sie mit Geduld.' },
  { name: 'Erstes Viertel', icon: '\uD83C\uDF13', impulse: 'Triff Entscheidungen und ueberwinde innere Hindernisse.' },
  { name: 'Zunehmender Mond', icon: '\uD83C\uDF14', impulse: 'Dein Vorhaben waechst. Bleib dran und vertraue dem Prozess.' },
  { name: 'Vollmond', icon: '\uD83C\uDF15', impulse: 'Hoechste Energie. Feiere was du erreicht hast und lass Altes los.' },
  { name: 'Abnehmender Mond', icon: '\uD83C\uDF16', impulse: 'Zeit der Dankbarkeit. Reflektiere und teile, was du gelernt hast.' },
  { name: 'Letztes Viertel', icon: '\uD83C\uDF17', impulse: 'Lass los, was nicht mehr dient. Mache Platz fuer Neues.' },
  { name: 'Abnehmende Sichel', icon: '\uD83C\uDF18', impulse: 'Ruhe und Innenschau. Bereite dich auf den naechsten Zyklus vor.' },
];

function getMoonPhase(): MoonPhase {
  const now = Date.now();
  const daysSinceRef = (now - REF_NEW_MOON) / (1000 * 60 * 60 * 24);
  const phase = ((daysSinceRef % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;
  const phaseIndex = Math.floor((phase / SYNODIC_MONTH) * 8) % 8;
  return PHASES[phaseIndex];
}

function getNextFullMoon(): string {
  const now = Date.now();
  const daysSinceRef = (now - REF_NEW_MOON) / (1000 * 60 * 60 * 24);
  const currentPhase = daysSinceRef % SYNODIC_MONTH;
  const daysToFull = ((SYNODIC_MONTH / 2) - currentPhase + SYNODIC_MONTH) % SYNODIC_MONTH;
  const fullMoonDate = new Date(now + daysToFull * 24 * 60 * 60 * 1000);
  return fullMoonDate.toLocaleDateString('de-DE', { day: 'numeric', month: 'long' });
}

export default function MoonPhaseCard() {
  const moonPhase = useMemo(() => getMoonPhase(), []);
  const nextFull = useMemo(() => getNextFullMoon(), []);

  return (
    <div className="h-full flex flex-col gap-2 p-4">
      <div className="flex items-center gap-3">
        <span className="text-[36px] leading-none" style={{ filter: 'drop-shadow(0 0 10px var(--gold-glow))' }}>
          {moonPhase.icon}
        </span>
        <div className="flex flex-col gap-0.5">
          <span className="font-label text-[12px] tracking-[0.08em] uppercase" style={{ color: 'var(--gold)' }}>
            {moonPhase.name}
          </span>
          <span className="font-body text-[10px]" style={{ color: 'var(--text-muted)' }}>
            Vollmond am {nextFull}
          </span>
        </div>
      </div>
      <p className="font-body text-[11px] leading-[1.5]" style={{ color: 'var(--text-body)' }}>
        {moonPhase.impulse}
      </p>
    </div>
  );
}
