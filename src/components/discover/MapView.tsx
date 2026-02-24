'use client';

import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { SoEvent } from '@/types/events';
import { useTheme } from '@/components/ThemeProvider';

export interface MapNearbyUser {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  location_lat: number;
  location_lng: number;
  soul_level: number;
  is_first_light: boolean;
  connections_count: number;
}

interface Props {
  users: MapNearbyUser[];
  events: SoEvent[];
  center: [number, number]; // [lng, lat]
  onMapMove?: (center: { lat: number; lng: number }) => void;
  onUserClick?: (user: MapNearbyUser) => void;
  onEventClick?: (event: SoEvent) => void;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';

const MAP_STYLES = {
  light: 'mapbox://styles/mapbox/light-v11',
  dark: 'mapbox://styles/mapbox/dark-v11',
} as const;

export default function MapView({ users, events, center, onMapMove, onUserClick, onEventClick }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const { theme } = useTheme();

  // Map initialisieren
  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN || map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const m = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAP_STYLES[theme],
      center: center,
      zoom: 12,
      maxZoom: 14,
      minZoom: 5,
      attributionControl: false,
    });

    m.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

    m.on('load', () => {
      setMapReady(true);
    });

    m.on('moveend', () => {
      const c = m.getCenter();
      onMapMove?.({ lat: c.lat, lng: c.lng });
    });

    map.current = m;

    return () => {
      m.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Theme-Wechsel: Mapbox Style live umschalten
  useEffect(() => {
    if (!map.current || !mapReady) return;
    map.current.setStyle(MAP_STYLES[theme]);
  }, [theme, mapReady]);

  // Marker aktualisieren
  useEffect(() => {
    if (!map.current || !mapReady) return;

    // Alte Marker entfernen
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // User-Marker (Profilbild oder Initiale)
    users.forEach((user) => {
      const initial = (user.display_name ?? user.username ?? '?').slice(0, 1).toUpperCase();
      const el = document.createElement('div');
      el.className = 'souleya-marker-user';

      if (user.avatar_url) {
        el.innerHTML = `<img src="${user.avatar_url}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`;
      } else {
        el.innerHTML = `<span style="font-size:14px;font-weight:600;color:var(--text-on-gold);">${initial}</span>`;
      }

      const borderColor = user.is_first_light ? 'rgba(200,169,110,0.8)' : 'rgba(200,169,110,0.5)';
      el.style.cssText = `
        width: 40px; height: 40px; border-radius: 50%;
        ${user.avatar_url ? '' : 'background: linear-gradient(135deg, var(--gold-deep), var(--gold));'}
        display: flex; align-items: center; justify-content: center;
        border: 2.5px solid ${borderColor};
        cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        overflow: hidden;
      `;

      // Klick → Callback statt Popup
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onUserClick?.(user);
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat([user.location_lng, user.location_lat])
        .addTo(map.current!);

      markersRef.current.push(marker);
    });

    // Event-Marker (Lila)
    events.forEach((event) => {
      const el = document.createElement('div');
      el.className = 'souleya-marker-event';
      el.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z"/></svg>';
      el.style.cssText = `
        width: 36px; height: 36px; border-radius: 50%;
        background: linear-gradient(135deg, var(--event-purple), var(--event-purple));
        display: flex; align-items: center; justify-content: center;
        color: #fff; font-size: 14px;
        border: 2px solid var(--event-purple-border);
        cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      `;

      // Klick → Callback statt Popup
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onEventClick?.(event);
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat([event.location_lng, event.location_lat])
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, [users, events, mapReady, onUserClick, onEventClick]);

  if (!MAPBOX_TOKEN) {
    return (
      <div
        className="w-full h-full glass-card flex items-center justify-center"
      >
        <p className="text-sm font-body" style={{ color: 'var(--text-muted)' }}>Karte nicht verfuegbar (Token fehlt)</p>
      </div>
    );
  }

  const isDark = theme === 'dark';

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainer} className="w-full h-full" />
      {/* Custom Styles fuer Mapbox Controls – Theme-abhaengig */}
      <style jsx global>{`
        .mapboxgl-canvas {
          filter: ${isDark
            ? 'saturate(0.8) brightness(0.92) hue-rotate(-3deg)'
            : 'sepia(0.18) saturate(0.85) brightness(1.03) hue-rotate(-3deg)'
          };
        }
        .mapboxgl-ctrl-group {
          background: ${isDark
            ? 'rgba(40,40,40,0.85)'
            : 'rgba(255,255,255,0.85)'
          } !important;
          border: 1px solid rgba(200,169,110,0.2) !important;
          border-radius: 12px !important;
          backdrop-filter: blur(16px) !important;
          box-shadow: 0 2px 8px rgba(0,0,0,${isDark ? '0.25' : '0.08'}) !important;
        }
        .mapboxgl-ctrl-group button {
          background: transparent !important;
          border-bottom: 1px solid rgba(200,169,110,0.1) !important;
          color: ${isDark ? '#F0E8D8' : 'inherit'} !important;
        }
        .mapboxgl-ctrl-group button span {
          filter: ${isDark ? 'invert(1)' : 'none'};
        }
        .mapboxgl-ctrl-group button:last-child {
          border-bottom: none !important;
        }
      `}</style>
    </div>
  );
}
