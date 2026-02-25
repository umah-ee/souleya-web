'use client';

import { Icon } from '@/components/ui/Icon';

export interface EventShareData {
  event_id: string;
  event_title: string;
  event_category?: 'meetup' | 'course';
  event_cover_url?: string | null;
  event_starts_at?: string;
  event_location_name?: string;
  event_participants_count?: number;
}

interface Props {
  data: EventShareData;
  onClick?: () => void;
}

function formatDay(dateString: string): string {
  return new Date(dateString).toLocaleDateString('de-DE', { day: 'numeric' });
}

function formatMonth(dateString: string): string {
  return new Date(dateString).toLocaleDateString('de-DE', { month: 'short' }).toUpperCase();
}

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

export default function EventShareCard({ data, onClick }: Props) {
  const isCourse = data.event_category === 'course';

  return (
    <div
      className="glass-card rounded-[14px] overflow-hidden max-w-[320px] w-full transition-transform duration-200 hover:-translate-y-[2px]"
      style={{ cursor: onClick ? 'pointer' : undefined }}
      onClick={onClick}
    >
      <div className="flex">
        {/* Links: Thumbnail */}
        <div
          className="w-[88px] flex-shrink-0 relative overflow-hidden"
          style={{
            background: data.event_cover_url
              ? undefined
              : 'linear-gradient(135deg, var(--gold-deep), var(--gold))',
          }}
        >
          {data.event_cover_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.event_cover_url}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {data.event_starts_at ? (
                <>
                  <span className="text-white font-heading text-lg leading-none">{formatDay(data.event_starts_at)}</span>
                  <span className="text-white/80 font-label text-[0.4rem] tracking-[0.12em] uppercase">{formatMonth(data.event_starts_at)}</span>
                </>
              ) : (
                <Icon name="calendar" size={20} style={{ color: 'rgba(255,255,255,.8)' }} />
              )}
            </div>
          )}
        </div>

        {/* Rechts: Info */}
        <div className="flex-1 min-w-0 p-2.5">
          {/* Kategorie Badge */}
          <div className="mb-1">
            <span
              className="text-[0.45rem] tracking-[0.12em] uppercase font-label px-1.5 py-px rounded-full"
              style={isCourse ? {
                color: 'var(--event-purple)',
                border: '1px solid var(--event-purple-border)',
                background: 'var(--event-purple-bg)',
              } : {
                color: 'var(--gold-text)',
                border: '1px solid var(--gold-border-s)',
                background: 'var(--gold-bg)',
              }}
            >
              {isCourse ? 'Kurs' : 'Meetup'}
            </span>
          </div>

          {/* Titel */}
          <h4 className="font-body font-medium text-xs leading-tight line-clamp-2 mb-1" style={{ color: 'var(--text-h)' }}>
            {data.event_title}
          </h4>

          {/* Zeit */}
          {data.event_starts_at && (
            <div className="flex items-center gap-1 mb-0.5">
              <Icon name="clock" size={9} style={{ color: 'var(--text-muted)' }} />
              <span className="text-[0.55rem] font-body" style={{ color: 'var(--text-muted)' }}>
                {formatTime(data.event_starts_at)}
              </span>
            </div>
          )}

          {/* Ort */}
          {data.event_location_name && (
            <div className="flex items-center gap-1 mb-1">
              <Icon name="map-pin" size={9} style={{ color: 'var(--text-muted)' }} />
              <span className="text-[0.55rem] font-body truncate" style={{ color: 'var(--text-muted)' }}>
                {data.event_location_name}
              </span>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-1 pt-1" style={{ borderTop: '1px solid var(--divider-l)' }}>
            {data.event_participants_count != null && (
              <span className="text-[0.5rem] font-body" style={{ color: 'var(--text-muted)' }}>
                {data.event_participants_count} Teilnehmer
              </span>
            )}
            <span
              className="text-[0.5rem] font-label tracking-[0.1em] uppercase px-2 py-0.5 rounded-full"
              style={{
                background: 'linear-gradient(135deg, var(--gold-deep), var(--gold))',
                color: 'var(--text-on-gold)',
              }}
            >
              Ansehen
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
