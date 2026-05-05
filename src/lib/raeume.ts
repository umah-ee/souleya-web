/**
 * Räume — Typen + reine Helpers, browser-safe.
 *
 * Server-Side-Datenzugriff (Supabase, Cookies) liegt in `raeume-db.ts`,
 * damit Client Components diese Datei importieren können ohne
 * `next/headers` mitzuziehen.
 */

export type RaumComment = {
  id: string;
  name: string;
  isAnonymous?: boolean;
  timeAgo: string;
  text: string;
  replies?: RaumComment[];
};

type RaumBase = {
  id: string;
  slug: string;
  question: string;
  teaser: string;
  impuls: string[];
  impulsFrage: string;
};

export type CallRaum = RaumBase & {
  type: 'call';
  callDate: string;
  callDateLong: string;
  callTime: string;
  callDurationMin: number;
  callMaxSlots: number;
  callMailDate: string;
  callMeetLink: string | null;
  callCalendarLink: string;
  ended: boolean;
  callSummary?: string;
};

export type OffenerRaum = RaumBase & {
  type: 'offen';
};

export type Raum = CallRaum | OffenerRaum;

export function commentCount(comments: RaumComment[]): number {
  return comments.reduce(
    (sum, c) => sum + 1 + (c.replies?.length ?? 0),
    0,
  );
}
