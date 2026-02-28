'use client';

import { useState, useEffect, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import type { Pulse } from '@/types/pulse';
import type { Connection } from '@/types/circles';
import { SOUL_LEVEL_NAMES } from '@/types/profile';
import PulseCard from '@/components/pulse/PulseCard';
import CreatePulseForm from '@/components/pulse/CreatePulseForm';
import ConnectionCard from '@/components/circles/ConnectionCard';
import { IncomingRequestCard, OutgoingRequestCard } from '@/components/circles/RequestCard';
import { fetchFeed } from '@/lib/pulse';
import {
  getConnections,
  getIncomingRequests,
  getOutgoingRequests,
  respondToRequest,
  cancelRequest,
  removeConnection,
} from '@/lib/circles';
import { Icon } from '@/components/ui/Icon';
import { fetchChallenges, joinChallenge, checkinChallenge, fetchChallenge } from '@/lib/challenges';
import type { Challenge } from '@/types/challenges';
import ChallengeCard from '@/components/challenges/ChallengeCard';
import ChallengeDetailModal from '@/components/challenges/ChallengeDetailModal';
import CreateChallengeModal from '@/components/challenges/CreateChallengeModal';

type Tab = 'feed' | 'connections' | 'requests' | 'mentors';

interface Props {
  user: User | null;
}

export default function CirclesClient({ user }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('feed');

  // Feed State
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [feedPage, setFeedPage] = useState(1);
  const [feedHasMore, setFeedHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Connections State
  const [connections, setConnections] = useState<Connection[]>([]);
  const [connectionsLoading, setConnectionsLoading] = useState(false);

  // Requests State
  const [incoming, setIncoming] = useState<Connection[]>([]);
  const [outgoing, setOutgoing] = useState<Connection[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [incomingCount, setIncomingCount] = useState(0);

  // Mentoren State
  const [mentors, setMentors] = useState<Connection[]>([]);
  const [mentorsLoading, setMentorsLoading] = useState(false);

  // Challenges State
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  // ── Feed laden (globaler Pulse-Feed) ──────────────────────
  const loadFeed = useCallback(async (pageNum: number, replace: boolean) => {
    try {
      const result = await fetchFeed(pageNum, 20);
      setPulses((prev) => replace ? result.pulses : [...prev, ...result.pulses]);
      setFeedHasMore(result.hasMore);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // ── Verbindungen laden ──────────────────────────────────
  const loadConnections = useCallback(async () => {
    setConnectionsLoading(true);
    try {
      const result = await getConnections(1, 100);
      setConnections(result.data);
    } catch (e) {
      console.error(e);
    } finally {
      setConnectionsLoading(false);
    }
  }, []);

  // ── Anfragen laden ──────────────────────────────────────
  const loadRequests = useCallback(async () => {
    setRequestsLoading(true);
    try {
      const [inc, out] = await Promise.all([
        getIncomingRequests(1, 50),
        getOutgoingRequests(1, 50),
      ]);
      setIncoming(inc.data);
      setOutgoing(out.data);
      setIncomingCount(inc.total);
    } catch (e) {
      console.error(e);
    } finally {
      setRequestsLoading(false);
    }
  }, []);

  // ── Mentoren laden (soul_level >= 4) ──────────────────────
  const loadMentors = useCallback(async () => {
    setMentorsLoading(true);
    try {
      const result = await getConnections(1, 100);
      const filtered = result.data.filter((c) => c.profile.soul_level >= 4);
      setMentors(filtered);
    } catch (e) {
      console.error(e);
    } finally {
      setMentorsLoading(false);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    setFeedLoading(true);
    loadFeed(1, true).finally(() => setFeedLoading(false));
    // Anfragen-Count fuer Badge laden
    getIncomingRequests(1, 1).then((r) => setIncomingCount(r.total)).catch(() => {});
  }, [loadFeed]);

  // ── Challenges laden ──────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    fetchChallenges({ page: 1, limit: 10 })
      .then((res) => setChallenges(res.data))
      .catch(console.error);
  }, [user]);

  // Tab-Switch Daten laden
  useEffect(() => {
    if (activeTab === 'connections') loadConnections();
    if (activeTab === 'requests') loadRequests();
    if (activeTab === 'mentors') loadMentors();
  }, [activeTab, loadConnections, loadRequests, loadMentors]);

  // ── Handlers ────────────────────────────────────────────
  const handleLoadMore = async () => {
    setLoadingMore(true);
    const nextPage = feedPage + 1;
    await loadFeed(nextPage, false);
    setFeedPage(nextPage);
    setLoadingMore(false);
  };

  const handleCreated = (pulse: Pulse) => {
    setPulses((prev) => [pulse, ...prev]);
  };

  const handleAccept = async (id: string) => {
    try {
      await respondToRequest(id, 'accepted');
      setIncoming((prev) => prev.filter((r) => r.id !== id));
      setIncomingCount((c) => Math.max(0, c - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDecline = async (id: string) => {
    try {
      await respondToRequest(id, 'declined');
      setIncoming((prev) => prev.filter((r) => r.id !== id));
      setIncomingCount((c) => Math.max(0, c - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const handleCancelRequest = async (id: string) => {
    try {
      await cancelRequest(id);
      setOutgoing((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveConnection = async (id: string) => {
    try {
      await removeConnection(id);
      setConnections((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeletePulse = (id: string) => {
    setPulses((prev) => prev.filter((p) => p.id !== id));
  };

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      const res = await joinChallenge(challengeId);
      setChallenges((prev) =>
        prev.map((c) =>
          c.id === challengeId
            ? { ...c, has_joined: true, participants_count: res.participants_count }
            : c,
        ),
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleCheckinChallenge = async (challengeId: string) => {
    const challenge = challenges.find((c) => c.id === challengeId);
    if (!challenge) return;
    const sDate = new Date(challenge.starts_at);
    const td = new Date();
    td.setHours(0, 0, 0, 0);
    const sd = new Date(sDate);
    sd.setHours(0, 0, 0, 0);
    const dm = td.getTime() - sd.getTime();
    const dayNum = Math.max(1, Math.min(challenge.duration_days, Math.floor(dm / 86400000) + 1));
    try {
      await checkinChallenge(challengeId, dayNum);
      const updated = await fetchChallenge(challengeId);
      setChallenges((prev) => prev.map((c) => (c.id === challengeId ? updated : c)));
    } catch (e) {
      console.error(e);
    }
  };

  const handleChallengeCreated = (challenge: Challenge) => {
    setChallenges((prev) => [challenge, ...prev]);
  };

  const handleChallengeUpdate = (updated: Partial<Challenge>) => {
    if (selectedChallenge) {
      const merged = { ...selectedChallenge, ...updated };
      setChallenges((prev) => prev.map((c) => (c.id === merged.id ? merged : c)));
    }
  };

  const tabs: { key: Tab; label: string; badge?: number }[] = [
    { key: 'feed', label: 'Feed' },
    { key: 'connections', label: 'Verbindungen' },
    { key: 'requests', label: 'Anfragen', badge: incomingCount > 0 ? incomingCount : undefined },
    { key: 'mentors', label: 'Mentoren' },
  ];

  return (
    <>
      {/* Desktop Header */}
      <div className="hidden md:block mb-6">
        <h1 className="font-heading text-2xl" style={{ color: 'var(--gold-text)' }}>
          Circle
        </h1>
        <p className="text-sm font-body mt-1" style={{ color: 'var(--text-muted)' }}>
          Dein persoenlicher Kreis
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 pb-px" style={{ borderBottom: '1px solid var(--divider-l)' }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="relative px-4 py-2.5 font-label text-[0.7rem] tracking-[0.1em] uppercase transition-colors duration-200 -mb-px bg-transparent"
            style={{
              color: activeTab === tab.key ? 'var(--gold-text)' : 'var(--text-muted)',
              borderBottom: activeTab === tab.key ? '2px solid var(--gold-text)' : '2px solid transparent',
            }}
          >
            {tab.label}
            {tab.badge !== undefined && (
              <span
                className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-label font-bold rounded-full px-1"
                style={{ background: 'var(--gold)', color: 'var(--text-on-gold)' }}
              >
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Feed Tab ──────────────────────────────────────── */}
      {activeTab === 'feed' && (
        <>
          {/* Challenges Section */}
          {challenges.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon name="target" size={14} style={{ color: 'var(--gold)' }} />
                  <span className="font-label text-[0.6rem] tracking-[0.15em] uppercase" style={{ color: 'var(--gold)' }}>
                    Challenges
                  </span>
                </div>
                <button
                  onClick={() => setShowCreateChallenge(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-pointer bg-transparent"
                  style={{ border: '1px solid var(--glass-border)' }}
                >
                  <Icon name="plus" size={10} style={{ color: 'var(--text-muted)' }} />
                  <span className="font-label text-[0.6rem] tracking-[0.1em] uppercase" style={{ color: 'var(--text-muted)' }}>
                    Neu
                  </span>
                </button>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                {challenges.map((challenge) => {
                  const sDate = new Date(challenge.starts_at);
                  const td = new Date();
                  td.setHours(0, 0, 0, 0);
                  const sd = new Date(sDate);
                  sd.setHours(0, 0, 0, 0);
                  const dm = td.getTime() - sd.getTime();
                  const dayNum = Math.max(1, Math.min(challenge.duration_days, Math.floor(dm / 86400000) + 1));
                  const checkinDays = new Set((challenge.my_progress?.checkins ?? []).map((c) => c.day_number));
                  const checkedToday = checkinDays.has(dayNum);
                  return (
                    <div key={challenge.id} style={{ minWidth: 260, maxWidth: 280 }}>
                      <ChallengeCard
                        challenge={challenge}
                        currentDayNumber={dayNum}
                        checkedInToday={checkedToday}
                        onJoin={() => handleJoinChallenge(challenge.id)}
                        onCheckin={() => handleCheckinChallenge(challenge.id)}
                        onClick={() => setSelectedChallenge(challenge)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {challenges.length === 0 && user && (
            <button
              onClick={() => setShowCreateChallenge(true)}
              className="w-full flex items-center justify-center gap-2 py-3 mb-5 rounded-xl cursor-pointer bg-transparent"
              style={{ border: '1px dashed var(--glass-border)' }}
            >
              <Icon name="target" size={14} style={{ color: 'var(--text-muted)' }} />
              <span className="font-label text-[0.6rem] tracking-[0.15em] uppercase" style={{ color: 'var(--text-muted)' }}>
                Erste Challenge starten
              </span>
            </button>
          )}

          {/* Pulse erstellen */}
          {user && <CreatePulseForm onCreated={handleCreated} />}

          {feedLoading ? (
            <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
              <p className="font-label text-[0.7rem] tracking-[0.2em]">
                WIRD GELADEN …
              </p>
            </div>
          ) : pulses.length === 0 ? (
            <div
              className="text-center py-16 px-4 rounded-2xl"
              style={{ border: '1px dashed var(--gold-border-s)' }}
            >
              <div className="mb-3">
                <Icon name="message-circle" size={32} style={{ color: 'var(--gold)', opacity: 0.6 }} />
              </div>
              <p className="font-heading text-2xl mb-2" style={{ color: 'var(--gold)' }}>
                Noch keine Impulse
              </p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Teile als erstes deinen Impuls mit der Community.
              </p>
            </div>
          ) : (
            <>
              {pulses.map((pulse) => (
                <PulseCard
                  key={pulse.id}
                  pulse={pulse}
                  currentUserId={user?.id}
                  onDelete={handleDeletePulse}
                />
              ))}
              {feedHasMore && (
                <div className="text-center py-4">
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
        </>
      )}

      {/* ── Verbindungen Tab ──────────────────────────────── */}
      {activeTab === 'connections' && (
        <>
          {connectionsLoading ? (
            <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
              <p className="font-label text-[0.7rem] tracking-[0.2em]">
                WIRD GELADEN …
              </p>
            </div>
          ) : connections.length === 0 ? (
            <div
              className="text-center py-16 px-4 rounded-2xl"
              style={{ border: '1px dashed var(--gold-border-s)' }}
            >
              <p className="font-heading text-2xl mb-2" style={{ color: 'var(--gold)' }}>
                Noch keine Verbindungen
              </p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Dein Circle wird wachsen, sobald du dich mit anderen Souls verbindest.
              </p>
            </div>
          ) : (
            <>
              <p className="font-label text-[0.7rem] tracking-[0.15em] uppercase mb-3" style={{ color: 'var(--text-muted)' }}>
                {connections.length} {connections.length === 1 ? 'Verbindung' : 'Verbindungen'}
              </p>
              {connections.map((connection) => (
                <ConnectionCard
                  key={connection.id}
                  connection={connection}
                  onRemove={handleRemoveConnection}
                />
              ))}
            </>
          )}
        </>
      )}

      {/* ── Anfragen Tab ──────────────────────────────────── */}
      {activeTab === 'requests' && (
        <>
          {requestsLoading ? (
            <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
              <p className="font-label text-[0.7rem] tracking-[0.2em]">
                WIRD GELADEN …
              </p>
            </div>
          ) : incoming.length === 0 && outgoing.length === 0 ? (
            <div
              className="text-center py-16 px-4 rounded-2xl"
              style={{ border: '1px dashed var(--gold-border-s)' }}
            >
              <p className="font-heading text-2xl mb-2" style={{ color: 'var(--gold)' }}>
                Keine Anfragen
              </p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Aktuell gibt es keine offenen Verbindungsanfragen.
              </p>
            </div>
          ) : (
            <>
              {/* Eingehende */}
              {incoming.length > 0 && (
                <>
                  <p className="font-label text-[0.7rem] tracking-[0.15em] uppercase mb-3" style={{ color: 'var(--text-muted)' }}>
                    Eingehend ({incoming.length})
                  </p>
                  {incoming.map((req) => (
                    <IncomingRequestCard
                      key={req.id}
                      request={req}
                      onAccept={handleAccept}
                      onDecline={handleDecline}
                    />
                  ))}
                </>
              )}

              {/* Ausgehende */}
              {outgoing.length > 0 && (
                <>
                  <p className="font-label text-[0.7rem] tracking-[0.15em] uppercase mb-3 mt-6" style={{ color: 'var(--text-muted)' }}>
                    Gesendet ({outgoing.length})
                  </p>
                  {outgoing.map((req) => (
                    <OutgoingRequestCard
                      key={req.id}
                      request={req}
                      onCancel={handleCancelRequest}
                    />
                  ))}
                </>
              )}
            </>
          )}
        </>
      )}

      {/* ── Mentoren Tab ──────────────────────────────────── */}
      {activeTab === 'mentors' && (
        <>
          {mentorsLoading ? (
            <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
              <p className="font-label text-[0.7rem] tracking-[0.2em]">
                WIRD GELADEN …
              </p>
            </div>
          ) : mentors.length === 0 ? (
            <div
              className="text-center py-16 px-4 rounded-2xl"
              style={{ border: '1px dashed var(--gold-border-s)' }}
            >
              <div className="mb-3">
                <Icon name="sparkles" size={32} style={{ color: 'var(--gold)', opacity: 0.6 }} />
              </div>
              <p className="font-heading text-2xl mb-2" style={{ color: 'var(--gold)' }}>
                Noch keine Mentoren
              </p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Verbinde dich mit Zen Masters oder Soul Mentors, um sie hier zu sehen.
              </p>
            </div>
          ) : (
            <>
              <p className="font-label text-[0.7rem] tracking-[0.15em] uppercase mb-3" style={{ color: 'var(--text-muted)' }}>
                {mentors.length} {mentors.length === 1 ? 'Mentor' : 'Mentoren'}
              </p>
              {mentors.map((mentor) => (
                <div key={mentor.id} className="relative">
                  <ConnectionCard
                    connection={mentor}
                    onRemove={handleRemoveConnection}
                  />
                  {/* Soul Level Badge */}
                  <span
                    className="absolute top-3 right-24 text-[0.6rem] tracking-[0.12em] uppercase font-label rounded-full px-2 py-0.5"
                    style={{
                      background: 'var(--gold-bg)',
                      color: 'var(--gold)',
                      border: '1px solid var(--gold-border-s)',
                    }}
                  >
                    {SOUL_LEVEL_NAMES[mentor.profile.soul_level] ?? `Level ${mentor.profile.soul_level}`}
                  </span>
                </div>
              ))}
            </>
          )}
        </>
      )}

      {/* Challenge Modals */}
      {showCreateChallenge && (
        <CreateChallengeModal
          onClose={() => setShowCreateChallenge(false)}
          onCreated={handleChallengeCreated}
        />
      )}
      {selectedChallenge && (
        <ChallengeDetailModal
          challenge={selectedChallenge}
          currentUserId={user?.id}
          onClose={() => setSelectedChallenge(null)}
          onUpdate={handleChallengeUpdate}
        />
      )}
    </>
  );
}
