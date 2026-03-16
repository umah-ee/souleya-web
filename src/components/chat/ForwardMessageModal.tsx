'use client';

import { useState, useEffect } from 'react';
import type { ChannelOverview, Message } from '@/types/chat';
import { fetchChannels, forwardMessage } from '@/lib/chat';
import { Icon } from '@/components/ui/Icon';

interface Props {
  message: Message;
  onClose: () => void;
  onForwarded: () => void;
}

export default function ForwardMessageModal({ message, onClose, onForwarded }: Props) {
  const [channels, setChannels] = useState<ChannelOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [forwarding, setForwarding] = useState(false);

  useEffect(() => {
    fetchChannels()
      .then((data) => setChannels(data.filter((c) => c.id !== message.channel_id)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [message.channel_id]);

  const filtered = channels.filter((c) => {
    if (!search.trim()) return true;
    return (c.name ?? '').toLowerCase().includes(search.toLowerCase());
  });

  const handleForward = async (channelId: string) => {
    setForwarding(true);
    try {
      await forwardMessage(message.id, channelId);
      onForwarded();
    } catch (e) {
      console.error(e);
    } finally {
      setForwarding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative w-full max-w-[360px] rounded-2xl overflow-hidden"
        style={{ background: 'var(--bg-solid)', border: '1px solid var(--glass-border)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--divider-l)' }}>
          <h3 className="font-heading text-base" style={{ color: 'var(--text-h)' }}>Weiterleiten an</h3>
          <button onClick={onClose} className="cursor-pointer p-1" style={{ color: 'var(--text-muted)' }}>
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* Vorschau */}
        <div className="px-5 py-3" style={{ background: 'var(--glass)' }}>
          <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>
            {message.content?.slice(0, 80)}
          </p>
        </div>

        {/* Suche */}
        <div className="px-5 py-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Chat suchen …"
            className="w-full px-3 py-2 text-sm font-body outline-none"
            style={{
              background: 'var(--input-bg)',
              border: '1px solid var(--input-border)',
              borderRadius: '8px',
              color: 'var(--text-body)',
            }}
          />
        </div>

        {/* Channel-Liste */}
        <div className="px-5 pb-4 max-h-[300px] overflow-y-auto space-y-1">
          {loading && (
            <p className="text-center py-4 text-[11px]" style={{ color: 'var(--text-muted)' }}>Wird geladen …</p>
          )}
          {!loading && filtered.length === 0 && (
            <p className="text-center py-4 text-[11px]" style={{ color: 'var(--text-muted)' }}>Keine Chats gefunden</p>
          )}
          {filtered.map((ch) => (
            <button
              key={ch.id}
              onClick={() => handleForward(ch.id)}
              disabled={forwarding}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors text-left"
              style={{ background: 'transparent' }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'var(--avatar-bg)', border: '1.5px solid var(--gold-border-s)' }}
              >
                {ch.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={ch.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <Icon name={ch.type === 'direct' ? 'user' : 'users'} size={14} style={{ color: 'var(--gold-text)' }} />
                )}
              </div>
              <span className="flex-1 text-[13px] truncate" style={{ color: 'var(--text-body)' }}>
                {ch.name ?? 'Chat'}
              </span>
              <Icon name="arrow-forward-up" size={14} style={{ color: 'var(--gold-text)' }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
