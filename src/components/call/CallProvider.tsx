'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useCurrentProfile } from '@/hooks/useCurrentProfile';
import VideoCallOverlay from '@/components/shared/VideoCallOverlay';
import IncomingCallOverlay from '@/components/chat/IncomingCallOverlay';
import { endCallMessage } from '@/lib/chat';
import type { RealtimeChannel } from '@supabase/supabase-js';

// ── Context ───────────────────────────────────────────────
interface CallContextValue {
  isInCall: boolean;
  startCall: (channelId: string, roomId: string, video: boolean, partner: CallPartner) => void;
}

interface CallPartner {
  id: string;
  name: string;
  avatar?: string | null;
  soulLevel?: number;
  isFirstLight?: boolean;
}

const CallContext = createContext<CallContextValue>({ isInCall: false, startCall: () => {} });
export const useCall = () => useContext(CallContext);

// ── Provider ──────────────────────────────────────────────
export default function CallProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useCurrentProfile();
  const userId = profile?.id;

  // Active Call State
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState(false);
  const [activePartner, setActivePartner] = useState<CallPartner | null>(null);
  const [isIncoming, setIsIncoming] = useState(false);

  // Incoming Call State
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

  const channelsRef = useRef<RealtimeChannel[]>([]);

  // ── Globalen Listener fuer alle Direct-Channels aufsetzen ──
  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();

    // Alle Direct-Channels des Users laden
    const setupListeners = async () => {
      const { data: memberships } = await supabase
        .from('channel_members')
        .select('channel_id, channels!inner(type)')
        .eq('user_id', userId);

      if (!memberships) return;

      // Nur Direct-Channels
      const directChannelIds = memberships
        .filter((m: any) => m.channels?.type === 'direct')
        .map((m: any) => m.channel_id as string);

      // Fuer jeden Channel einen Broadcast-Listener
      for (const chId of directChannelIds) {
        const ch = supabase.channel(`call-signal:${chId}`);
        ch.on('broadcast', { event: 'incoming_call' }, ({ payload }) => {
          if (payload.callerId === userId) return;
          setIncoming({
            roomId: payload.roomId,
            channelId: chId,
            callerName: payload.callerName ?? 'Jemand',
            callerAvatar: payload.callerAvatar ?? null,
            callerSoulLevel: payload.callerSoulLevel,
            isFirstLight: payload.isFirstLight,
            video: payload.video ?? false,
            callerId: payload.callerId,
          });

          // Browser Notification (wenn erlaubt)
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            new Notification(payload.video ? 'Videoanruf' : 'Anruf', {
              body: `${payload.callerName ?? 'Jemand'} ruft an`,
              icon: payload.callerAvatar ?? '/icon-192.png',
              tag: 'incoming-call',
            });
          }
        }).subscribe();

        channelsRef.current.push(ch);
      }
    };

    setupListeners();

    // Browser Notification Berechtigung anfragen (einmalig)
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }

    return () => {
      const supabase2 = createClient();
      for (const ch of channelsRef.current) {
        supabase2.removeChannel(ch);
      }
      channelsRef.current = [];
    };
  }, [userId]);

  // ── Call starten (Caller) ───────────────────────────────
  const startCall = useCallback((channelId: string, roomId: string, video: boolean, partner: CallPartner) => {
    setActiveRoom(roomId);
    setActiveChannelId(channelId);
    setActiveVideo(video);
    setActivePartner(partner);
    setIsIncoming(false);
  }, []);

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

  const isInCall = !!activeRoom;

  return (
    <CallContext.Provider value={{ isInCall, startCall }}>
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
