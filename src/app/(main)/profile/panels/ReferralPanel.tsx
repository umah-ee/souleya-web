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

export default function ReferralPanel({ isOpen, onClose, profile }: ReferralPanelProps) {
  const [copied, setCopied] = useState(false);
  const referralUrl = `https://souleya.com?ref=${profile.referral_code}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback: nichts tun
    }
  };

  return (
    <Panel isOpen={isOpen} onClose={onClose} title="Einladungen">
      {/* ─── Stats ─── */}
      <div className="flex justify-center gap-10 mb-8">
        <div className="text-center">
          <span className="block text-[26px] font-heading" style={{ color: 'var(--text-h)' }}>
            0
          </span>
          <span className="text-[10px] font-label tracking-[1.2px] uppercase" style={{ color: 'var(--text-muted)' }}>
            Eingeladen
          </span>
        </div>
        <div className="text-center">
          <span className="block text-[26px] font-heading" style={{ color: 'var(--text-h)' }}>
            0
          </span>
          <span className="text-[10px] font-label tracking-[1.2px] uppercase" style={{ color: 'var(--text-muted)' }}>
            Seeds verdient
          </span>
        </div>
      </div>

      {/* ─── Divider ─── */}
      <div
        className="h-px mx-auto max-w-[200px] mb-6"
        style={{ background: 'linear-gradient(90deg, transparent, var(--gold-border-s), transparent)' }}
      />

      {/* ─── Einladungslink ─── */}
      <p className="text-[10px] font-label tracking-[1.2px] uppercase mb-3" style={{ color: 'var(--text-muted)' }}>
        Dein Einladungslink
      </p>

      <div className="flex items-center gap-2 mb-6">
        <code
          className="flex-1 font-body text-[13px] rounded-[12px] px-3 py-2.5 truncate"
          style={{ color: 'var(--gold-text)', background: 'var(--glass)', border: '1px solid var(--glass-border)' }}
        >
          souleya.com?ref={profile.referral_code}
        </code>
        <button
          onClick={handleCopy}
          className="px-4 py-2.5 rounded-full font-label text-[10px] tracking-[0.8px] uppercase cursor-pointer transition-all duration-200 flex-shrink-0"
          style={{
            background: copied ? 'var(--success-bg)' : 'var(--gold-bg)',
            border: copied ? '1px solid var(--success-border)' : '1px solid var(--gold-border-s)',
            color: copied ? 'var(--success)' : 'var(--gold-text)',
          }}
        >
          {copied ? 'Kopiert!' : 'Kopieren'}
        </button>
      </div>

      {/* ─── Eingeladene Liste (Placeholder) ─── */}
      <p className="text-[10px] font-label tracking-[1.2px] uppercase mb-3" style={{ color: 'var(--text-muted)' }}>
        Eingeladene
      </p>
      <p className="text-[13px]" style={{ color: 'var(--text-sec)' }}>
        Noch keine Einladungen. Teile deinen Link!
      </p>
    </Panel>
  );
}
