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
import { fetchEvents, fetchNearbyUsers, joinEvent, leaveEvent, geocodeLocation } from '@/lib/events';
import { Icon } from '@/components/ui/Icon';
import DiscoverOverlay from '@/components/discover/DiscoverOverlay';
import EventCardCompact from '@/components/discover/EventCardCompact';
import CreateEventModal from '@/components/discover/CreateEventModal';
import ShareEventModal from '@/components/discover/ShareEventModal';

// Mapbox dynamisch laden (nur client-side)
const MapView = dynamic(() => import('@/components/discover/MapView'), { ssr: false });

interface Props {
  userId: string | null;
}

interface GeoResult {
  place_name: string;
  lat: number;
  lng: number;
  feature_type: string;
}

// Muenchen als Standard-Zentrum
const DEFAULT_CENTER: [number, number] = [11.576, 48.137];

export default function DiscoverClient({ userId }: Props) {
  // ── View Toggle ─────────────────────────────────────────────
  const [view, setView] = useState<'map' | 'board'>('map');

  // ── Suche ──────────────────────────────────────────────────
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [geoResults, setGeoResults] = useState<GeoResult[]>([]);
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

  // ── Create Event Modal ──────────────────────────────────────
  const [showCreateModal, setShowCreateModal] = useState(false);

  // ── Share Event Modal ───────────────────────────────────────
  const [shareEvent, setShareEvent] = useState<SoEvent | null>(null);

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

  // ── Event beitreten/verlassen ─────────────────────────────
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

  // ── Suche: Users + Orte (Debounced) ────────────────────────
  const handleSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setSearchResults([]);
      setGeoResults([]);
      setSearched(false);
      return;
    }

    setSearching(true);
    try {
      // Parallel: Users + Geocoding
      const [usersRes, geoRes] = await Promise.allSettled([
        searchUsers(q, 1, 30),
        geocodeLocation(q, 'forward'),
      ]);

      // User-Ergebnisse
      if (usersRes.status === 'fulfilled') {
        setSearchResults(usersRes.value.data);

        if (userId && usersRes.value.data.length > 0) {
          const statusMap: Record<string, ConnectionStatus> = {};
          await Promise.all(
            usersRes.value.data.map(async (user) => {
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
      } else {
        setSearchResults([]);
      }

      // Geocoding-Ergebnisse
      if (geoRes.status === 'fulfilled' && geoRes.value.results) {
        setGeoResults(geoRes.value.results);
      } else {
        setGeoResults([]);
      }

      setSearched(true);
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
        setGeoResults([]);
        setSearched(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query, handleSearch]);

  // ── Ort-Klick: Zur Karte wechseln + Karte dorthin pannen ──
  const handleGeoClick = (geo: GeoResult) => {
    setMapCenter([geo.lng, geo.lat]);
    setQuery('');
    setView('map');
  };

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
        <span
          className="px-3 py-1.5 rounded-full font-label text-[0.6rem] tracking-[0.1em] uppercase"
          style={{ border: '1px solid var(--success-border)', color: 'var(--success)' }}
        >
          Verbunden
        </span>
      );
    }
    if (status === 'pending_outgoing') {
      return (
        <span
          className="px-3 py-1.5 rounded-full font-label text-[0.6rem] tracking-[0.1em] uppercase"
          style={{ border: '1px solid var(--gold-border-s)', color: 'var(--text-muted)' }}
        >
          Angefragt
        </span>
      );
    }
    if (status === 'pending_incoming') {
      return (
        <span
          className="px-3 py-1.5 rounded-full font-label text-[0.6rem] tracking-[0.1em] uppercase"
          style={{ border: '1px solid var(--gold-border-s)', color: 'var(--gold-text)' }}
        >
          Antworten
        </span>
      );
    }

    return (
      <button
        onClick={() => handleConnect(user.id)}
        disabled={isSending || !userId}
        className="px-3 py-1.5 rounded-full font-label text-[0.6rem] tracking-[0.1em] uppercase transition-all duration-200"
        style={{
          background: isSending ? 'var(--gold-bg)' : 'linear-gradient(135deg, var(--gold-deep), var(--gold))',
          color: isSending ? 'var(--text-muted)' : 'var(--text-on-gold)',
          cursor: isSending ? 'not-allowed' : 'pointer',
        }}
      >
        {isSending ? '...' : 'Verbinden'}
      </button>
    );
  };

  // ── Event neu laden nach Erstellung ─────────────────────────
  const handleEventCreated = () => {
    setShowCreateModal(false);
    loadDiscoverData(mapCenter[1], mapCenter[0]);
  };

  return (
    <div className="fixed top-14 md:top-0 bottom-16 md:bottom-0 left-0 md:left-16 right-0 z-10">
      {/* ─── SUCHE AKTIV → Liste statt Karte ────────────────── */}
      {isSearchActive ? (
        <div className="h-full flex flex-col" style={{ background: 'var(--bg-solid)' }}>
          {/* Suchfeld oben */}
          <div className="px-4 pt-3 pb-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Souls oder Orte suchen ..."
              className="w-full py-3 px-5 backdrop-blur-xl rounded-[8px] text-sm font-body outline-none transition-colors"
              style={{
                background: 'var(--glass-nav)',
                border: '1px solid var(--gold-border-s)',
                color: 'var(--text-h)',
              }}
            />
          </div>

          {/* Suchergebnisse */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {searching && (
              <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                <p className="font-label text-[0.7rem] tracking-[0.2em]">SUCHE ...</p>
              </div>
            )}

            {!searching && searched && searchResults.length === 0 && geoResults.length === 0 && (
              <div
                className="text-center py-12 px-4 rounded-2xl"
                style={{ border: '1px dashed var(--gold-border-s)' }}
              >
                <p className="font-heading text-xl mb-2" style={{ color: 'var(--gold)' }}>Keine Ergebnisse</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Versuche einen anderen Suchbegriff.</p>
              </div>
            )}

            {/* Orte */}
            {!searching && geoResults.length > 0 && (
              <div className="mb-4">
                <p className="font-label text-[0.7rem] tracking-[0.15em] uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
                  Orte
                </p>
                <div className="space-y-2">
                  {geoResults.map((geo, i) => (
                    <button
                      key={i}
                      onClick={() => handleGeoClick(geo)}
                      className="w-full flex items-center gap-3 glass-card rounded-2xl p-3 transition-colors cursor-pointer text-left"
                    >
                      <div
                        className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center"
                        style={{ background: 'var(--gold-bg)', color: 'var(--gold-text)' }}
                      >
                        <Icon name="map-pin" size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-sm truncate" style={{ color: 'var(--text-h)' }}>
                          {geo.place_name}
                        </p>
                        <p className="text-xs font-label" style={{ color: 'var(--text-muted)' }}>
                          {geo.feature_type === 'place' ? 'Stadt' : geo.feature_type === 'locality' ? 'Ortsteil' : 'Gebiet'}
                        </p>
                      </div>
                      <Icon name="compass" size={14} style={{ color: 'var(--gold)' }} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Souls */}
            {!searching && searchResults.length > 0 && (
              <div className="space-y-3">
                <p className="font-label text-[0.7rem] tracking-[0.15em] uppercase" style={{ color: 'var(--text-muted)' }}>
                  {searchResults.length} {searchResults.length === 1 ? 'Soul' : 'Souls'}
                </p>
                {searchResults.map((user) => {
                  const initials = (user.display_name ?? user.username ?? '?').slice(0, 1).toUpperCase();
                  const CardWrapper = user.username
                    ? ({ children }: { children: React.ReactNode }) => <Link href={`/u/${user.username}`} className="block">{children}</Link>
                    : ({ children }: { children: React.ReactNode }) => <>{children}</>;
                  return (
                    <div key={user.id} className="flex items-center gap-3 glass-card rounded-2xl p-4 transition-colors">
                      <CardWrapper>
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center font-heading text-lg overflow-hidden"
                            style={{
                              background: 'var(--avatar-bg)',
                              color: 'var(--gold-text)',
                              border: `1.5px solid ${user.is_first_light ? 'var(--gold-border)' : 'var(--gold-border-s)'}`,
                            }}
                          >
                            {user.avatar_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-body font-medium text-sm truncate" style={{ color: 'var(--text-h)' }}>
                                {user.display_name ?? user.username ?? 'Anonym'}
                              </span>
                              {user.is_first_light && (
                                <span
                                  className="text-[0.55rem] tracking-[0.15em] uppercase font-label rounded-full px-1.5 py-px flex-shrink-0"
                                  style={{ color: 'var(--gold)', border: '1px solid var(--gold-border-s)' }}
                                >
                                  First Light
                                </span>
                              )}
                            </div>
                            {user.username && <p className="text-xs font-label" style={{ color: 'var(--text-muted)' }}>@{user.username}</p>}
                            {user.bio && <p className="text-xs font-body mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{user.bio}</p>}
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
        /* ─── KARTE ODER PINNWAND ──────────────────────────────── */
        <div className="relative w-full h-full">
          {/* Karte (sichtbar wenn view === 'map') */}
          {view === 'map' && (
            <>
              <MapView
                users={nearbyUsers}
                events={events}
                center={mapCenter}
                onMapMove={handleMapMove}
                onUserClick={handleUserClick}
                onEventClick={handleEventClick}
              />

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
            </>
          )}

          {/* Pinnwand (sichtbar wenn view === 'board') */}
          {view === 'board' && (
            <div className="h-full overflow-y-auto pt-16 px-3 pb-4" style={{ background: 'var(--bg-solid)' }}>
              {events.length === 0 ? (
                <div
                  className="text-center py-12 px-4 rounded-2xl mt-4"
                  style={{ border: '1px dashed var(--gold-border-s)' }}
                >
                  <p className="font-heading text-xl mb-2" style={{ color: 'var(--gold)' }}>Keine Events</p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>In dieser Gegend gibt es noch keine Events.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {events.map((event) => (
                    <EventCardCompact
                      key={event.id}
                      event={event}
                      userId={userId}
                      onJoin={handleJoinEvent}
                      onLeave={handleLeaveEvent}
                      onShare={setShareEvent}
                      joining={joiningEvent[event.id]}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Schwebendes Suchfeld + Toggle */}
          <div className="absolute top-3 left-4 right-4 z-10 flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Souls oder Orte suchen ..."
              className="flex-1 py-3 px-5 backdrop-blur-xl rounded-[8px] text-sm font-body outline-none transition-colors"
              style={{
                background: 'var(--glass-nav)',
                border: '1px solid var(--gold-border-s)',
                color: 'var(--text-h)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              }}
            />

            {/* Segment Toggle */}
            <div
              className="flex rounded-[8px] overflow-hidden flex-shrink-0 backdrop-blur-xl"
              style={{
                background: 'var(--glass-nav)',
                border: '1px solid var(--gold-border-s)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              }}
            >
              <button
                onClick={() => setView('map')}
                className="px-3 py-2 flex items-center justify-center cursor-pointer transition-all duration-200"
                style={{
                  background: view === 'map' ? 'var(--gold-bg)' : 'transparent',
                  color: view === 'map' ? 'var(--gold-text)' : 'var(--text-muted)',
                  borderRight: '1px solid var(--divider-l)',
                }}
              >
                <Icon name="map-2" size={16} />
              </button>
              <button
                onClick={() => setView('board')}
                className="px-3 py-2 flex items-center justify-center cursor-pointer transition-all duration-200"
                style={{
                  background: view === 'board' ? 'var(--gold-bg)' : 'transparent',
                  color: view === 'board' ? 'var(--gold-text)' : 'var(--text-muted)',
                }}
              >
                <Icon name="layout-grid" size={16} />
              </button>
            </div>
          </div>

          {/* FAB – Event erstellen */}
          {userId && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="fixed bottom-20 right-4 md:bottom-6 md:right-6 w-14 h-14 rounded-full flex items-center justify-center z-20 transition-transform duration-200 hover:scale-105 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, var(--gold-deep), var(--gold))',
                color: 'var(--text-on-gold)',
                boxShadow: '0 4px 16px rgba(200,169,110,0.4)',
              }}
            >
              <Icon name="calendar-plus" size={22} />
            </button>
          )}

          {/* CreateEventModal */}
          {showCreateModal && (
            <CreateEventModal
              onClose={() => setShowCreateModal(false)}
              onCreated={handleEventCreated}
            />
          )}

          {/* ShareEventModal */}
          {shareEvent && (
            <ShareEventModal
              event={shareEvent}
              onClose={() => setShareEvent(null)}
            />
          )}
        </div>
      )}
    </div>
  );
}
