'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

// ── STUN Config (kostenlos, Google) ──────────────────────
const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

// ── Typen ─────────────────────────────────────────────────
export type CallState = 'idle' | 'connecting' | 'ringing' | 'connected' | 'ended';

export interface UseWebRTCOptions {
  roomId: string;
  userId: string;
  enabled?: boolean; // default true, false = kein Auto-Subscribe
}

export interface UseWebRTCReturn {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  callState: CallState;
  isMuted: boolean;
  isVideoOff: boolean;
  duration: number; // Sekunden seit Verbindung
  startCall: (video: boolean) => Promise<void>;
  answerCall: () => Promise<void>;
  endCall: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  incomingOffer: RTCSessionDescriptionInit | null;
}

// ══════════════════════════════════════════════════════════
export function useWebRTC({ roomId, userId, enabled = true }: UseWebRTCOptions): UseWebRTCReturn {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [callState, setCallState] = useState<CallState>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [duration, setDuration] = useState(0);
  const [incomingOffer, setIncomingOffer] = useState<RTCSessionDescriptionInit | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<number>(0);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const wantVideoRef = useRef(false);

  const supabase = createClient();

  // ── Aufräumen ───────────────────────────────────────────
  const cleanup = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (pcRef.current) { pcRef.current.close(); pcRef.current = null; }
    if (localStream) { localStream.getTracks().forEach(t => t.stop()); }
    setLocalStream(null);
    setRemoteStream(null);
    setIncomingOffer(null);
    pendingCandidatesRef.current = [];
  }, [localStream]);

  // ── Timer fuer Call-Dauer ───────────────────────────────
  const startTimer = useCallback(() => {
    startedAtRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setDuration(Math.floor((Date.now() - startedAtRef.current) / 1000));
    }, 1000);
  }, []);

  // ── PeerConnection erstellen ────────────────────────────
  const createPC = useCallback(() => {
    const pc = new RTCPeerConnection(RTC_CONFIG);
    pcRef.current = pc;

    // Remote Stream empfangen
    const remote = new MediaStream();
    setRemoteStream(remote);

    pc.ontrack = (ev) => {
      ev.streams[0]?.getTracks().forEach(track => remote.addTrack(track));
      // Fallback: direkt den Track hinzufuegen
      if (!ev.streams[0]) remote.addTrack(ev.track);
      setRemoteStream(new MediaStream(remote.getTracks()));
    };

    // ICE Candidates senden
    pc.onicecandidate = (ev) => {
      if (ev.candidate && channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'ice_candidate',
          payload: { candidate: ev.candidate.toJSON(), from: userId },
        });
      }
    };

    // Connection State
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        setCallState('connected');
        startTimer();
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setCallState('ended');
      }
    };

    return pc;
  }, [userId, startTimer]);

  // ── Media holen ─────────────────────────────────────────
  const getMedia = useCallback(async (video: boolean) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: video ? { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' } : false,
    });
    setLocalStream(stream);
    return stream;
  }, []);

  // ── Signaling Channel subscriben ────────────────────────
  useEffect(() => {
    if (!enabled || !roomId) return;

    const ch = supabase.channel(`call:${roomId}`);
    channelRef.current = ch;

    ch
      .on('broadcast', { event: 'sdp_offer' }, ({ payload }) => {
        if (payload.from === userId) return;
        setIncomingOffer(payload.offer);
        wantVideoRef.current = payload.video ?? false;
        setCallState('ringing');
      })
      .on('broadcast', { event: 'sdp_answer' }, async ({ payload }) => {
        if (payload.from === userId) return;
        const pc = pcRef.current;
        if (!pc) return;
        await pc.setRemoteDescription(new RTCSessionDescription(payload.answer));
        // Queued ICE Candidates anwenden
        for (const c of pendingCandidatesRef.current) {
          await pc.addIceCandidate(new RTCIceCandidate(c)).catch(() => {});
        }
        pendingCandidatesRef.current = [];
      })
      .on('broadcast', { event: 'ice_candidate' }, async ({ payload }) => {
        if (payload.from === userId) return;
        const pc = pcRef.current;
        if (!pc || !pc.remoteDescription) {
          pendingCandidatesRef.current.push(payload.candidate);
          return;
        }
        await pc.addIceCandidate(new RTCIceCandidate(payload.candidate)).catch(() => {});
      })
      .on('broadcast', { event: 'call_end' }, ({ payload }) => {
        if (payload.from === userId) return;
        setCallState('ended');
        cleanup();
      })
      .on('broadcast', { event: 'call_reject' }, ({ payload }) => {
        if (payload.from === userId) return;
        setCallState('ended');
        cleanup();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
      channelRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, userId, enabled]);

  // ── Call starten (Caller) ───────────────────────────────
  const startCall = useCallback(async (video: boolean) => {
    setCallState('connecting');
    wantVideoRef.current = video;

    const stream = await getMedia(video);
    const pc = createPC();

    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    channelRef.current?.send({
      type: 'broadcast',
      event: 'sdp_offer',
      payload: { offer, video, from: userId },
    });

    setCallState('ringing');
  }, [getMedia, createPC, userId]);

  // ── Call annehmen (Callee) ──────────────────────────────
  const answerCall = useCallback(async () => {
    if (!incomingOffer) return;
    setCallState('connecting');

    const stream = await getMedia(wantVideoRef.current);
    const pc = createPC();

    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    await pc.setRemoteDescription(new RTCSessionDescription(incomingOffer));

    // Queued ICE Candidates anwenden
    for (const c of pendingCandidatesRef.current) {
      await pc.addIceCandidate(new RTCIceCandidate(c)).catch(() => {});
    }
    pendingCandidatesRef.current = [];

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    channelRef.current?.send({
      type: 'broadcast',
      event: 'sdp_answer',
      payload: { answer, from: userId },
    });

    setIncomingOffer(null);
  }, [incomingOffer, getMedia, createPC, userId]);

  // ── Call beenden ────────────────────────────────────────
  const endCall = useCallback(() => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'call_end',
      payload: { from: userId, duration },
    });
    setCallState('ended');
    cleanup();
  }, [userId, duration, cleanup]);

  // ── Mute Toggle ─────────────────────────────────────────
  const toggleMute = useCallback(() => {
    if (!localStream) return;
    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  }, [localStream]);

  // ── Video Toggle ────────────────────────────────────────
  const toggleVideo = useCallback(() => {
    if (!localStream) return;
    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOff(!videoTrack.enabled);
    }
  }, [localStream]);

  // ── Cleanup bei Unmount ─────────────────────────────────
  useEffect(() => {
    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    localStream,
    remoteStream,
    callState,
    isMuted,
    isVideoOff,
    duration,
    startCall,
    answerCall,
    endCall,
    toggleMute,
    toggleVideo,
    incomingOffer,
  };
}
