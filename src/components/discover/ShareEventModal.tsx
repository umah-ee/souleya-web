'use client';

import { useState, useEffect } from 'react';
import type { SoEvent } from '@/types/events';
import { apiFetch } from '@/lib/api';
import { Icon } from '@/components/ui/Icon';
import EventShareCard from '@/components/shared/EventShareCard';

interface Props {
  event: SoEvent;
  onClose: () => void;
}

interface ChannelOverview {
  id: string;
  type: string;
  name: string | null;
  avatar_url: string | null;
}

export default function ShareEventModal({ event, onClose }: Props) {
  const [channels, setChannels] = useState<ChannelOverview[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [sendingTo, setSendingTo] = useState<string | null>(null);
  const [sent, setSent] = useState<Set<string>>(new Set());

  // Channels laden
  useEffect(() => {
    setLoadingChannels(true);
    apiFetch<ChannelOverview[]>('/chat/channels')
      .then((data) => setChannels(data))
      .catch((e) => console.error('Channels laden fehlgeschlagen:', e))
      .finally(() => setLoadingChannels(false));
  }, []);

  // Event im Chat teilen
  const handleShareToChat = async (channelId: string) => {
    setSendingTo(channelId);
    try {
      await apiFetch(`/chat/channels/${channelId}/messages`, {
        method: 'POST',
        body: JSON.stringify({
          content: `📍 ${event.title}`,
          metadata: {
            event_id: event.id,
            event_title: event.title,
            event_category: event.category,
            event_cover_url: event.cover_url,
            event_starts_at: event.starts_at,
            event_location_name: event.location_name,
            event_participants_count: event.participants_count,
          },
        }),
      });
      setSent((prev) => new Set([...prev, channelId]));
    } catch (e) {
      console.error('Event teilen fehlgeschlagen:', e);
    } finally {
      setSendingTo(null);
    }
  };

  // Event im Pulse teilen (navigiert zum Pulse-Erstellen)
  const handleShareToPulse = () => {
    // Pulse-Erstellung mit Event-Referenz via URL-Parameter
    const params = new URLSearchParams({
      event_id: event.id,
      event_title: event.title,
    });
    window.location.href = `/dashboard?share_event=${params.toString()}`;
    onClose();
  };

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,.5)' }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl overflow-hidden mx-4 max-w-[400px] w-full max-h-[80vh] flex flex-col"
        style={{
          background: 'var(--bg-solid)',
          border: '1px solid var(--glass-border)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.35)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gold-Leiste */}
        <div
          className="h-[2px] flex-shrink-0"
          style={{ background: 'linear-gradient(to right, transparent, var(--gold-glow), transparent)' }}
        />

        {/* Header */}
        <div className="px-5 pt-4 pb-2 flex items-center justify-between flex-shrink-0">
          <h2 className="font-heading text-lg" style={{ color: 'var(--text-h)' }}>Event teilen</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer"
            style={{ background: 'var(--glass)', color: 'var(--text-muted)' }}
          >
            <Icon name="x" size={14} />
          </button>
        </div>

        {/* Vorschau */}
        <div className="px-5 pb-3">
          <EventShareCard
            data={{
              event_id: event.id,
              event_title: event.title,
              event_category: event.category,
              event_cover_url: event.cover_url,
              event_starts_at: event.starts_at,
              event_location_name: event.location_name,
              event_participants_count: event.participants_count,
            }}
          />
        </div>

        {/* Optionen */}
        <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-3">
          {/* Im Pulse teilen */}
          <button
            onClick={handleShareToPulse}
            className="w-full flex items-center gap-3 glass-card rounded-2xl p-3 transition-colors cursor-pointer"
          >
            <div
              className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center"
              style={{ background: 'var(--gold-bg)', color: 'var(--gold-text)' }}
            >
              <Icon name="sparkles" size={18} />
            </div>
            <div className="flex-1 text-left">
              <p className="font-body text-sm font-medium" style={{ color: 'var(--text-h)' }}>Im Pulse teilen</p>
              <p className="text-xs font-body" style={{ color: 'var(--text-muted)' }}>Teile dieses Event in deinem Feed</p>
            </div>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: 'var(--divider-l)' }} />
            <span className="font-label text-[0.6rem] tracking-[0.15em] uppercase" style={{ color: 'var(--text-muted)' }}>
              oder im Chat
            </span>
            <div className="flex-1 h-px" style={{ background: 'var(--divider-l)' }} />
          </div>

          {/* Channel-Liste */}
          {loadingChannels && (
            <div className="text-center py-4" style={{ color: 'var(--text-muted)' }}>
              <p className="font-label text-[0.65rem] tracking-[0.15em]">LADE CHATS ...</p>
            </div>
          )}

          {!loadingChannels && channels.length === 0 && (
            <p className="text-center text-sm font-body py-4" style={{ color: 'var(--text-muted)' }}>
              Noch keine Chats vorhanden.
            </p>
          )}

          {!loadingChannels && channels.map((ch) => {
            const isSent = sent.has(ch.id);
            const isSending = sendingTo === ch.id;
            const initial = (ch.name ?? '?').slice(0, 1).toUpperCase();

            return (
              <div key={ch.id} className="flex items-center gap-3 glass-card rounded-2xl p-3">
                <div
                  className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-heading text-sm overflow-hidden"
                  style={{
                    background: 'var(--avatar-bg)',
                    color: 'var(--gold-text)',
                    border: '1px solid var(--gold-border-s)',
                  }}
                >
                  {ch.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={ch.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : initial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm truncate" style={{ color: 'var(--text-h)' }}>
                    {ch.name ?? 'Chat'}
                  </p>
                  <p className="text-xs font-label" style={{ color: 'var(--text-muted)' }}>
                    {ch.type === 'direct' ? 'Direktnachricht' : 'Gruppe'}
                  </p>
                </div>
                <button
                  onClick={() => handleShareToChat(ch.id)}
                  disabled={isSending || isSent}
                  className="px-3 py-1.5 rounded-full font-label text-[0.55rem] tracking-[0.1em] uppercase transition-all duration-200"
                  style={{
                    background: isSent
                      ? 'var(--success-bg)'
                      : isSending
                        ? 'var(--gold-bg)'
                        : 'linear-gradient(135deg, var(--gold-deep), var(--gold))',
                    color: isSent
                      ? 'var(--success)'
                      : isSending
                        ? 'var(--text-muted)'
                        : 'var(--text-on-gold)',
                    cursor: isSent || isSending ? 'not-allowed' : 'pointer',
                    border: isSent ? '1px solid var(--success-border)' : 'none',
                  }}
                >
                  {isSent ? 'Gesendet' : isSending ? '...' : 'Senden'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
