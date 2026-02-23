'use client';

import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import type { MapNearbyUser } from '@/components/discover/MapView';
import type { UserSearchResult } from '@/lib/users';
import type { ConnectionStatus } from '@/types/circles';
import type { SoEvent } from '@/types/events';
import { searchUsers } from '@/lib/users';
import { sendConnectionRequest, getConnectionStatus } from '@/lib/circles';
import { fetchEvents, fetchNearbyUsers, joinEvent, leaveEvent } from '@/lib/events';
import DiscoverOverlay from '@/components/discover/DiscoverOverlay';

// Mapbox dynamisch laden (nur client-side)
const MapView = dynamic(() => import('@/components/discover/MapView'), { ssr: false });

interface Props {
  userId: string | null;
}

// Muenchen als Standard-Zentrum
const DEFAULT_CENTER: [number, number] = [11.576, 48.137];

export default function DiscoverClient({ userId }: Props) {
  // ── Suche ──────────────────────────────────────────────────
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [statuses, setStatuses] = useState<Record<string, ConnectionStatus>>({});
  const [sending, setSending] = useState<Record<string, boolean>>({});

  // ── Karte + Discover ──────────────────────────────────────
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [nearbyUsers, setNearbyUsers] = useState<MapNearbyUser[]>([]);
  const [events, setEvents] = useState<SoEvent[]>([]);

  // ── Overlay State ─────────────────────────────────────────
  const [selectedUser, setSelectedUser] = useState<MapNearbyUser | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<SoEvent | null>(null);
  const [overlayConnectionStatus, setOverlayConnectionStatus] = useState<ConnectionStatus>('none');
  const [connecting, setConnecting] = useState(false);
  const [joiningEvent, setJoiningEvent] = useState<Record<string, boolean>>({});

  // Aktive Suche = Query hat mind. 2 Zeichen
  const isSearchActive = query.trim().length >= 2;

  // ── Nearby Users + Events laden ───────────────────────────
  const loadDiscoverData = useCallback(async (lat: number, lng: number) => {
    try {
      const [nearbyRes, eventsRes] = await Promise.all([
        fetchNearbyUsers(lat, lng),
        fetchEvents({ lat, lng }),
      ]);
      setNearbyUsers(nearbyRes.data);
      setEvents(eventsRes.data);
    } catch (e) {
      console.error('Discover-Daten laden fehlgeschlagen:', e);
    }
  }, []);

  // Initial laden
  useEffect(() => {
    loadDiscoverData(mapCenter[1], mapCenter[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Map Move Handler ──────────────────────────────────────
  const handleMapMove = useCallback((center: { lat: number; lng: number }) => {
    setMapCenter([center.lng, center.lat]);
  }, []);

  // Debounced Reload nach Map-Move
  useEffect(() => {
    const timer = setTimeout(() => {
      loadDiscoverData(mapCenter[1], mapCenter[0]);
    }, 800);
    return () => clearTimeout(timer);
  }, [mapCenter, loadDiscoverData]);

  // ── Marker-Klick Handler ──────────────────────────────────
  const handleUserClick = useCallback(async (user: MapNearbyUser) => {
    setSelectedEvent(null);
    setSelectedUser(user);
    setOverlayConnectionStatus('none');

    // Verbindungsstatus laden
    if (userId && user.id !== userId) {
      try {
        const status = await getConnectionStatus(user.id);
        setOverlayConnectionStatus(status.status);
      } catch {
        // Fehler ignorieren
      }
    }
  }, [userId]);

  const handleEventClick = useCallback((event: SoEvent) => {
    setSelectedUser(null);
    setSelectedEvent(event);
  }, []);

  const handleCloseOverlay = useCallback(() => {
    setSelectedUser(null);
    setSelectedEvent(null);
  }, []);

  // ── Verbinden im Overlay ──────────────────────────────────
  const handleOverlayConnect = async () => {
    if (!selectedUser || !userId) return;
    setConnecting(true);
    try {
      await sendConnectionRequest(selectedUser.id);
      setOverlayConnectionStatus('pending_outgoing');
    } catch (e) {
      console.error(e);
    } finally {
      setConnecting(false);
    }
  };

  // ── Event beitreten/verlassen im Overlay ──────────────────
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
      if (selectedEvent?.id === eventId) {
        setSelectedEvent((prev) =>
          prev ? { ...prev, has_joined: true, participants_count: res.participants_count } : prev,
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setJoiningEvent((s) => ({ ...s, [eventId]: false }));
    }
  };

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
      if (selectedEvent?.id === eventId) {
        setSelectedEvent((prev) =>
          prev ? { ...prev, has_joined: false, participants_count: res.participants_count } : prev,
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setJoiningEvent((s) => ({ ...s, [eventId]: false }));
    }
  };

  // ── User-Suche (Debounced) ────────────────────────────────
  const handleSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setSearchResults([]);
      setSearched(false);
      return;
    }

    setSearching(true);
    try {
      const res = await searchUsers(q, 1, 30);
      setSearchResults(res.data);
      setSearched(true);

      if (userId && res.data.length > 0) {
        const statusMap: Record<string, ConnectionStatus> = {};
        await Promise.all(
          res.data.map(async (user) => {
            try {
              const s = await getConnectionStatus(user.id);
              statusMap[user.id] = s.status;
            } catch {
              statusMap[user.id] = 'none';
            }
          }),
        );
        setStatuses(statusMap);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSearching(false);
    }
  }, [userId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        handleSearch(query);
      } else {
        setSearchResults([]);
        setSearched(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query, handleSearch]);

  // ── Verbinden-Button (Suche) ──────────────────────────────
  const handleConnect = async (targetId: string) => {
    setSending((s) => ({ ...s, [targetId]: true }));
    try {
      await sendConnectionRequest(targetId);
      setStatuses((s) => ({ ...s, [targetId]: 'pending_outgoing' }));
    } catch (e) {
      console.error(e);
    } finally {
      setSending((s) => ({ ...s, [targetId]: false }));
    }
  };

  const getStatusButton = (user: UserSearchResult) => {
    const status = statuses[user.id];
    const isSending = sending[user.id];

    if (status === 'connected') {
      return (
        <span className="px-3 py-1.5 border border-[#52B788]/30 rounded-full text-[#52B788] font-label text-[0.6rem] tracking-[0.1em] uppercase">
          Verbunden
        </span>
      );
    }
    if (status === 'pending_outgoing') {
      return (
        <span className="px-3 py-1.5 border border-gold-1/20 rounded-full text-[#5A5450] font-label text-[0.6rem] tracking-[0.1em] uppercase">
          Angefragt
        </span>
      );
    }
    if (status === 'pending_incoming') {
      return (
        <span className="px-3 py-1.5 border border-gold-1/30 rounded-full text-gold-1 font-label text-[0.6rem] tracking-[0.1em] uppercase">
          Antworten
        </span>
      );
    }

    return (
      <button
        onClick={() => handleConnect(user.id)}
        disabled={isSending || !userId}
        className={`
          px-3 py-1.5 rounded-full font-label text-[0.6rem] tracking-[0.1em] uppercase transition-all duration-200
          ${isSending
            ? 'bg-gold-1/20 text-[#5A5450] cursor-not-allowed'
            : 'bg-gradient-to-br from-gold-3 to-gold-2 text-dark cursor-pointer hover:opacity-90'
          }
        `}
      >
        {isSending ? '...' : 'Verbinden'}
      </button>
    );
  };

  return (
    <div className="-mx-4 -mt-6" style={{ height: 'calc(100vh - 5rem)' }}>
      {/* ─── SUCHE AKTIV → Liste statt Karte ────────────────── */}
      {isSearchActive ? (
        <div className="h-full flex flex-col">
          {/* Suchfeld oben */}
          <div className="px-4 pt-3 pb-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Souls suchen ..."
              className="w-full py-3 px-5 bg-dark/80 backdrop-blur-xl border border-gold-1/20 rounded-2xl text-[#F0EDE8] text-sm font-body outline-none focus:border-gold-1/40 transition-colors placeholder:text-[#5A5450]"
            />
          </div>

          {/* Suchergebnisse */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {searching && (
              <div className="text-center py-8 text-[#5A5450]">
                <p className="font-label text-[0.7rem] tracking-[0.2em]">SUCHE ...</p>
              </div>
            )}

            {!searching && searched && searchResults.length === 0 && (
              <div className="text-center py-12 px-4 border border-dashed border-gold-1/15 rounded-2xl">
                <p className="text-gold-3 font-heading text-xl font-light mb-2">Keine Ergebnisse</p>
                <p className="text-[#5A5450] text-sm">Versuche einen anderen Suchbegriff.</p>
              </div>
            )}

            {!searching && searchResults.length > 0 && (
              <div className="space-y-3">
                <p className="text-[#5A5450] font-label text-[0.7rem] tracking-[0.15em] uppercase">
                  {searchResults.length} {searchResults.length === 1 ? 'Ergebnis' : 'Ergebnisse'}
                </p>
                {searchResults.map((user) => {
                  const initials = (user.display_name ?? user.username ?? '?').slice(0, 1).toUpperCase();
                  const CardWrapper = user.username
                    ? ({ children }: { children: React.ReactNode }) => <Link href={`/u/${user.username}`} className="block">{children}</Link>
                    : ({ children }: { children: React.ReactNode }) => <>{children}</>;
                  return (
                    <div key={user.id} className="flex items-center gap-3 bg-dark rounded-2xl border border-gold-1/10 p-4 hover:border-gold-1/25 transition-colors">
                      <CardWrapper>
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`w-12 h-12 rounded-full bg-gold-1/15 flex-shrink-0 flex items-center justify-center font-heading text-lg text-gold-1 border ${user.is_origin_soul ? 'border-gold-1/50' : 'border-gold-1/20'}`}>
                            {user.avatar_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-body font-medium text-sm text-[#F0EDE8] truncate">
                                {user.display_name ?? user.username ?? 'Anonym'}
                              </span>
                              {user.is_origin_soul && (
                                <span className="text-[0.55rem] tracking-[0.15em] uppercase text-gold-3 font-label border border-gold-3/30 rounded-full px-1.5 py-px flex-shrink-0">Origin</span>
                              )}
                            </div>
                            {user.username && <p className="text-xs text-[#5A5450] font-label">@{user.username}</p>}
                            {user.bio && <p className="text-xs text-[#5A5450] font-body mt-0.5 truncate">{user.bio}</p>}
                          </div>
                        </div>
                      </CardWrapper>
                      <div className="flex-shrink-0">{getStatusButton(user)}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ─── KARTE FULLSCREEN + OVERLAY ──────────────────────── */
        <div className="relative w-full h-full">
          {/* Karte – voller Bereich */}
          <MapView
            users={nearbyUsers}
            events={events}
            center={mapCenter}
            onMapMove={handleMapMove}
            onUserClick={handleUserClick}
            onEventClick={handleEventClick}
          />

          {/* Schwebendes Suchfeld */}
          <div className="absolute top-3 left-4 right-4 z-10">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Souls suchen ..."
              className="w-full py-3 px-5 bg-dark-est/90 backdrop-blur-xl border border-gold-1/20 rounded-2xl text-[#F0EDE8] text-sm font-body outline-none focus:border-gold-1/40 transition-colors placeholder:text-[#5A5450] shadow-lg shadow-black/20"
            />
          </div>

          {/* User Overlay */}
          {selectedUser && (
            <DiscoverOverlay
              type="user"
              user={selectedUser}
              userId={userId}
              connectionStatus={overlayConnectionStatus}
              onConnect={handleOverlayConnect}
              connecting={connecting}
              onClose={handleCloseOverlay}
            />
          )}

          {/* Event Overlay */}
          {selectedEvent && (
            <DiscoverOverlay
              type="event"
              event={selectedEvent}
              userId={userId}
              onJoin={handleJoinEvent}
              onLeave={handleLeaveEvent}
              joining={joiningEvent[selectedEvent.id]}
              onClose={handleCloseOverlay}
            />
          )}
        </div>
      )}
    </div>
  );
}
