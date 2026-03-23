'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';
import { useNotifications } from './NotificationContext';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Gerade eben';
  if (mins < 60) return `${mins} Min.`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} Std.`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} T.`;
  return `${Math.floor(days / 7)} W.`;
}

const TYPE_ICONS: Record<string, string> = {
  connection_request: 'users',
  connection_accepted: 'users',
  pulse_like: 'heart',
  pulse_comment: 'message',
  chat_message: 'message-circle',
  event_reminder: 'calendar',
  incoming_call: 'phone',
  f2f_call_started: 'video',
  f2f_booking_request: 'calendar-event',
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { unreadCount, notifications, markAsRead, markAllRead, deleteOne, deleteRead } = useNotifications();
  const [prevCount, setPrevCount] = useState(unreadCount);
  const [pulse, setPulse] = useState(false);

  // Badge-Pulse-Animation bei neuer Notification
  useEffect(() => {
    if (unreadCount > prevCount) {
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 1500);
      return () => clearTimeout(timer);
    }
    setPrevCount(unreadCount);
  }, [unreadCount, prevCount]);

  // Klick ausserhalb schliesst Panel
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleItemClick = async (id: string, link: string | null, isRead: boolean) => {
    if (!isRead) await markAsRead(id);
    if (link) router.push(link);
    setOpen(false);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteOne(id);
  };

  const hasReadNotifications = notifications.some((n) => n.is_read);

  return (
    <div ref={ref} className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-colors"
        style={{
          background: 'var(--glass)',
          border: '1px solid var(--glass-border)',
          color: 'var(--text-sec)',
        }}
        title="Benachrichtigungen"
      >
        <Icon name="bell" size={18} />
        {unreadCount > 0 && (
          <span
            className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-label font-semibold px-1${pulse ? ' notification-badge-pulse' : ''}`}
            style={{
              background: '#E53E3E',
              color: '#fff',
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-[360px] rounded-2xl overflow-hidden"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--glass-border)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
            zIndex: 40,
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid var(--divider-l)' }}
          >
            <span className="font-heading text-sm italic" style={{ color: 'var(--text-h)' }}>
              Benachrichtigungen
            </span>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs cursor-pointer border-none bg-transparent transition-colors"
                  style={{ color: 'var(--gold-text)' }}
                >
                  Alle gelesen
                </button>
              )}
              {hasReadNotifications && (
                <button
                  onClick={deleteRead}
                  className="text-xs cursor-pointer border-none bg-transparent transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Gelesene loeschen
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto scrollbar-gold" style={{ maxHeight: 400 }}>
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Icon name="bell" size={24} style={{ color: 'var(--text-muted)', marginBottom: 8 }} />
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Keine Benachrichtigungen
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className="group flex items-start gap-3 px-4 py-3 w-full text-left cursor-pointer transition-colors relative"
                  style={{
                    background: n.is_read ? 'transparent' : 'var(--gold-bg)',
                    borderBottom: '1px solid var(--divider-l)',
                  }}
                  onClick={() => handleItemClick(n.id, n.link, n.is_read)}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--sidebar-hover)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = n.is_read ? 'transparent' : 'var(--gold-bg)'; }}
                >
                  {/* Actor Avatar oder Type-Icon */}
                  {n.actor_avatar_url ? (
                    <img
                      src={n.actor_avatar_url}
                      alt=""
                      className="flex-shrink-0 w-9 h-9 rounded-full object-cover mt-0.5"
                      style={{ border: '1px solid var(--glass-border)' }}
                    />
                  ) : (
                    <span
                      className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center mt-0.5"
                      style={{
                        background: 'var(--glass)',
                        border: '1px solid var(--glass-border)',
                      }}
                    >
                      <Icon
                        name={(TYPE_ICONS[n.type] || 'bell') as import('@/components/ui/Icon').IconName}
                        size={15}
                        style={{ color: n.is_read ? 'var(--text-muted)' : 'var(--gold-text)' }}
                      />
                    </span>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs leading-snug" style={{ color: 'var(--text-body)' }}>
                      {n.title}
                    </p>
                    {n.body && (
                      <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                        {n.body}
                      </p>
                    )}
                    <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                      {timeAgo(n.created_at)}
                    </p>
                  </div>

                  {/* Unread Dot + Delete */}
                  <div className="flex-shrink-0 flex items-center gap-1.5 mt-1">
                    {!n.is_read && (
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: 'var(--gold)' }}
                      />
                    )}
                    <button
                      onClick={(e) => handleDelete(e, n.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-full flex items-center justify-center border-none cursor-pointer"
                      style={{
                        background: 'var(--glass)',
                        color: 'var(--text-muted)',
                      }}
                      title="Loeschen"
                    >
                      <Icon name="x" size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer — Link zu Einstellungen */}
          <div
            className="px-4 py-2.5 text-center"
            style={{ borderTop: '1px solid var(--divider-l)' }}
          >
            <button
              onClick={() => { router.push('/profile?tab=notifications'); setOpen(false); }}
              className="text-xs cursor-pointer border-none bg-transparent transition-colors"
              style={{ color: 'var(--gold-text)' }}
            >
              Benachrichtigungseinstellungen
            </button>
          </div>
        </div>
      )}

      {/* Pulse Animation Keyframes */}
      <style jsx>{`
        @keyframes badgePulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(229, 62, 62, 0.6); }
          50% { transform: scale(1.2); box-shadow: 0 0 0 8px rgba(229, 62, 62, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(229, 62, 62, 0); }
        }
        .notification-badge-pulse {
          animation: badgePulse 0.5s ease-out 3;
        }
      `}</style>
    </div>
  );
}
