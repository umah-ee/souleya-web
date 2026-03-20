'use client';

import { useMemo } from 'react';
import { Icon } from '@/components/ui/Icon';
import type { IconName } from '@/components/ui/Icon';

interface Element {
  name: string;
  icon: IconName;
  color: string;
  colorBg: string;
  quality: string;
  ritual: string;
}

const ELEMENTS: Element[] = [
  {
    name: 'Feuer',
    icon: 'flame',
    color: '#FB7185',
    colorBg: 'rgba(251,113,133,0.12)',
    quality: 'Leidenschaft, Energie, Transformation',
    ritual: 'Zuende eine Kerze an und setze eine klare Absicht fuer den Tag. Beobachte die Flamme fuer einen Moment.',
  },
  {
    name: 'Wasser',
    icon: 'droplet',
    color: '#60A5FA',
    colorBg: 'rgba(96,165,250,0.12)',
    quality: 'Fliessen, Loslassen, Intuition',
    ritual: 'Trinke bewusst ein Glas Wasser. Spuere wie es durch deinen Koerper fliesst und dich naehrt.',
  },
  {
    name: 'Erde',
    icon: 'seedling',
    color: '#4ADE80',
    colorBg: 'rgba(74,222,128,0.12)',
    quality: 'Stabilitaet, Erdung, Wachstum',
    ritual: 'Gehe barfuss auf die Erde oder beruehre eine Pflanze. Spuere die Verbindung zur Natur.',
  },
  {
    name: 'Luft',
    icon: 'droplet',
    color: '#A78BFA',
    colorBg: 'rgba(167,139,250,0.12)',
    quality: 'Klarheit, Kommunikation, Freiheit',
    ritual: 'Oeffne ein Fenster und atme 5 Mal bewusst tief ein. Spuere die frische Luft in deinen Lungen.',
  },
];

export default function ElementCard() {
  const element = useMemo(() => {
    const now = new Date();
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
    return ELEMENTS[dayOfYear % ELEMENTS.length];
  }, []);

  return (
    <div className="h-full flex flex-col gap-2 p-4">
      <div className="flex items-center gap-3">
        <div
          className="w-11 h-11 rounded-[8px] flex items-center justify-center flex-shrink-0"
          style={{ background: element.colorBg }}
        >
          <Icon name={element.icon} size={24} style={{ color: element.color }} />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="font-label text-[12px] tracking-[0.08em] uppercase font-semibold" style={{ color: element.color }}>
            {element.name}
          </span>
          <span className="font-body text-[10px]" style={{ color: 'var(--text-muted)' }}>
            {element.quality}
          </span>
        </div>
      </div>
      <p className="font-body text-[11px] leading-[1.5]" style={{ color: 'var(--text-body)' }}>
        {element.ritual}
      </p>
    </div>
  );
}
