'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import type { ChannelOverview } from '@/types/chat';
import { fetchChannels, removeChannelMember } from '@/lib/chat';
import { Icon } from '@/components/ui/Icon';
import ChannelListItem from '@/components/chat/ChannelListItem';
import NewChatModal from '@/components/chat/NewChatModal';
import { useUnread } from '@/components/chat/UnreadContext';

// ── Archiv-Helfer (localStorage) ──────────────────────────
const ARCHIVE_KEY = 'souleya_archived_chats';

function getArchivedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(ARCHIVE_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function archiveChannel(channelId: string) {
  const ids = getArchivedIds();
  ids.add(channelId);
  localStorage.setItem(ARCHIVE_KEY, JSON.stringify([...ids]));
}

function unarchiveChannel(channelId: string) {
  const ids = getArchivedIds();
  ids.delete(channelId);
  localStorage.setItem(ARCHIVE_KEY, JSON.stringify([...ids]));
}

// ──────────────────────────────────────────────────────────

interface Props {
  user: User | null;
}

export default function ChatListClient({ user }: Props) {
  const router = useRouter();
  const { updateFromChannels } = useUnread();
  const [channels, setChannels] = useState<ChannelOverview[]>([]);
  const [archivedIds, setArchivedIds] = useState<Set<string>>(new Set());
  const [showArchived, setShowArchived] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);

  const loadChannels = useCallback(async () => {
    setError(false);
    setLoading(true);
    try {
      const data = await fetchChannels();
      setChannels(data);
      setArchivedIds(getArchivedIds());
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

  const handleArchiveChannel = (channelId: string) => {
    archiveChannel(channelId);
    setArchivedIds((prev) => new Set([...prev, channelId]));
  };

  const handleUnarchiveChannel = (channelId: string) => {
    unarchiveChannel(channelId);
    setArchivedIds((prev) => {
      const next = new Set(prev);
      next.delete(channelId);
      return next;
    });
  };

  const handleLeaveChannel = async (channelId: string) => {
    if (!user) return;
    try {
      await removeChannelMember(channelId, user.id);
      setChannels((prev) => prev.filter((c) => c.id !== channelId));
    } catch (e) {
      console.error('Chat verlassen fehlgeschlagen:', e);
    }
  };

  // Aktive und archivierte Channels trennen
  const activeChannels = channels.filter((c) => !archivedIds.has(c.id));
  const archivedChannels = channels.filter((c) => archivedIds.has(c.id));

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
      ) : activeChannels.length === 0 && archivedChannels.length === 0 ? (
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
        <>
          {/* Aktive Chats */}
          {activeChannels.length === 0 && archivedChannels.length > 0 ? (
            <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
              <p className="text-sm font-body">Alle Chats archiviert.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeChannels.map((channel) => (
                <ChannelListItem
                  key={channel.id}
                  channel={channel}
                  onClick={() => router.push(`/chat/${channel.id}`)}
                  onArchive={handleArchiveChannel}
                  onLeave={handleLeaveChannel}
                />
              ))}
            </div>
          )}

          {/* Archivierte Chats */}
          {archivedChannels.length > 0 && (
            <div className="mt-6">
              <button
                onClick={() => setShowArchived(!showArchived)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-transparent border-none cursor-pointer"
              >
                <span
                  className="text-[10px] font-label tracking-[0.1em] uppercase"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Archiviert ({archivedChannels.length})
                </span>
                <svg
                  viewBox="0 0 24 24" width="14" height="14" fill="none"
                  stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                  style={{ transform: showArchived ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                >
                  <path d="M6 9l6 6l6 -6" />
                </svg>
              </button>

              {showArchived && (
                <div className="space-y-2 mt-2" style={{ opacity: 0.7 }}>
                  {archivedChannels.map((channel) => (
                    <div key={channel.id} className="relative group">
                      <ChannelListItem
                        channel={channel}
                        onClick={() => {
                          // Beim Oeffnen eines archivierten Chats: automatisch entarchivieren
                          handleUnarchiveChannel(channel.id);
                          router.push(`/chat/${channel.id}`);
                        }}
                      />
                      {/* Wiederherstellen-Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnarchiveChannel(channel.id);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 rounded-full text-[9px] font-label tracking-[0.05em] uppercase cursor-pointer"
                        style={{
                          background: 'var(--gold-bg)',
                          color: 'var(--gold-text)',
                          border: '1px solid var(--gold-border-s)',
                        }}
                      >
                        Wiederherstellen
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
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
