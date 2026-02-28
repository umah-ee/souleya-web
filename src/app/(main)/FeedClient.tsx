'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { User } from '@supabase/supabase-js';
import type { SoEvent } from '@/types/events';
import type { Pulse } from '@/types/pulse';
import { fetchMyEvents, joinEvent, leaveEvent, bookmarkEvent, unbookmarkEvent } from '@/lib/events';
import { fetchMyPulses } from '@/lib/pulse';
import EventCardCompact from '@/components/discover/EventCardCompact';
import PulseCard from '@/components/pulse/PulseCard';
import ShareEventModal from '@/components/discover/ShareEventModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Icon } from '@/components/ui/Icon';
import { fetchChallenges, joinChallenge, checkinChallenge, fetchChallenge } from '@/lib/challenges';
import type { Challenge } from '@/types/challenges';
import ChallengeCard from '@/components/challenges/ChallengeCard';
import ChallengeDetailModal from '@/components/challenges/ChallengeDetailModal';
import CreateChallengeModal from '@/components/challenges/CreateChallengeModal';

interface Props {
  user: User | null;
}

// ── Union-Typ fuer Timeline-Items ────────────────────────────
type TimelineItem =
  | { type: 'event'; date: Date; data: SoEvent }
  | { type: 'pulse'; date: Date; data: Pulse };

// ── Hilfsfunktionen fuer Timeline-Gruppierung ──────────────
function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
}

function formatWeekday(date: Date): string {
  return date.toLocaleDateString('de-DE', { weekday: 'short' });
}

