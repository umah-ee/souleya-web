'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { User } from '@supabase/supabase-js';
import type { SoEvent } from '@/types/events';
import { fetchMyEvents, joinEvent, leaveEvent, bookmarkEvent, unbookmarkEvent } from '@/lib/events';
import EventCardCompact from '@/components/discover/EventCardCompact';
import ShareEventModal from '@/components/discover/ShareEventModal';
import { Icon } from '@/components/ui/Icon';

interface Props {
  user: User | null;
}

// ── Hilfsfunktionen fuer Timeline-Gruppierung ──────────────
function formatMonthYear(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
}

function formatWeekday(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('de-DE', { weekday: 'short' });
}

function formatDay(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('de-DE', { day: 'numeric' });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

interface TimelineGroup {
  label: string;
  events: SoEvent[];
}

function groupEventsByMonth(events: SoEvent[]): TimelineGroup[] {
  const map = new Map<string, SoEvent[]>();
  for (const event of events) {
    const key = formatMonthYear(event.starts_at);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(event);
  }
  return Array.from(map.entries()).map(([label, evts]) => ({ label, events: evts }));
}

export default function FeedClient({ user }: Props) {
  const [events, setEvents] = useState<SoEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [joiningEvent, setJoiningEvent] = useState<Record<string, boolean>>({});
  const [bookmarkingEvent, setBookmarkingEvent] = useState<Record<string, boolean>>({});
  const [shareEvent, setShareEvent] = useState<SoEvent | null>(null);

  const loadEvents = useCallback(async (pageNum: number, replace: boolean) => {
    try {
      const result = await fetchMyEvents(pageNum, 20);
      setEvents((prev) => replace ? result.data : [...prev, ...result.data]);
      setHasMore(result.hasMore);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    loadEvents(1, true).finally(() => setLoading(false));
  }, [loadEvents, user]);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    await loadEvents(nextPage, false);
    setPage(nextPage);
    setLoadingMore(false);
  };

  // Events nach starts_at aufsteigend sortieren (naechstes zuerst)
  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()),
    [events],
  );

  const groups = useMemo(() => groupEventsByMonth(sortedEvents), [sortedEvents]);

  // ── Event beitreten ─────────────────────────────────────
  const handleJoinEvent = async (eventId: string) => {
    setJoiningEvent((s) => ({ ...s, [eventId]: true }));
    try {
      const res = await joinEvent(eventId);
      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId
            ? { ...e, has_joined: true, participants_count: res.participants_count }
            : e,
        ),
      );
    } catch (e) {
      console.error(e);
    } finally {
      setJoiningEvent((s) => ({ ...s, [eventId]: false }));
    }
  };

  // ── Event verlassen ─────────────────────────────────────
  const handleLeaveEvent = async (eventId: string) => {
    setJoiningEvent((s) => ({ ...s, [eventId]: true }));
    try {
      const res = await leaveEvent(eventId);
      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId
            ? { ...e, has_joined: false, participants_count: res.participants_count }
            : e,
        ),
      );
    } catch (e) {
      console.error(e);
    } finally {
      setJoiningEvent((s) => ({ ...s, [eventId]: false }));
    }
  };

  // ── Event merken/entmerken ──────────────────────────────
  const handleBookmarkEvent = async (eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return;

    const wasBookmarked = event.is_bookmarked;

    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, is_bookmarked: !wasBookmarked } : e)),
    );

    setBookmarkingEvent((s) => ({ ...s, [eventId]: true }));
    try {
      if (wasBookmarked) {
        await unbookmarkEvent(eventId);
      } else {
        await bookmarkEvent(eventId);
      }
    } catch (e) {
      setEvents((prev) =>
        prev.map((ev) => (ev.id === eventId ? { ...ev, is_bookmarked: wasBookmarked } : ev)),
      );
      console.error(e);
    } finally {
      setBookmarkingEvent((s) => ({ ...s, [eventId]: false }));
    }
  };

  return (
    <>
      {/* Desktop Header */}
      <div className="hidden md:block mb-6">
        <h1 className="font-heading text-2xl" style={{ color: 'var(--gold-text)' }}>
          Meine Impulse
        </h1>
        <p className="text-sm font-body mt-1" style={{ color: 'var(--text-muted)' }}>
          Deine Events und Kurse auf einen Blick
        </p>
      </div>

      {/* Events */}
      {loading ? (
        <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
          <p className="font-label text-[0.7rem] tracking-[0.2em]">
            WIRD GELADEN …
          </p>
        </div>
      ) : events.length === 0 ? (
        <div
          className="text-center py-16 px-4 rounded-2xl"
          style={{ border: '1px dashed var(--gold-border-s)' }}
        >
          <div className="mb-3">
            <Icon name="calendar" size={32} style={{ color: 'var(--gold)', opacity: 0.6 }} />
          </div>
          <p className="font-heading text-2xl mb-2" style={{ color: 'var(--gold)' }}>
            Noch keine Events
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Entdecke Events auf der Discover-Seite und nimm teil oder merke sie dir.
          </p>
        </div>
      ) : (
        <>
          {/* ── Timeline ────────────────────────────────────── */}
          <div className="relative">
            {groups.map((group, gi) => (
              <div key={group.label} className="relative">
                {/* Monats-Header */}
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0 z-10"
                    style={{
                      background: 'linear-gradient(135deg, var(--gold-deep), var(--gold))',
                      boxShadow: '0 0 8px rgba(200,169,110,0.4)',
                    }}
                  />
                  <span
                    className="font-label text-[0.7rem] tracking-[0.15em] uppercase"
                    style={{ color: 'var(--gold-text)' }}
                  >
                    {group.label}
                  </span>
                  <div className="flex-1 h-px" style={{ background: 'var(--gold-border-s)' }} />
                </div>

                {/* Events in diesem Monat */}
                <div className="relative pl-6 ml-[5px]">
                  {/* Vertikale Timeline-Linie */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-[1.5px]"
                    style={{
                      background: gi === groups.length - 1
                        ? 'linear-gradient(to bottom, var(--gold-border-s), transparent)'
                        : 'var(--gold-border-s)',
                    }}
                  />

                  {group.events.map((event, ei) => (
                    <div key={event.id} className="relative mb-5 last:mb-8">
                      {/* Verbindungspunkt auf der Timeline */}
                      <div
                        className="absolute -left-6 top-4 w-[9px] h-[9px] rounded-full z-10"
                        style={{
                          left: '-6px',
                          marginLeft: '-3.5px',
                          background: event.is_bookmarked ? 'var(--gold)' : 'var(--glass)',
                          border: `2px solid ${event.is_bookmarked ? 'var(--gold)' : 'var(--gold-border-s)'}`,
                          boxShadow: event.is_bookmarked ? '0 0 6px rgba(200,169,110,0.3)' : 'none',
                        }}
                      />

                      {/* Datum-Badge links */}
                      <div className="flex items-start gap-3">
                        <div
                          className="flex-shrink-0 w-12 text-center pt-1"
                        >
                          <div
                            className="font-heading text-lg leading-none"
                            style={{ color: 'var(--gold-text)' }}
                          >
                            {formatDay(event.starts_at)}
                          </div>
                          <div
                            className="font-label text-[0.5rem] tracking-[0.12em] uppercase"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            {formatWeekday(event.starts_at)}
                          </div>
                          <div
                            className="font-label text-[0.5rem] mt-0.5"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            {formatTime(event.starts_at)}
                          </div>
                        </div>

                        {/* Event Card */}
                        <div className="flex-1 min-w-0">
                          <EventCardCompact
                            event={event}
                            userId={user?.id}
                            onJoin={handleJoinEvent}
                            onLeave={handleLeaveEvent}
                            onShare={setShareEvent}
                            onBookmark={handleBookmarkEvent}
                            joining={joiningEvent[event.id]}
                            bookmarking={bookmarkingEvent[event.id]}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="text-center py-4 mt-4">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-6 py-2.5 bg-transparent rounded-full font-label text-[0.7rem] tracking-[0.1em] uppercase cursor-pointer transition-colors duration-200"
                style={{
                  border: '1px solid var(--gold-border-s)',
                  color: 'var(--gold-text)',
                }}
              >
                {loadingMore ? '…' : 'Mehr laden'}
              </button>
            </div>
          )}
        </>
      )}

      {/* ShareEventModal */}
      {shareEvent && (
        <ShareEventModal
          event={shareEvent}
          onClose={() => setShareEvent(null)}
        />
      )}
    </>
  );
}
