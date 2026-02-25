'use client';

import { useState, useEffect, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import type { SoEvent } from '@/types/events';
import { fetchMyEvents, joinEvent, leaveEvent, bookmarkEvent, unbookmarkEvent } from '@/lib/events';
import EventCardCompact from '@/components/discover/EventCardCompact';
import ShareEventModal from '@/components/discover/ShareEventModal';
import { Icon } from '@/components/ui/Icon';

interface Props {
  user: User | null;
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

    // Optimistisches Update
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
      // Revert bei Fehler
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
          Deine Events und Kurse
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {events.map((event) => (
              <EventCardCompact
                key={event.id}
                event={event}
                userId={user?.id}
                onJoin={handleJoinEvent}
                onLeave={handleLeaveEvent}
                onShare={setShareEvent}
                onBookmark={handleBookmarkEvent}
                joining={joiningEvent[event.id]}
                bookmarking={bookmarkingEvent[event.id]}
              />
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
