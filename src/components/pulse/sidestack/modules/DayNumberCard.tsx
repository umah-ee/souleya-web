'use client';

import { useMemo } from 'react';

const NUMEROLOGY_MEANINGS: Record<number, string> = {
  1: 'Neubeginn & Fuehrung',
  2: 'Harmonie & Partnerschaft',
  3: 'Kreativitaet & Ausdruck',
  4: 'Stabilitaet & Struktur',
  5: 'Veraenderung & Freiheit',
  6: 'Liebe & Verantwortung',
  7: 'Innenschau & Reflexion',
  8: 'Fuelle & Manifestation',
  9: 'Vollendung & Loslassen',
};

function getDayNumber(): number {
  const now = new Date();
  const digits = `${now.getDate()}${now.getMonth() + 1}${now.getFullYear()}`;
  let sum = digits.split('').reduce((a, d) => a + parseInt(d), 0);
  while (sum > 9) {
    sum = String(sum).split('').reduce((a, d) => a + parseInt(d), 0);
  }
  return sum;
}

export default function DayNumberCard() {
  const dayNumber = useMemo(() => getDayNumber(), []);
  const dayMeaning = NUMEROLOGY_MEANINGS[dayNumber] ?? '';

  return (
    <div className="h-full flex flex-col items-center justify-center text-center gap-1 p-4">
      <span className="font-label text-[9px] tracking-[0.12em] uppercase" style={{ color: 'var(--gold)' }}>
        Tageszahl
      </span>
      <span className="font-heading text-[48px] leading-none" style={{ color: 'var(--text-h)' }}>
        {dayNumber}
      </span>
      <p className="font-body text-[11px]" style={{ color: 'var(--text-body)' }}>
        {dayMeaning}
      </p>
    </div>
  );
}
