'use client';

import { useState, useEffect } from 'react';
import type { Profile } from '@/types/profile';
import { fetchReferrals, type ReferralData } from '@/lib/profile';
import Panel from '@/components/ui/Panel';
import { Icon } from '@/components/ui/Icon';

interface ReferralPanelProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
}

function getInitials(name: string | null): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
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
  const [data, setData] = useState<ReferralData | null>(null);
  const referralUrl = `souleya.com?ref=${profile.referral_code}`;

  useEffect(() => {
    if (isOpen) {
      fetchReferrals().then(setData).catch(() => {});
    }
  }, [isOpen]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`https://${referralUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
    }
  };

  return (
    <Panel isOpen={isOpen} onClose={onClose} title="Einladungen">
      {/* ─── Stats — Mockup: ref-stats, gap 40px, padding 20px 28px 8px ─── */}
      <div
        className="flex justify-center"
        style={{ gap: '40px', padding: '20px 0 8px' }}
      >
        <div className="text-center">
          <div
            className="font-heading"
            style={{ fontSize: '30px', fontWeight: 500, lineHeight: 1, color: 'var(--text-h)' }}
          >
            {data?.count ?? 0}
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
            {data?.seeds_earned ?? 0}
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

      {/* ─── Invited Users Header ─── */}
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

      {/* ─── Invited Users List ─── */}
      {data && data.invited.length > 0 ? (
        <div>
          {data.invited.map((user, i) => (
            <div
              key={i}
              className="flex items-center transition-colors"
              style={{
                padding: '14px 0',
                borderTop: i > 0 ? '1px solid var(--divider-l)' : undefined,
              }}
            >
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt=""
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    marginRight: '14px',
                    flexShrink: 0,
                  }}
                />
              ) : (
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
                  {getInitials(user.display_name)}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div
                  className="truncate"
                  style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-body)' }}
                >
                  {user.display_name || 'Neues Mitglied'}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-sec)', marginTop: '2px' }}>
                  {new Date(user.created_at).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>

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
                +100
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

      <div style={{ height: '32px' }} />
    </Panel>
  );
}
