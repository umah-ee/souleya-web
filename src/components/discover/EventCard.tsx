'use client';

import type { SoEvent } from '@/types/events';
import { Icon } from '@/components/ui/Icon';

interface Props {
  event: SoEvent;
  onJoin?: (id: string) => void;
  onLeave?: (id: string) => void;
  joining?: boolean;
  userId?: string | null;
}

function formatDate(dateString: string): string {
  const d = new Date(dateString);
  return d.toLocaleDateString('de-DE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function formatTime(dateString: string): string {
  const d = new Date(dateString);
  return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

export default function EventCard({ event, onJoin, onLeave, joining, userId }: Props) {
  const isCreator = userId === event.creator_id;
  const isFull = event.max_participants != null && event.participants_count >= event.max_participants;
  const creatorName = event.creator?.display_name ?? event.creator?.username ?? 'Anonym';

  return (
    <div className="glass-card rounded-2xl p-4 transition-colors">
      {/* Kategorie + Datum */}
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-[0.6rem] tracking-[0.15em] uppercase font-label px-2 py-0.5 rounded-full"
          style={event.category === 'course' ? {
            color: 'var(--event-purple)',
            border: '1px solid var(--event-purple-border)',
            background: 'var(--event-purple-bg)',
          } : {
            color: 'var(--gold-text)',
            border: '1px solid var(--gold-border-s)',
            background: 'var(--gold-bg)',
          }}
        >
          {event.category === 'course' ? 'Kurs' : 'Meetup'}
        </span>
        <span className="font-body text-xs" style={{ color: 'var(--text-muted)' }}>
          {formatDate(event.starts_at)} · {formatTime(event.starts_at)}
          {event.ends_at && ` – ${formatTime(event.ends_at)}`}
        </span>
      </div>

      {/* Titel */}
      <h3 className="font-body font-medium text-sm mb-1.5" style={{ color: 'var(--text-h)' }}>{event.title}</h3>

      {/* Beschreibung */}
      {event.description && (
        <p className="text-xs font-body line-clamp-2 mb-3" style={{ color: 'var(--text-muted)' }}>{event.description}</p>
      )}

      {/* Ort */}
      <div className="flex items-center gap-1.5 mb-3">
        <span style={{ color: 'var(--text-muted)' }}><Icon name="map-pin" size={12} /></span>
        <span className="text-xs font-body truncate" style={{ color: 'var(--text-sec)' }}>{event.location_name}</span>
      </div>

      {/* Footer: Creator + Teilnehmer + Action */}
      <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--divider-l)' }}>
        <div className="flex items-center gap-2 min-w-0">
          {/* Creator Avatar */}
          <div
            className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-heading overflow-hidden"
            style={{
              background: 'var(--avatar-bg)',
              color: 'var(--gold-text)',
              border: `1px solid ${event.creator?.is_first_light ? 'var(--gold-border)' : 'var(--gold-border-s)'}`,
            }}
          >
            {event.creator?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={event.creator.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
            ) : creatorName.slice(0, 1).toUpperCase()}
          </div>
          <span className="text-xs font-body truncate" style={{ color: 'var(--text-muted)' }}>{creatorName}</span>
          <span className="text-xs" style={{ color: 'var(--divider)' }}>·</span>
          <span className="text-xs font-body flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
            {event.participants_count}{event.max_participants ? `/${event.max_participants}` : ''} Teilnehmer
          </span>
        </div>

        {/* Action Button */}
        {userId && !isCreator && (
          <div className="flex-shrink-0 ml-3">
            {event.has_joined ? (
              <button
                onClick={() => onLeave?.(event.id)}
                disabled={joining}
                className="px-3 py-1.5 rounded-full font-label text-[0.6rem] tracking-[0.1em] uppercase cursor-pointer transition-colors"
                style={{
                  border: '1px solid var(--divider)',
                  color: 'var(--text-muted)',
                }}
              >
                {joining ? '…' : 'Verlassen'}
              </button>
            ) : (
              <button
                onClick={() => onJoin?.(event.id)}
                disabled={joining || isFull}
                className="px-3 py-1.5 rounded-full font-label text-[0.6rem] tracking-[0.1em] uppercase transition-all duration-200"
                style={{
                  background: isFull || joining
                    ? 'var(--gold-bg)'
                    : 'linear-gradient(135deg, var(--gold-deep), var(--gold))',
                  color: isFull || joining ? 'var(--text-muted)' : 'var(--text-on-gold)',
                  cursor: isFull || joining ? 'not-allowed' : 'pointer',
                }}
              >
                {isFull ? 'Voll' : joining ? '…' : 'Teilnehmen'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
