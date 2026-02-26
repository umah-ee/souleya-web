'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import type { ChannelOverview } from '@/types/chat';
import { fetchChannels } from '@/lib/chat';
import { Icon } from '@/components/ui/Icon';
import ChannelListItem from '@/components/chat/ChannelListItem';
import NewChatModal from '@/components/chat/NewChatModal';
import { useUnread } from '@/components/chat/UnreadContext';

interface Props {
  user: User | null;
}

export default function ChatListClient({ user }: Props) {
  const router = useRouter();
  const { updateFromChannels } = useUnread();
  const [channels, setChannels] = useState<ChannelOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);

  const loadChannels = useCallback(async () => {
    setError(false);
    setLoading(true);
    try {
      const data = await fetchChannels();
      setChannels(data);
      updateFromChannels(data);
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [updateFromChannels]);

  useEffect(() => {
    loadChannels();
  }, [loadChannels]);

  const handleChannelCreated = (channelId: string) => {
    setShowNewChat(false);
    router.push(`/chat/${channelId}`);
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="hidden md:block">
          <h1 className="font-heading text-2xl" style={{ color: 'var(--gold-text)' }}>
            Chat
          </h1>
          <p className="text-sm font-body mt-1" style={{ color: 'var(--text-muted)' }}>
            Deine Nachrichten
          </p>
        </div>

        <button
          onClick={() => setShowNewChat(true)}
          className="ml-auto flex items-center gap-2 px-4 py-2 rounded-full font-label text-[0.7rem] tracking-[0.1em] uppercase cursor-pointer transition-all duration-200"
          style={{
            background: 'linear-gradient(135deg, var(--gold-deep), var(--gold))',
            color: 'var(--text-on-gold)',
          }}
        >
          <Icon name="plus" size={14} />
          Neuer Chat
        </button>
      </div>

      {/* Channel-Liste */}
      {loading ? (
        <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
          <p className="font-label text-[0.7rem] tracking-[0.2em]">WIRD GELADEN ...</p>
        </div>
      ) : error ? (
        <div
          className="text-center py-16 px-4 rounded-2xl"
          style={{ border: '1px dashed var(--gold-border-s)' }}
        >
          <p className="font-heading text-2xl mb-2" style={{ color: 'var(--gold)' }}>
            Fehler beim Laden
          </p>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            Chats konnten nicht geladen werden.
          </p>
          <button
            onClick={loadChannels}
            className="px-4 py-2 rounded-full font-label text-[0.7rem] tracking-[0.1em] uppercase cursor-pointer"
            style={{ border: '1px solid var(--gold-border-s)', color: 'var(--gold-text)' }}
          >
            Erneut versuchen
          </button>
        </div>
      ) : channels.length === 0 ? (
        <div
          className="text-center py-16 px-4 rounded-2xl"
          style={{ border: '1px dashed var(--gold-border-s)' }}
        >
          <p className="font-heading text-2xl mb-2" style={{ color: 'var(--gold)' }}>
            Noch keine Chats
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Starte einen neuen Chat mit einer deiner Verbindungen.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {channels.map((channel) => (
            <ChannelListItem
              key={channel.id}
              channel={channel}
              onClick={() => router.push(`/chat/${channel.id}`)}
            />
          ))}
        </div>
      )}

      {/* Neuer Chat Modal */}
      {showNewChat && (
        <NewChatModal
          onClose={() => setShowNewChat(false)}
          onCreated={handleChannelCreated}
        />
      )}
    </>
  );
}
