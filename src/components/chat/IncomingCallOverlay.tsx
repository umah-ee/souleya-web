'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import EnsoRing from '@/components/ui/EnsoRing';

interface Props {
  callerName: string;
  callerAvatar?: string | null;
  callerSoulLevel?: number;
  isFirstLight?: boolean;
  isVideo: boolean;
  onAccept: () => void;
  onReject: () => void;
}

export default function IncomingCallOverlay({
  callerName,
  callerAvatar,
  callerSoulLevel = 1,
  isFirstLight = false,
  isVideo,
  onAccept,
  onReject,
}: Props) {
  const [elapsed, setElapsed] = useState(0);

  // 30s Timeout → auto-reject
  useEffect(() => {
    const timer = setInterval(() => setElapsed(e => e + 1), 1000);
    const timeout = setTimeout(() => onReject(), 30_000);
    return () => { clearInterval(timer); clearTimeout(timeout); };
  }, [onReject]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
    >
      <div className="flex flex-col items-center gap-6">
        {/* Pulsierender EnsoRing */}
        <div style={{ animation: 'callPulse 2s ease-in-out infinite' }}>
          <EnsoRing
            size={140}
            soulLevel={callerSoulLevel}
            isFirstLight={isFirstLight}
            isMentor={callerSoulLevel >= 5}
            avatarUrl={callerAvatar}
          />
        </div>

        {/* Name */}
        <div className="text-center">
          <div style={{ fontSize: 22, fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', color: '#F0E8D8', marginBottom: 4 }}>
            {callerName}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(240,232,216,.6)' }}>
            {isVideo ? 'Videoanruf' : 'Audioanruf'} …
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-6 mt-4">
          {/* Ablehnen */}
          <button
            onClick={onReject}
            className="border-none cursor-pointer flex items-center justify-center transition-all duration-200"
            style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'linear-gradient(135deg, #DC3232, #B02020)',
            }}
          >
            <Icon name="phone-off" size={28} style={{ color: '#fff' }} />
          </button>

          {/* Annehmen */}
          <button
            onClick={onAccept}
            className="border-none cursor-pointer flex items-center justify-center transition-all duration-200"
            style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'linear-gradient(135deg, #2D8B3D, #1E6B2D)',
            }}
          >
            <Icon name={isVideo ? 'video' : 'phone'} size={28} style={{ color: '#fff' }} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes callPulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(200,169,110,0)); }
          50% { transform: scale(1.05); filter: drop-shadow(0 0 20px rgba(200,169,110,.3)); }
        }
      `}</style>
    </div>
  );
}
