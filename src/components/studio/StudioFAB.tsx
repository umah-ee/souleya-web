'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icon, type IconName } from '@/components/ui/Icon';

interface FABItem {
  label: string;
  icon: IconName;
  href: string;
}

const FAB_ITEMS: FABItem[] = [
  { label: 'Neuer Kurs', icon: 'school', href: '/studio/courses?create=1' },
  { label: 'Neues Medium', icon: 'library', href: '/studio/content?create=1' },
  { label: 'Termin erstellen', icon: 'calendar-event', href: '/studio/f2f?create=1' },
  { label: 'Ankuendigung', icon: 'speakerphone', href: '/studio/messages?announce=1' },
  { label: 'Neuer Coupon', icon: 'wallet', href: '/studio/finance?coupon=1' },
];

export default function StudioFAB() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[299] transition-opacity duration-300"
          style={{ background: 'rgba(0,0,0,.3)' }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* FAB */}
      <div className="fixed bottom-7 right-7 z-[300] hidden md:block">
        {/* Menu items */}
        <div
          className="absolute bottom-[68px] right-0 flex flex-col gap-2.5 items-end transition-all duration-300"
          style={{
            pointerEvents: open ? 'auto' : 'none',
            opacity: open ? 1 : 0,
            transform: open ? 'translateY(0)' : 'translateY(10px)',
          }}
        >
          {FAB_ITEMS.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 whitespace-nowrap no-underline transition-all duration-250"
              style={{
                opacity: open ? 1 : 0,
                transform: open ? 'translateY(0)' : 'translateY(8px)',
                transitionDelay: open ? `${i * 50}ms` : '0ms',
              }}
            >
              <span
                style={{
                  background: 'var(--glass-strong)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 10,
                  padding: '8px 14px',
                  fontSize: 11,
                  color: 'var(--text-h)',
                  boxShadow: 'var(--glass-shadow)',
                }}
              >
                {item.label}
              </span>
              <span
                className="flex items-center justify-center"
                style={{
                  width: 40, height: 40,
                  borderRadius: '50%',
                  background: 'var(--glass-strong)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid var(--glass-border)',
                  boxShadow: 'var(--glass-shadow)',
                }}
              >
                <Icon name={item.icon} size={18} style={{ color: 'var(--gold)' }} />
              </span>
            </Link>
          ))}
        </div>

        {/* Main button */}
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center justify-center border-none cursor-pointer transition-all duration-300"
          style={{
            width: 56, height: 56,
            borderRadius: '50%',
            background: 'var(--gold)',
            boxShadow: '0 6px 24px var(--gold-glow)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <Icon
            name="plus"
            size={24}
            style={{
              color: 'var(--text-on-gold)',
              transform: open ? 'rotate(45deg)' : 'none',
              transition: 'transform 0.3s',
            }}
          />
        </button>
      </div>
    </>
  );
}
