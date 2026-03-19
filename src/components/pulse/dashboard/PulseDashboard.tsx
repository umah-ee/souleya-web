'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { SoEvent } from '@/types/events';
import type { Challenge } from '@/types/challenges';
import { fetchEvents } from '@/lib/events';
import { fetchMyChallenges, checkinChallenge } from '@/lib/challenges';
import { getDailyQuote } from '@/lib/wisdomQuotes';
import { createPulse } from '@/lib/pulse';

import GreetingCard from './GreetingCard';
import ActivityBar from './ActivityBar';
import WisdomCard from './WisdomCard';
import ToolkitSection from './ToolkitSection';
import ChallengeWidget from './ChallengeWidget';
import NearbyEventsWidget from './NearbyEventsWidget';
import AstroSideStack from './AstroSideStack';

interface PulseDashboardProps {
  displayName: string;
  locationLat?: number;
  locationLng?: number;
  interests: string[];
  soulLevel: number;
  birthday?: string | null;
}

export default function PulseDashboard({
  displayName,
  locationLat,
  locationLng,
  interests,
  soulLevel,
  birthday,
}: PulseDashboardProps) {
  // Automatischer Modus nach Uhrzeit (kein manueller Toggle)
  const mode = useMemo(() => {
    const h = new Date().getHours();
    return h >= 5 && h < 17 ? 'morning' : 'evening';
  }, []);

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [nearbyEvents, setNearbyEvents] = useState<SoEvent[]>([]);
  const [checkingIn, setCheckingIn] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  // Wisdom quote
  const quote = useMemo(() => getDailyQuote(), []);
  const [quoteShareState, setQuoteShareState] = useState<'idle' | 'sharing' | 'shared'>('idle');
  const [quoteCopied, setQuoteCopied] = useState(false);

  // Unread counts (placeholder — real values from context/API)
  const [unreadMessages] = useState(0);
  const [newPosts] = useState(0);

  // ── Data loading ──────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      const now = new Date().toISOString();

      const [challengesRes, eventsRes] = await Promise.all([
        fetchMyChallenges().catch(() => [] as Challenge[]),
        locationLat != null && locationLng != null
          ? fetchEvents({ lat: locationLat, lng: locationLng, limit: 6 }).catch(() => ({ data: [] as SoEvent[], total: 0, hasMore: false }))
          : Promise.resolve({ data: [] as SoEvent[], total: 0, hasMore: false }),
      ]);

      const activeChallenges = Array.isArray(challengesRes)
        ? challengesRes.filter((c) => c.status === 'active')
        : [];
      setChallenges(activeChallenges);

      const futureEvents = eventsRes.data
        .filter((e) => e.starts_at >= now)
        .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
        .slice(0, 3);
      setNearbyEvents(futureEvents);
    } catch (e) {
      console.error('Dashboard laden fehlgeschlagen:', e);
    } finally {
      setLoading(false);
    }
  }, [locationLat, locationLng]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Actions ───────────────────────────────────────────────
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

  const handleShareQuote = async () => {
    setQuoteShareState('sharing');
    try {
      await createPulse({
        content: `\u201E${quote.text}\u201C\n\u2014 ${quote.author} \u00B7 ${quote.tradition}`,
      });
      setQuoteShareState('shared');
      setTimeout(() => setQuoteShareState('idle'), 3000);
    } catch {
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

  // ── Render ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
        <p className="font-label text-[0.7rem] tracking-[0.2em]">WIRD GELADEN \u2026</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <GreetingCard displayName={displayName} />

      {/* Activity Bar */}
      <ActivityBar unreadMessages={unreadMessages} newPosts={newPosts} />

      {/* Wisdom Card + Astro Side Stack (2-Spalten-Grid auf Desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
        <WisdomCard
          quote={quote}
          onShare={handleShareQuote}
          shareState={quoteShareState}
        />
        <AstroSideStack birthday={birthday} />
      </div>

      {/* Toolkit Section */}
      <ToolkitSection displayName={displayName} />

      {/* Challenge Widget */}
      <ChallengeWidget
        challenges={challenges}
        onCheckin={handleCheckin}
        checkingIn={checkingIn}
      />

      {/* Nearby Events */}
      <NearbyEventsWidget
        events={nearbyEvents}
        userLat={locationLat}
        userLng={locationLng}
      />
    </div>
  );
}
