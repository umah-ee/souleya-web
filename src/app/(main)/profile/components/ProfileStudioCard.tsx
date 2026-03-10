'use client';

import Link from 'next/link';
import type { Profile } from '@/types/profile';
import { Icon } from '@/components/ui/Icon';

interface ProfileStudioCardProps {
  profile: Profile;
}

export default function ProfileStudioCard({ profile }: ProfileStudioCardProps) {
  if (!profile.is_mentor) return null;

  return (
    <div className="px-6 mt-10">
      <Link
        href="/studio"
        className="flex items-center gap-3 py-3.5 px-4 rounded-[14px] font-body text-[14px] italic cursor-pointer no-underline group transition-all duration-300"
        style={{
          background: 'var(--gold-bg)',
          border: '1.5px solid var(--gold-border)',
          color: 'var(--gold-text)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--gold-bg-hover)';
          e.currentTarget.style.boxShadow = '0 6px 24px var(--gold-glow), inset 0 1px 0 rgba(255,255,255,0.08)';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.borderColor = 'var(--gold)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--gold-bg)';
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = 'var(--gold-border)';
        }}
      >
        <span
          className="flex items-center justify-center flex-shrink-0"
          style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--gold)' }}
        >
          <Icon name="sparkles" size={18} style={{ color: 'var(--text-on-gold)' }} />
        </span>
        <span className="flex-1">Coach Studio oeffnen</span>
        <Icon
          name="chevron-right"
          size={16}
          style={{ color: 'var(--gold-text)', transition: 'transform 0.3s', flexShrink: 0 }}
        />
      </Link>
    </div>
  );
}
