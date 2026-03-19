'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import type { ChannelDetail, Message, ReactionSummary, ReadStatusMember } from '@/types/chat';
import {
  fetchChannel, fetchMessages, sendMessage, markChannelAsRead,
  deleteMessage, editMessage, addReaction, removeReaction,
  uploadChatImage, uploadVoiceMessage, fetchReadStatus,
  pinMessage, unpinMessage,
} from '@/lib/chat';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { createClient } from '@/lib/supabase/client';
import { Icon } from '@/components/ui/Icon';
import ChatBubble from '@/components/chat/ChatBubble';
import GroupInfoPanel from '@/components/chat/GroupInfoPanel';
import CreatePollForm from '@/components/chat/CreatePollForm';
import SeedsTransferModal from '@/components/chat/SeedsTransferModal';
import MessageSearch from '@/components/chat/MessageSearch';
import ForwardMessageModal from '@/components/chat/ForwardMessageModal';
import CreateChallengeModal from '@/components/challenges/CreateChallengeModal';
import { createChallenge } from '@/lib/challenges';
import type { Challenge } from '@/types/challenges';
import { fetchEvent, joinEvent, leaveEvent } from '@/lib/events';
import type { SoEvent } from '@/types/events';
import DiscoverOverlay from '@/components/discover/DiscoverOverlay';
import dynamic from 'next/dynamic';

