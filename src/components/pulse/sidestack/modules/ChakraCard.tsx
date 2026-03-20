'use client';

import { useMemo } from 'react';

interface Chakra {
  name: string;
  sanskrit: string;
  number: number;
  color: string;
  colorBg: string;
  exercise: string;
}

const CHAKRAS: Chakra[] = [
  { name: 'Wurzelchakra', sanskrit: 'Muladhara', number: 1, color: '#E53E3E', colorBg: 'rgba(229,62,62,0.12)', exercise: 'Stehe barfuss auf dem Boden und spuere die Verbindung zur Erde. Atme 3 Mal tief.' },
  { name: 'Sakralchakra', sanskrit: 'Svadhisthana', number: 2, color: '#ED8936', colorBg: 'rgba(237,137,54,0.12)', exercise: 'Bewege deine Hueften sanft im Kreis. Spuere die Kreativitaet in dir fliessen.' },
  { name: 'Solarplexus', sanskrit: 'Manipura', number: 3, color: '#ECC94B', colorBg: 'rgba(236,201,75,0.12)', exercise: 'Lege eine Hand auf deinen Bauch. Atme tief ein und spuere deine innere Kraft.' },
  { name: 'Herzchakra', sanskrit: 'Anahata', number: 4, color: '#4ADE80', colorBg: 'rgba(74,222,128,0.12)', exercise: 'Lege eine Hand auf dein Herz und atme 3 Mal tief ein und aus. Spuere die Waerme.' },
  { name: 'Halschakra', sanskrit: 'Vishuddha', number: 5, color: '#60A5FA', colorBg: 'rgba(96,165,250,0.12)', exercise: 'Summe einen tiefen Ton und spuere die Vibration in deiner Kehle.' },
  { name: 'Stirnchakra', sanskrit: 'Ajna', number: 6, color: '#A78BFA', colorBg: 'rgba(167,139,250,0.12)', exercise: 'Schliesse die Augen und richte deinen Blick sanft auf den Punkt zwischen deinen Augenbrauen.' },
  { name: 'Kronenchakra', sanskrit: 'Sahasrara', number: 7, color: '#D8B4FE', colorBg: 'rgba(216,180,254,0.12)', exercise: 'Sitze still und stelle dir ein warmes Licht vor, das von oben in dich hineinfliesst.' },
];

export default function ChakraCard() {
  const chakra = useMemo(() => {
    const dayOfWeek = new Date().getDay(); // 0=So, 1=Mo, ...
    // Montag=Wurzel (Index 0), Sonntag=Kronen (Index 6)
    const idx = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    return CHAKRAS[idx];
  }, []);

  return (
    <div className="h-full flex flex-col gap-2 p-4">
      <div className="flex items-center gap-3">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 relative"
          style={{ background: chakra.colorBg }}
        >
          <span style={{ color: chakra.color, fontSize: '18px', lineHeight: 1 }}>{'\u2764'}</span>
          {/* Pulsierender Ring */}
          <div
            className="absolute inset-[-4px] rounded-full pointer-events-none"
            style={{
              border: `1.5px solid ${chakra.color}`,
              opacity: 0.3,
              animation: 'pulse 3s ease-in-out infinite',
            }}
          />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="font-label text-[12px] tracking-[0.08em] uppercase font-semibold" style={{ color: chakra.color }}>
            {chakra.name}
          </span>
          <span className="font-body text-[10px] italic" style={{ color: 'var(--text-muted)' }}>
            {chakra.sanskrit} — {chakra.number}. Chakra
          </span>
        </div>
      </div>
      <p className="font-body text-[11px] leading-[1.5]" style={{ color: 'var(--text-body)' }}>
        {chakra.exercise}
      </p>
    </div>
  );
}
