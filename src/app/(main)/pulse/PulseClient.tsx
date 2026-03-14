'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import type { SoEvent } from '@/types/events';
import type { Connection } from '@/types/circles';
import type { Challenge } from '@/types/challenges';
import type { Pulse } from '@/types/pulse';
import { fetchMyEvents, fetchEvents, joinEvent } from '@/lib/events';
import { getIncomingRequests, respondToRequest } from '@/lib/circles';
import { fetchMyChallenges, checkinChallenge } from '@/lib/challenges';
import { fetchMyPulses, createPulse } from '@/lib/pulse';
import { getDailyQuote } from '@/lib/wisdomQuotes';
import { Icon } from '@/components/ui/Icon';
import EnsoRing from '@/components/ui/EnsoRing';

// ── Props ─────────────────────────────────────────────────────
interface Props {
  user: User | null;
  displayName: string | null;
  locationLat: number | null;
  locationLng: number | null;
  interests: string[];
}

// ── Hilfsfunktionen ───────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Guten Morgen';
  if (h < 17) return 'Guten Tag';
  if (h < 21) return 'Guten Abend';
  return 'Gute Nacht';
}

function formatDateLong(d: Date): string {
  return d.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
}

function formatEventDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
}

function formatEventTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

function formatEventWeekday(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('de-DE', { weekday: 'short' });
}

/** Haversine distance in km */
function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ══════════════════════════════════════════════════════════════
// PULSE DASHBOARD — Ive Style
// ══════════════════════════════════════════════════════════════

