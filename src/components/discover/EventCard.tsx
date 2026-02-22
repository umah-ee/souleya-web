'use client';

import type { SoEvent } from '@/types/events';

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
    <div className="bg-dark rounded-2xl border border-gold-1/10 p-4 hover:border-gold-1/20 transition-colors">
      {/* Kategorie + Datum */}
      <div className="flex items-center justify-between mb-3">
        <span className={`
          text-[0.6rem] tracking-[0.15em] uppercase font-label px-2 py-0.5 rounded-full
          ${event.category === 'course'
            ? 'text-[#9B72CF] border border-[#9B72CF]/30 bg-[#9B72CF]/10'
            : 'text-gold-1 border border-gold-1/30 bg-gold-1/10'
          }
        `}>
          {event.category === 'course' ? 'Kurs' : 'Meetup'}
        </span>
        <span className="text-[#5A5450] font-body text-xs">
          {formatDate(event.starts_at)} · {formatTime(event.starts_at)}
          {event.ends_at && ` – ${formatTime(event.ends_at)}`}
        </span>
      </div>

      {/* Titel */}
      <h3 className="text-[#F0EDE8] font-body font-medium text-sm mb-1.5">{event.title}</h3>

      {/* Beschreibung */}
      {event.description && (
        <p className="text-[#5A5450] text-xs font-body line-clamp-2 mb-3">{event.description}</p>
      )}

      {/* Ort */}
      <div className="flex items-center gap-1.5 mb-3">
        <span className="text-[#5A5450] text-xs">📍</span>
        <span className="text-[#9A9080] text-xs font-body truncate">{event.location_name}</span>
      </div>

      {/* Footer: Creator + Teilnehmer + Action */}
      <div className="flex items-center justify-between pt-3 border-t border-gold-1/[0.06]">
        <div className="flex items-center gap-2 min-w-0">
          {/* Creator Avatar */}
          <div className={`
            w-6 h-6 rounded-full bg-gold-1/15 flex-shrink-0 flex items-center justify-center
            text-[10px] text-gold-1 font-heading border
            ${event.creator?.is_origin_soul ? 'border-gold-1/50' : 'border-gold-1/20'}
          `}>
            {event.creator?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={event.creator.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
            ) : creatorName.slice(0, 1).toUpperCase()}
          </div>
          <span className="text-[#5A5450] text-xs font-body truncate">{creatorName}</span>
          <span className="text-[#5A5450]/50 text-xs">·</span>
          <span className="text-[#5A5450] text-xs font-body flex-shrink-0">
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
                className="px-3 py-1.5 border border-[#5A5450]/30 rounded-full text-[#5A5450] font-label text-[0.6rem] tracking-[0.1em] uppercase cursor-pointer hover:border-[#5A5450]/50 transition-colors"
              >
                {joining ? '…' : 'Verlassen'}
              </button>
            ) : (
              <button
                onClick={() => onJoin?.(event.id)}
                disabled={joining || isFull}
                className={`
                  px-3 py-1.5 rounded-full font-label text-[0.6rem] tracking-[0.1em] uppercase transition-all duration-200
                  ${isFull
                    ? 'bg-[#5A5450]/20 text-[#5A5450] cursor-not-allowed'
                    : joining
                      ? 'bg-gold-1/20 text-[#5A5450] cursor-not-allowed'
                      : 'bg-gradient-to-br from-gold-3 to-gold-2 text-dark cursor-pointer hover:opacity-90'
                  }
                `}
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
