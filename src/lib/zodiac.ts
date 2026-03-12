// Sternzeichen-Berechnung aus Geburtstag

interface ZodiacSign {
  name: string;
  symbol: string;
}

const ZODIAC_SIGNS: Array<ZodiacSign & { fromMonth: number; fromDay: number; toMonth: number; toDay: number }> = [
  { name: 'Steinbock',  symbol: '\u2651', fromMonth: 12, fromDay: 22, toMonth: 1,  toDay: 19 },
  { name: 'Wassermann', symbol: '\u2652', fromMonth: 1,  fromDay: 20, toMonth: 2,  toDay: 18 },
  { name: 'Fische',     symbol: '\u2653', fromMonth: 2,  fromDay: 19, toMonth: 3,  toDay: 20 },
  { name: 'Widder',     symbol: '\u2648', fromMonth: 3,  fromDay: 21, toMonth: 4,  toDay: 19 },
  { name: 'Stier',      symbol: '\u2649', fromMonth: 4,  fromDay: 20, toMonth: 5,  toDay: 20 },
  { name: 'Zwillinge',  symbol: '\u264A', fromMonth: 5,  fromDay: 21, toMonth: 6,  toDay: 20 },
  { name: 'Krebs',      symbol: '\u264B', fromMonth: 6,  fromDay: 21, toMonth: 7,  toDay: 22 },
  { name: 'Loewe',      symbol: '\u264C', fromMonth: 7,  fromDay: 23, toMonth: 8,  toDay: 22 },
  { name: 'Jungfrau',   symbol: '\u264D', fromMonth: 8,  fromDay: 23, toMonth: 9,  toDay: 22 },
  { name: 'Waage',      symbol: '\u264E', fromMonth: 9,  fromDay: 23, toMonth: 10, toDay: 22 },
  { name: 'Skorpion',   symbol: '\u264F', fromMonth: 10, fromDay: 23, toMonth: 11, toDay: 21 },
  { name: 'Schuetze',   symbol: '\u2650', fromMonth: 11, fromDay: 22, toMonth: 12, toDay: 21 },
];

/**
 * Berechnet das Sternzeichen aus einem ISO-Datum (z.B. "1990-06-15").
 * Gibt null zurueck wenn das Datum ungueltig ist.
 */
export function getZodiacSign(birthday: string): ZodiacSign | null {
  const date = new Date(birthday + 'T00:00:00');
  if (isNaN(date.getTime())) return null;

  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();

  for (const sign of ZODIAC_SIGNS) {
    // Steinbock ist speziell: Dezember → Januar (Jahreswechsel)
    if (sign.fromMonth > sign.toMonth) {
      if ((month === sign.fromMonth && day >= sign.fromDay) || (month === sign.toMonth && day <= sign.toDay)) {
        return { name: sign.name, symbol: sign.symbol };
      }
    } else {
      if ((month === sign.fromMonth && day >= sign.fromDay) || (month === sign.toMonth && day <= sign.toDay)) {
        return { name: sign.name, symbol: sign.symbol };
      }
    }
  }

  return null;
}
