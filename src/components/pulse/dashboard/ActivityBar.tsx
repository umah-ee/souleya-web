'use client';

import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';

interface Props {
  unreadMessages: number;
  newPosts: number;
}

export default function ActivityBar({ unreadMessages, newPosts }: Props) {
  if (unreadMessages === 0 && newPosts === 0) return null;

  return (
    <div
      className="rounded-[8px] px-4 py-3 flex items-center gap-4"
      style={{
        background: 'var(--glass)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--glass-border)',
      }}
    >
      {unreadMessages > 0 && (
        <Link href="/chat" className="flex items-center gap-2 no-underline group">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: 'var(--gold)' }}
          />
          <span className="text-xs font-body group-hover:underline" style={{ color: 'var(--text-sec)' }}>
            {unreadMessages} {unreadMessages === 1 ? 'neue Nachricht' : 'neue Nachrichten'}
          </span>
          <Icon name="chevron-right" size={12} style={{ color: 'var(--text-muted)' }} />
        </Link>
      )}
      {newPosts > 0 && (
        <Link href="/circles" className="flex items-center gap-2 no-underline group">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: 'var(--success, #4ade80)' }}
          />
          <span className="text-xs font-body group-hover:underline" style={{ color: 'var(--text-sec)' }}>
            {newPosts} neue {newPosts === 1 ? 'Beitrag' : 'Beitraege'}
          </span>
          <Icon name="chevron-right" size={12} style={{ color: 'var(--text-muted)' }} />
        </Link>
      )}
    </div>
  );
}
