'use client';

import type { Profile } from '@/types/profile';
import Panel from '@/components/ui/Panel';
import { Icon, type IconName } from '@/components/ui/Icon';

interface SeedsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
}

/**
 * Seeds Panel — exakt nach Mockup: Souleya_Profile_Redesign_Mockup.html
 *
 * Hero: Icon(48px, radius-14, gold-softer) → Amount(44px serif) → "Seeds"(10px) → EUR(12px)
 * Topup: Hint-Text auf Web (kein Button)
 * Verlauf: Rows (icon 30px radius-9, title 14px, date 11px, amount 18px serif)
 */
export default function SeedsPanel({ isOpen, onClose, profile }: SeedsPanelProps) {
  // Placeholder-Transaktionen (spaeter durch API ersetzen)
  const transactions: {
    id: number;
    icon: IconName;
    title: string;
    date: string;
    amount: number;
    type: 'incoming' | 'outgoing' | 'topup';
  }[] = [
    { id: 1, icon: 'chevron-down', title: 'Referral · @markus', date: 'Heute, 14:22', amount: +100, type: 'incoming' },
    { id: 2, icon: 'chevron-down', title: 'Kurs: Breathwork Basics', date: 'Gestern, 19:05', amount: -350, type: 'outgoing' },
    { id: 3, icon: 'gift', title: 'Willkommensbonus', date: '1. Maerz 2026', amount: +50, type: 'incoming' },
    { id: 4, icon: 'users', title: 'Einladung angenommen', date: '28. Feb 2026', amount: +25, type: 'incoming' },
  ];

  return (
    <Panel isOpen={isOpen} onClose={onClose} title="Seeds">
      {/* ─── Hero: Balance — Mockup: seeds-panel-hero ─── */}
      <div
        className="flex flex-col items-center"
        style={{ padding: '8px 0 28px', gap: '6px' }}
      >
        {/* Seed Icon — Mockup: 48px, radius 14px, gold-softer bg, gold border */}
        <div
          className="seeds-panel-icon flex items-center justify-center"
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'var(--gold-softer)',
            border: '1px solid var(--gold-border)',
            marginBottom: '8px',
          }}
        >
          <Icon name="seed" size={24} style={{ color: 'var(--gold)' }} />
        </div>

        {/* Amount — Mockup: 44px, serif, weight 400, line-height 1 */}
        <div
          className="font-heading"
          style={{
            fontSize: '44px',
            fontWeight: 400,
            lineHeight: 1,
            color: 'var(--text-h)',
          }}
        >
          {profile.seeds_balance.toLocaleString('de-DE')}
        </div>

        {/* Label — Mockup: 10px, Josefin Sans, weight 500, letter-spacing 1.5px, uppercase */}
        <div
          className="font-label"
          style={{
            fontSize: '10px',
            fontWeight: 500,
            letterSpacing: '1.5px',
            textTransform: 'uppercase' as const,
            color: 'var(--text-sec)',
          }}
        >
          Seeds
        </div>

        {/* EUR Value — Mockup: 12px, Quicksand, weight 500 */}
        <div
          className="font-body"
          style={{
            fontSize: '12px',
            fontWeight: 500,
            color: 'var(--text-sec)',
            marginTop: '2px',
          }}
        >
          ≈ {(profile.seeds_balance * 0.01).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
        </div>
      </div>

      {/* ─── Transaction Header — Mockup: 10px, uppercase, padding 24px 28px 12px ─── */}
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
        Verlauf
      </div>

      {/* ─── Transaction List — Mockup: seeds-txns ─── */}
      <div>
        {transactions.map((tx, i) => (
          <div
            key={tx.id}
            className="flex items-center transition-colors"
            style={{
              padding: '14px 0',
              borderTop: i > 0 ? '1px solid var(--divider-l)' : undefined,
            }}
          >
            {/* Icon — Mockup: 30px, radius 9px */}
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '9px',
                marginRight: '14px',
                ...(tx.type === 'incoming'
                  ? {
                      background: 'rgba(82,183,136,.10)',
                      color: '#52B788',
                      border: '1px solid rgba(82,183,136,.15)',
                    }
                  : tx.type === 'topup'
                  ? {
                      background: 'var(--gold-bg)',
                      color: 'var(--gold)',
                      border: '1px solid var(--gold-border)',
                    }
                  : {
                      background: 'var(--glass)',
                      color: 'var(--text-sec)',
                      border: '1px solid var(--divider-l)',
                    }),
              }}
            >
              <Icon name={tx.icon} size={14} />
            </div>

            {/* Text — Mockup: title 14px/500, date 11px */}
            <div className="flex-1 min-w-0">
              <div
                className="truncate"
                style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-body)' }}
              >
                {tx.title}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-sec)', marginTop: '2px' }}>
                {tx.date}
              </div>
            </div>

            {/* Amount — Mockup: 18px, serif, weight 500 */}
            <div
              className="font-heading flex-shrink-0"
              style={{
                fontSize: '18px',
                fontWeight: 500,
                marginLeft: '14px',
                color: tx.amount > 0 ? '#52B788' : 'var(--text-sec)',
              }}
            >
              {tx.amount > 0 ? '+' : '−'}{Math.abs(tx.amount)}
            </div>
          </div>
        ))}
      </div>

      {/* Spacer — Mockup: 32px */}
      <div style={{ height: '32px' }} />
    </Panel>
  );
}
