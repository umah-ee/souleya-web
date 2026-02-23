'use client';

import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { SoEvent } from '@/types/events';

export interface MapNearbyUser {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  location_lat: number;
  location_lng: number;
  vip_level: number;
  is_origin_soul: boolean;
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

export default function MapView({ users, events, center, onMapMove, onUserClick, onEventClick }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapReady, setMapReady] = useState(false);

  // Map initialisieren
  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN || map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const m = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
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
        el.innerHTML = `<span style="font-size:14px;font-weight:600;color:#1E1C26;">${initial}</span>`;
      }

      const borderColor = user.is_origin_soul ? 'rgba(200,169,110,0.8)' : 'rgba(200,169,110,0.5)';
      el.style.cssText = `
        width: 40px; height: 40px; border-radius: 50%;
        ${user.avatar_url ? '' : 'background: linear-gradient(135deg, #A8894E, #C8A96E);'}
        display: flex; align-items: center; justify-content: center;
        border: 2.5px solid ${borderColor};
        cursor: pointer; box-shadow: 0 2px 10px rgba(0,0,0,0.4);
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
      el.innerHTML = '<span>☆</span>';
      el.style.cssText = `
        width: 36px; height: 36px; border-radius: 50%;
        background: linear-gradient(135deg, #7B4FA2, #9B72CF);
        display: flex; align-items: center; justify-content: center;
        color: #fff; font-size: 14px;
        border: 2px solid rgba(155,114,207,0.5);
        cursor: pointer; box-shadow: 0 2px 10px rgba(0,0,0,0.4);
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
      <div className="w-full h-full bg-dark border border-gold-1/10 flex items-center justify-center">
        <p className="text-[#5A5450] text-sm font-body">Karte nicht verfuegbar (Token fehlt)</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainer} className="w-full h-full" />
      {/* Custom Styles */}
      <style jsx global>{`
        .mapboxgl-ctrl-group {
          background: #2C2A35 !important;
          border: 1px solid rgba(200,169,110,0.15) !important;
          border-radius: 12px !important;
        }
        .mapboxgl-ctrl-group button {
          background: transparent !important;
          border-bottom: 1px solid rgba(200,169,110,0.1) !important;
        }
        .mapboxgl-ctrl-group button:last-child {
          border-bottom: none !important;
        }
        .mapboxgl-ctrl-group button .mapboxgl-ctrl-icon {
          filter: invert(1) !important;
        }
      `}</style>
    </div>
  );
}
