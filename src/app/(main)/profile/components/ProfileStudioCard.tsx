'use client';

import Link from 'next/link';
import type { Profile } from '@/types/profile';
import type { PublicProfile } from '@/lib/users';
import { Icon } from '@/components/ui/Icon';

interface ProfileStudioCardProps {
  profile: Profile | PublicProfile;
}

/**
 * Studio Card — exakt nach Mockup
 *
 * Padding 20px 24px, radius 24px, gap 16px
 * Background: 3-Stop gold gradient (dusk: lavender/rose via CSS override)
 * ::before Orb (radial-gradient)
 * Icon: 44px, radius 14px, gradient BG + box-shadow
 * Title: 19px Cormorant Garamond italic 600
 * Subtitle: "Kurse, Sessions & Inhalte verwalten"
 * Hover: translateY(-2px) + shadow
 */
export default function ProfileStudioCard({ profile }: ProfileStudioCardProps) {
  if (!profile.is_mentor) return null;

  return (
    <div className="px-6" style={{ marginTop: '40px' }}>
      <Link
        href="/studio"
        className="studio-card relative flex items-center no-underline cursor-pointer overflow-hidden transition-all duration-300"
        style={{
          padding: '20px 24px',
          gap: '16px',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, var(--gold-soft) 0%, var(--gold-softer) 50%, var(--gold-soft) 100%)',
          border: '1px solid var(--gold-border)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: 'inset 0 0 0 1px var(--gold-border-s), 0 4px 24px rgba(0,0,0,.08)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = 'inset 0 0 0 1px var(--gold-border), 0 8px 32px var(--gold-glow)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'inset 0 0 0 1px var(--gold-border-s), 0 4px 24px rgba(0,0,0,.08)';
        }}
      >
        {/* Icon — Mockup: 44px, radius 14px, gold gradient bg */}
        <span
          className="studio-icon flex items-center justify-center flex-shrink-0"
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '14px',
            background: 'var(--primary-gradient)',
            boxShadow: 'var(--primary-glow)',
          }}
        >
          <Icon name="sparkles" size={20} style={{ color: 'var(--text-on-gold)' }} />
        </span>

        {/* Text — Mockup: Title 19px serif italic 600 + Subtitle 12px */}
        <div className="flex-1 min-w-0">
          <div
            className="font-heading italic"
            style={{ fontSize: '19px', fontWeight: 600, color: 'var(--text-h)' }}
          >
            Coach Studio
          </div>
          <div
            style={{ fontSize: '12px', color: 'var(--text-sec)', marginTop: '2px' }}
          >
            Kurse, Sessions &amp; Inhalte verwalten
          </div>
        </div>

        {/* Chevron */}
        <Icon
          name="chevron-right"
          size={16}
          style={{ color: 'var(--text-muted)', flexShrink: 0 }}
        />
      </Link>
    </div>
  );
}
