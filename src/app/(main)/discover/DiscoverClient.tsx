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
import { fetchEvents, fetchNearbyUsers, joinEvent, leaveEvent, geocodeLocation, bookmarkEvent, unbookmarkEvent, joinEventChat } from '@/lib/events';
import { fetchNearbyPlaces, savePlace, unsavePlace, PLACE_TAGS } from '@/lib/places';
import { fetchProfile } from '@/lib/profile';
import { Icon } from '@/components/ui/Icon';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import DiscoverOverlay from '@/components/discover/DiscoverOverlay';
import ProfileModal from '@/components/discover/ProfileModal';
import EventCardCompact from '@/components/discover/EventCardCompact';
import CreateEventModal from '@/components/discover/CreateEventModal';
import EditEventModal from '@/components/discover/EditEventModal';
import ShareEventModal from '@/components/discover/ShareEventModal';
import PlaceCard from '@/components/discover/PlaceCard';
import PlaceDetailModal from '@/components/discover/PlaceDetailModal';
import CreatePlaceModal from '@/components/discover/CreatePlaceModal';
import { useSidebar } from '@/components/layout/SidebarContext';
import { useCurrentProfile } from '@/hooks/useCurrentProfile';

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

function getInitialCenter(): [number, number] {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('discover_location');
      if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
  }
  return DEFAULT_CENTER;
}

function getInitialLabel(): string {
  if (typeof window !== 'undefined') {
    try {
      return localStorage.getItem('discover_location_label') ?? '';
    } catch { /* ignore */ }
  }
  return '';
}