function formatDay(date: Date): string {
  return date.toLocaleDateString('de-DE', { day: 'numeric' });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

interface TimelineGroup {
  label: string;
  items: TimelineItem[];
}

function groupByMonth(items: TimelineItem[]): TimelineGroup[] {
  const map = new Map<string, TimelineItem[]>();
  for (const item of items) {
    const key = formatMonthYear(item.date);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  }
  return Array.from(map.entries()).map(([label, groupItems]) => ({ label, items: groupItems }));
}

export default function FeedClient({ user }: Props) {
  const [events, setEvents] = useState<SoEvent[]>([]);
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [eventPage, setEventPage] = useState(1);
  const [hasMoreEvents, setHasMoreEvents] = useState(false);
  const [joiningEvent, setJoiningEvent] = useState<Record<string, boolean>>({});
  const [bookmarkingEvent, setBookmarkingEvent] = useState<Record<string, boolean>>({});
  const [shareEvent, setShareEvent] = useState<SoEvent | null>(null);

  // Bestaetigungsdialog fuer Entmerken
  const [confirmUnbookmark, setConfirmUnbookmark] = useState<string | null>(null);

  // Challenges
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  // ── Daten laden ─────────────────────────────────────────────
  const loadData = useCallback(async (pageNum: number, replace: boolean) => {
    try {
      const [eventsRes, pulsesRes] = await Promise.all([
        fetchMyEvents(pageNum, 20),
        replace ? fetchMyPulses(1, 50) : Promise.resolve(null),
      ]);
      setEvents((prev) => replace ? eventsRes.data : [...prev, ...eventsRes.data]);
      setHasMoreEvents(eventsRes.hasMore);
      if (pulsesRes) {
        setPulses(pulsesRes.data);
      }
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
    loadData(1, true).finally(() => setLoading(false));
  }, [loadData, user]);

  // Challenges laden
  useEffect(() => {
    if (!user) return;
    fetchChallenges({ page: 1, limit: 10 }).then(res => setChallenges(res.data)).catch(console.error);
  }, [user]);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    const nextPage = eventPage + 1;
    await loadData(nextPage, false);
    setEventPage(nextPage);
    setLoadingMore(false);
  };

  // ── Timeline-Items zusammenfuehren und sortieren ─────────
  const timelineItems = useMemo(() => {
    const items: TimelineItem[] = [];

    for (const event of events) {
      items.push({ type: 'event', date: new Date(event.starts_at), data: event });
    }

    for (const pulse of pulses) {
      items.push({ type: 'pulse', date: new Date(pulse.created_at), data: pulse });
    }

    // Absteigend sortieren (neueste zuerst)
    items.sort((a, b) => b.date.getTime() - a.date.getTime());
    return items;
  }, [events, pulses]);

  const groups = useMemo(() => groupByMonth(timelineItems), [timelineItems]);

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

  // ── Bookmark mit Bestaetigung ─────────────────────────────
  const handleBookmarkEvent = async (eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return;

    // Wenn bereits gemerkt → Bestaetigungsdialog zeigen
    if (event.is_bookmarked) {
      setConfirmUnbookmark(eventId);
      return;
    }

    // Merken (optimistisch)
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, is_bookmarked: true } : e)),
    );
    setBookmarkingEvent((s) => ({ ...s, [eventId]: true }));
    try {
      await bookmarkEvent(eventId);
    } catch (e) {
      setEvents((prev) =>
        prev.map((ev) => (ev.id === eventId ? { ...ev, is_bookmarked: false } : ev)),
      );
      console.error(e);
    } finally {
      setBookmarkingEvent((s) => ({ ...s, [eventId]: false }));
    }
  };

  // ── Entmerken bestaetigt ──────────────────────────────────
  const handleConfirmUnbookmark = async () => {
    const eventId = confirmUnbookmark;
    if (!eventId) return;
    setConfirmUnbookmark(null);

    // Optimistisch entmerken
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, is_bookmarked: false } : e)),
    );
    setBookmarkingEvent((s) => ({ ...s, [eventId]: true }));
    try {
      await unbookmarkEvent(eventId);
      // Event aus der Liste entfernen wenn nicht mehr joined
      setEvents((prev) => prev.filter((e) => e.id !== eventId || e.has_joined));
    } catch (e) {
      setEvents((prev) =>
        prev.map((ev) => (ev.id === eventId ? { ...ev, is_bookmarked: true } : ev)),
      );
      console.error(e);
    } finally {
      setBookmarkingEvent((s) => ({ ...s, [eventId]: false }));
    }
  };

  // ── Pulse geloescht ───────────────────────────────────────
  const handlePulseDeleted = (pulseId: string) => {
    setPulses((prev) => prev.filter((p) => p.id !== pulseId));
  };

  // ── Challenge-Aktionen ──────────────────────────────────────
  const handleJoinChallenge = async (challengeId: string) => {
    try {
      const res = await joinChallenge(challengeId);
      setChallenges(prev => prev.map(c =>
        c.id === challengeId ? { ...c, has_joined: true, participants_count: res.participants_count } : c
      ));
    } catch (e) { console.error(e); }
  };

  const handleCheckinChallenge = async (challengeId: string) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return;
    const startDate = new Date(challenge.starts_at);
    const today = new Date(); today.setHours(0,0,0,0);
    const startDay = new Date(startDate); startDay.setHours(0,0,0,0);
    const diffMs = today.getTime() - startDay.getTime();
    const currentDayNumber = Math.max(1, Math.min(challenge.duration_days, Math.floor(diffMs / 86400000) + 1));
    try {
      await checkinChallenge(challengeId, currentDayNumber);
      const updated = await fetchChallenge(challengeId);
      setChallenges(prev => prev.map(c => c.id === challengeId ? updated : c));
    } catch (e) { console.error(e); }
  };

  const handleChallengeCreated = (challenge: Challenge) => {
    setChallenges(prev => [challenge, ...prev]);
  };

  const handleChallengeUpdate = (challengeId: string, updates: Partial<Challenge>) => {
    setChallenges(prev => prev.map(c => c.id === challengeId ? { ...c, ...updates } : c));
  };

  const isEmpty = timelineItems.length === 0;

  return (
    <>
      {/* Desktop Header */}
      <div className="hidden md:block mb-6">
        <h1 className="font-heading text-2xl" style={{ color: 'var(--gold-text)' }}>
          Meine Impulse
        </h1>
        <p className="text-sm font-body mt-1" style={{ color: 'var(--text-muted)' }}>
          Deine Events, Kurse und Beitraege auf einen Blick
        </p>
      </div>

      {/* ── Aktive Challenges ──────────────────────────── */}
      {!loading && challenges.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Icon name="target" size={16} style={{ color: 'var(--gold)' }} />
              <span className="font-label text-[0.65rem] tracking-[0.15em] uppercase" style={{ color: 'var(--gold-text)' }}>
                Aktive Challenges
              </span>
            </div>
            {user && (
              <button
                onClick={() => setShowCreateChallenge(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full font-label text-[0.6rem] tracking-[0.1em] uppercase cursor-pointer transition-all duration-200"
                style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}
              >
                <Icon name="plus" size={12} />
                Neue Challenge
              </button>
            )}
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin" style={{ scrollbarWidth: 'none' }}>
            {challenges.map(challenge => {
              const startDate = new Date(challenge.starts_at);
              const today = new Date(); today.setHours(0,0,0,0);
              const startDay = new Date(startDate); startDay.setHours(0,0,0,0);
              const diffMs = today.getTime() - startDay.getTime();
              const currentDayNumber = Math.max(1, Math.min(challenge.duration_days, Math.floor(diffMs / 86400000) + 1));
              const checkinDays = new Set((challenge.my_progress?.checkins ?? []).map(c => c.day_number));
              const checkedInToday = checkinDays.has(currentDayNumber);
              return (
                <div key={challenge.id} className="flex-shrink-0" style={{ width: 280 }}>
                  <ChallengeCard
                    challenge={challenge}
                    currentDayNumber={currentDayNumber}
                    checkedInToday={checkedInToday}
                    onClick={() => setSelectedChallenge(challenge)}
                    onJoin={() => handleJoinChallenge(challenge.id)}
                    onCheckin={() => handleCheckinChallenge(challenge.id)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Wenn keine Challenges aber User eingeloggt: nur den Button zeigen */}
      {!loading && challenges.length === 0 && user && (
        <div className="mb-6 text-center">
          <button
            onClick={() => setShowCreateChallenge(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-label text-[0.65rem] tracking-[0.1em] uppercase cursor-pointer transition-all duration-200"
            style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}
          >
            <Icon name="target" size={14} />
            Erste Challenge starten
          </button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
          <p className="font-label text-[0.7rem] tracking-[0.2em]">
            WIRD GELADEN …
          </p>
        </div>
      ) : isEmpty ? (
        <div
          className="text-center py-16 px-4 rounded-2xl"
          style={{ border: '1px dashed var(--gold-border-s)' }}
        >
          <div className="mb-3">
            <Icon name="sparkles" size={32} style={{ color: 'var(--gold)', opacity: 0.6 }} />
          </div>
          <p className="font-heading text-2xl mb-2" style={{ color: 'var(--gold)' }}>
            Noch keine Impulse
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Erstelle einen Beitrag, nimm an Events teil oder merke dir welche.
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

                {/* Items in diesem Monat */}
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

                  {group.items.map((item) => {
                    const isEvent = item.type === 'event';
                    const itemId = isEvent ? (item.data as SoEvent).id : (item.data as Pulse).id;
                    const isBookmarked = isEvent ? (item.data as SoEvent).is_bookmarked : false;

                    return (
                      <div key={`${item.type}-${itemId}`} className="relative mb-5 last:mb-8">
                        {/* Verbindungspunkt auf der Timeline */}
                        <div
                          className="absolute -left-6 top-4 w-[9px] h-[9px] rounded-full z-10"
                          style={{
                            left: '-6px',
                            marginLeft: '-3.5px',
                            background: isEvent
                              ? (isBookmarked ? 'var(--gold)' : 'var(--glass)')
                              : 'var(--gold-deep)',
                            border: `2px solid ${isEvent
                              ? (isBookmarked ? 'var(--gold)' : 'var(--gold-border-s)')
                              : 'var(--gold-deep)'}`,
                            boxShadow: (isBookmarked || !isEvent) ? '0 0 6px rgba(200,169,110,0.3)' : 'none',
                          }}
                        />

                        {/* Datum-Badge + Card */}
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-12 text-center pt-1">
                            <div
                              className="font-heading text-lg leading-none"
                              style={{ color: 'var(--gold-text)' }}
                            >
                              {formatDay(item.date)}
                            </div>
                            <div
                              className="font-label text-[0.5rem] tracking-[0.12em] uppercase"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              {formatWeekday(item.date)}
                            </div>
                            <div
                              className="font-label text-[0.5rem] mt-0.5"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              {formatTime(item.date)}
                            </div>
                          </div>

                          {/* Card */}
                          <div className="flex-1 min-w-0">
                            {isEvent ? (
                              <EventCardCompact
                                event={item.data as SoEvent}
                                userId={user?.id}
                                onJoin={handleJoinEvent}
                                onLeave={handleLeaveEvent}
                                onShare={setShareEvent}
                                onBookmark={handleBookmarkEvent}
                                joining={joiningEvent[(item.data as SoEvent).id]}
                                bookmarking={bookmarkingEvent[(item.data as SoEvent).id]}
                              />
                            ) : (
                              <PulseCard
                                pulse={item.data as Pulse}
                                currentUserId={user?.id}
                                onDelete={() => handlePulseDeleted((item.data as Pulse).id)}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {hasMoreEvents && (
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

      {/* Bestaetigungsdialog: Event entmerken */}
      <ConfirmDialog
        open={!!confirmUnbookmark}
        title="Event entmerken?"
        message="Moechtest du dieses Event nicht mehr merken? Es verschwindet dann aus deinen Impulsen."
        confirmLabel="Entmerken"
        cancelLabel="Behalten"
        onConfirm={handleConfirmUnbookmark}
        onCancel={() => setConfirmUnbookmark(null)}
      />

      {/* CreateChallengeModal */}
      {showCreateChallenge && (
        <CreateChallengeModal
          onClose={() => setShowCreateChallenge(false)}
          onCreated={handleChallengeCreated}
        />
      )}

      {/* ChallengeDetailModal */}
      {selectedChallenge && (
        <ChallengeDetailModal
          challenge={selectedChallenge}
          currentUserId={user?.id}
          onClose={() => setSelectedChallenge(null)}
          onUpdate={(updates) => {
            handleChallengeUpdate(selectedChallenge.id, updates);
            setSelectedChallenge(prev => prev ? { ...prev, ...updates } : null);
          }}
        />
      )}
    </>
  );
}
