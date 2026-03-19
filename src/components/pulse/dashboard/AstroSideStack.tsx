'use client';

import { useMemo } from 'react';
import { Icon } from '@/components/ui/Icon';

// ══════════════════════════════════════════════════════════════
// ASTRO SIDE STACK — Sternzeichen + Tageszahl
// Wird rechts neben der WisdomCard angezeigt (Desktop: 2-Spalten-Grid)
// ══════════════════════════════════════════════════════════════

interface Props {
  birthday?: string | null; // ISO date string, z.B. "1990-03-15"
}

// ── Sternzeichen-Daten ───────────────────────────────────────
interface ZodiacSign {
  name: string;
  symbol: string; // Unicode Astrologie-Symbol
  element: string;
  impulse: string[];
}

const ZODIAC_SIGNS: ZodiacSign[] = [
  { name: 'Steinbock', symbol: '\u2651', element: 'Erde', impulse: ['Deine Disziplin ist heute deine Staerke. Nutze sie bewusst.', 'Ein guter Tag, um langfristige Plaene zu schmieden.', 'Goennen dir eine Pause — auch Staerke braucht Erholung.'] },
  { name: 'Wassermann', symbol: '\u2652', element: 'Luft', impulse: ['Deine Kreativitaet fliesst heute besonders frei.', 'Neue Ideen klopfen an — oeffne die Tuer.', 'Verbinde dich mit Gleichgesinnten. Gemeinsam entsteht Grosses.'] },
  { name: 'Fische', symbol: '\u2653', element: 'Wasser', impulse: ['Deine Intuition ist heute besonders stark. Vertraue dem, was sich richtig anfuehlt.', 'Lass deine Traeume heute naeher an die Realitaet.', 'Ein sanfter Tag — sei liebevoll mit dir selbst.'] },
  { name: 'Widder', symbol: '\u2648', element: 'Feuer', impulse: ['Deine Energie ist heute ansteckend. Nutze den Schwung.', 'Mut steht dir gut — wage heute etwas Neues.', 'Kanal deinen Tatendrang in ein konkretes Ziel.'] },
  { name: 'Stier', symbol: '\u2649', element: 'Erde', impulse: ['Geniesse die kleinen Dinge — sie naehren deine Seele.', 'Heute ist ein guter Tag fuer Bestaendigkeit und Ruhe.', 'Vertraue deinem Rhythmus. Du bist genau richtig.'] },
  { name: 'Zwillinge', symbol: '\u264A', element: 'Luft', impulse: ['Deine Neugierde fuehrt dich heute zu spannenden Erkenntnissen.', 'Gespraeche oeffnen neue Tueren — suche den Austausch.', 'Lass beide Seiten in dir zu Wort kommen.'] },
  { name: 'Krebs', symbol: '\u264B', element: 'Wasser', impulse: ['Dein Mitgefuehl ist heute deine groesste Gabe.', 'Zurueckziehen ist erlaubt — dein Inneres braucht Raum.', 'Pflege die Verbindungen, die dir am Herzen liegen.'] },
  { name: 'Loewe', symbol: '\u264C', element: 'Feuer', impulse: ['Dein Strahlen inspiriert andere — zeig dich.', 'Grosszuegigkeit kommt heute doppelt zurueck.', 'Fuehre mit dem Herzen, nicht mit dem Kopf.'] },
  { name: 'Jungfrau', symbol: '\u264D', element: 'Erde', impulse: ['Ordnung im Aussen schafft Klarheit im Innen.', 'Dein Blick fuers Detail ist heute Gold wert.', 'Perfektionismus darf heute mal Pause machen.'] },
  { name: 'Waage', symbol: '\u264E', element: 'Luft', impulse: ['Balance ist heute dein Schluessel. Finde die Mitte.', 'Schoenheit in allen Formen naehrt deine Seele.', 'Harmonie beginnt bei dir selbst.'] },
  { name: 'Skorpion', symbol: '\u264F', element: 'Wasser', impulse: ['Tiefe Einblicke warten heute auf dich.', 'Transformation beginnt mit einem ehrlichen Blick nach innen.', 'Lass los, was nicht mehr dient.'] },
  { name: 'Schuetze', symbol: '\u2650', element: 'Feuer', impulse: ['Dein Optimismus oeffnet heute Tueren.', 'Folge deiner Abenteuerlust — auch im Kleinen.', 'Weisheit kommt heute durch Erfahrung, nicht durch Buechern.'] },
];