const EmojiPicker = dynamic(() => import('@/components/chat/EmojiPicker'), { ssr: false });

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
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showPollForm, setShowPollForm] = useState(false);
  const [showSeedsModal, setShowSeedsModal] = useState(false);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [overlayEvent, setOverlayEvent] = useState<SoEvent | null>(null);
  const [eventJoining, setEventJoining] = useState(false);
  const [forwardingMsg, setForwardingMsg] = useState<Message | null>(null);
  const [pendingImages, setPendingImages] = useState<File[]>([]);
  const [pendingImagePreviews, setPendingImagePreviews] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [typingUsers, setTypingUsers] = useState<{ id: string; name: string }[]>([]);
  const [readStatus, setReadStatus] = useState<ReadStatusMember[]>([]);
  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const channelRef = useRef<ChannelDetail | null>(null);
  const presenceChannelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { isRecording, durationMs, startRecording, stopRecording, cancelRecording } = useVoiceRecorder();
  const [sendingVoice, setSendingVoice] = useState(false);

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
      fetchReadStatus(channelId).then(setReadStatus).catch(() => {});
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [channelId, loadReactionsForMessages]);

  useEffect(() => {
    prevMsgCountRef.current = 0;
    setNewMsgCount(0);
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
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'poll_votes' },
        () => {
          window.dispatchEvent(new Event('poll-vote-update'));
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'channel_members', filter: `channel_id=eq.${channelId}` },
        () => {
          fetchReadStatus(channelId).then(setReadStatus).catch(() => {});
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sub);
    };
  }, [channelId, user?.id]);

  // ── Typing Indicator (Supabase Presence) ────────────────────
  useEffect(() => {
    if (!user?.id) return;
    const supabase = createClient();
    const presenceCh = supabase.channel(`typing:${channelId}`, { config: { presence: { key: user.id } } });

    presenceCh
      .on('presence', { event: 'sync' }, () => {
        const state = presenceCh.presenceState();
        const users: { id: string; name: string }[] = [];
        for (const [uid, presences] of Object.entries(state)) {
          if (uid === user.id) continue;
          const p = presences[0] as { typing?: boolean; name?: string } | undefined;
          if (p?.typing) {
            users.push({ id: uid, name: p.name ?? 'Jemand' });
          }
        }
        setTypingUsers(users);
      })
      .subscribe();

    presenceChannelRef.current = presenceCh;

    return () => {
      supabase.removeChannel(presenceCh);
      presenceChannelRef.current = null;
    };
  }, [channelId, user?.id]);

  const trackTyping = useCallback((isTyping: boolean) => {
    const ch = presenceChannelRef.current;
    if (!ch || !user?.id) return;
    const myProfile = channelRef.current?.members.find((m) => m.user_id === user.id);
    ch.track({
      typing: isTyping,
      name: myProfile?.profile.display_name ?? myProfile?.profile.username ?? 'Jemand',
    });
  }, [user?.id]);

  // ── Auto-Scroll (normales Column-Layout, expliziter scrollToBottom) ────────
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [newMsgCount, setNewMsgCount] = useState(0);
  const prevMsgCountRef = useRef(0);
  const initialScrollDone = useRef(false);

  const isNearBottom = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return true;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    return distanceFromBottom < 150;
  }, []);

  const scrollToBottom = useCallback((smooth = false) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' });
    setNewMsgCount(0);
  }, []);

  // Nach initialem Laden: zum Ende scrollen
  useEffect(() => {
    if (!loading && messages.length > 0 && !initialScrollDone.current) {
      initialScrollDone.current = true;
      // requestAnimationFrame damit das DOM gerendert ist
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollToBottom(false);
        });
      });
    }
  }, [loading, messages.length, scrollToBottom]);

  // Neue Nachrichten: Badge zeigen wenn User oben scrollt, sonst auto-scroll
  useEffect(() => {
    const prevCount = prevMsgCountRef.current;
    const newCount = messages.length;
    prevMsgCountRef.current = newCount;

    if (newCount > prevCount && prevCount > 0) {
      const lastMsg = messages[newCount - 1];
      const prevLastMsg = messages[prevCount - 1];
      if (lastMsg?.id !== prevLastMsg?.id) {
        if (isNearBottom()) {
          // User ist unten — automatisch mitscrollen
          requestAnimationFrame(() => scrollToBottom(true));
        } else {
          setNewMsgCount((c) => c + (newCount - prevCount));
        }
      }
    }
  }, [messages, isNearBottom, scrollToBottom]);

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
    trackTyping(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    try {
      const msg = await sendMessage(channelId, {
        type: 'text',
        content,
        reply_to: replyTo?.id,
      });
      // Nachricht nur hinzufügen wenn Realtime sie noch nicht eingefügt hat
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
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

  // ── Event im Overlay oeffnen ──────────────────────────────
  const handleEventClick = useCallback(async (eventId: string) => {
    try {
      const event = await fetchEvent(eventId);
      setOverlayEvent(event);
    } catch (e) {
      console.error('Event laden fehlgeschlagen', e);
    }
  }, []);

  // ── Interne Links abfangen ──────────────────────────────────
  const handleLinkClick = useCallback((url: string): boolean => {
    try {
      const u = new URL(url);
      if (u.hostname === 'souleya.com' || u.hostname === 'www.souleya.com' || u.hostname === 'localhost') {
        // Event-Link: /discover?eventId=... oder Event-Pfade
        const eventId = u.searchParams.get('eventId');
        if (eventId) {
          handleEventClick(eventId);
          return true;
        }
      }
    } catch { /* external URL */ }
    return false;
  }, [handleEventClick]);

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

  // ── Bild-Upload (mehrere Bilder) ────────────────────────────
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const maxImages = 10;
    const remaining = maxImages - pendingImages.length;
    const newFiles: File[] = [];
    const newPreviews: string[] = [];

    for (let i = 0; i < Math.min(files.length, remaining); i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 10 * 1024 * 1024) continue; // 10 MB limit
      newFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    if (newFiles.length > 0) {
      setPendingImages((prev) => [...prev, ...newFiles]);
      setPendingImagePreviews((prev) => [...prev, ...newPreviews]);
    }
    // Reset file input so same file can be re-selected
    e.target.value = '';
  };

  const handleRemovePendingImage = (index: number) => {
    URL.revokeObjectURL(pendingImagePreviews[index]);
    setPendingImages((prev) => prev.filter((_, i) => i !== index));
    setPendingImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCancelImage = () => {
    pendingImagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setPendingImages([]);
    setPendingImagePreviews([]);
  };

  const handleSendImage = async () => {
    if (pendingImages.length === 0 || !user?.id || uploadingImage) return;
    setUploadingImage(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of pendingImages) {
        const url = await uploadChatImage(file, user.id);
        uploadedUrls.push(url);
      }

      const msg = await sendMessage(channelId, {
        type: 'image',
        content: uploadedUrls[0],
        metadata: uploadedUrls.length > 1 ? { image_urls: uploadedUrls } : undefined,
      });
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      handleCancelImage();
    } catch (e) {
      console.error('Bild-Upload fehlgeschlagen:', e);
    } finally {
      setUploadingImage(false);
    }
  };

  // ── Voice Message ────────────────────────────────────────
  const handleSendVoice = async () => {
    if (!user?.id || sendingVoice) return;
    setSendingVoice(true);
    try {
      const { blob, durationMs: dur } = await stopRecording();
      const voiceUrl = await uploadVoiceMessage(blob, user.id);
      const msg = await sendMessage(channelId, {
        type: 'voice',
        content: voiceUrl,
        metadata: { duration_ms: dur },
      });
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    } catch (e) {
      console.error('Sprachnachricht fehlgeschlagen:', e);
    } finally {
      setSendingVoice(false);
    }
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

  // ── Pin ──────────────────────────────────────────────────────
  const handleTogglePin = async (msg: Message) => {
    try {
      if (msg.pinned_at) {
        await unpinMessage(msg.id);
        setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, pinned_at: null, pinned_by: null } : m));
      } else {
        await pinMessage(msg.id);
        setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, pinned_at: new Date().toISOString(), pinned_by: user?.id ?? null } : m));
      }
    } catch (e) {
      console.error(e);
    }
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

  const handleChannelUpdated = (updated: ChannelDetail) => {
    setChannel(updated);
    channelRef.current = updated;
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

        <div
          className={`flex-1 min-w-0 ${channel.type !== 'direct' ? 'cursor-pointer' : ''}`}
          onClick={() => { if (channel.type !== 'direct') setShowGroupInfo(true); }}
        >
          <div className="text-sm font-heading truncate" style={{ color: 'var(--text-h)' }}>
            {getChannelName()}
          </div>
          <div className="text-[10px] font-label tracking-[0.1em] uppercase" style={{ color: 'var(--text-muted)' }}>
            {getMembersLabel()}
          </div>
        </div>

        <button
          onClick={() => setShowSearch((s) => !s)}
          className="p-1.5 cursor-pointer shrink-0"
          style={{ color: showSearch ? 'var(--gold-text)' : 'var(--text-muted)' }}
          title="Suchen"
        >
          <Icon name="search" size={18} />
        </button>
      </div>

      {/* ── Suche ────────────────────────────────────────── */}
      {showSearch && (
        <MessageSearch
          channelId={channelId}
          onClose={() => setShowSearch(false)}
          onScrollToMessage={(msgId) => {
            setShowSearch(false);
            const el = document.getElementById(`msg-${msgId}`);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              el.style.background = 'rgba(200,169,110,0.15)';
              setTimeout(() => { el.style.background = ''; }, 2000);
            }
          }}
        />
      )}

      {/* ── Nachrichten (normales Column-Layout, scrollToBottom nach Laden) ── */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto scrollbar-gold px-4 py-4 relative"
        style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
      >
        {/* "Aeltere laden" Button — ganz oben im Chat */}
        {hasMore && (
          <div className="text-center py-3">
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

        {messages.map((msg, origIdx) => {
          const isOwn = msg.user_id === user?.id;
          const prevMsg = origIdx > 0 ? messages[origIdx - 1] : undefined;
          const showAuthor = !isOwn && (!prevMsg || prevMsg.user_id !== msg.user_id);
          const msgRead = isOwn && readStatus.some(
            (rs) => new Date(rs.last_read_at) >= new Date(msg.created_at),
          );

          return (
            <div key={msg.id} id={`msg-${msg.id}`}>
            <ChatBubble
              message={msg}
              isOwn={isOwn}
              showAuthor={showAuthor}
              currentUserId={user?.id ?? ''}
              reactions={reactions[msg.id] ?? []}
              isRead={msgRead}
              onReply={() => handleReply(msg)}
              onReact={() => setEmojiPickerMsgId(msg.id)}
              onPin={() => handleTogglePin(msg)}
              onForward={msg.type === 'text' ? () => setForwardingMsg(msg) : undefined}
              onEdit={isOwn && msg.type === 'text' ? () => handleStartEdit(msg) : undefined}
              onDelete={isOwn ? () => handleDelete(msg.id) : undefined}
              onToggleReaction={(emoji) => handleToggleReaction(msg.id, emoji)}
              onEventClick={handleEventClick}
              onLinkClick={handleLinkClick}
            />
            </div>
          );
        })}

        {/* Scroll-Anker am Ende der Nachrichten */}
        <div ref={messagesEndRef} />

        {/* Neue Nachrichten Button (sticky) */}
        {newMsgCount > 0 && (
          <button
            onClick={() => scrollToBottom(true)}
            className="sticky bottom-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-4 py-2 rounded-full font-label text-[0.65rem] tracking-[0.08em] uppercase cursor-pointer transition-all duration-200 animate-slide-up"
            style={{
              background: 'var(--gold)',
              color: 'var(--text-on-gold)',
              boxShadow: '0 4px 16px var(--gold-glow, rgba(200,169,110,0.35))',
              border: 'none',
            }}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
            {newMsgCount} neue {newMsgCount === 1 ? 'Nachricht' : 'Nachrichten'}
          </button>
        )}

        {/* Emoji Picker Popover */}
        {emojiPickerMsgId && (
          <div className="fixed inset-0 z-40 flex items-end justify-center pb-28">
            <EmojiPicker
              onSelect={handleEmojiSelect}
              onClose={() => setEmojiPickerMsgId(null)}
            />
          </div>
        )}
      </div>

      {/* ── Bilder-Vorschau Banner ───────────────────────────── */}
      {pendingImagePreviews.length > 0 && (
        <div
          className="px-4 py-2 text-[11px]"
          style={{ borderTop: '1px solid var(--gold-border-s)', background: 'var(--gold-bg)' }}
        >
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {pendingImagePreviews.map((preview, i) => (
              <div key={i} className="relative shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Vorschau"
                  className="w-14 h-14 rounded-lg object-cover"
                  style={{ border: '1px solid var(--glass-border)' }}
                />
                <button
                  onClick={() => handleRemovePendingImage(i)}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center cursor-pointer"
                  style={{ background: 'var(--bg-solid)', border: '1px solid var(--divider)', color: 'var(--text-muted)' }}
                >
                  <Icon name="x" size={8} />
                </button>
              </div>
            ))}
            {pendingImages.length < 10 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-14 h-14 rounded-lg flex items-center justify-center cursor-pointer shrink-0 transition-colors"
                style={{ border: '1px dashed var(--glass-border)', color: 'var(--text-muted)', background: 'transparent' }}
                title="Weitere Bilder hinzufuegen"
              >
                <Icon name="plus" size={16} />
              </button>
            )}
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              {pendingImages.length} {pendingImages.length === 1 ? 'Bild' : 'Bilder'}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancelImage}
                className="cursor-pointer px-2 py-1 rounded-full font-label text-[0.6rem] tracking-[0.1em] uppercase"
                style={{ color: 'var(--text-muted)', border: '1px solid var(--divider)', background: 'transparent' }}
              >
                Abbrechen
              </button>
              <button
                onClick={handleSendImage}
                disabled={uploadingImage}
                className="px-3 py-1.5 rounded-full font-label text-[0.6rem] tracking-[0.1em] uppercase cursor-pointer transition-all border-none"
                style={{
                  background: uploadingImage
                    ? 'var(--gold-bg)'
                    : 'linear-gradient(135deg, var(--gold-deep), var(--gold))',
                  color: uploadingImage ? 'var(--text-muted)' : 'var(--text-on-gold)',
                }}
              >
                {uploadingImage ? 'Wird hochgeladen ...' : 'Senden'}
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* ── Typing Indicator ─────────────────────────────── */}
      {typingUsers.length > 0 && (
        <div className="px-4 py-1.5 shrink-0">
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {typingUsers.length === 1
              ? `${typingUsers[0].name} schreibt gerade`
              : `${typingUsers.map((u) => u.name).join(', ')} schreiben gerade`}
            <span className="inline-flex ml-0.5">
              <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
              <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
              <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
            </span>
          </span>
        </div>
      )}

      {/* ── Input ──────────────────────────────────────────── */}
      {showPollForm ? (
        <CreatePollForm
          channelId={channelId}
          onCreated={(msg) => {
            setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
            setShowPollForm(false);
          }}
          onCancel={() => setShowPollForm(false)}
        />
      ) : (
        <div
          className="flex items-center gap-1.5 px-4 py-3 shrink-0"
          style={{ borderTop: '1px solid var(--divider-l)' }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={handleImageSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
            title="Bild senden"
          >
            <Icon name="photo" size={16} />
          </button>
          <button
            onClick={() => setShowPollForm(true)}
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
            title="Abstimmung"
          >
            <Icon name="chart-bar" size={16} />
          </button>
          <button
            onClick={() => setShowSeedsModal(true)}
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
            title="Seeds senden"
          >
            <Icon name="seedling" size={16} />
          </button>
          <button
            onClick={() => setShowChallengeModal(true)}
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
            title="Challenge starten"
          >
            <Icon name="target" size={16} />
          </button>
          {isRecording ? (
            /* ── Recording UI ──────────────────── */
            <>
              <button
                onClick={cancelRecording}
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 cursor-pointer"
                style={{ color: 'var(--text-muted)' }}
                title="Abbrechen"
              >
                <Icon name="x" size={16} />
              </button>
              <div className="flex-1 flex items-center gap-2 px-3">
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#ef4444' }} />
                <span className="text-[12px] font-label tabular-nums" style={{ color: 'var(--text-body)' }}>
                  {Math.floor(durationMs / 60000)}:{String(Math.floor((durationMs % 60000) / 1000)).padStart(2, '0')}
                </span>
                <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Aufnahme …</span>
              </div>
              <button
                onClick={handleSendVoice}
                disabled={sendingVoice}
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-all duration-200"
                style={{
                  background: 'linear-gradient(135deg, var(--gold-deep), var(--gold))',
                  color: 'var(--text-on-gold)',
                }}
              >
                <Icon name="send" size={16} />
              </button>
            </>
          ) : (
            /* ── Normal Input ──────────────────── */
            <>
              <input
                ref={inputRef}
                type="text"
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  trackTyping(true);
                  if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                  typingTimeoutRef.current = setTimeout(() => trackTyping(false), 3000);
                }}
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
              {text.trim() ? (
                <button
                  onClick={handleSend}
                  disabled={sending}
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-all duration-200"
                  style={{
                    background: 'linear-gradient(135deg, var(--gold-deep), var(--gold))',
                    color: 'var(--text-on-gold)',
                  }}
                >
                  <Icon name="send" size={16} />
                </button>
              ) : (
                <button
                  onClick={() => startRecording().catch(console.error)}
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-all duration-200"
                  style={{ background: 'var(--gold-bg)', color: 'var(--text-muted)' }}
                  title="Sprachnachricht aufnehmen"
                >
                  <Icon name="microphone" size={16} />
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Gruppen-Info Panel */}
      {showGroupInfo && channel && channel.type !== 'direct' && (
        <GroupInfoPanel
          channel={channel}
          currentUserId={user?.id ?? ''}
          onClose={() => setShowGroupInfo(false)}
          onChannelUpdated={handleChannelUpdated}
        />
      )}

      {/* Challenge Modal */}
      {showChallengeModal && (
        <CreateChallengeModal
          channelId={channelId}
          onClose={() => setShowChallengeModal(false)}
          onCreated={() => {
            setShowChallengeModal(false);
          }}
        />
      )}

      {/* Seeds Transfer Modal */}
      {showSeedsModal && channel && (
        <SeedsTransferModal
          channelId={channelId}
          channelType={channel.type}
          members={channel.members}
          currentUserId={user?.id ?? ''}
          onClose={() => setShowSeedsModal(false)}
          onSent={() => setShowSeedsModal(false)}
        />
      )}

      {/* Forward Message Modal */}
      {forwardingMsg && (
        <ForwardMessageModal
          message={forwardingMsg}
          onClose={() => setForwardingMsg(null)}
          onForwarded={() => setForwardingMsg(null)}
        />
      )}

      {/* Event Overlay (inline im Chat) */}
      {overlayEvent && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center"
          onClick={() => setOverlayEvent(null)}
          style={{ background: 'rgba(0,0,0,0.5)' }}
        >
          <div
            className="w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <DiscoverOverlay
              type="event"
              event={overlayEvent}
              userId={user?.id ?? null}
              joining={eventJoining}
              onJoin={async (id) => {
                setEventJoining(true);
                try {
                  const res = await joinEvent(id);
                  setOverlayEvent((e) => e ? { ...e, has_joined: true, participants_count: res.participants_count } : e);
                } catch (err) { console.error(err); }
                finally { setEventJoining(false); }
              }}
              onLeave={async (id) => {
                setEventJoining(true);
                try {
                  const res = await leaveEvent(id);
                  setOverlayEvent((e) => e ? { ...e, has_joined: false, participants_count: res.participants_count } : e);
                } catch (err) { console.error(err); }
                finally { setEventJoining(false); }
              }}
              onClose={() => setOverlayEvent(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
