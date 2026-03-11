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
import { fetchMyPulses } from '@/lib/pulse';
import { Icon } from '@/components/ui/Icon';
import EnsoRing from '@/components/ui/EnsoRing';
import DashboardCalendar from '@/components/pulse/DashboardCalendar';

// ── Props ─────────────────────────────────────────────────────
interface Props {
  user: User | null;
  displayName: string | null;
  locationLat: number | null;
  locationLng: number | null;
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

// ── Kachel-Wrapper ────────────────────────────────────────────

function DashboardCard({
  icon,
  title,
  badge,
  children,
  className = '',
}: {
  icon: string;
  title: string;
  badge?: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl p-5 ${className}`}
      style={{
        background: 'var(--glass)',
        border: '1px solid var(--glass-border)',
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Icon name={icon as never} size={16} style={{ color: 'var(--gold)' }} />
        <span
          className="font-label text-[0.6rem] tracking-[0.15em] uppercase"
          style={{ color: 'var(--text-muted)' }}
        >
          {title}
        </span>
        {badge != null && badge > 0 && (
          <span
            className="ml-auto min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[9px] font-label px-1"
            style={{ background: 'var(--gold)', color: 'var(--text-on-gold)' }}
          >
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// PULSE DASHBOARD
// ══════════════════════════════════════════════════════════════

export default function PulseClient({ user, displayName, locationLat, locationLng }: Props) {
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

      // Nur zukuenftige Events, sortiert nach Datum
      const future = eventsRes.data
        .filter((e) => e.starts_at >= now)
        .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
      setUpcomingEvents(future);

      // Nur aktive Challenges
      const activeChallenges = Array.isArray(challengesRes)
        ? challengesRes.filter((c) => c.status === 'active')
        : [];
      setChallenges(activeChallenges);

      setRecentPulses(pulsesRes.data);

      // Empfehlungen: Events die der User noch nicht joined hat
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
      // Zum Upcoming hinzufuegen, aus Empfehlungen entfernen
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

  // ── Event-Dates fuer Kalender ──────────────────────────────
  const eventDates = useMemo(
    () => upcomingEvents.map((e) => e.starts_at),
    [upcomingEvents],
  );

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
    <div className="space-y-4">
      {/* ── Begruessungs-Header ──────────────────────────────── */}
      <div className="flex items-end justify-between mb-2">
        <div>
          <h1 className="font-heading text-xl md:text-2xl" style={{ color: 'var(--text-h)' }}>
            {getGreeting()}{firstName ? `, ${firstName}` : ''}
          </h1>
          <p
            className="text-xs font-body mt-0.5"
            style={{ color: 'var(--text-muted)' }}
          >
            Dein Souleya Dashboard
          </p>
        </div>
        <span
          className="font-label text-[0.55rem] tracking-[0.12em] uppercase"
          style={{ color: 'var(--text-muted)' }}
        >
          {formatDateLong(new Date())}
        </span>
      </div>

      {/* ── Grid: Anfragen + Kalender ────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Verbindungsanfragen */}
        <DashboardCard icon="user-plus" title="Verbindungsanfragen" badge={requests.length}>
          {requests.length === 0 ? (
            <p className="text-xs font-body py-3" style={{ color: 'var(--text-muted)' }}>
              Keine offenen Anfragen
            </p>
          ) : (
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
                        ×
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
        </DashboardCard>

        {/* Mini-Kalender */}
        <DashboardCard icon="calendar" title="Kalender">
          <DashboardCalendar eventDates={eventDates} />
        </DashboardCard>
      </div>

      {/* ── Naechste Events (volle Breite, horizontal scroll) ── */}
      <DashboardCard icon="calendar-event" title="Deine nächsten Events" badge={upcomingEvents.length}>
        {upcomingEvents.length === 0 ? (
          <div className="text-center py-4">
            <Icon name="calendar-plus" size={24} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
            <p className="text-xs font-body mt-2" style={{ color: 'var(--text-muted)' }}>
              Du hast noch keine Events
            </p>
            <Link
              href="/discover"
              className="inline-flex items-center gap-1 mt-2 text-xs font-label"
              style={{ color: 'var(--gold-text)' }}
            >
              Events entdecken
              <Icon name="chevron-right" size={12} />
            </Link>
          </div>
        ) : (
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
                  {/* Datum gross */}
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
                    {/* Kategorie-Dot */}
                    <span
                      className="ml-auto w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: isCourse ? 'var(--event-purple)' : 'var(--gold)' }}
                    />
                  </div>

                  {/* Titel */}
                  <p
                    className="text-xs font-body font-medium truncate mb-1"
                    style={{ color: 'var(--text-h)' }}
                  >
                    {event.title}
                  </p>

                  {/* Uhrzeit + Ort */}
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
        )}
      </DashboardCard>

      {/* ── Grid: Challenges + Empfehlungen ───────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Aktive Challenges */}
        <DashboardCard icon="flame" title="Aktive Challenges" badge={challenges.length}>
          {challenges.length === 0 ? (
            <p className="text-xs font-body py-3" style={{ color: 'var(--text-muted)' }}>
              Keine aktiven Challenges
            </p>
          ) : (
            <div className="space-y-3">
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

                    {/* Fortschrittsbalken */}
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

                    {/* Check-in Button */}
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
          )}
        </DashboardCard>

        {/* Empfehlungen */}
        <DashboardCard icon="sparkles" title="Für dich entdecken">
          {locationLat == null || locationLng == null ? (
            <p className="text-xs font-body py-3" style={{ color: 'var(--text-muted)' }}>
              Aktiviere deinen Standort in deinem Profil, um Empfehlungen zu erhalten.
            </p>
          ) : recommendations.length === 0 ? (
            <div className="text-center py-3">
              <p className="text-xs font-body" style={{ color: 'var(--text-muted)' }}>
                Keine neuen Events in der Nähe
              </p>
              <Link
                href="/discover"
                className="inline-flex items-center gap-1 mt-2 text-xs font-label"
                style={{ color: 'var(--gold-text)' }}
              >
                Entdecken
                <Icon name="chevron-right" size={12} />
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recommendations.map((event) => {
                const dist = distanceKm(locationLat, locationLng, event.location_lat, event.location_lng);
                const isCourse = event.category === 'course';
                const isJoining = joiningEvent[event.id];

                return (
                  <div key={event.id} className="flex items-center gap-2.5">
                    {/* Kategorie-Dot */}
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: isCourse ? 'var(--event-purple)' : 'var(--gold)' }}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-body font-medium truncate block" style={{ color: 'var(--text-h)' }}>
                        {event.title}
                      </span>
                      <span className="text-[0.6rem] font-body" style={{ color: 'var(--text-muted)' }}>
                        {formatEventDate(event.starts_at)} · {dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(1)}km`}
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
          )}
        </DashboardCard>
      </div>

      {/* ── Letzte Impulse (Timeline-Vorschau) ─────────────────── */}
      {recentPulses.length > 0 && (
        <DashboardCard icon="activity" title="Letzte Impulse">
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
        </DashboardCard>
      )}
    </div>
  );
}
