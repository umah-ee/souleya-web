'use client';

import { useState } from 'react';
import type { Profile } from '@/types/profile';
import Panel from '@/components/ui/Panel';
import { Icon } from '@/components/ui/Icon';

interface ReferralPanelProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
}

/**
 * Referral Panel — exakt nach Mockup: Souleya_Profile_Redesign_Mockup.html
 *
 * Stats: 30px serif numbers (Eingeladen + Seeds verdient)
 * Link: ref-link-box (URL 12px + Kopieren button)
 * Users: ref-user rows (34px avatar, name 14px, date 11px, seeds +N)
 */
export default function ReferralPanel({ isOpen, onClose, profile }: ReferralPanelProps) {
  const [copied, setCopied] = useState(false);
  const referralUrl = `souleya.com?ref=${profile.referral_code}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`https://${referralUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
    }
  };

  // Placeholder — spaeter durch API ersetzen
  const invitedUsers: { initials: string; name: string; date: string; seeds: number }[] = [];

  return (
    <Panel isOpen={isOpen} onClose={onClose} title="Einladungen">
      {/* ─── Stats — Mockup: ref-stats, gap 40px, padding 20px 28px 8px ─── */}
      <div
        className="flex justify-center"
        style={{ gap: '40px', padding: '20px 4px 8px' }}
      >
        <div className="text-center">
          <div
            className="font-heading"
            style={{ fontSize: '30px', fontWeight: 500, lineHeight: 1, color: 'var(--text-h)' }}
          >
            {invitedUsers.length}
          </div>
          <div
            className="font-label"
            style={{
              fontSize: '10px',
              fontWeight: 500,
              letterSpacing: '1.2px',
              textTransform: 'uppercase' as const,
              color: 'var(--text-sec)',
              marginTop: '6px',
            }}
          >
            Eingeladen
          </div>
        </div>
        <div className="text-center">
          <div
            className="font-heading"
            style={{ fontSize: '30px', fontWeight: 500, lineHeight: 1, color: 'var(--text-h)' }}
          >
            0
          </div>
          <div
            className="font-label"
            style={{
              fontSize: '10px',
              fontWeight: 500,
              letterSpacing: '1.2px',
              textTransform: 'uppercase' as const,
              color: 'var(--text-sec)',
              marginTop: '6px',
            }}
          >
            Seeds verdient
          </div>
        </div>
      </div>

      {/* ─── Referral Link — Mockup: ref-link-section ─── */}
      <div style={{ padding: '24px 0', textAlign: 'center' }}>
        {/* Label — Mockup: 10px, uppercase */}
        <div
          className="font-label"
          style={{
            fontSize: '10px',
            fontWeight: 500,
            letterSpacing: '1.2px',
            textTransform: 'uppercase' as const,
            color: 'var(--text-sec)',
            marginBottom: '14px',
          }}
        >
          Dein Einladungslink
        </div>

        {/* Link Box — Mockup: ref-link-box, radius 14px, glass bg, border */}
        <div
          className="flex items-center"
          style={{
            gap: '10px',
            padding: '10px 16px',
            borderRadius: '14px',
            background: 'var(--glass)',
            border: '1px solid var(--divider-l)',
          }}
        >
          <Icon name="link" size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <span
            className="font-body truncate text-left flex-1"
            style={{
              fontSize: '12px',
              color: 'var(--gold)',
              letterSpacing: '0.3px',
            }}
          >
            {referralUrl}
          </span>
          {/* Kopieren — Mockup: 10px, uppercase, radius 20px, gold-softer bg */}
          <button
            onClick={handleCopy}
            className="font-label flex-shrink-0 cursor-pointer transition-all duration-200"
            style={{
              fontSize: '10px',
              fontWeight: 500,
              letterSpacing: '1.2px',
              textTransform: 'uppercase' as const,
              padding: '6px 16px',
              borderRadius: '20px',
              background: copied ? 'var(--success-bg)' : 'var(--gold-bg)',
              color: copied ? 'var(--success)' : 'var(--gold)',
              border: copied ? '1px solid var(--success-border)' : '1px solid var(--gold-border)',
            }}
          >
            {copied ? 'Kopiert!' : 'Kopieren'}
          </button>
        </div>
      </div>

      {/* ─── Invited Users Header — Mockup: ref-users-header ─── */}
      <div
        className="font-label"
        style={{
          fontSize: '10px',
          fontWeight: 500,
          letterSpacing: '1.2px',
          textTransform: 'uppercase' as const,
          color: 'var(--text-sec)',
          padding: '24px 0 12px',
        }}
      >
        Deine Einladungen
      </div>

      {/* ─── Invited Users List — Mockup: ref-users ─── */}
      {invitedUsers.length > 0 ? (
        <div>
          {invitedUsers.map((user, i) => (
            <div
              key={user.name}
              className="flex items-center transition-colors"
              style={{
                padding: '14px 4px',
                borderTop: i > 0 ? '1px solid var(--divider-l)' : undefined,
              }}
            >
              {/* Avatar — Mockup: 34px, circle, glass bg, border */}
              <div
                className="font-label flex items-center justify-center flex-shrink-0"
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'var(--glass)',
                  border: '1px solid var(--divider-l)',
                  marginRight: '14px',
                  fontSize: '11px',
                  fontWeight: 500,
                  letterSpacing: '0.5px',
                  color: 'var(--text-sec)',
                }}
              >
                {user.initials}
              </div>

              {/* Text — Mockup: name 14px/500, date 11px */}
              <div className="flex-1 min-w-0">
                <div
                  className="truncate"
                  style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-body)' }}
                >
                  {user.name}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-sec)', marginTop: '2px' }}>
                  {user.date}
                </div>
              </div>

              {/* Seeds — Mockup: 10px, Josefin Sans, weight 500, green */}
              <div
                className="font-label flex-shrink-0"
                style={{
                  fontSize: '10px',
                  fontWeight: 500,
                  letterSpacing: '1px',
                  color: '#52B788',
                  marginLeft: '14px',
                }}
              >
                +{user.seeds}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            fontSize: '13px',
            color: 'var(--text-sec)',
            padding: '4px 0',
          }}
        >
          Noch keine Einladungen. Teile deinen Link!
        </div>
      )}

      {/* Spacer — Mockup: 32px */}
      <div style={{ height: '32px' }} />
    </Panel>
  );
}
