'use client';

import { useState } from 'react';
import type { ChannelOverview } from '@/types/chat';
import { Icon } from '@/components/ui/Icon';

function timeAgo(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return 'jetzt';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} Min.`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} Std.`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} T.`;
  return new Date(dateString).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
}

function getMessagePreview(channel: ChannelOverview): string {
  if (!channel.last_message) return 'Noch keine Nachrichten';

  const { type, content, author_name } = channel.last_message;
  const prefix = channel.type !== 'direct' && author_name ? `${author_name}: ` : '';

  switch (type) {
    case 'image': return `${prefix}Bild`;
    case 'voice': return `${prefix}Sprachnachricht`;
    case 'location': return `${prefix}Standort`;
    case 'seeds': return `${prefix}Seeds gesendet`;
    case 'poll': return `${prefix}Abstimmung`;
    case 'system': return content ?? 'System';
    default: return `${prefix}${content?.slice(0, 60) ?? ''}`;
  }
}

interface Props {
  channel: ChannelOverview;
  onClick: () => void;
  onLeave?: (channelId: string) => void;
}

export default function ChannelListItem({ channel, onClick, onLeave }: Props) {
  const hasUnread = channel.unread_count > 0;
  const initials = (channel.name ?? '?').slice(0, 1).toUpperCase();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLeaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirm(true);
  };

  const handleConfirmLeave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirm(false);
    onLeave?.(channel.id);
  };

  const handleCancelLeave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirm(false);
  };

  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className="w-full flex items-center gap-3 px-3 py-3 rounded-[14px] text-left transition-colors duration-150 cursor-pointer"
        style={{
          background: hasUnread ? 'var(--gold-bg)' : 'transparent',
        }}
      >
        {/* Avatar */}
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center font-heading text-sm overflow-hidden shrink-0"
          style={{
            background: 'var(--avatar-bg)',
            color: 'var(--gold-text)',
            border: `1.5px solid ${hasUnread ? 'var(--gold-border)' : 'var(--gold-border-s)'}`,
          }}
        >
          {channel.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={channel.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : channel.type === 'direct' ? (
            initials
          ) : (
            <Icon name="users" size={18} />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <span
              className="text-[13px] truncate"
              style={{
                color: hasUnread ? 'var(--text-h)' : 'var(--text-body)',
                fontWeight: hasUnread ? 500 : 400,
              }}
            >
              {channel.name ?? 'Chat'}
            </span>
            {channel.last_message && (
              <span className="text-[10px] shrink-0" style={{ color: 'var(--text-muted)' }}>
                {timeAgo(channel.last_message.created_at)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            <span
              className="text-[11px] truncate flex-1"
              style={{ color: 'var(--text-muted)' }}
            >
              {getMessagePreview(channel)}
            </span>
            {hasUnread && (
              <span
                className="min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-label font-bold rounded-full px-1 shrink-0"
                style={{ background: 'var(--gold)', color: 'var(--text-on-gold)' }}
              >
                {channel.unread_count > 99 ? '99+' : channel.unread_count}
              </span>
            )}
          </div>
        </div>

        {/* Loeschen-Button (Hover) */}
        {onLeave && (
          <div
            className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            onClick={handleLeaveClick}
            role="button"
            tabIndex={-1}
            style={{ padding: '4px' }}
          >
            <Icon name="x" size={14} style={{ color: 'var(--text-muted)' }} />
          </div>
        )}
      </button>

      {/* Bestaetigungs-Overlay */}
      {showConfirm && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-between px-4 rounded-[14px]"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--gold-border-s)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-[12px] font-body" style={{ color: 'var(--text-body)' }}>
            Chat verlassen?
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleCancelLeave}
              className="px-3 py-1 rounded-full text-[11px] font-label tracking-[0.05em] uppercase cursor-pointer bg-transparent"
              style={{ border: '1px solid var(--gold-border-s)', color: 'var(--text-muted)' }}
            >
              Nein
            </button>
            <button
              onClick={handleConfirmLeave}
              className="px-3 py-1 rounded-full text-[11px] font-label tracking-[0.05em] uppercase cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #C8616180, #C8616140)',
                color: '#E88',
                border: '1px solid rgba(200,97,97,0.3)',
              }}
            >
              Verlassen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
