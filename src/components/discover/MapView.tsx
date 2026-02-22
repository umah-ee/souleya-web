'use client';

import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { SoEvent } from '@/types/events';

interface NearbyUser {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  location_lat: number;
  location_lng: number;
  is_origin_soul: boolean;
}

interface Props {
  users: NearbyUser[];
  events: SoEvent[];
  center: [number, number]; // [lng, lat]
  onMapMove?: (center: { lat: number; lng: number }) => void;
  fullWidth?: boolean;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';

export default function MapView({ users, events, center, onMapMove, fullWidth = false }: Props) {
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
      maxZoom: 14, // Datenschutz: nicht naeher als Stadtteil
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
        // Profilbild als Marker
        el.innerHTML = `<img src="${user.avatar_url}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`;
      } else {
        // Initiale als Fallback
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

      const popup = new mapboxgl.Popup({ offset: 24, closeButton: false })
        .setHTML(`
          <div style="font-family: sans-serif; color: #F0EDE8; font-size: 12px;">
            <strong>${user.display_name ?? user.username ?? 'Anonym'}</strong>
            ${user.username ? `<br><span style="color: #9A9080; font-size: 11px;">@${user.username}</span>` : ''}
            ${user.is_origin_soul ? '<br><span style="color: #C8A96E; font-size: 10px;">Origin Soul</span>' : ''}
          </div>
        `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([user.location_lng, user.location_lat])
        .setPopup(popup)
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

      const popup = new mapboxgl.Popup({ offset: 22, closeButton: false })
        .setHTML(`
          <div style="font-family: sans-serif; color: #F0EDE8; font-size: 12px;">
            <strong>${event.title}</strong>
            <br><span style="color: #9A9080; font-size: 11px;">📍 ${event.location_name}</span>
            <br><span style="color: #9B72CF; font-size: 10px;">${event.category === 'course' ? 'Kurs' : 'Meetup'}</span>
          </div>
        `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([event.location_lng, event.location_lat])
        .setPopup(popup)
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, [users, events, mapReady]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className={`w-full ${fullWidth ? 'h-[50vh]' : 'h-[280px] rounded-2xl'} bg-dark border border-gold-1/10 flex items-center justify-center`}>
        <p className="text-[#5A5450] text-sm font-body">Karte nicht verfuegbar (Token fehlt)</p>
      </div>
    );
  }

  return (
    <div className={`w-full ${fullWidth ? 'h-[50vh]' : 'h-[280px] rounded-2xl'} overflow-hidden ${fullWidth ? '' : 'border border-gold-1/10'} relative`}>
      <div ref={mapContainer} className="w-full h-full" />
      {/* Custom Popup Styles */}
      <style jsx global>{`
        .mapboxgl-popup-content {
          background: #2C2A35 !important;
          border: 1px solid rgba(200,169,110,0.2) !important;
          border-radius: 12px !important;
          padding: 8px 12px !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.4) !important;
        }
        .mapboxgl-popup-tip {
          border-top-color: #2C2A35 !important;
        }
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
