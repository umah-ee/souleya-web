'use client';

import { Icon } from '@/components/ui/Icon';
import type { IconName } from '@/components/ui/Icon';

interface LessonThumbnailProps {
  contentType: string;
  contentUrl?: string | null;
  title: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_MAP = {
  sm: { w: 48, h: 36 },
  md: { w: 80, h: 60 },
  lg: { w: 160, h: 120 },
};

const TYPE_CONFIG: Record<string, { icon: IconName; color: string; label: string }> = {
  video: { icon: 'player-play', color: 'var(--gold)', label: 'Video' },
  audio: { icon: 'microphone' as IconName, color: 'var(--gold)', label: 'Audio' },
  pdf: { icon: 'file-text', color: '#D44638', label: 'PDF' },
  text: { icon: 'edit' as IconName, color: 'var(--text-sec)', label: 'Text' },
  live: { icon: 'player-play' as IconName, color: '#E53935', label: 'Live' },
  quiz: { icon: 'check' as IconName, color: 'var(--gold)', label: 'Quiz' },
};

export default function LessonThumbnail({ contentType, contentUrl, title, size = 'sm' }: LessonThumbnailProps) {
  const { w, h } = SIZE_MAP[size];
  const config = TYPE_CONFIG[contentType] ?? TYPE_CONFIG.text;
  const iconSize = size === 'sm' ? 16 : size === 'md' ? 22 : 32;

  const baseStyle: React.CSSProperties = {
    width: w,
    height: h,
    borderRadius: 8,
    overflow: 'hidden',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  };

  // Video mit URL → Poster-Thumbnail
  if (contentType === 'video' && contentUrl) {
    return (
      <div style={{ ...baseStyle, background: '#000' }}>
        <video
          src={contentUrl}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          preload="metadata"
          muted
        />
        <div
          style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.25)',
          }}
        >
          <Icon name="player-play" size={iconSize} style={{ color: '#fff' }} />
        </div>
      </div>
    );
  }

  // Audio mit URL → Waveform
  if (contentType === 'audio' && contentUrl) {
    return (
      <div style={{ ...baseStyle, background: 'var(--glass)', border: '1px solid var(--glass-border)' }}>
        <div style={{ textAlign: 'center' }}>
          <Icon name="microphone" size={iconSize} style={{ color: config.color }} />
          {size !== 'sm' && (
            <div style={{ fontSize: 7, color: 'var(--text-muted)', marginTop: 2, maxWidth: w - 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {title.slice(0, 20)}
            </div>
          )}
        </div>
      </div>
    );
  }

  // PDF mit URL
  if (contentType === 'pdf' && contentUrl) {
    return (
      <div style={{ ...baseStyle, background: 'var(--glass)', border: '1px solid var(--glass-border)' }}>
        <div style={{ textAlign: 'center' }}>
          <Icon name="file-text" size={iconSize} style={{ color: '#D44638' }} />
          <div style={{ fontSize: 7, fontWeight: 600, color: '#D44638', marginTop: 1, letterSpacing: '0.5px' }}>PDF</div>
        </div>
      </div>
    );
  }

  // Live → Pulsierender Punkt
  if (contentType === 'live') {
    return (
      <div style={{ ...baseStyle, background: 'var(--glass)', border: '1px solid var(--glass-border)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%', background: '#E53935',
            margin: '0 auto 4px',
            animation: 'pulse-live 2s ease-in-out infinite',
          }} />
          <div style={{ fontSize: 7, fontWeight: 600, color: '#E53935', letterSpacing: '1px', textTransform: 'uppercase' }}>Live</div>
        </div>
        <style>{`@keyframes pulse-live{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.3)}}`}</style>
      </div>
    );
  }

  // Hat eine URL aber kein Spezialfall → generisches Icon mit Dateiname
  if (contentUrl) {
    return (
      <div style={{ ...baseStyle, background: 'var(--glass)', border: '1px solid var(--glass-border)' }}>
        <div style={{ textAlign: 'center' }}>
          <Icon name={config.icon} size={iconSize} style={{ color: config.color }} />
          {size !== 'sm' && (
            <div style={{ fontSize: 7, color: 'var(--text-muted)', marginTop: 2 }}>{config.label}</div>
          )}
        </div>
      </div>
    );
  }

  // Keine URL → Upload-Platzhalter
  return (
    <div
      style={{
        ...baseStyle,
        background: 'var(--glass)',
        border: '1.5px dashed var(--gold-border-s)',
      }}
    >
      <Icon name="arrow-forward-up" size={iconSize} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
    </div>
  );
}
