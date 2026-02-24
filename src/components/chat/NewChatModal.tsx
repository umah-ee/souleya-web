'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Connection } from '@/types/circles';
import { getConnections } from '@/lib/circles';
import { createDirectChannel } from '@/lib/chat';
import { Icon } from '@/components/ui/Icon';

interface Props {
  onClose: () => void;
  onCreated: (channelId: string) => void;
}

export default function NewChatModal({ onClose, onCreated }: Props) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const loadConnections = useCallback(async () => {
    try {
      const result = await getConnections(1, 100);
      setConnections(result.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  const handleStartChat = async (partnerId: string) => {
    setCreating(partnerId);
    try {
      const result = await createDirectChannel(partnerId);
      onCreated(result.id);
    } catch (e) {
      console.error(e);
      setCreating(null);
    }
  };

  const filtered = connections.filter((c) => {
    if (!search.trim()) return true;
    const name = (c.profile.display_name ?? c.profile.username ?? '').toLowerCase();
    return name.includes(search.toLowerCase());
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative w-full max-w-[420px] max-h-[80vh] rounded-t-2xl md:rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: 'var(--bg-solid)',
          border: '1px solid var(--glass-border)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--divider-l)' }}>
          <h2 className="font-heading text-lg" style={{ color: 'var(--text-h)' }}>Neuer Chat</h2>
          <button onClick={onClose} className="cursor-pointer p-1" style={{ color: 'var(--text-muted)' }}>
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* Suche */}
        <div className="px-4 py-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Kontakt suchen ..."
            className="w-full px-3 py-2 text-sm font-body outline-none"
            style={{
              background: 'var(--input-bg)',
              border: '1px solid var(--input-border)',
              borderRadius: '8px',
              color: 'var(--text-body)',
            }}
          />
        </div>

        {/* Kontakte-Liste */}
        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {loading ? (
            <p className="text-center py-8 font-label text-[0.7rem] tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
              WIRD GELADEN ...
            </p>
          ) : filtered.length === 0 ? (
            <p className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>
              {search ? 'Kein Kontakt gefunden' : 'Noch keine Verbindungen'}
            </p>
          ) : (
            filtered.map((connection) => {
              const profile = connection.profile;
              const name = profile.display_name ?? profile.username ?? 'Anonym';
              const initial = name.slice(0, 1).toUpperCase();
              const isCreating = creating === profile.id;

              return (
                <button
                  key={connection.id}
                  onClick={() => handleStartChat(profile.id)}
                  disabled={isCreating}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left cursor-pointer transition-colors duration-150"
                  style={{ opacity: isCreating ? 0.5 : 1 }}
                >
                  {/* Avatar */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-heading text-sm overflow-hidden shrink-0"
                    style={{
                      background: 'var(--avatar-bg)',
                      color: 'var(--gold-text)',
                      border: '1.5px solid var(--gold-border-s)',
                    }}
                  >
                    {profile.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : initial}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-[13px]" style={{ color: 'var(--text-body)' }}>{name}</div>
                    {profile.username && (
                      <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>@{profile.username}</div>
                    )}
                  </div>

                  <Icon name="message-circle" size={16} style={{ color: 'var(--gold-text)' }} />
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
