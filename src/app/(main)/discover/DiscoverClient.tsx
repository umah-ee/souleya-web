'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import type { MapNearbyUser } from '@/components/discover/MapView';
import type { UserSearchResult } from '@/lib/users';
import type { ConnectionStatus } from '@/types/circles';
import type { SoEvent } from '@/types/events';
import type { Place } from '@/types/places';
import { searchUsers } from '@/lib/users';
import { sendConnectionRequest, getConnectionStatus } from '@/lib/circles';
import { fetchEvents, fetchNearbyUsers, joinEvent, leaveEvent, geocodeLocation, bookmarkEvent, unbookmarkEvent } from '@/lib/events';
import { fetchNearbyPlaces, savePlace, unsavePlace, PLACE_TAGS } from '@/lib/places';
import { Icon } from '@/components/ui/Icon';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import DiscoverOverlay from '@/components/discover/DiscoverOverlay';
import ProfileModal from '@/components/discover/ProfileModal';
import EventCardCompact from '@/components/discover/EventCardCompact';
import CreateEventModal from '@/components/discover/CreateEventModal';
import ShareEventModal from '@/components/discover/ShareEventModal';
import PlaceCard from '@/components/discover/PlaceCard';
import PlaceDetailModal from '@/components/discover/PlaceDetailModal';
import CreatePlaceModal from '@/components/discover/CreatePlaceModal';

// Mapbox dynamisch laden (nur client-side)
const MapView = dynamic(() => import('@/components/discover/MapView'), { ssr: false });