function getZodiacFromBirthday(birthday: string): ZodiacSign {
  const d = new Date(birthday);
  const month = d.getMonth() + 1; // 1-12
  const day = d.getDate();

  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return ZODIAC_SIGNS[1]; // Wassermann
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return ZODIAC_SIGNS[2]; // Fische
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return ZODIAC_SIGNS[3]; // Widder
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return ZODIAC_SIGNS[4]; // Stier
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return ZODIAC_SIGNS[5]; // Zwillinge
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return ZODIAC_SIGNS[6]; // Krebs
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return ZODIAC_SIGNS[7]; // Loewe
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return ZODIAC_SIGNS[8]; // Jungfrau
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return ZODIAC_SIGNS[9]; // Waage
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return ZODIAC_SIGNS[10]; // Skorpion
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return ZODIAC_SIGNS[11]; // Schuetze
  return ZODIAC_SIGNS[0]; // Steinbock
}

// ── Numerologie: Tageszahl ───────────────────────────────────
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

export default function AstroSideStack({ birthday }: Props) {
  const zodiac = useMemo(() => {
    if (!birthday) return null;
    return getZodiacFromBirthday(birthday);
  }, [birthday]);

  const dayNumber = useMemo(() => getDayNumber(), []);
  const dayMeaning = NUMEROLOGY_MEANINGS[dayNumber] ?? '';

  // Tagesimpuls deterministisch waehlen
  const dailyImpulse = useMemo(() => {
    if (!zodiac) return '';
    const now = new Date();
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
    return zodiac.impulse[dayOfYear % zodiac.impulse.length];
  }, [zodiac]);

  return (
    <div className="flex flex-col gap-3">
      {/* Sternzeichen-Karte */}
      {zodiac && (
        <div
          className="rounded-[8px] p-4 flex flex-col gap-2 relative overflow-hidden flex-1"
          style={{
            background: 'var(--glass)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--glass-border)',
          }}
        >
          {/* Subtiler Gold-Glow oben rechts */}
          <div
            className="absolute -top-5 -right-5 w-20 h-20 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, var(--gold-glow) 0%, transparent 70%)' }}
          />

          {/* Symbol */}
          <span className="font-heading text-[28px] leading-none" style={{ color: 'var(--gold)', filter: 'drop-shadow(0 0 8px var(--gold-glow))' }}>
            {zodiac.symbol}
          </span>

          {/* Name */}
          <span className="font-label text-[12px] tracking-[0.08em] uppercase" style={{ color: 'var(--gold)' }}>
            {zodiac.name}
          </span>

          {/* Tagesimpuls */}
          <p className="font-body text-[11px] leading-[1.5]" style={{ color: 'var(--text-body)' }}>
            {dailyImpulse}
          </p>
        </div>
      )}

      {/* Tageszahl-Karte */}
      <div
        className="rounded-[8px] p-4 flex flex-col items-center justify-center text-center gap-1 relative overflow-hidden flex-1"
        style={{
          background: 'var(--glass)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--glass-border)',
        }}
      >
        <span className="font-label text-[9px] tracking-[0.12em] uppercase" style={{ color: 'var(--gold)' }}>
          Tageszahl
        </span>
        <span
          className="font-heading text-[48px] leading-none"
          style={{ color: 'var(--text-h)' }}
        >
          {dayNumber}
        </span>
        <p className="font-body text-[11px]" style={{ color: 'var(--text-body)' }}>
          {dayMeaning}
        </p>
      </div>

      {/* Kein Sternzeichen gesetzt */}
      {!zodiac && (
        <div
          className="rounded-[8px] p-4 flex flex-col items-center gap-2 text-center"
          style={{
            background: 'var(--glass)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--glass-border)',
          }}
        >
          <Icon name="zodiac-aquarius" size={24} style={{ color: 'var(--text-muted)' }} />
          <p className="font-body text-[11px]" style={{ color: 'var(--text-muted)' }}>
            Trage dein Geburtsdatum im Profil ein und erhalte persoenliche Impulse.
          </p>
        </div>
      )}
    </div>
  );
}
