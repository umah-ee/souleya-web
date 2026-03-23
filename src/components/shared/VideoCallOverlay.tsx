'use client';

import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useCurrentProfile } from '@/hooks/useCurrentProfile';
import { useRingtone } from '@/hooks/useRingtone';
import EnsoRing from '@/components/ui/EnsoRing';

interface Props {
  roomId: string;
  partnerId: string;
  partnerName: string;
  partnerAvatar?: string | null;
  partnerSoulLevel?: number;
  isFirstLight?: boolean;
  initialVideo: boolean;
  isIncoming?: boolean; // true = Callee, false = Caller
  onEnd: (duration: number) => void;
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function VideoCallOverlay({
  roomId,
  partnerId,
  partnerName,
  partnerAvatar,
  partnerSoulLevel = 1,
  isFirstLight = false,
  initialVideo,
  isIncoming = false,
  onEnd,
}: Props) {
  const { profile } = useCurrentProfile();
  const userId = profile?.id ?? '';

  const {
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
  } = useWebRTC({ roomId, userId, enabled: true });

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [hasStarted, setHasStarted] = useState(false);

  // Ausgehender Klingelton (nur Caller, nur waehrend Ringing)
  useRingtone(!isIncoming && callState === 'ringing' ? 'outgoing' : null);

  // Auto-Start fuer Caller
  useEffect(() => {
    if (!isIncoming && !hasStarted && userId) {
      setHasStarted(true);
      startCall(initialVideo);
    }
  }, [isIncoming, hasStarted, userId, startCall, initialVideo]);

  // Auto-Answer fuer Callee — wartet bis Offer eingetroffen ist
  useEffect(() => {
    if (isIncoming && incomingOffer && userId) {
      answerCall();
    }
  }, [isIncoming, incomingOffer, userId, answerCall]);

  // Local Video Stream zuweisen
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch(() => {});
    }
  }, [localStream]);

  // Remote Video Stream zuweisen
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch(() => {});
    }
  }, [remoteStream]);

  // Call beendet → onEnd Callback
  useEffect(() => {
    if (callState === 'ended') {
      onEnd(duration);
    }
  }, [callState, duration, onEnd]);

  const handleEndCall = () => {
    endCall();
    // onEnd wird automatisch via useEffect aufgerufen wenn callState → 'ended'
  };

  const hasRemoteVideo = remoteStream?.getVideoTracks().some(t => t.enabled) ?? false;
  const hasLocalVideo = localStream?.getVideoTracks().some(t => t.enabled && !isVideoOff) ?? false;

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col"
      style={{ background: '#1a1a1a' }}
    >
      {/* ── Video-Bereich ─────────────────────────────── */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {/* Remote Video — immer im DOM, sichtbar nur wenn Video-Tracks da */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ display: hasRemoteVideo ? 'block' : 'none' }}
        />

        {/* Avatar Fallback wenn kein Remote-Video */}
        {!hasRemoteVideo && callState === 'connected' && (
          <div className="flex flex-col items-center gap-4">
            <EnsoRing
              size="profile-large"
              soulLevel={partnerSoulLevel}
              isFirstLight={isFirstLight}
              isMentor={partnerSoulLevel >= 5}
            >
              {partnerAvatar ? (
                <img src={partnerAvatar} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="w-full h-full rounded-full flex items-center justify-center" style={{ background: 'rgba(200,169,110,.15)' }}>
                  <Icon name="user" size={40} style={{ color: '#C8A96E' }} />
                </div>
              )}
            </EnsoRing>
            <span style={{ fontSize: 20, fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', color: '#F0E8D8' }}>
              {partnerName}
            </span>
          </div>
        )}

        {/* ── Status-Anzeige (pulsierender EnsoRing) ──── */}
        {callState !== 'connected' && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,.7)' }}>
            <div className="flex flex-col items-center gap-4">
              <div style={{ animation: 'callPulse 2s ease-in-out infinite' }}>
                <EnsoRing
                  size="profile-large"
                  soulLevel={partnerSoulLevel}
                  isFirstLight={isFirstLight}
                  isMentor={partnerSoulLevel >= 5}
                >
                  {partnerAvatar ? (
                    <img src={partnerAvatar} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <div className="w-full h-full rounded-full flex items-center justify-center" style={{ background: 'rgba(200,169,110,.15)' }}>
                      <Icon name="user" size={40} style={{ color: '#C8A96E' }} />
                    </div>
                  )}
                </EnsoRing>
              </div>
              <span style={{ fontSize: 18, fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', color: '#F0E8D8' }}>
                {partnerName}
              </span>
              <p style={{ fontSize: 13, color: 'rgba(240,232,216,.6)' }}>
                {callState === 'connecting' && 'Verbindung wird aufgebaut …'}
                {callState === 'ringing' && (isIncoming ? 'Eingehender Anruf …' : 'Klingelt …')}
                {callState === 'idle' && 'Vorbereitung …'}
                {callState === 'ended' && 'Anruf beendet'}
              </p>
            </div>
          </div>
        )}

        {/* ── Lokales Video (Bild-in-Bild) — immer im DOM ── */}
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="absolute rounded-[8px] overflow-hidden shadow-lg"
          style={{
            bottom: 100, right: 20, width: 160, height: 120,
            border: '2px solid rgba(200,169,110,.3)',
            objectFit: 'cover',
            transform: 'scaleX(-1)',
            display: hasLocalVideo ? 'block' : 'none',
          }}
        />
      </div>

      {/* ── Header (Name + Timer) ──────────────────────── */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-4" style={{ background: 'linear-gradient(rgba(0,0,0,.6), transparent)' }}>
        <div className="flex items-center gap-3">
          {partnerAvatar ? (
            <img src={partnerAvatar} alt="" className="rounded-full" style={{ width: 36, height: 36, objectFit: 'cover' }} />
          ) : (
            <div className="rounded-full flex items-center justify-center" style={{ width: 36, height: 36, background: 'rgba(200,169,110,.2)' }}>
              <Icon name="user" size={18} style={{ color: '#C8A96E' }} />
            </div>
          )}
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#F0E8D8' }}>{partnerName}</div>
            <div style={{ fontSize: 11, color: 'rgba(240,232,216,.6)' }}>
              {callState === 'connected' ? `${initialVideo ? 'Videoanruf' : 'Audioanruf'} · ${formatDuration(duration)}` : callState === 'ringing' ? 'Verbindet …' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* ── Steuerleiste ───────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-4 py-6" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,.7))' }}>
        {/* Mute */}
        <button
          onClick={toggleMute}
          className="border-none cursor-pointer flex items-center justify-center transition-all duration-200"
          style={{
            width: 52, height: 52, borderRadius: '50%',
            background: isMuted ? 'rgba(220,50,50,.8)' : 'rgba(255,255,255,.12)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <Icon name={isMuted ? 'microphone-off' : 'microphone'} size={22} style={{ color: '#F0E8D8' }} />
        </button>

        {/* Video Toggle */}
        {initialVideo && (
          <button
            onClick={toggleVideo}
            className="border-none cursor-pointer flex items-center justify-center transition-all duration-200"
            style={{
              width: 52, height: 52, borderRadius: '50%',
              background: isVideoOff ? 'rgba(220,50,50,.8)' : 'rgba(255,255,255,.12)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            <Icon name={isVideoOff ? 'video-off' : 'video'} size={22} style={{ color: '#F0E8D8' }} />
          </button>
        )}

        {/* Auflegen */}
        <button
          onClick={handleEndCall}
          className="border-none cursor-pointer flex items-center justify-center transition-all duration-200"
          style={{
            width: 64, height: 52, borderRadius: 26,
            background: 'linear-gradient(135deg, #DC3232, #B02020)',
          }}
        >
          <Icon name="phone-off" size={24} style={{ color: '#fff' }} />
        </button>
      </div>

      <style>{`
        @keyframes callPulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(200,169,110,0)); }
          50% { transform: scale(1.06); filter: drop-shadow(0 0 24px rgba(200,169,110,.35)); }
        }
      `}</style>
    </div>
  );
}
