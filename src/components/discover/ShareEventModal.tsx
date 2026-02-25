'use client';

import { useState, useEffect } from 'react';
import type { SoEvent } from '@/types/events';
import type { Connection, ConnectionProfile } from '@/types/circles';
import type { ChannelOverview } from '@/types/chat';
import { getConnections } from '@/lib/circles';
import { fetchChannels, createDirectChannel, sendMessage } from '@/lib/chat';
import { Icon } from '@/components/ui/Icon';
import EventShareCard from '@/components/shared/EventShareCard';

interface Props {
  event: SoEvent;
  onClose: () => void;
}

export default function ShareEventModal({ event, onClose }: Props) {
  const [contacts, setContacts] = useState<ConnectionProfile[]>([]);
  const [recentChannels, setRecentChannels] = useState<ChannelOverview[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [sendingTo, setSendingTo] = useState<string | null>(null);
  const [sent, setSent] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [shareMessage, setShareMessage] = useState('');

  // Kontakte + zuletzt aktive Channels laden
  useEffect(() => {
    setLoadingContacts(true);
    Promise.all([
      getConnections(1, 100),
      fetchChannels(),
    ])
      .then(([connectionsRes, channels]) => {
        const profiles = connectionsRes.data.map((c: Connection) => c.profile);
        setContacts(profiles);

        // Top 5 zuletzt aktive Channels (nach letzter Nachricht sortiert)
        const sorted = [...channels]
          .filter((ch) => ch.last_message)
          .sort((a, b) => {
            const aTime = a.last_message?.created_at ?? '';
            const bTime = b.last_message?.created_at ?? '';
            return bTime.localeCompare(aTime);
          })
          .slice(0, 5);
        setRecentChannels(sorted);
      })
      .catch((e) => console.error('Laden fehlgeschlagen:', e))
      .finally(() => setLoadingContacts(false));
  }, []);

  // Gefilterte Kontakte
  const filteredContacts = searchQuery.trim()
    ? contacts.filter((c) => {
        const q = searchQuery.toLowerCase();
        return (
          (c.display_name ?? '').toLowerCase().includes(q) ||
          (c.username ?? '').toLowerCase().includes(q)
        );
      })
    : contacts;

  // Event-Nachricht Content zusammenbauen
  const buildMessageContent = () => {
    if (shareMessage.trim()) {
      return `${shareMessage.trim()}\n\n📍 ${event.title}`;
    }
    return `📍 ${event.title}`;
  };

  const eventMetadata = {
    event_id: event.id,
    event_title: event.title,
    event_category: event.category,
    event_cover_url: event.cover_url,
    event_starts_at: event.starts_at,
    event_location_name: event.location_name,
    event_participants_count: event.participants_count,
  };

  // Event an Kontakt senden
  const handleShareToContact = async (contactId: string) => {
    setSendingTo(contactId);
    try {
      const channel = await createDirectChannel(contactId);
      await sendMessage(channel.id, {
        type: 'text',
        content: buildMessageContent(),
        metadata: eventMetadata,
      });
      setSent((prev) => new Set([...prev, contactId]));
    } catch (e) {
      console.error('Event teilen fehlgeschlagen:', e);
    } finally {
      setSendingTo(null);
    }
  };

  // Event in einen Channel senden
  const handleShareToChannel = async (channelId: string) => {
    setSendingTo(channelId);
    try {
      await sendMessage(channelId, {
        type: 'text',
        content: buildMessageContent(),
        metadata: eventMetadata,
      });
      setSent((prev) => new Set([...prev, channelId]));
    } catch (e) {
      console.error('Event teilen fehlgeschlagen:', e);
    } finally {
      setSendingTo(null);
    }
  };

  // Event im Feed teilen
  const handleShareToFeed = () => {
    const params = new URLSearchParams({
      event_id: event.id,
      event_title: event.title,
    });
    window.location.href = `/circles?share_event=${params.toString()}`;
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

        {/* Nachricht-Textfeld */}
        <div className="px-5 pb-3">
          <textarea
            value={shareMessage}
            onChange={(e) => setShareMessage(e.target.value.slice(0, 500))}
            placeholder="Optionale Nachricht hinzufuegen …"
            maxLength={500}
            rows={2}
            className="w-full py-2.5 px-4 rounded-[8px] text-sm font-body outline-none resize-none"
            style={{
              background: 'var(--glass)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-h)',
            }}
          />
          {shareMessage.length > 0 && (
            <p className="text-right text-[0.65rem] font-label mt-1" style={{ color: 'var(--text-muted)' }}>
              {shareMessage.length} / 500
            </p>
          )}
        </div>

        {/* Optionen */}
        <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-3">
          {/* Im Feed teilen */}
          <button
            onClick={handleShareToFeed}
            className="w-full flex items-center gap-3 glass-card rounded-2xl p-3 transition-colors cursor-pointer"
          >
            <div
              className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center"
              style={{ background: 'var(--gold-bg)', color: 'var(--gold-text)' }}
            >
              <Icon name="sparkles" size={18} />
            </div>
            <div className="flex-1 text-left">
              <p className="font-body text-sm font-medium" style={{ color: 'var(--text-h)' }}>Im Feed teilen</p>
              <p className="text-xs font-body" style={{ color: 'var(--text-muted)' }}>Im Circle-Feed teilen</p>
            </div>
          </button>

          {/* ── Zuletzt aktiv (Top 5 Channels) ──────────────── */}
          {recentChannels.length > 0 && (
            <>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px" style={{ background: 'var(--divider-l)' }} />
                <span className="font-label text-[0.6rem] tracking-[0.15em] uppercase" style={{ color: 'var(--text-muted)' }}>
                  Zuletzt aktiv
                </span>
                <div className="flex-1 h-px" style={{ background: 'var(--divider-l)' }} />
              </div>

              {recentChannels.map((channel) => {
                const isSent = sent.has(channel.id);
                const isSending = sendingTo === channel.id;
                const isGroup = channel.type !== 'direct';
                const channelName = channel.name ?? 'Chat';

                return (
                  <div key={channel.id} className="flex items-center gap-3 glass-card rounded-2xl p-3">
                    <div
                      className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-heading text-sm overflow-hidden"
                      style={{
                        background: 'var(--avatar-bg)',
                        color: 'var(--gold-text)',
                        border: '1.5px solid var(--gold-border-s)',
                      }}
                    >
                      {channel.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={channel.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <Icon name={isGroup ? 'users' : 'user'} size={16} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm truncate" style={{ color: 'var(--text-h)' }}>
                        {channelName}
                      </p>
                      {isGroup && (
                        <p className="text-xs font-label" style={{ color: 'var(--text-muted)' }}>
                          {channel.members_count} Mitglieder
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleShareToChannel(channel.id)}
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
            </>
          )}

          {/* ── Kontakte ────────────────────────────────────── */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: 'var(--divider-l)' }} />
            <span className="font-label text-[0.6rem] tracking-[0.15em] uppercase" style={{ color: 'var(--text-muted)' }}>
              An Kontakt senden
            </span>
            <div className="flex-1 h-px" style={{ background: 'var(--divider-l)' }} />
          </div>

          {/* Kontakte-Suche */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Kontakt suchen ..."
            className="w-full py-2.5 px-4 rounded-[8px] text-sm font-body outline-none"
            style={{
              background: 'var(--glass)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-h)',
            }}
          />

          {/* Kontakte laden */}
          {loadingContacts && (
            <div className="text-center py-4" style={{ color: 'var(--text-muted)' }}>
              <p className="font-label text-[0.65rem] tracking-[0.15em]">LADE KONTAKTE ...</p>
            </div>
          )}

          {/* Keine Kontakte */}
          {!loadingContacts && contacts.length === 0 && (
            <p className="text-center text-sm font-body py-4" style={{ color: 'var(--text-muted)' }}>
              Noch keine Kontakte vorhanden.
            </p>
          )}

          {/* Keine Suchergebnisse */}
          {!loadingContacts && contacts.length > 0 && filteredContacts.length === 0 && (
            <p className="text-center text-sm font-body py-4" style={{ color: 'var(--text-muted)' }}>
              Kein Kontakt gefunden.
            </p>
          )}

          {/* Kontaktliste */}
          {!loadingContacts && filteredContacts.map((contact) => {
            const isSent = sent.has(contact.id);
            const isSending = sendingTo === contact.id;
            const initial = (contact.display_name ?? contact.username ?? '?').slice(0, 1).toUpperCase();

            return (
              <div key={contact.id} className="flex items-center gap-3 glass-card rounded-2xl p-3">
                <div
                  className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-heading text-sm overflow-hidden"
                  style={{
                    background: 'var(--avatar-bg)',
                    color: 'var(--gold-text)',
                    border: `1.5px solid ${contact.is_first_light ? 'var(--gold-border)' : 'var(--gold-border-s)'}`,
                  }}
                >
                  {contact.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={contact.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : initial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm truncate" style={{ color: 'var(--text-h)' }}>
                    {contact.display_name ?? contact.username ?? 'Anonym'}
                  </p>
                  {contact.username && (
                    <p className="text-xs font-label" style={{ color: 'var(--text-muted)' }}>
                      @{contact.username}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleShareToContact(contact.id)}
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
