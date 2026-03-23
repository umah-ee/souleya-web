'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useCurrentProfile } from '@/hooks/useCurrentProfile';
import VideoCallOverlay from '@/components/shared/VideoCallOverlay';
import IncomingCallOverlay from '@/components/chat/IncomingCallOverlay';
import { endCallMessage } from '@/lib/chat';
import type { RealtimeChannel } from '@supabase/supabase-js';

// ── Context ───────────────────────────────────────────────
interface CallPartner {
  id: string;
  name: string;
  avatar?: string | null;
  soulLevel?: number;
  isFirstLight?: boolean;
}

interface CallContextValue {
  isInCall: boolean;
  /** Caller ruft startOutgoingCall auf um den Callee zu benachrichtigen + Call-UI zu oeffnen */
  startOutgoingCall: (channelId: string, roomId: string, video: boolean, partner: CallPartner, calleeId: string) => void;
}

const CallContext = createContext<CallContextValue>({ isInCall: false, startOutgoingCall: () => {} });
export const useCall = () => useContext(CallContext);

// ══════════════════════════════════════════════════════════
export default function CallProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useCurrentProfile();
  const userId = profile?.id;

  // Active Call
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState(false);
  const [activePartner, setActivePartner] = useState<CallPartner | null>(null);
  const [isIncoming, setIsIncoming] = useState(false);

  // Incoming Call
  const [incoming, setIncoming] = useState<{
    roomId: string;
    channelId: string;
    callerName: string;
    callerAvatar?: string | null;
    callerSoulLevel?: number;
    isFirstLight?: boolean;
    video: boolean;
    callerId: string;
  } | null>(null);

  const inboxRef = useRef<RealtimeChannel | null>(null);

  // ── Einen einzigen persoenlichen Call-Inbox-Channel ─────
  // Jeder User lauscht auf `call-inbox:{eigene userId}`
  // Der Caller sendet an `call-inbox:{callee userId}`
  useEffect(() => {
    if (!userId) return;
    const supabase = createClient();

    const inbox = supabase.channel(`call-inbox:${userId}`);
    inboxRef.current = inbox;

    inbox
      .on('broadcast', { event: 'incoming_call' }, ({ payload }) => {
        if (payload.callerId === userId) return;

        setIncoming({
          roomId: payload.roomId,
          channelId: payload.channelId,
          callerName: payload.callerName ?? 'Jemand',
          callerAvatar: payload.callerAvatar ?? null,
          callerSoulLevel: payload.callerSoulLevel,
          isFirstLight: payload.isFirstLight,
          video: payload.video ?? false,
          callerId: payload.callerId,
        });

        // Browser Notification
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification(payload.video ? 'Videoanruf' : 'Anruf', {
            body: `${payload.callerName ?? 'Jemand'} ruft an`,
            icon: payload.callerAvatar ?? '/icon-192.png',
            tag: 'incoming-call',
          });
        }
      })
      .subscribe();

    // Browser Notification Berechtigung anfragen
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }

    return () => {
      supabase.removeChannel(inbox);
      inboxRef.current = null;
    };
  }, [userId]);

  // ── Outgoing Call (Caller) ──────────────────────────────
  const startOutgoingCall = useCallback((channelId: string, roomId: string, video: boolean, partner: CallPartner, calleeId: string) => {
    // Broadcast an den Call-Inbox des Callees senden
    const supabase = createClient();
    const calleeCh = supabase.channel(`call-inbox:${calleeId}`);

    calleeCh.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        // Mehrfach senden fuer Zuverlaessigkeit
        const payload = {
          roomId,
          channelId,
          callerId: userId,
          callerName: profile?.display_name ?? 'Jemand',
          callerAvatar: profile?.avatar_url ?? null,
          callerSoulLevel: profile?.soul_level,
          isFirstLight: profile?.is_first_light,
          video,
        };

        calleeCh.send({ type: 'broadcast', event: 'incoming_call', payload });
        // Nochmal nach 1s fuer Sicherheit
        setTimeout(() => {
          calleeCh.send({ type: 'broadcast', event: 'incoming_call', payload });
        }, 1000);
        // Channel nach 3s aufraumen
        setTimeout(() => supabase.removeChannel(calleeCh), 3000);
      }
    });

    // Call UI oeffnen
    setActiveRoom(roomId);
    setActiveChannelId(channelId);
    setActiveVideo(video);
    setActivePartner(partner);
    setIsIncoming(false);
  }, [userId, profile]);

  // ── Call annehmen ───────────────────────────────────────
  const handleAccept = useCallback(() => {
    if (!incoming) return;
    setActiveRoom(incoming.roomId);
    setActiveChannelId(incoming.channelId);
    setActiveVideo(incoming.video);
    setActivePartner({
      id: incoming.callerId,
      name: incoming.callerName,
      avatar: incoming.callerAvatar,
      soulLevel: incoming.callerSoulLevel,
      isFirstLight: incoming.isFirstLight,
    });
    setIsIncoming(true);
    setIncoming(null);
  }, [incoming]);

  // ── Call ablehnen ───────────────────────────────────────
  const handleReject = useCallback(() => {
    setIncoming(null);
  }, []);

  // ── Call beenden ────────────────────────────────────────
  const handleEnd = useCallback(async (duration: number) => {
    if (activeChannelId) {
      await endCallMessage(activeChannelId, duration, activeVideo).catch(() => {});
    }
    setActiveRoom(null);
    setActiveChannelId(null);
    setActivePartner(null);
    setIsIncoming(false);
  }, [activeChannelId, activeVideo]);

  return (
    <CallContext.Provider value={{ isInCall: !!activeRoom, startOutgoingCall }}>
      {children}

      {/* Incoming Call Overlay (global) */}
      {incoming && !activeRoom && (
        <IncomingCallOverlay
          callerName={incoming.callerName}
          callerAvatar={incoming.callerAvatar}
          callerSoulLevel={incoming.callerSoulLevel}
          isFirstLight={incoming.isFirstLight}
          isVideo={incoming.video}
          onAccept={handleAccept}
          onReject={handleReject}
        />
      )}

      {/* Active Call Overlay (global) */}
      {activeRoom && activePartner && (
        <VideoCallOverlay
          roomId={activeRoom}
          partnerId={activePartner.id}
          partnerName={activePartner.name}
          partnerAvatar={activePartner.avatar}
          partnerSoulLevel={activePartner.soulLevel}
          isFirstLight={activePartner.isFirstLight}
          initialVideo={activeVideo}
          isIncoming={isIncoming}
          onEnd={handleEnd}
        />
      )}
    </CallContext.Provider>
  );
}