export default function PulseClient({ user, displayName, locationLat, locationLng, interests }: Props) {
  // State
  const [requests, setRequests] = useState<Connection[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<SoEvent[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [recommendations, setRecommendations] = useState<SoEvent[]>([]);
  const [recentPulses, setRecentPulses] = useState<Pulse[]>([]);
  const [loading, setLoading] = useState(true);

  // Action states
  const [respondingRequest, setRespondingRequest] = useState<Record<string, boolean>>({});
  const [joiningEvent, setJoiningEvent] = useState<Record<string, boolean>>({});
  const [checkingIn, setCheckingIn] = useState<Record<string, boolean>>({});

  // Wisdom quote sharing states
  const [quoteShareState, setQuoteShareState] = useState<'idle' | 'sharing' | 'shared'>('idle');
  const [quoteCopied, setQuoteCopied] = useState(false);

  // Daily quote
  const quote = useMemo(() => getDailyQuote(), []);

  // ── Daten laden ─────────────────────────────────────────────
  const loadData = useCallback(async () => {
    if (!user) { setLoading(false); return; }

    try {
      const now = new Date().toISOString();

      const [requestsRes, eventsRes, challengesRes, pulsesRes, recsRes] = await Promise.all([
        getIncomingRequests(1, 10).catch(() => ({ data: [] as Connection[], total: 0, hasMore: false })),
        fetchMyEvents(1, 20).catch(() => ({ data: [] as SoEvent[], total: 0, hasMore: false })),
        fetchMyChallenges().catch(() => [] as Challenge[]),
        fetchMyPulses(1, 5).catch(() => ({ data: [] as Pulse[] })),
        locationLat != null && locationLng != null
          ? fetchEvents({ lat: locationLat, lng: locationLng, limit: 10 }).catch(() => ({ data: [] as SoEvent[], total: 0, hasMore: false }))
          : Promise.resolve({ data: [] as SoEvent[], total: 0, hasMore: false }),
      ]);

      setRequests(requestsRes.data);

      const future = eventsRes.data
        .filter((e) => e.starts_at >= now)
        .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
      setUpcomingEvents(future);

      const activeChallenges = Array.isArray(challengesRes)
        ? challengesRes.filter((c) => c.status === 'active')
        : [];
      setChallenges(activeChallenges);

      setRecentPulses(pulsesRes.data);

      const recs = recsRes.data
        .filter((e) => !e.has_joined && e.starts_at >= now)
        .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
        .slice(0, 4);
      setRecommendations(recs);
    } catch (e) {
      console.error('Pulse Dashboard laden fehlgeschlagen:', e);
    } finally {
      setLoading(false);
    }
  }, [user, locationLat, locationLng]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Interest-based event suggestion ─────────────────────────
  const matchedSuggestion = useMemo(() => {
    if (upcomingEvents.length > 0 || recommendations.length === 0 || interests.length === 0) return null;
    const lowerInterests = interests.map((i) => i.toLowerCase());
    return recommendations.find((ev) => {
      const haystack = `${ev.title} ${ev.description ?? ''}`.toLowerCase();
      return lowerInterests.some((interest) => haystack.includes(interest));
    }) ?? recommendations[0] ?? null;
  }, [upcomingEvents, recommendations, interests]);

  // ── Actions ─────────────────────────────────────────────────

  const handleRespondRequest = async (id: string, status: 'accepted' | 'declined') => {
    setRespondingRequest((s) => ({ ...s, [id]: true }));
    try {
      await respondToRequest(id, status);
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      console.error(e);
    } finally {
      setRespondingRequest((s) => ({ ...s, [id]: false }));
    }
  };

  const handleJoinRecommendation = async (eventId: string) => {
    setJoiningEvent((s) => ({ ...s, [eventId]: true }));
    try {
      await joinEvent(eventId);
      const ev = recommendations.find((e) => e.id === eventId);
      if (ev) {
        setRecommendations((prev) => prev.filter((e) => e.id !== eventId));
        setUpcomingEvents((prev) =>
          [...prev, { ...ev, has_joined: true }].sort(
            (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
          ),
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setJoiningEvent((s) => ({ ...s, [eventId]: false }));
    }
  };

  const handleCheckin = async (challengeId: string, dayNumber: number) => {
    setCheckingIn((s) => ({ ...s, [challengeId]: true }));
    try {
      const result = await checkinChallenge(challengeId, dayNumber);
      setChallenges((prev) =>
        prev.map((c) =>
          c.id === challengeId
            ? {
                ...c,
                my_progress: c.my_progress
                  ? {
                      ...c.my_progress,
                      current_streak: result.current_streak,
                      total_checkins: result.total_checkins,
                      completed: result.completed,
                    }
                  : null,
              }
            : c,
        ),
      );
    } catch (e) {
      console.error(e);
    } finally {
      setCheckingIn((s) => ({ ...s, [challengeId]: false }));
    }
  };

  const handleShareQuoteToFeed = async () => {
    setQuoteShareState('sharing');
    try {
      await createPulse({
        content: `\u201E${quote.text}\u201C\n\u2014 ${quote.author} \u00B7 ${quote.tradition}`,
      });
      setQuoteShareState('shared');
      setTimeout(() => setQuoteShareState('idle'), 3000);
    } catch (e) {
      console.error(e);
      setQuoteShareState('idle');
    }
  };

  const handleCopyQuote = async () => {
    const text = `\u201E${quote.text}\u201C \u2014 ${quote.author}\n\nvia Souleya`;
    try {
      if (navigator.share) {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(text);
        setQuoteCopied(true);
        setTimeout(() => setQuoteCopied(false), 2500);
      }
    } catch {
      await navigator.clipboard.writeText(text);
      setQuoteCopied(true);
      setTimeout(() => setQuoteCopied(false), 2500);
    }
  };

  // ── Render ─────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
        <p className="font-label text-[0.7rem] tracking-[0.2em]">WIRD GELADEN …</p>
      </div>
    );
  }

  const firstName = displayName?.split(' ')[0] ?? '';

  return (
    <div className="space-y-8">
      {/* ── Gruß ──────────────────────────────────────────────── */}
      <div className="pt-2">
        <h1
          className="font-heading text-2xl md:text-3xl"
          style={{ color: 'var(--text-h)' }}
        >
          {getGreeting()}{firstName ? `, ${firstName}` : ''}
        </h1>
        <p
          className="text-sm font-body mt-1"
          style={{ color: 'var(--text-muted)' }}
        >
          {formatDateLong(new Date())}
        </p>
      </div>

      {/* ── Täglicher Weisheitsspruch ─────────────────────────── */}
      <div
        className="rounded-2xl px-6 py-7 md:px-8 md:py-9"
        style={{
          background: 'var(--gold-bg)',
          border: '1px solid var(--gold-border-s)',
        }}
      >
        <p
          className="font-heading italic text-lg md:text-xl leading-relaxed"
          style={{ color: 'var(--text-h)' }}
        >
          &bdquo;{quote.text}&ldquo;
        </p>
        <p
          className="font-label text-[0.6rem] tracking-[0.15em] uppercase mt-3"
          style={{ color: 'var(--text-muted)' }}
        >
          {quote.author} &middot; {quote.tradition}
        </p>

        <div className="flex items-center gap-2 mt-5">
          <button
            onClick={handleShareQuoteToFeed}
            disabled={quoteShareState !== 'idle'}
            className="flex items-center gap-1.5 px-3.5 py-1.5 border-none rounded-full font-label text-[0.55rem] tracking-[0.08em] uppercase cursor-pointer transition-opacity duration-200"
            style={{
              background: 'linear-gradient(135deg, var(--gold-deep), var(--gold))',
              color: 'var(--text-on-gold)',
              opacity: quoteShareState === 'sharing' ? 0.5 : 1,
            }}
          >
            <Icon name="edit" size={12} />
            {quoteShareState === 'shared' ? 'Geteilt' : 'Im Feed teilen'}
          </button>
          <button
            onClick={handleCopyQuote}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-transparent rounded-full font-label text-[0.55rem] tracking-[0.08em] uppercase cursor-pointer transition-opacity duration-200"
            style={{
              border: '1px solid var(--gold-border-s)',
              color: 'var(--gold-text)',
            }}
          >
            <Icon name={quoteCopied ? 'check' : 'share'} size={12} />
            {quoteCopied ? 'Kopiert' : 'Teilen'}
          </button>
        </div>
      </div>

      {/* ── Verbindungsanfragen (nur wenn > 0) ────────────────── */}
      {requests.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span
              className="min-w-[20px] h-[20px] flex items-center justify-center rounded-full text-[9px] font-label px-1.5"
              style={{ background: 'var(--gold)', color: 'var(--text-on-gold)' }}
            >
              {requests.length}
            </span>
            <span
              className="text-sm font-body"
              style={{ color: 'var(--text-h)' }}
            >
              {requests.length === 1 ? 'Neue Verbindungsanfrage' : 'Neue Verbindungsanfragen'}
            </span>
          </div>

          <div className="space-y-2.5">
            {requests.slice(0, 3).map((req) => {
              const { profile } = req;
              const initials = (profile.display_name ?? profile.username ?? '?').slice(0, 1).toUpperCase();
              const isLoading = respondingRequest[req.id];

              return (
                <div key={req.id} className="flex items-center gap-2.5">
                  <Link href={profile.username ? `/u/${profile.username}` : '#'} className="flex-shrink-0">
                    <EnsoRing soulLevel={profile.soul_level} isFirstLight={profile.is_first_light} size="feed">
                      <div
                        className="w-full h-full rounded-full flex items-center justify-center font-heading text-[0.6rem] overflow-hidden"
                        style={{ background: 'var(--avatar-bg)', color: 'var(--gold-text)' }}
                      >
                        {profile.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : initials}
                      </div>
                    </EnsoRing>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-body font-medium truncate block" style={{ color: 'var(--text-h)' }}>
                      {profile.display_name ?? profile.username ?? 'Anonym'}
                    </span>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleRespondRequest(req.id, 'accepted')}
                      disabled={isLoading}
                      className="px-2.5 py-1 border-none rounded-full font-label text-[0.55rem] tracking-[0.08em] uppercase cursor-pointer"
                      style={{
                        background: 'linear-gradient(135deg, var(--gold-deep), var(--gold))',
                        color: 'var(--text-on-gold)',
                        opacity: isLoading ? 0.5 : 1,
                      }}
                    >
                      Annehmen
                    </button>
                    <button
                      onClick={() => handleRespondRequest(req.id, 'declined')}
                      disabled={isLoading}
                      className="px-2.5 py-1 bg-transparent rounded-full font-label text-[0.55rem] tracking-[0.08em] uppercase cursor-pointer"
                      style={{
                        border: '1px solid var(--divider)',
                        color: 'var(--text-muted)',
                        opacity: isLoading ? 0.5 : 1,
                      }}
                    >
                      &times;
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {requests.length > 3 && (
            <Link
              href="/circles"
              className="flex items-center gap-1 mt-3 text-xs font-label"
              style={{ color: 'var(--gold-text)' }}
            >
              Alle anzeigen
              <Icon name="chevron-right" size={12} />
            </Link>
          )}
        </div>
      )}

      {/* ── Deine Events ──────────────────────────────────────── */}
      {upcomingEvents.length > 0 && (
        <div>
          <h2
            className="font-heading text-base mb-3"
            style={{ color: 'var(--text-h)' }}
          >
            Deine Events
          </h2>
          <div
            className="flex gap-3 overflow-x-auto pb-1"
            style={{ scrollbarWidth: 'none' }}
          >
            {upcomingEvents.slice(0, 8).map((event) => {
              const isCourse = event.category === 'course';
              return (
                <div
                  key={event.id}
                  className="flex-shrink-0 rounded-xl p-3.5 transition-transform duration-200 hover:-translate-y-[2px]"
                  style={{
                    width: 155,
                    background: 'var(--bg-solid)',
                    border: '1px solid var(--glass-border)',
                    willChange: 'transform',
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div>
                      <div className="font-heading text-lg leading-none" style={{ color: 'var(--gold-text)' }}>
                        {formatEventDate(event.starts_at)}
                      </div>
                      <div
                        className="font-label text-[0.5rem] tracking-[0.1em] uppercase"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {formatEventWeekday(event.starts_at)}
                      </div>
                    </div>
                    <span
                      className="ml-auto w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: isCourse ? 'var(--event-purple)' : 'var(--gold)' }}
                    />
                  </div>
                  <p
                    className="text-xs font-body font-medium truncate mb-1"
                    style={{ color: 'var(--text-h)' }}
                  >
                    {event.title}
                  </p>
                  <div className="flex items-center gap-1 mb-1">
                    <Icon name="clock" size={11} style={{ color: 'var(--text-muted)' }} />
                    <span className="text-[0.6rem] font-body" style={{ color: 'var(--text-muted)' }}>
                      {formatEventTime(event.starts_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Icon name="map-pin" size={11} style={{ color: 'var(--text-muted)' }} />
                    <span className="text-[0.6rem] font-body truncate" style={{ color: 'var(--text-muted)' }}>
                      {event.location_name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Interessen-basierter Vorschlag (wenn keine Events) ── */}
      {upcomingEvents.length === 0 && matchedSuggestion && (
        <div>
          <h2
            className="font-heading text-base mb-3"
            style={{ color: 'var(--text-h)' }}
          >
            Basierend auf deinen Interessen
          </h2>
          <div
            className="rounded-xl p-4"
            style={{
              background: 'var(--glass)',
              border: '1px solid var(--glass-border)',
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-body font-medium truncate" style={{ color: 'var(--text-h)' }}>
                  {matchedSuggestion.title}
                </p>
                <p className="text-xs font-body mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {formatEventDate(matchedSuggestion.starts_at)} &middot; {formatEventTime(matchedSuggestion.starts_at)}
                  {matchedSuggestion.location_name && ` \u00B7 ${matchedSuggestion.location_name}`}
                </p>
              </div>
              <button
                onClick={() => handleJoinRecommendation(matchedSuggestion.id)}
                disabled={joiningEvent[matchedSuggestion.id]}
                className="flex-shrink-0 px-3 py-1.5 border-none rounded-full font-label text-[0.55rem] tracking-[0.08em] uppercase cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, var(--gold-deep), var(--gold))',
                  color: 'var(--text-on-gold)',
                  opacity: joiningEvent[matchedSuggestion.id] ? 0.5 : 1,
                }}
              >
                Teilnehmen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Fallback: keine Events und kein Vorschlag ──────────── */}
      {upcomingEvents.length === 0 && !matchedSuggestion && (
        <p className="text-sm font-body" style={{ color: 'var(--text-muted)' }}>
          Noch keine Events geplant.{' '}
          <Link
            href="/discover"
            className="inline-flex items-center gap-0.5 font-label"
            style={{ color: 'var(--gold-text)' }}
          >
            Entdecken
            <Icon name="chevron-right" size={12} />
          </Link>
        </p>
      )}

      {/* ── Aktive Challenges (nur wenn vorhanden) ─────────────── */}
      {challenges.length > 0 && (
        <div>
          <h2
            className="font-heading text-base mb-3"
            style={{ color: 'var(--text-h)' }}
          >
            Aktive Challenges
          </h2>
          <div className="space-y-4">
            {challenges.slice(0, 3).map((ch) => {
              const progress = ch.my_progress;
              const totalDays = ch.duration_days;
              const checkins = progress?.total_checkins ?? 0;
              const pct = totalDays > 0 ? Math.min(100, Math.round((checkins / totalDays) * 100)) : 0;
              const streak = progress?.current_streak ?? 0;
              const todayNumber = checkins + 1;
              const isChecking = checkingIn[ch.id];

              return (
                <div key={ch.id}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-base">{ch.emoji}</span>
                    <span className="text-sm font-body font-medium flex-1 truncate" style={{ color: 'var(--text-h)' }}>
                      {ch.title}
                    </span>
                    {streak > 0 && (
                      <span className="text-xs font-label" style={{ color: 'var(--gold-text)' }}>
                        {streak}d Streak
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--divider)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          background: 'linear-gradient(90deg, var(--gold-deep), var(--gold))',
                        }}
                      />
                    </div>
                    <span className="text-[0.55rem] font-label flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                      {checkins}/{totalDays}
                    </span>
                  </div>

                  {!progress?.completed && todayNumber <= totalDays && (
                    <button
                      onClick={() => handleCheckin(ch.id, todayNumber)}
                      disabled={isChecking}
                      className="mt-2 px-3 py-1 bg-transparent rounded-full font-label text-[0.55rem] tracking-[0.08em] uppercase cursor-pointer transition-colors duration-200"
                      style={{
                        border: '1px solid var(--gold-border-s)',
                        color: 'var(--gold-text)',
                        opacity: isChecking ? 0.5 : 1,
                      }}
                    >
                      Tag {todayNumber} einchecken
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Empfehlungen in deiner Nähe (nur wenn vorhanden) ──── */}
      {recommendations.length > 0 && upcomingEvents.length > 0 && locationLat != null && locationLng != null && (
        <div>
          <h2
            className="font-heading text-base mb-3"
            style={{ color: 'var(--text-h)' }}
          >
            In deiner Nähe
          </h2>
          <div className="space-y-2.5">
            {recommendations.map((event) => {
              const dist = distanceKm(locationLat, locationLng, event.location_lat, event.location_lng);
              const isCourse = event.category === 'course';
              const isJoining = joiningEvent[event.id];

              return (
                <div key={event.id} className="flex items-center gap-2.5">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: isCourse ? 'var(--event-purple)' : 'var(--gold)' }}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-body font-medium truncate block" style={{ color: 'var(--text-h)' }}>
                      {event.title}
                    </span>
                    <span className="text-[0.6rem] font-body" style={{ color: 'var(--text-muted)' }}>
                      {formatEventDate(event.starts_at)} &middot; {dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(1)}km`}
                    </span>
                  </div>
                  <button
                    onClick={() => handleJoinRecommendation(event.id)}
                    disabled={isJoining}
                    className="px-2.5 py-1 border-none rounded-full font-label text-[0.55rem] tracking-[0.08em] uppercase cursor-pointer flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, var(--gold-deep), var(--gold))',
                      color: 'var(--text-on-gold)',
                      opacity: isJoining ? 0.5 : 1,
                    }}
                  >
                    Teilnehmen
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Letzte Impulse (nur wenn vorhanden) ────────────────── */}
      {recentPulses.length > 0 && (
        <div>
          <h2
            className="font-heading text-base mb-3"
            style={{ color: 'var(--text-h)' }}
          >
            Letzte Impulse
          </h2>
          <div className="space-y-2.5">
            {recentPulses.slice(0, 3).map((pulse) => {
              const date = new Date(pulse.created_at);
              return (
                <div key={pulse.id} className="flex items-start gap-2.5">
                  <div className="flex-shrink-0 mt-0.5">
                    <EnsoRing soulLevel={pulse.author.soul_level} isFirstLight={pulse.author.is_first_light} size="feed">
                      <div
                        className="w-full h-full rounded-full flex items-center justify-center font-heading text-[0.6rem] overflow-hidden"
                        style={{ background: 'var(--avatar-bg)', color: 'var(--gold-text)' }}
                      >
                        {pulse.author.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={pulse.author.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (pulse.author.display_name ?? '?').slice(0, 1).toUpperCase()}
                      </div>
                    </EnsoRing>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-body font-medium" style={{ color: 'var(--text-h)' }}>
                        {pulse.author.display_name ?? pulse.author.username ?? 'Anonym'}
                      </span>
                      <span className="text-[0.55rem] font-label" style={{ color: 'var(--text-muted)' }}>
                        {date.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <p className="text-xs font-body line-clamp-2 mt-0.5" style={{ color: 'var(--text-sec)', lineHeight: 1.5 }}>
                      {pulse.content}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <Link
            href="/circles"
            className="flex items-center gap-1 mt-3 text-xs font-label"
            style={{ color: 'var(--gold-text)' }}
          >
            Alle Impulse anzeigen
            <Icon name="chevron-right" size={12} />
          </Link>
        </div>
      )}
    </div>
  );
}