export default function DiscoverClient({ userId }: Props) {
  const { collapsed } = useSidebar();
  const { profile: currentProfile } = useCurrentProfile();

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
  const [geoExpanded, setGeoExpanded] = useState(false);

  // ── Karte + Discover ──────────────────────────────────────
  const [mapCenter, setMapCenter] = useState<[number, number]>(getInitialCenter);
  const [locationLabel, setLocationLabel] = useState(getInitialLabel);
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

  // ── Share + Edit Event Modal ──────────────────────────────
  const [shareEvent, setShareEvent] = useState<SoEvent | null>(null);
  const [editEvent, setEditEvent] = useState<SoEvent | null>(null);

  // ── Confirm Dialogs ──────────────────────────────────────
  const [confirmUnbookmark, setConfirmUnbookmark] = useState<string | null>(null);
  const [chatInviteEventId, setChatInviteEventId] = useState<string | null>(null);

  // ── Lokaler Bookmark-State ────────────────────────────────
  const localBookmarks = useRef<Record<string, boolean>>({});

  // ── Tags expand/collapse ────────────────────────────────
  const [tagsExpanded, setTagsExpanded] = useState(false);
  const [popularTags, setPopularTags] = useState<string[]>([]);
  const [userInterests, setUserInterests] = useState<string[]>([]);

  const isSearchActive = query.trim().length >= 2;

  // ── Profil-Vorlieben + Standort laden ────────────────────────
  const [tagsInitialized, setTagsInitialized] = useState(false);
  useEffect(() => {
    if (!userId || tagsInitialized) return;
    fetchProfile()
      .then((profile) => {
        const interests = profile.interests ?? [];
        setUserInterests(interests);
        const matching = interests.filter((i) => PLACE_TAGS.includes(i));
        if (matching.length > 0) {
          setActiveTags(matching);
        }
        // Standort aus Profil uebernehmen wenn kein localStorage-Wert vorhanden
        const hasStored = !!localStorage.getItem('discover_location');
        if (!hasStored && profile.location_lat && profile.location_lng) {
          setMapCenter([profile.location_lng, profile.location_lat]);
          if (profile.location) {
            setLocationLabel(profile.location);
          }
        }
        setTagsInitialized(true);
      })
      .catch(() => setTagsInitialized(true));
  }, [userId, tagsInitialized]);

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
      // Compute popular tags from places
      const tagFreq = new Map<string, number>();
      placesRes.forEach((p) => p.tags?.forEach((t) => tagFreq.set(t, (tagFreq.get(t) || 0) + 1)));
      const top3 = [...tagFreq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map((e) => e[0]);
      setPopularTags(top3);
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

  // Standort in localStorage persistieren
  useEffect(() => {
    try {
      localStorage.setItem('discover_location', JSON.stringify(mapCenter));
    } catch { /* ignore */ }
  }, [mapCenter]);

  useEffect(() => {
    try {
      localStorage.setItem('discover_location_label', locationLabel);
    } catch { /* ignore */ }
  }, [locationLabel]);

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
        // Nach Bookmark: Chat-Invite anbieten
        setChatInviteEventId(eventId);
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

  const handleJoinEventChat = async () => {
    if (!chatInviteEventId) return;
    try {
      const result = await joinEventChat(chatInviteEventId);
      setChatInviteEventId(null);
      // Zum Chat navigieren
      window.location.href = `/chat/${result.channel_id}`;
    } catch (e) {
      console.error('Event-Chat beitreten fehlgeschlagen:', e);
      setChatInviteEventId(null);
    }
  };

  // ── Event bearbeiten ─────────────────────────────────────
  const handleEditEvent = (event: SoEvent) => {
    setEditEvent(event);
  };

  const handleEventUpdated = () => {
    setEditEvent(null);
    // Events neu laden
    if (mapCenter) {
      fetchEvents({ lat: mapCenter[1], lng: mapCenter[0], userId: userId ?? undefined })
        .then((res) => setEvents(res.data))
        .catch(console.error);
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
      setGeoExpanded(false);
      return;
    }
    setGeoExpanded(false);

    setSearching(true);
    try {
      const proximity = `${mapCenter[0]},${mapCenter[1]}`;
      const [usersRes, geoRes] = await Promise.allSettled([
        searchUsers(q, 1, 30),
        geocodeLocation(q, 'forward', proximity),
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
  }, [userId, mapCenter]);

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
    setLocationLabel(geo.place_name);
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
      async (pos) => {
        const { longitude, latitude } = pos.coords;
        setMapCenter([longitude, latitude]);
        loadDiscoverData(latitude, longitude);
        setQuery('');
        // Reverse Geocode fuer Location-Label
        try {
          const res = await geocodeLocation(`${longitude},${latitude}`, 'reverse');
          if (res.results?.[0]) {
            setLocationLabel(res.results[0].place_name);
          }
        } catch { /* ignore */ }
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
    <>
    <style>{`@media(min-width:768px){.discover-wrap{left:${collapsed ? 64 : 240}px !important}}`}</style>
    <div className="discover-wrap fixed top-14 md:top-0 bottom-16 md:bottom-0 left-0 right-0 z-10">
      {/* ─── SUCHFELD + SEGMENT-TOGGLE ──────────────────────── */}
      <div
        className="absolute top-3 left-1/2 -translate-x-1/2 z-10 w-[80%] max-w-[600px]"
        style={{
          ...(isSearchActive ? { position: 'relative', top: 0, left: 0, right: 0, transform: 'none', width: '100%', maxWidth: 'none', padding: '12px 16px 0' } : {}),
        }}
      >
        {/* Such-Input */}
        <div className="flex gap-2 mb-2">
          <div className="flex-1 relative">
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Souls oder Orte suchen …"
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

        {/* Segment Toggle — kompakte Pillen unter Suchfeld */}
        {!isSearchActive && (
          <div className="flex gap-1.5 mb-1">
            {SEGMENTS.map((seg) => {
              const count = seg.key === 'mitglieder' ? nearbyUsers.length
                : seg.key === 'events' ? events.length
                : seg.key === 'orte' ? places.length : 0;
              return (
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
                  {count > 0 && <span style={{ opacity: 0.7 }}>({count})</span>}
                </button>
              );
            })}
          </div>
        )}

        {/* Location Breadcrumb Pill */}
        {!isSearchActive && locationLabel && (
          <div className="flex items-center mb-1">
            <span
              className="inline-flex items-center gap-1.5 text-[10px] font-label rounded-full px-3 py-1"
              style={{ border: '1px solid var(--gold-border)', color: 'var(--gold-text)', background: 'var(--glass-nav)' }}
            >
              <Icon name="map-pin" size={10} style={{ color: 'var(--gold)' }} />
              <span className="truncate max-w-[180px]">{locationLabel}</span>
              <button
                onClick={handleGeolocate}
                className="ml-0.5 cursor-pointer hover:opacity-70 transition-opacity"
                style={{ color: 'var(--text-muted)' }}
                title="Standort zuruecksetzen"
              >
                <svg viewBox="0 0 24 24" width={10} height={10} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6l-12 12" /><path d="M6 6l12 12" />
                </svg>
              </button>
            </span>
          </div>
        )}

        {/* Tag-Filter — Calm & Curated (nur bei Orte/Alle) */}
        {!isSearchActive && (segment === 'orte' || segment === 'alle') && (() => {
          const VISIBLE_COUNT = 6;
          const visibleTags = tagsExpanded
            ? PLACE_TAGS
            : [...new Set([...activeTags, ...PLACE_TAGS.slice(0, VISIBLE_COUNT)])].slice(0, Math.max(VISIBLE_COUNT, activeTags.length));
          const hiddenCount = PLACE_TAGS.length - visibleTags.length;
          return (
            <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5">
              {visibleTags.map((tag) => {
                const isActive = activeTags.includes(tag);
                const isPopular = popularTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className="font-label cursor-pointer transition-colors duration-200 inline-flex items-center gap-1"
                    style={{
                      fontSize: '0.6rem',
                      letterSpacing: '0.06em',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      background: isActive ? 'var(--gold-bg)' : isPopular ? 'var(--gold-bg)' : 'transparent',
                      color: isActive ? 'var(--gold-text)' : isPopular ? 'var(--gold-text)' : 'var(--text-muted)',
                      borderBottom: isActive ? '1.5px solid var(--gold)' : '1.5px solid transparent',
                      opacity: isPopular && !isActive ? 0.85 : 1,
                    }}
                  >
                    {tag}
                    {isPopular && !isActive && (
                      <span style={{ fontSize: '0.45rem', color: 'var(--gold)', opacity: 0.7 }}>beliebt</span>
                    )}
                  </button>
                );
              })}
              {hiddenCount > 0 && !tagsExpanded && (
                <button
                  onClick={() => setTagsExpanded(true)}
                  className="font-label cursor-pointer transition-colors duration-200"
                  style={{
                    fontSize: '0.6rem',
                    letterSpacing: '0.06em',
                    padding: '4px 8px',
                    color: 'var(--text-muted)',
                    opacity: 0.7,
                  }}
                >
                  +{hiddenCount}
                </button>
              )}
              {tagsExpanded && (
                <button
                  onClick={() => setTagsExpanded(false)}
                  className="font-label cursor-pointer transition-colors duration-200"
                  style={{
                    fontSize: '0.6rem',
                    letterSpacing: '0.06em',
                    padding: '4px 8px',
                    color: 'var(--text-muted)',
                    opacity: 0.7,
                  }}
                >
                  weniger
                </button>
              )}
            </div>
          );
        })()}
      </div>

      {/* ─── SUCHE AKTIV → Ergebnisliste ────────────────────── */}
      {isSearchActive ? (
        <div className="h-full flex flex-col pt-[60px]" style={{ background: 'var(--bg-solid)' }}>
          <div className="flex-1 overflow-y-auto scrollbar-gold px-4 pb-20">
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
            {!searching && geoResults.length > 0 && (() => {
              const GEO_LIMIT = 3;
              const visible = geoExpanded ? geoResults : geoResults.slice(0, GEO_LIMIT);
              const hiddenCount = geoResults.length - GEO_LIMIT;
              return (
                <div className="mb-4">
                  <p className="font-label text-[0.7rem] tracking-[0.15em] uppercase mb-2" style={{ color: 'var(--text-muted)' }}>Orte</p>
                  <div className="space-y-2">
                    {visible.map((geo, i) => (
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
                  {!geoExpanded && hiddenCount > 0 && (
                    <button
                      onClick={() => setGeoExpanded(true)}
                      className="w-full mt-2 py-2 text-center font-label text-[0.7rem] tracking-[0.12em] uppercase rounded-xl transition-colors cursor-pointer"
                      style={{ color: 'var(--gold)', border: '1px dashed var(--gold-border-s)' }}
                    >
                      {hiddenCount} weitere{hiddenCount === 1 ? 'r Ort' : ' Orte'}
                    </button>
                  )}
                  {geoExpanded && geoResults.length > GEO_LIMIT && (
                    <button
                      onClick={() => setGeoExpanded(false)}
                      className="w-full mt-2 py-2 text-center font-label text-[0.7rem] tracking-[0.12em] uppercase rounded-xl transition-colors cursor-pointer"
                      style={{ color: 'var(--gold)', border: '1px dashed var(--gold-border-s)' }}
                    >
                      Weniger anzeigen
                    </button>
                  )}
                </div>
              );
            })()}

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
        <div key={segment} className="relative w-full h-full animate-discover-fade">
          {/* Karte (immer sichtbar bei 'alle' und 'mitglieder', sonst auch) */}
          {(segment === 'alle' || segment === 'mitglieder') && (
            <>
              <MapView
                users={nearbyUsers}
                events={segment === 'alle' ? events : []}
                places={segment === 'alle' ? places : []}
                center={mapCenter}
                onMapMove={handleMapMove}
                onUserClick={handleUserClick}
                onEventClick={handleEventClick}
                onPlaceClick={handlePlaceClick}
              />

              {/* "Fuer dich" Recommendations (only in 'alle' segment) */}
              {segment === 'alle' && userInterests.length > 0 && (() => {
                const interestsLower = userInterests.map((i) => i.toLowerCase());
                const matchingPlaces = places.filter((p) =>
                  p.tags?.some((t) => interestsLower.includes(t.toLowerCase())),
                );
                const matchingEvents = events.filter((e) =>
                  interestsLower.some((i) => e.title.toLowerCase().includes(i) || e.category?.toLowerCase().includes(i)),
                );
                type RecoItem = { type: 'place'; data: Place } | { type: 'event'; data: SoEvent };
                const recos: RecoItem[] = [
                  ...matchingPlaces.map((p) => ({ type: 'place' as const, data: p })),
                  ...matchingEvents.map((e) => ({ type: 'event' as const, data: e })),
                ].slice(0, 8);
                if (recos.length === 0) return null;
                return (
                  <div className="absolute bottom-20 md:bottom-4 left-0 right-0 z-10 px-3">
                    <p className="font-label text-[0.6rem] tracking-[0.15em] uppercase mb-1.5 px-1" style={{ color: 'var(--gold-text)' }}>Fuer dich</p>
                    <div className="overflow-x-auto flex gap-3 pb-2 scrollbar-gold">
                      {recos.map((reco) => {
                        const isPlace = reco.type === 'place';
                        const item = reco.data;
                        const coverUrl = isPlace ? (item as Place).cover_url : (item as SoEvent).cover_url;
                        const title = isPlace ? (item as Place).name : (item as SoEvent).title;
                        return (
                          <div
                            key={`${reco.type}-${item.id}`}
                            onClick={() => isPlace ? handlePlaceClick(item as Place) : handleEventClick(item as SoEvent)}
                            className="flex-shrink-0 rounded-xl overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-[1.03]"
                            style={{
                              width: '160px',
                              border: '1px solid var(--gold-border)',
                              background: 'var(--glass)',
                              backdropFilter: 'blur(16px)',
                              WebkitBackdropFilter: 'blur(16px)',
                            }}
                          >
                            {coverUrl && (
                              <div className="relative" style={{ height: '80px' }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={coverUrl} alt="" loading="lazy" className="w-full h-full object-cover block" />
                                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,.4) 0%, transparent 60%)' }} />
                              </div>
                            )}
                            <div className="p-2">
                              <p className="text-[11px] font-heading italic line-clamp-1" style={{ color: 'var(--text-h)' }}>{title}</p>
                              <p className="text-[8px] tracking-[0.1em] uppercase font-label mt-0.5" style={{ color: 'var(--gold)' }}>Passt zu dir</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

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

              {/* Members Empty State */}
              {segment === 'mitglieder' && nearbyUsers.length === 0 && (
                <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 w-[90%] max-w-[400px] text-center py-8 px-6 rounded-2xl" style={{ border: '1px dashed var(--gold-border-s)', background: 'var(--glass)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
                  <div className="flex justify-center mb-3">
                    <svg viewBox="0 0 24 24" width={48} height={48} fill="none" stroke="var(--gold)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
                      <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      <path d="M21 21v-2a4 4 0 0 0 -3 -3.85" />
                    </svg>
                  </div>
                  <p className="font-heading text-lg mb-1.5" style={{ color: 'var(--text-h)' }}>Noch keine Souls in der Naehe.</p>
                  <p className="text-xs font-body" style={{ color: 'var(--text-muted)' }}>Erweitere deinen Suchradius oder vernetze dich mit anderen.</p>
                </div>
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
            <div className="h-full overflow-y-auto scrollbar-gold pt-36 px-4 pb-20" style={{ background: 'var(--bg-solid)' }}>
              {events.length === 0 ? (
                <div className="text-center py-12 px-6 rounded-2xl mt-4" style={{ border: '1px dashed var(--gold-border-s)', background: 'var(--glass)' }}>
                  <div className="flex justify-center mb-4">
                    <svg viewBox="0 0 24 24" width={48} height={48} fill="none" stroke="var(--gold)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12.5 21h-6.5a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v5" />
                      <path d="M16 3v4" /><path d="M8 3v4" /><path d="M4 11h16" />
                      <path d="M16 19h6" /><path d="M19 16v6" />
                    </svg>
                  </div>
                  <p className="font-heading text-xl mb-2" style={{ color: 'var(--text-h)' }}>Hier gibt es noch keine Events.</p>
                  <p className="text-sm font-body mb-4" style={{ color: 'var(--text-muted)' }}>Sei der Erste und erstelle ein Event in deiner Naehe.</p>
                  <button
                    onClick={() => setShowCreateEvent(true)}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full font-label text-[0.7rem] tracking-[0.1em] uppercase cursor-pointer transition-all duration-200"
                    style={{
                      background: 'linear-gradient(135deg, var(--gold-deep), var(--gold))',
                      color: 'var(--text-on-gold)',
                    }}
                  >
                    Event erstellen →
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 max-w-[600px] mx-auto">
                  {events.map((event) => (
                    <EventCardCompact
                      key={event.id}
                      event={event}
                      userId={userId}
                      onJoin={handleJoinEvent}
                      onLeave={handleLeaveEvent}
                      onShare={setShareEvent}
                      onBookmark={handleBookmarkEvent}
                      onEdit={handleEditEvent}
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
            <div className="h-full overflow-y-auto scrollbar-gold pt-36 px-4 pb-20" style={{ background: 'var(--bg-solid)' }}>
              {places.length === 0 ? (
                <div className="text-center py-12 px-6 rounded-2xl mt-4" style={{ border: '1px dashed var(--gold-border-s)', background: 'var(--glass)' }}>
                  <div className="flex justify-center mb-4">
                    <svg viewBox="0 0 24 24" width={48} height={48} fill="none" stroke="var(--gold)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
                      <path d="M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0z" />
                    </svg>
                  </div>
                  <p className="font-heading text-xl mb-2" style={{ color: 'var(--text-h)' }}>Kennst du einen besonderen Ort?</p>
                  <p className="text-sm font-body mb-4" style={{ color: 'var(--text-muted)' }}>Teile deine Lieblingsorte mit der Community.</p>
                  <button
                    onClick={() => setShowCreatePlace(true)}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full font-label text-[0.7rem] tracking-[0.1em] uppercase cursor-pointer transition-all duration-200"
                    style={{
                      background: 'linear-gradient(135deg, var(--gold-deep), var(--gold))',
                      color: 'var(--text-on-gold)',
                    }}
                  >
                    Ort vorschlagen →
                  </button>
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
          {editEvent && (
            <EditEventModal event={editEvent} onClose={() => setEditEvent(null)} onUpdated={handleEventUpdated} />
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

      {/* Confirm Dialog: Unbookmark */}
      <ConfirmDialog
        open={confirmUnbookmark !== null}
        title="Event entmerken?"
        message="Moechtest du dieses Event nicht mehr merken?"
        confirmLabel="Entmerken"
        onConfirm={handleConfirmUnbookmark}
        onCancel={() => setConfirmUnbookmark(null)}
      />

      {/* Confirm Dialog: Event-Chat beitreten */}
      <ConfirmDialog
        open={chatInviteEventId !== null}
        title="Event-Chat beitreten?"
        message="Moechtest du dem Chat fuer dieses Event beitreten? Du kannst dich dort mit anderen Teilnehmern austauschen."
        confirmLabel="Beitreten"
        onConfirm={handleJoinEventChat}
        onCancel={() => setChatInviteEventId(null)}
      />
    </div>
    </>
  );
}
