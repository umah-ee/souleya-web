'use client';
import Link from 'next/link';
import { Icon, type IconName } from '@/components/ui/Icon';

const MORE_ITEMS: { label: string; icon: IconName; href: string }[] = [
  { label: 'Content & Mediathek', icon: 'library', href: '/studio/content' },
  { label: 'Face2Face', icon: 'video', href: '/studio/f2f' },
  { label: 'Teilnehmer', icon: 'users-group', href: '/studio/participants' },
  { label: 'Finanzen', icon: 'wallet', href: '/studio/finance' },
  { label: 'Analytics', icon: 'chart-line', href: '/studio/analytics' },
  { label: 'Bewertungen', icon: 'star', href: '/studio/messages' },
  { label: 'Profil & Branding', icon: 'id-badge', href: '/studio/profile' },
  { label: 'Zurueck zur Community', icon: 'arrow-left', href: '/' },
];

export default function MorePage() {
  return (
    <div>
      <h2 style={{ fontSize: 11, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16 }}>Mehr</h2>
      <div className="flex flex-col gap-2">
        {MORE_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} className="glass-card rounded-[8px] p-4 flex items-center gap-3 no-underline transition-transform duration-200 hover:-translate-y-0.5" style={{ background: 'var(--card-bg)' }}>
            <div className="flex items-center justify-center" style={{ width: 36, height: 36, borderRadius: 8, background: item.href === '/' ? 'var(--gold)' : 'var(--gold-bg)' }}>
              <Icon name={item.icon} size={18} style={{ color: item.href === '/' ? 'var(--text-on-gold)' : 'var(--gold)' }} />
            </div>
            <span style={{ fontSize: 13, color: item.href === '/' ? 'var(--gold-text)' : 'var(--text-h)', fontWeight: item.href === '/' ? 500 : 400 }}>{item.label}</span>
            <Icon name="chevron-right" size={16} style={{ color: 'var(--text-muted)', marginLeft: 'auto' }} />
          </Link>
        ))}
      </div>
    </div>
  );
}
