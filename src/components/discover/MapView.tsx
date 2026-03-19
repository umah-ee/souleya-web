'use client';

import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { SoEvent } from '@/types/events';
import type { Place } from '@/types/places';
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
  places?: Place[];
  center: [number, number]; // [lng, lat]
  onMapMove?: (center: { lat: number; lng: number }) => void;
  onUserClick?: (user: MapNearbyUser) => void;
  onEventClick?: (event: SoEvent) => void;
  onPlaceClick?: (place: Place) => void;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';

const MAP_STYLES = {
  light: 'mapbox://styles/mapbox/light-v11',
  dark: 'mapbox://styles/mapbox/dark-v11',
} as const;

export default function MapView({ users, events, places = [], center, onMapMove, onUserClick, onEventClick, onPlaceClick }: Props) {
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
  const [styleLoaded, setStyleLoaded] = useState(0);
  useEffect(() => {
    if (!map.current || !mapReady) return;
    map.current.setStyle(MAP_STYLES[theme]);
    // After style change, sources/layers are gone — trigger re-render of markers
    map.current.once('style.load', () => {
      setStyleLoaded((c) => c + 1);
    });
  }, [theme, mapReady]);

  // User-Ref fuer Klick-Handler
  const usersRef = useRef<MapNearbyUser[]>([]);
  usersRef.current = users;

  // Cluster-Layers + Unclustered-Marker fuer Users
  useEffect(() => {
    if (!map.current || !mapReady) return;
    const m = map.current;

    // Cleanup: alte Cluster-Layers und -Source entfernen
    const layersToRemove = ['users-cluster-circles', 'users-cluster-count', 'users-unclustered-point'];
    layersToRemove.forEach((id) => {
      if (m.getLayer(id)) m.removeLayer(id);
    });
    if (m.getSource('users-cluster')) m.removeSource('users-cluster');

    // Unclustered DOM-Marker entfernen (nur User-Marker)
    markersRef.current.forEach((marker) => {
      const el = marker.getElement();
      if (el.className.includes('souleya-marker-user')) marker.remove();
    });
    markersRef.current = markersRef.current.filter((marker) => !marker.getElement().className.includes('souleya-marker-user'));

    if (users.length === 0) return;

    // GeoJSON Source mit Cluster-Optionen
    m.addSource('users-cluster', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: users.map((u) => ({
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: [u.location_lng, u.location_lat],
          },
          properties: {
            id: u.id,
            name: u.display_name || u.username || '',
            avatar_url: u.avatar_url || '',
            is_first_light: u.is_first_light,
          },
        })),
      },
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50,
    });

    // Cluster circles (gold)
    m.addLayer({
      id: 'users-cluster-circles',
      type: 'circle',
      source: 'users-cluster',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#C8A96E',
        'circle-radius': ['step', ['get', 'point_count'], 20, 10, 26, 30, 32],
        'circle-opacity': 0.85,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#D4BC8B',
      },
    });

    // Cluster count text
    m.addLayer({
      id: 'users-cluster-count',
      type: 'symbol',
      source: 'users-cluster',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': ['get', 'point_count_abbreviated'],
        'text-size': 13,
      },
      paint: {
        'text-color': '#FFFFFF',
      },
    });

    // Invisible point for unclustered — we use DOM markers for avatars
    m.addLayer({
      id: 'users-unclustered-point',
      type: 'circle',
      source: 'users-cluster',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-radius': 0,
        'circle-opacity': 0,
      },
    });

    // Click on cluster → zoom in
    m.on('click', 'users-cluster-circles', (e) => {
      const features = m.queryRenderedFeatures(e.point, { layers: ['users-cluster-circles'] });
      if (!features.length) return;
      const clusterId = features[0].properties?.cluster_id;
      const source = m.getSource('users-cluster') as mapboxgl.GeoJSONSource;
      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return;
        const geom = features[0].geometry;
        if (geom.type === 'Point') {
          m.easeTo({ center: geom.coordinates as [number, number], zoom: zoom ?? 14 });
        }
      });
    });

    // Cursor pointer on clusters
    m.on('mouseenter', 'users-cluster-circles', () => { m.getCanvas().style.cursor = 'pointer'; });
    m.on('mouseleave', 'users-cluster-circles', () => { m.getCanvas().style.cursor = ''; });

    // Render unclustered user markers as DOM (for avatars)
    const renderUnclusteredMarkers = () => {
      // Remove old unclustered user DOM markers
      markersRef.current.forEach((marker) => {
        const el = marker.getElement();
        if (el.className.includes('souleya-marker-user')) marker.remove();
      });
      markersRef.current = markersRef.current.filter((marker) => !marker.getElement().className.includes('souleya-marker-user'));

      const features = m.queryRenderedFeatures({ layers: ['users-unclustered-point'] });
      features.forEach((feature) => {
        const props = feature.properties;
        if (!props?.id) return;
        const user = usersRef.current.find((u) => u.id === props.id);
        if (!user) return;

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

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          onUserClick?.(user);
        });

        const geom = feature.geometry;
        if (geom.type === 'Point') {
          const marker = new mapboxgl.Marker(el)
            .setLngLat(geom.coordinates as [number, number])
            .addTo(m);
          markersRef.current.push(marker);
        }
      });
    };

    // Render on idle and moveend
    m.on('idle', renderUnclusteredMarkers);
    m.on('moveend', renderUnclusteredMarkers);

    // Initial render
    renderUnclusteredMarkers();

    return () => {
      m.off('idle', renderUnclusteredMarkers);
      m.off('moveend', renderUnclusteredMarkers);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, mapReady, onUserClick, styleLoaded]);

  // Event + Place DOM markers (fewer items, keep as DOM markers)
  useEffect(() => {
    if (!map.current || !mapReady) return;

    // Remove old event + place markers
    markersRef.current.forEach((marker) => {
      const el = marker.getElement();
      if (el.className.includes('souleya-marker-event') || el.className.includes('souleya-marker-place')) {
        marker.remove();
      }
    });
    markersRef.current = markersRef.current.filter((marker) => {
      const cn = marker.getElement().className;
      return !cn.includes('souleya-marker-event') && !cn.includes('souleya-marker-place');
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

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onEventClick?.(event);
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat([event.location_lng, event.location_lat])
        .addTo(map.current!);

      markersRef.current.push(marker);
    });

    // Place-Marker (Gold)
    places.forEach((place) => {
      const el = document.createElement('div');
      el.className = 'souleya-marker-place';
      el.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M3 21l18 0"/><path d="M5 21v-14l8 -4v18"/><path d="M19 21v-10l-6 -4"/><path d="M9 9v.01"/><path d="M9 12v.01"/><path d="M9 15v.01"/><path d="M9 18v.01"/></svg>';
      el.style.cssText = `
        width: 36px; height: 36px; border-radius: 50%;
        background: linear-gradient(135deg, var(--gold-deep), var(--gold));
        display: flex; align-items: center; justify-content: center;
        border: 2px solid rgba(200,169,110,0.6);
        cursor: pointer; box-shadow: 0 2px 8px rgba(200,169,110,0.25);
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onPlaceClick?.(place);
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat([place.location_lng, place.location_lat])
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, places, mapReady, onEventClick, onPlaceClick, styleLoaded]);

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
        .mapboxgl-ctrl-top-right {
          top: 50% !important;
          transform: translateY(-50%) !important;
          right: 12px !important;
        }
        .mapboxgl-ctrl-group {
          background: ${isDark
            ? 'rgba(40,40,40,0.85)'
            : 'rgba(255,255,255,0.85)'
          } !important;
          border: 1px solid rgba(200,169,110,0.2) !important;
          border-radius: 8px !important;
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
