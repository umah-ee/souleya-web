'use client';

import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import type { SoEvent } from '@/types/events';

interface Props {
  events: SoEvent[];
  userLat?: number;
  userLng?: number;
}

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

function getRelativeDay(iso: string): string {
  const eventDate = new Date(iso);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  if (eventDate.toDateString() === today.toDateString()) return 'Heute';
  if (eventDate.toDateString() === tomorrow.toDateString()) return 'Morgen';
  return eventDate.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' });
}

export default function NearbyEventsWidget({ events, userLat, userLng }: Props) {
  if (events.length === 0) return null;

  const displayed = events.slice(0, 3);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-heading text-base" style={{ color: 'var(--text-h)' }}>
          In deiner Naehe
        </h2>
        <Link
          href="/discover"
          className="flex items-center gap-0.5 text-xs font-label no-underline"
          style={{ color: 'var(--gold-text)' }}
        >
          Alle
          <Icon name="chevron-right" size={12} />
        </Link>
      </div>

      <div className="space-y-2">
        {displayed.map((event) => {
          const dist = userLat != null && userLng != null
            ? distanceKm(userLat, userLng, event.location_lat, event.location_lng)
            : null;

          return (
            <div
              key={event.id}
              className="rounded-[8px] px-3 py-2.5 flex items-center gap-3"
              style={{
                background: 'var(--glass)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid var(--glass-border)',
              }}
            >
              {/* Time block */}
              <div className="flex-shrink-0 text-center" style={{ minWidth: 44 }}>
                <div className="font-heading text-sm leading-none" style={{ color: 'var(--gold-text)' }}>
                  {formatTime(event.starts_at)}
                </div>
                <div className="font-label text-[0.5rem] tracking-[0.08em] uppercase mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {getRelativeDay(event.starts_at)}
                </div>
              </div>

              {/* Divider */}
              <div className="w-px h-8 flex-shrink-0" style={{ background: 'var(--divider)' }} />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-body font-medium truncate" style={{ color: 'var(--text-h)' }}>
                  {event.title}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Icon name="map-pin" size={10} style={{ color: 'var(--text-muted)' }} />
                  <span className="text-[0.6rem] font-body truncate" style={{ color: 'var(--text-muted)' }}>
                    {event.location_name}
                  </span>
                </div>
              </div>

              {/* Distance */}
              {dist != null && (
                <span
                  className="flex-shrink-0 px-2 py-0.5 rounded-full font-label text-[0.5rem] tracking-[0.05em]"
                  style={{ background: 'var(--gold-bg)', color: 'var(--gold-text)' }}
                >
                  {dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(1)}km`}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
