import { createClient } from '@/lib/supabase/server';
import type { Raum, RaumComment } from './raeume';

/* ────────────────── DB-Mapping ────────────────── */

type RoomRow = {
  id: string;
  slug: string;
  type: 'call' | 'offen';
  question: string;
  teaser: string;
  impuls: string[];
  impuls_frage: string;
  call_date: string | null;
  call_date_long: string | null;
  call_time: string | null;
  call_duration_min: number | null;
  call_max_slots: number | null;
  call_mail_date: string | null;
  call_meet_link: string | null;
  call_calendar_link: string | null;
  ended: boolean;
  call_summary: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
};

function mapRoom(row: RoomRow): Raum {
  if (row.type === 'call') {
    return {
      id: row.id,
      slug: row.slug,
      type: 'call',
      question: row.question,
      teaser: row.teaser,
      impuls: row.impuls ?? [],
      impulsFrage: row.impuls_frage,
      callDate: row.call_date ?? '',
      callDateLong: row.call_date_long ?? '',
      callTime: row.call_time ?? '',
      callDurationMin: row.call_duration_min ?? 20,
      callMaxSlots: row.call_max_slots ?? 12,
      callMailDate: row.call_mail_date ?? '',
      callMeetLink: row.call_meet_link,
      callCalendarLink: row.call_calendar_link ?? '',
      ended: row.ended,
      callSummary: row.call_summary ?? undefined,
    };
  }
  return {
    id: row.id,
    slug: row.slug,
    type: 'offen',
    question: row.question,
    teaser: row.teaser,
    impuls: row.impuls ?? [],
    impulsFrage: row.impuls_frage,
  };
}

/* ────────────────── Public Reads ────────────────── */

export async function findRaum(slug: string): Promise<Raum | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();
  if (error || !data) return null;
  return mapRoom(data as RoomRow);
}

export async function sortedRaeume(): Promise<Raum[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('rooms')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });
  if (!data) return [];
  // Aktive Call-Räume (noch nicht beendet) ans obere Ende pinnen
  return (data as RoomRow[])
    .map(mapRoom)
    .sort((a, b) => {
      const aPinned = a.type === 'call' && !a.ended ? 1 : 0;
      const bPinned = b.type === 'call' && !b.ended ? 1 : 0;
      return bPinned - aPinned;
    });
}

/* ────────────────── Kommentare ────────────────── */

type CommentRow = {
  id: string;
  room_id: string;
  parent_id: string | null;
  email: string;
  display_name: string;
  is_anonymous: boolean;
  text: string;
  created_at: string;
};

export async function getRaumComments(roomId: string): Promise<RaumComment[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('room_comments')
    .select('id, room_id, parent_id, display_name, is_anonymous, text, created_at')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true });
  if (!data) return [];
  return buildCommentTree(data as CommentRow[]);
}

function buildCommentTree(rows: CommentRow[]): RaumComment[] {
  const byId = new Map<string, RaumComment>();
  const top: RaumComment[] = [];

  for (const r of rows) {
    byId.set(r.id, {
      id: r.id,
      name: r.is_anonymous ? 'Anonym' : r.display_name,
      isAnonymous: r.is_anonymous,
      timeAgo: formatTimeAgo(r.created_at),
      text: r.text,
      replies: [],
    });
  }

  for (const r of rows) {
    const c = byId.get(r.id)!;
    if (r.parent_id && byId.has(r.parent_id)) {
      const parent = byId.get(r.parent_id)!;
      parent.replies = parent.replies ?? [];
      parent.replies.push(c);
    } else {
      top.push(c);
    }
  }

  return top;
}

function formatTimeAgo(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffH = Math.floor(diffMs / 3_600_000);
  const diffD = Math.floor(diffMs / 86_400_000);
  if (diffMin < 1) return 'gerade eben';
  if (diffMin < 60) return `vor ${diffMin} Min.`;
  if (diffH < 24) return diffH === 1 ? 'vor 1 Std.' : `vor ${diffH} Std.`;
  if (diffD === 1) return 'vor 1 Tag';
  return `vor ${diffD} Tagen`;
}
