'use client';

import { useState, useEffect, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import type { Pulse } from '@/types/pulse';
import type { Connection } from '@/types/circles';
import PulseCard from '@/components/pulse/PulseCard';
import ConnectionCard from '@/components/circles/ConnectionCard';
import { IncomingRequestCard, OutgoingRequestCard } from '@/components/circles/RequestCard';
import {
  fetchCircleFeed,
  getConnections,
  getIncomingRequests,
  getOutgoingRequests,
  respondToRequest,
  cancelRequest,
  removeConnection,
} from '@/lib/circles';

type Tab = 'feed' | 'connections' | 'requests';

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

  // ── Feed laden ──────────────────────────────────────────
  const loadFeed = useCallback(async (pageNum: number, replace: boolean) => {
    try {
      const result = await fetchCircleFeed(pageNum, 20);
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

  // Initial Load
  useEffect(() => {
    setFeedLoading(true);
    loadFeed(1, true).finally(() => setFeedLoading(false));
    // Anfragen-Count fuer Badge laden
    getIncomingRequests(1, 1).then((r) => setIncomingCount(r.total)).catch(() => {});
  }, [loadFeed]);

  // Tab-Switch Daten laden
  useEffect(() => {
    if (activeTab === 'connections') loadConnections();
    if (activeTab === 'requests') loadRequests();
  }, [activeTab, loadConnections, loadRequests]);

  // ── Handlers ────────────────────────────────────────────
  const handleLoadMore = async () => {
    setLoadingMore(true);
    const nextPage = feedPage + 1;
    await loadFeed(nextPage, false);
    setFeedPage(nextPage);
    setLoadingMore(false);
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

  const tabs: { key: Tab; label: string; badge?: number }[] = [
    { key: 'feed', label: 'Feed' },
    { key: 'connections', label: 'Verbindungen' },
    { key: 'requests', label: 'Anfragen', badge: incomingCount > 0 ? incomingCount : undefined },
  ];

  return (
    <>
      {/* Desktop Header */}
      <div className="hidden md:block mb-6">
        <h1 className="font-heading text-2xl font-light text-gold-1 tracking-wide">
          Circle
        </h1>
        <p className="text-sm text-[#5A5450] font-body mt-1">
          Dein persoenlicher Kreis
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gold-1/10 pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`
              relative px-4 py-2.5 font-label text-[0.7rem] tracking-[0.1em] uppercase
              transition-colors duration-200 border-b-2 -mb-px
              ${activeTab === tab.key
                ? 'text-gold-1 border-gold-1'
                : 'text-[#5A5450] border-transparent hover:text-gold-1/60'
              }
            `}
          >
            {tab.label}
            {tab.badge !== undefined && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-gold-1 text-dark-est text-[10px] font-label font-bold rounded-full px-1">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'feed' && (
        <>
          {feedLoading ? (
            <div className="text-center py-12 text-[#5A5450]">
              <p className="font-label text-[0.7rem] tracking-[0.2em]">
                WIRD GELADEN …
              </p>
            </div>
          ) : pulses.length === 0 ? (
            <div className="text-center py-16 px-4 border border-dashed border-gold-1/15 rounded-2xl">
              <p className="text-gold-3 font-heading text-2xl font-light mb-2">
                Dein Circle ist noch leer
              </p>
              <p className="text-[#5A5450] text-sm">
                Verbinde dich mit anderen Souls, um ihre Impulse hier zu sehen.
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
                    className="px-6 py-2.5 bg-transparent border border-gold-1/30 rounded-full text-gold-1 font-label text-[0.7rem] tracking-[0.1em] uppercase cursor-pointer hover:border-gold-1/50 transition-colors duration-200"
                  >
                    {loadingMore ? '…' : 'Mehr laden'}
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {activeTab === 'connections' && (
        <>
          {connectionsLoading ? (
            <div className="text-center py-12 text-[#5A5450]">
              <p className="font-label text-[0.7rem] tracking-[0.2em]">
                WIRD GELADEN …
              </p>
            </div>
          ) : connections.length === 0 ? (
            <div className="text-center py-16 px-4 border border-dashed border-gold-1/15 rounded-2xl">
              <p className="text-gold-3 font-heading text-2xl font-light mb-2">
                Noch keine Verbindungen
              </p>
              <p className="text-[#5A5450] text-sm">
                Dein Circle wird wachsen, sobald du dich mit anderen Souls verbindest.
              </p>
            </div>
          ) : (
            <>
              <p className="text-[#5A5450] font-label text-[0.7rem] tracking-[0.15em] uppercase mb-3">
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

      {activeTab === 'requests' && (
        <>
          {requestsLoading ? (
            <div className="text-center py-12 text-[#5A5450]">
              <p className="font-label text-[0.7rem] tracking-[0.2em]">
                WIRD GELADEN …
              </p>
            </div>
          ) : incoming.length === 0 && outgoing.length === 0 ? (
            <div className="text-center py-16 px-4 border border-dashed border-gold-1/15 rounded-2xl">
              <p className="text-gold-3 font-heading text-2xl font-light mb-2">
                Keine Anfragen
              </p>
              <p className="text-[#5A5450] text-sm">
                Aktuell gibt es keine offenen Verbindungsanfragen.
              </p>
            </div>
          ) : (
            <>
              {/* Eingehende */}
              {incoming.length > 0 && (
                <>
                  <p className="text-[#5A5450] font-label text-[0.7rem] tracking-[0.15em] uppercase mb-3">
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
                  <p className="text-[#5A5450] font-label text-[0.7rem] tracking-[0.15em] uppercase mb-3 mt-6">
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
    </>
  );
}