type Segment = 'alle' | 'mitglieder' | 'events' | 'orte';

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
  // ── Segment ─────────────────────────────────────────────────
  const [segment, setSegment] = useState<Segment>('alle');
  const [activeTags, setActiveTags] = useState<string[]>([]);

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
  const [places, setPlaces] = useState<Place[]>([]);
  const [savingPlace, setSavingPlace] = useState<Record<string, boolean>>({});

  // ── Overlay State ─────────────────────────────────────────
  const [selectedUser, setSelectedUser] = useState<MapNearbyUser | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<SoEvent | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [overlayConnectionStatus, setOverlayConnectionStatus] = useState<ConnectionStatus>('none');
  const [connecting, setConnecting] = useState(false);
  const [joiningEvent, setJoiningEvent] = useState<Record<string, boolean>>({});
  const [bookmarkingEvent, setBookmarkingEvent] = useState<Record<string, boolean>>({});

  // ── Create Modals ──────────────────────────────────────────
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showCreatePlace, setShowCreatePlace] = useState(false);

  // ── Share Event Modal ─────────────────────────────────────
  const [shareEvent, setShareEvent] = useState<SoEvent | null>(null);

  // ── Confirm Dialog (Entmerken) ────────────────────────────
  const [confirmUnbookmark, setConfirmUnbookmark] = useState<string | null>(null);

  // ── Lokaler Bookmark-State ────────────────────────────────
  const localBookmarks = useRef<Record<string, boolean>>({});

  const isSearchActive = query.trim().length >= 2;

  // ── Daten laden ─────────────────────────────────────────────
  const loadDiscoverData = useCallback(async (lat: number, lng: number) => {
    try {
      const [nearbyRes, eventsRes, placesRes] = await Promise.all([
        fetchNearbyUsers(lat, lng),
        fetchEvents({ lat, lng, userId: userId ?? undefined }),
        fetchNearbyPlaces(lat, lng, undefined, activeTags.length > 0 ? activeTags : undefined),
      ]);
      setNearbyUsers(nearbyRes.data);
      const merged = eventsRes.data.map((e) => ({
        ...e,
        is_bookmarked: e.id in localBookmarks.current
          ? localBookmarks.current[e.id]
          : e.is_bookmarked,
      }));
      setEvents(merged);
      setPlaces(placesRes);
    } catch (e) {
      console.error('Discover-Daten laden fehlgeschlagen:', e);
    }
  }, [userId, activeTags]);

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

  // ── Tags-Aenderung → Reload ───────────────────────────────
  useEffect(() => {
    loadDiscoverData(mapCenter[1], mapCenter[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTags]);

  // ── Tag Toggle ────────────────────────────────────────────
  const toggleTag = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  // ── Marker-Klick Handler ──────────────────────────────────
  const handleUserClick = useCallback(async (user: MapNearbyUser) => {
    setSelectedEvent(null);
    setSelectedPlace(null);
    setSelectedUser(user);
    setOverlayConnectionStatus('none');

    if (userId && user.id !== userId) {
      try {
        const status = await getConnectionStatus(user.id);
        setOverlayConnectionStatus(status.status);
      } catch { /* ignore */ }
    }
  }, [userId]);

  const handleEventClick = useCallback((event: SoEvent) => {
    setSelectedUser(null);
    setSelectedPlace(null);
    setSelectedEvent(event);
  }, []);

  const handlePlaceClick = useCallback((place: Place) => {
    setSelectedUser(null);
    setSelectedEvent(null);
    setSelectedPlace(place);
  }, []);

  const handleCloseOverlay = useCallback(() => {
    setSelectedUser(null);
    setSelectedEvent(null);
    setSelectedPlace(null);
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
          e.id === eventId ? { ...e, has_joined: true, participants_count: res.participants_count } : e,
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
          e.id === eventId ? { ...e, has_joined: false, participants_count: res.participants_count } : e,
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

  // ── Event merken/entmerken ───────────────────────────────
  const handleBookmarkEvent = async (eventId: string) => {
    const event = events.find((e) => e.id === eventId) ?? selectedEvent;
    if (!event) return;
    if (event.is_bookmarked) {
      setConfirmUnbookmark(eventId);
      return;
    }
    await executeBookmark(eventId, false);
  };

  const executeBookmark = async (eventId: string, wasBookmarked: boolean) => {
    const newState = !wasBookmarked;
    localBookmarks.current[eventId] = newState;
    setTimeout(() => { delete localBookmarks.current[eventId]; }, 5000);

    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, is_bookmarked: newState } : e)),
    );
    if (selectedEvent?.id === eventId) {
      setSelectedEvent((prev) => (prev ? { ...prev, is_bookmarked: newState } : prev));
    }

    setBookmarkingEvent((s) => ({ ...s, [eventId]: true }));
    try {
      if (wasBookmarked) {
        await unbookmarkEvent(eventId);
      } else {
        await bookmarkEvent(eventId);
      }
    } catch (e) {
      localBookmarks.current[eventId] = wasBookmarked;
      setEvents((prev) =>
        prev.map((ev) => (ev.id === eventId ? { ...ev, is_bookmarked: wasBookmarked } : ev)),
      );
      if (selectedEvent?.id === eventId) {
        setSelectedEvent((prev) => (prev ? { ...prev, is_bookmarked: wasBookmarked } : prev));
      }
      console.error(e);
    } finally {
      setBookmarkingEvent((s) => ({ ...s, [eventId]: false }));
    }
  };

  const handleConfirmUnbookmark = () => {
    if (confirmUnbookmark) {
      executeBookmark(confirmUnbookmark, true);
      setConfirmUnbookmark(null);
    }
  };

  // ── Place speichern/entsichern ────────────────────────────
  const handleSavePlace = async (placeId: string) => {
    setSavingPlace((s) => ({ ...s, [placeId]: true }));
    try {
      await savePlace(placeId);
      setPlaces((prev) => prev.map((p) => p.id === placeId ? { ...p, is_saved: true } : p));
    } catch (e) { console.error(e); }
    finally { setSavingPlace((s) => ({ ...s, [placeId]: false })); }
  };

  const handleUnsavePlace = async (placeId: string) => {
    setSavingPlace((s) => ({ ...s, [placeId]: true }));
    try {
      await unsavePlace(placeId);
      setPlaces((prev) => prev.map((p) => p.id === placeId ? { ...p, is_saved: false } : p));
    } catch (e) { console.error(e); }
    finally { setSavingPlace((s) => ({ ...s, [placeId]: false })); }
  };

  const handlePlaceSaveToggle = () => {
    if (!selectedPlace) return;
    if (selectedPlace.is_saved) {
      handleUnsavePlace(selectedPlace.id);
      setSelectedPlace((p) => p ? { ...p, is_saved: false } : p);
    } else {
      handleSavePlace(selectedPlace.id);
      setSelectedPlace((p) => p ? { ...p, is_saved: true } : p);
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
      const [usersRes, geoRes] = await Promise.allSettled([
        searchUsers(q, 1, 30),
        geocodeLocation(q, 'forward'),
      ]);

      if (usersRes.status === 'fulfilled') {
        setSearchResults(usersRes.value.data);
        if (userId && usersRes.value.data.length > 0) {
          const statusMap: Record<string, ConnectionStatus> = {};
          await Promise.all(
            usersRes.value.data.map(async (user) => {
              try {
                const s = await getConnectionStatus(user.id);
                statusMap[user.id] = s.status;
              } catch { statusMap[user.id] = 'none'; }
            }),
          );
          setStatuses(statusMap);
        }
      } else {
        setSearchResults([]);
      }

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

  const handleGeoClick = (geo: GeoResult) => {
    setMapCenter([geo.lng, geo.lat]);
    setQuery('');
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

  // ── Geolocation ─────────────────────────────────────────────
  const [locating, setLocating] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleGeolocate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMapCenter([pos.coords.longitude, pos.coords.latitude]);
        loadDiscoverData(pos.coords.latitude, pos.coords.longitude);
        setQuery('');
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  // ── Event/Place Created → Reload ─────────────────────────────
  const handleEventCreated = () => {
    setShowCreateEvent(false);
    loadDiscoverData(mapCenter[1], mapCenter[0]);
  };

  const handlePlaceCreated = () => {
    setShowCreatePlace(false);
    loadDiscoverData(mapCenter[1], mapCenter[0]);
  };

  // ── Segment Labels ────────────────────────────────────────────
  const SEGMENTS = [
    { key: 'alle' as Segment, label: 'Alle', icon: 'map-2' as const },
    { key: 'mitglieder' as Segment, label: 'Mitglieder', icon: 'users' as const },
    { key: 'events' as Segment, label: 'Events', icon: 'calendar' as const },
    { key: 'orte' as Segment, label: 'Orte', icon: 'map-pin' as const },
  ];

  return (
    <div className="fixed top-14 md:top-0 bottom-16 md:bottom-0 left-0 md:left-16 right-0 z-10">
      {/* ─── SUCHFELD + SEGMENT-TOGGLE ──────────────────────── */}
      <div
        className="absolute top-3 left-4 right-4 z-20"
        style={isSearchActive ? { position: 'relative', top: 0, left: 0, right: 0, padding: '12px 16px 0' } : undefined}
      >
        {/* Such-Input */}
        <div className="flex gap-2 mb-2">
          <div className="flex-1 relative">
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Souls oder Orte suchen ..."
              className="w-full py-3 px-5 pr-12 backdrop-blur-xl rounded-[8px] text-sm font-body outline-none transition-colors"
              style={{
                background: 'var(--glass-nav)',
                border: '1px solid var(--gold-border-s)',
                color: 'var(--text-h)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              }}
            />
            <button
              onClick={handleGeolocate}
              disabled={locating}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200"
              style={{ color: locating ? 'var(--gold)' : 'var(--text-muted)', background: 'transparent' }}
              title="Meinen Standort verwenden"
            >
              <Icon name="current-location" size={18} />
            </button>
          </div>
        </div>

        {/* Segment Toggle (nur wenn Suche nicht aktiv) */}
        {!isSearchActive && (
          <div className="flex gap-1.5 mb-2">
            {SEGMENTS.map((seg) => (
              <button
                key={seg.key}
                onClick={() => setSegment(seg.key)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-[8px] backdrop-blur-xl text-[0.65rem] tracking-[0.08em] uppercase font-label cursor-pointer transition-all duration-200"
                style={{
                  background: segment === seg.key ? 'var(--gold-bg)' : 'var(--glass-nav)',
                  border: `1px solid ${segment === seg.key ? 'var(--gold-border)' : 'var(--gold-border-s)'}`,
                  color: segment === seg.key ? 'var(--gold-text)' : 'var(--text-muted)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}
              >
                <Icon name={seg.icon} size={13} />
                {seg.label}
                {seg.key === 'mitglieder' && nearbyUsers.length > 0 && (
                  <span style={{ opacity: 0.7 }}>({nearbyUsers.length})</span>
                )}
                {seg.key === 'events' && events.length > 0 && (
                  <span style={{ opacity: 0.7 }}>({events.length})</span>
                )}
                {seg.key === 'orte' && places.length > 0 && (
                  <span style={{ opacity: 0.7 }}>({places.length})</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Tag-Filter (nur bei Orte-Segment oder Alle) */}
        {!isSearchActive && (segment === 'orte' || segment === 'alle') && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {PLACE_TAGS.slice(0, 15).map((tag) => {
              const isActive = activeTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-full text-[0.65rem] tracking-[0.06em] font-label cursor-pointer transition-all duration-200 whitespace-nowrap"
                  style={{
                    background: isActive
                      ? 'linear-gradient(135deg, var(--gold-deep), var(--gold))'
                      : 'var(--glass)',
                    border: `1px solid ${isActive ? 'var(--gold)' : 'var(--glass-border)'}`,
                    color: isActive ? 'var(--text-on-gold)' : 'var(--text-sec)',
                    backdropFilter: isActive ? 'none' : 'blur(8px)',
                    WebkitBackdropFilter: isActive ? 'none' : 'blur(8px)',
                  }}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── SUCHE AKTIV → Ergebnisliste ────────────────────── */}
      {isSearchActive ? (
        <div className="h-full flex flex-col pt-[60px]" style={{ background: 'var(--bg-solid)' }}>
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {searching && (
              <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                <p className="font-label text-[0.7rem] tracking-[0.2em]">SUCHE ...</p>
              </div>
            )}

            {!searching && searched && searchResults.length === 0 && geoResults.length === 0 && (
              <div className="text-center py-12 px-4 rounded-2xl" style={{ border: '1px dashed var(--gold-border-s)' }}>
                <p className="font-heading text-xl mb-2" style={{ color: 'var(--gold)' }}>Keine Ergebnisse</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Versuche einen anderen Suchbegriff.</p>
              </div>
            )}

            {/* Orte */}
            {!searching && geoResults.length > 0 && (
              <div className="mb-4">
                <p className="font-label text-[0.7rem] tracking-[0.15em] uppercase mb-2" style={{ color: 'var(--text-muted)' }}>Orte</p>
                <div className="space-y-2">
                  {geoResults.map((geo, i) => (
                    <button
                      key={i}
                      onClick={() => handleGeoClick(geo)}
                      className="w-full flex items-center gap-3 glass-card rounded-2xl p-3 transition-colors cursor-pointer text-left"
                    >
                      <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: 'var(--gold-bg)', color: 'var(--gold-text)' }}>
                        <Icon name="map-pin" size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-sm truncate" style={{ color: 'var(--text-h)' }}>{geo.place_name}</p>
                        <p className="text-xs font-label" style={{ color: 'var(--text-muted)' }}>
                          {geo.feature_type === 'poi' ? 'Ort / Lokal' : geo.feature_type === 'address' ? 'Adresse' : geo.feature_type === 'place' ? 'Stadt' : geo.feature_type === 'locality' ? 'Ortsteil' : geo.feature_type === 'neighborhood' ? 'Viertel' : 'Gebiet'}
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
                                <span className="text-[0.55rem] tracking-[0.15em] uppercase font-label rounded-full px-1.5 py-px flex-shrink-0" style={{ color: 'var(--gold)', border: '1px solid var(--gold-border-s)' }}>
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
        /* ─── DISCOVER-ANSICHT ──────────────────────────────── */
        <div className="relative w-full h-full">
          {/* Karte (immer sichtbar bei 'alle' und 'mitglieder', sonst auch) */}
          {(segment === 'alle' || segment === 'mitglieder') && (
            <>
              <MapView
                users={nearbyUsers}
                events={events}
                places={places}
                center={mapCenter}
                onMapMove={handleMapMove}
                onUserClick={handleUserClick}
                onEventClick={handleEventClick}
                onPlaceClick={handlePlaceClick}
              />

              {/* User Profile Modal */}
              {selectedUser && (
                <ProfileModal
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
                  onShare={setShareEvent}
                  onBookmark={handleBookmarkEvent}
                  joining={joiningEvent[selectedEvent.id]}
                  bookmarking={bookmarkingEvent[selectedEvent.id]}
                  onClose={handleCloseOverlay}
                />
              )}
            </>
          )}

          {/* Events Board */}
          {segment === 'events' && (
            <div className="h-full overflow-y-auto pt-28 px-4 pb-4" style={{ background: 'var(--bg-solid)' }}>
              {events.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-2xl mt-4" style={{ border: '1px dashed var(--gold-border-s)' }}>
                  <p className="font-heading text-xl mb-2" style={{ color: 'var(--gold)' }}>Keine Events</p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>In dieser Gegend gibt es noch keine Events.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-5 max-w-[860px] mx-auto">
                  {events.map((event) => (
                    <EventCardCompact
                      key={event.id}
                      event={event}
                      userId={userId}
                      onJoin={handleJoinEvent}
                      onLeave={handleLeaveEvent}
                      onShare={setShareEvent}
                      onBookmark={handleBookmarkEvent}
                      joining={joiningEvent[event.id]}
                      bookmarking={bookmarkingEvent[event.id]}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Orte Board */}
          {segment === 'orte' && (
            <div className="h-full overflow-y-auto pt-32 px-4 pb-4" style={{ background: 'var(--bg-solid)' }}>
              {places.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-2xl mt-4" style={{ border: '1px dashed var(--gold-border-s)' }}>
                  <p className="font-heading text-xl mb-2" style={{ color: 'var(--gold)' }}>Keine Soul Places</p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>In dieser Gegend gibt es noch keine Orte. Schlage einen vor!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-5 max-w-[860px] mx-auto">
                  {places.map((place) => (
                    <PlaceCard
                      key={place.id}
                      place={place}
                      userId={userId}
                      onSave={handleSavePlace}
                      onUnsave={handleUnsavePlace}
                      saving={savingPlace[place.id]}
                      onClick={handlePlaceClick}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* FAB – Erstellen (Event oder Place je nach Segment) */}
          {userId && (
            <button
              onClick={() => segment === 'orte' ? setShowCreatePlace(true) : setShowCreateEvent(true)}
              className="fixed bottom-20 right-4 md:bottom-6 md:right-6 w-14 h-14 rounded-full flex items-center justify-center z-20 transition-transform duration-200 hover:scale-105 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, var(--gold-deep), var(--gold))',
                color: 'var(--text-on-gold)',
                boxShadow: '0 4px 16px rgba(200,169,110,0.4)',
              }}
            >
              <Icon name={segment === 'orte' ? 'map-pin' : 'calendar-plus'} size={22} />
            </button>
          )}

          {/* Modals */}
          {showCreateEvent && (
            <CreateEventModal onClose={() => setShowCreateEvent(false)} onCreated={handleEventCreated} />
          )}
          {showCreatePlace && (
            <CreatePlaceModal
              onClose={() => setShowCreatePlace(false)}
              onCreated={handlePlaceCreated}
              defaultLat={mapCenter[1]}
              defaultLng={mapCenter[0]}
            />
          )}
          {shareEvent && (
            <ShareEventModal event={shareEvent} onClose={() => setShareEvent(null)} />
          )}

          {/* Place Detail Modal */}
          {selectedPlace && (
            <PlaceDetailModal
              place={selectedPlace}
              userId={userId}
              onClose={handleCloseOverlay}
              onSaveToggle={handlePlaceSaveToggle}
            />
          )}
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmUnbookmark !== null}
        title="Event entmerken?"
        message="Moechtest du dieses Event nicht mehr merken?"
        confirmLabel="Entmerken"
        onConfirm={handleConfirmUnbookmark}
        onCancel={() => setConfirmUnbookmark(null)}
      />
    </div>
  );
}
