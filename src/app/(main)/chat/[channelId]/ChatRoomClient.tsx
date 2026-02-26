'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import type { ChannelDetail, Message, ReactionSummary } from '@/types/chat';
import {
  fetchChannel, fetchMessages, sendMessage, markChannelAsRead,
  deleteMessage, editMessage, addReaction, removeReaction,
} from '@/lib/chat';
import { createClient } from '@/lib/supabase/client';
import { Icon } from '@/components/ui/Icon';
import ChatBubble from '@/components/chat/ChatBubble';

const QUICK_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '👏', '🙏', '✨', '🔥', '🕊️', '🌿', '💛'];

type ReactionsMap = Record<string, ReactionSummary[]>;

interface Props {
  channelId: string;
  user: User | null;
}

export default function ChatRoomClient({ channelId, user }: Props) {
  const router = useRouter();
  const [channel, setChannel] = useState<ChannelDetail | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [editingMsg, setEditingMsg] = useState<Message | null>(null);
  const [emojiPickerMsgId, setEmojiPickerMsgId] = useState<string | null>(null);
  const [reactions, setReactions] = useState<ReactionsMap>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const channelRef = useRef<ChannelDetail | null>(null);

  // ── Reactions batch laden (via Supabase direkt) ──────────
  const loadReactionsForMessages = useCallback(async (messageIds: string[]) => {
    if (messageIds.length === 0) return;
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('reactions')
        .select('message_id, emoji, user_id')
        .in('message_id', messageIds);

      if (!data) return;

      const map: ReactionsMap = {};
      for (const row of data) {
        if (!map[row.message_id]) map[row.message_id] = [];
        const existing = map[row.message_id].find((r) => r.emoji === row.emoji);
        if (existing) {
          existing.count += 1;
          if (row.user_id === user?.id) existing.has_reacted = true;
        } else {
          map[row.message_id].push({
            emoji: row.emoji,
            count: 1,
            has_reacted: row.user_id === user?.id,
          });
        }
      }
      setReactions((prev) => ({ ...prev, ...map }));
    } catch (e) {
      console.error('Reactions laden fehlgeschlagen:', e);
    }
  }, [user?.id]);

  // ── Daten laden ───────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      const [ch, msgs] = await Promise.all([
        fetchChannel(channelId),
        fetchMessages(channelId, 1, 50),
      ]);
      setChannel(ch);
      channelRef.current = ch;
      setMessages(msgs.data);
      setHasMore(msgs.hasMore);
      setPage(1);
      await markChannelAsRead(channelId);
      loadReactionsForMessages(msgs.data.map((m) => m.id));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [channelId, loadReactionsForMessages]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Realtime Subscription ─────────────────────────────────
  useEffect(() => {
    const supabase = createClient();
    const sub = supabase
      .channel(`chat:${channelId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `channel_id=eq.${channelId}` },
        (payload) => {
          const raw = payload.new as Message;
          const member = channelRef.current?.members.find((m) => m.user_id === raw.user_id);
          const enriched: Message = {
            ...raw,
            author: member?.profile
              ? { id: member.profile.id, username: member.profile.username, display_name: member.profile.display_name, avatar_url: member.profile.avatar_url }
              : raw.author ?? { id: raw.user_id, username: null, display_name: null, avatar_url: null },
          };
          setMessages((prev) => {
            if (prev.some((m) => m.id === enriched.id)) return prev;
            return [...prev, enriched];
          });
          markChannelAsRead(channelId).catch(() => {});
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages', filter: `channel_id=eq.${channelId}` },
        (payload) => {
          const updated = payload.new as Message;
          setMessages((prev) => prev.map((m) => m.id === updated.id ? { ...m, ...updated } : m));
        },
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'reactions' },
        (payload) => {
          const row = payload.new as { message_id: string; emoji: string; user_id: string };
          setReactions((prev) => {
            const msgReactions = [...(prev[row.message_id] ?? [])];
            const existing = msgReactions.find((r) => r.emoji === row.emoji);
            if (existing) {
              return {
                ...prev,
                [row.message_id]: msgReactions.map((r) =>
                  r.emoji === row.emoji
                    ? { ...r, count: r.count + 1, has_reacted: r.has_reacted || row.user_id === user?.id }
                    : r,
                ),
              };
            }
            return {
              ...prev,
              [row.message_id]: [...msgReactions, { emoji: row.emoji, count: 1, has_reacted: row.user_id === user?.id }],
            };
          });
        },
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'reactions' },
        (payload) => {
          const row = payload.old as { message_id: string; emoji: string; user_id: string };
          setReactions((prev) => {
            const msgReactions = prev[row.message_id];
            if (!msgReactions) return prev;
            const updated = msgReactions
              .map((r) =>
                r.emoji === row.emoji
                  ? { ...r, count: r.count - 1, has_reacted: row.user_id === user?.id ? false : r.has_reacted }
                  : r,
              )
              .filter((r) => r.count > 0);
            return { ...prev, [row.message_id]: updated };
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sub);
    };
  }, [channelId, user?.id]);

  // ── Auto-Scroll ───────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Aeltere Nachrichten laden ─────────────────────────────
  const loadOlderMessages = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const result = await fetchMessages(channelId, nextPage, 50);
      setMessages((prev) => [...result.data, ...prev]);
      setHasMore(result.hasMore);
      setPage(nextPage);
      loadReactionsForMessages(result.data.map((m) => m.id));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMore(false);
    }
  };

  // ── Nachricht senden ──────────────────────────────────────
  const handleSend = async () => {
    const content = text.trim();
    if (!content || sending) return;

    if (editingMsg) {
      setSending(true);
      try {
        const updated = await editMessage(editingMsg.id, content);
        setMessages((prev) => prev.map((m) => m.id === updated.id ? updated : m));
        setEditingMsg(null);
        setText('');
      } catch (e) {
        console.error(e);
      } finally {
        setSending(false);
      }
      return;
    }

    setSending(true);
    try {
      const msg = await sendMessage(channelId, {
        type: 'text',
        content,
        reply_to: replyTo?.id,
      });
      setMessages((prev) => [...prev, msg]);
      setText('');
      setReplyTo(null);
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDelete = async (msgId: string) => {
    try {
      await deleteMessage(msgId);
      setMessages((prev) => prev.filter((m) => m.id !== msgId));
    } catch (e) {
      console.error(e);
    }
  };

  const handleStartEdit = (msg: Message) => {
    setEditingMsg(msg);
    setText(msg.content ?? '');
    setReplyTo(null);
    inputRef.current?.focus();
  };

  const handleReply = (msg: Message) => {
    setReplyTo(msg);
    setEditingMsg(null);
    inputRef.current?.focus();
  };

  // ── Reactions ─────────────────────────────────────────────
  const handleToggleReaction = async (msgId: string, emoji: string) => {
    const existing = reactions[msgId]?.find((r) => r.emoji === emoji);
    try {
      if (existing?.has_reacted) {
        await removeReaction(msgId, emoji);
      } else {
        await addReaction(msgId, emoji);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEmojiSelect = async (emoji: string) => {
    if (!emojiPickerMsgId) return;
    const msgId = emojiPickerMsgId;
    setEmojiPickerMsgId(null);
    await handleToggleReaction(msgId, emoji);
  };

  // ── Channel-Name bestimmen ────────────────────────────────
  const getChannelName = () => {
    if (!channel) return '';
    if (channel.type === 'direct') {
      const partner = channel.members.find((m) => m.user_id !== user?.id);
      return partner?.profile.display_name ?? partner?.profile.username ?? 'Chat';
    }
    return channel.name ?? 'Gruppe';
  };

  const getMembersLabel = () => {
    if (!channel) return '';
    if (channel.type === 'direct') return 'Direkt';
    return `${channel.members.length} Mitglieder`;
  };

  if (loading) {
    return (
      <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
        <p className="font-label text-[0.7rem] tracking-[0.2em]">WIRD GELADEN ...</p>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="text-center py-16 px-4 rounded-2xl" style={{ border: '1px dashed var(--gold-border-s)' }}>
        <p className="font-heading text-2xl mb-2" style={{ color: 'var(--gold)' }}>Chat nicht gefunden</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col -mx-4 -mt-6 -mb-6" style={{ height: 'calc(100vh - 56px)' }}>
      {/* ── Header ─────────────────────────────────────────── */}
      <div
        className="flex items-center gap-3 px-4 py-3 shrink-0"
        style={{ borderBottom: '1px solid var(--divider-l)' }}
      >
        <button
          onClick={() => router.push('/chat')}
          className="p-1 cursor-pointer"
          style={{ color: 'var(--text-muted)' }}
        >
          <Icon name="arrow-left" size={20} />
        </button>

        <div
          className="w-9 h-9 rounded-full flex items-center justify-center font-heading text-sm overflow-hidden shrink-0"
          style={{ background: 'var(--avatar-bg)', color: 'var(--gold-text)', border: '1.5px solid var(--gold-border-s)' }}
        >
          {channel.type === 'direct' ? (
            (() => {
              const partner = channel.members.find((m) => m.user_id !== user?.id);
              if (partner?.profile.avatar_url) {
                // eslint-disable-next-line @next/next/no-img-element
                return <img src={partner.profile.avatar_url} alt="" className="w-full h-full object-cover" />;
              }
              return (partner?.profile.display_name ?? '?').slice(0, 1).toUpperCase();
            })()
          ) : (
            <Icon name="users" size={16} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-sm font-heading truncate" style={{ color: 'var(--text-h)' }}>
            {getChannelName()}
          </div>
          <div className="text-[10px] font-label tracking-[0.1em] uppercase" style={{ color: 'var(--text-muted)' }}>
            {getMembersLabel()}
          </div>
        </div>
      </div>

      {/* ── Nachrichten ────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 relative">
        {hasMore && (
          <div className="text-center pb-3">
            <button
              onClick={loadOlderMessages}
              disabled={loadingMore}
              className="px-4 py-1.5 rounded-full font-label text-[0.65rem] tracking-[0.1em] uppercase bg-transparent cursor-pointer transition-colors"
              style={{ border: '1px solid var(--gold-border-s)', color: 'var(--text-muted)' }}
            >
              {loadingMore ? '...' : 'Aeltere laden'}
            </button>
          </div>
        )}

        {messages.map((msg, i) => {
          const isOwn = msg.user_id === user?.id;
          const prevMsg = messages[i - 1];
          const showAuthor = !isOwn && (!prevMsg || prevMsg.user_id !== msg.user_id);

          return (
            <ChatBubble
              key={msg.id}
              message={msg}
              isOwn={isOwn}
              showAuthor={showAuthor}
              reactions={reactions[msg.id] ?? []}
              onReply={() => handleReply(msg)}
              onReact={() => setEmojiPickerMsgId(msg.id)}
              onEdit={isOwn && msg.type === 'text' ? () => handleStartEdit(msg) : undefined}
              onDelete={isOwn ? () => handleDelete(msg.id) : undefined}
              onToggleReaction={(emoji) => handleToggleReaction(msg.id, emoji)}
            />
          );
        })}
        <div ref={messagesEndRef} />

        {/* Emoji Picker Popover */}
        {emojiPickerMsgId && (
          <div className="fixed inset-0 z-40" onClick={() => setEmojiPickerMsgId(null)}>
            <div
              className="absolute bottom-24 left-1/2 -translate-x-1/2 rounded-2xl p-3 z-50"
              style={{
                background: 'var(--bg-solid)',
                border: '1px solid var(--glass-border)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <p
                className="text-[10px] font-label tracking-[0.15em] uppercase text-center mb-3"
                style={{ color: 'var(--text-muted)' }}
              >
                Reaktion wählen
              </p>
              <div className="grid grid-cols-6 gap-1.5">
                {QUICK_EMOJIS.map((emoji) => {
                  const hasReacted = reactions[emojiPickerMsgId]?.some(
                    (r) => r.emoji === emoji && r.has_reacted,
                  );
                  return (
                    <button
                      key={emoji}
                      onClick={() => handleEmojiSelect(emoji)}
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-xl cursor-pointer transition-colors duration-150"
                      style={{
                        background: hasReacted ? 'rgba(200,169,110,0.15)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${hasReacted ? 'rgba(200,169,110,0.3)' : 'rgba(255,255,255,0.06)'}`,
                      }}
                    >
                      {emoji}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Reply/Edit Banner ──────────────────────────────── */}
      {(replyTo || editingMsg) && (
        <div
          className="px-4 py-2 flex items-center gap-2 text-[11px]"
          style={{ borderTop: '1px solid var(--gold-border-s)', background: 'var(--gold-bg)' }}
        >
          <Icon name={editingMsg ? 'pencil' : 'corner-up-left'} size={12} style={{ color: 'var(--gold-text)' }} />
          <span className="flex-1 truncate" style={{ color: 'var(--text-sec)' }}>
            {editingMsg
              ? `Bearbeiten: ${editingMsg.content?.slice(0, 60) ?? ''}`
              : `Antwort auf: ${replyTo?.author?.display_name ?? 'Nachricht'}`}
          </span>
          <button
            onClick={() => { setReplyTo(null); setEditingMsg(null); setText(''); }}
            className="cursor-pointer p-0.5"
            style={{ color: 'var(--text-muted)' }}
          >
            <Icon name="x" size={14} />
          </button>
        </div>
      )}

      {/* ── Input ──────────────────────────────────────────── */}
      <div
        className="flex items-center gap-2 px-4 py-3 shrink-0"
        style={{ borderTop: '1px solid var(--divider-l)' }}
      >
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={editingMsg ? 'Nachricht bearbeiten ...' : 'Nachricht schreiben ...'}
          maxLength={5000}
          className="flex-1 px-4 py-2.5 text-sm font-body outline-none"
          style={{
            background: 'var(--input-bg)',
            border: '1px solid var(--input-border)',
            borderRadius: '8px',
            color: 'var(--text-body)',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-all duration-200"
          style={{
            background: text.trim() && !sending
              ? 'linear-gradient(135deg, var(--gold-deep), var(--gold))'
              : 'var(--gold-bg)',
            color: text.trim() && !sending ? 'var(--text-on-gold)' : 'var(--text-muted)',
          }}
        >
          <Icon name="send" size={16} />
        </button>
      </div>
    </div>
  );
}
