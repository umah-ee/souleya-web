'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Icon } from '@/components/ui/Icon';
import type { IconName } from '@/components/ui/Icon';

export interface SideStackModule {
  key: string;
  name: string;
  icon: IconName;
}

interface Props {
  moduleKey: string;
  registry: SideStackModule[];
  onSwap: (newKey: string) => void;
  children: React.ReactNode;
}

export default function SlotCard({ moduleKey, registry, onSwap, children }: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Dropdown schliessen bei Klick ausserhalb
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (
      dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
      btnRef.current && !btnRef.current.contains(e.target as Node)
    ) {
      setDropdownOpen(false);
    }
  }, []);

  useEffect(() => {
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen, handleClickOutside]);

  return (
    <div
      className="h-[204px] rounded-[8px] overflow-hidden relative"
      style={{
        background: 'var(--glass)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--glass-border)',
      }}
    >
      {/* Swap Button */}
      <button
        ref={btnRef}
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="absolute top-2.5 right-2.5 z-10 w-[26px] h-[26px] rounded-full flex items-center justify-center cursor-pointer transition-all duration-150"
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid var(--glass-border)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.background = 'var(--gold-bg)'; }}
        onMouseLeave={(e) => { if (!dropdownOpen) { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; } }}
      >
        <Icon name="arrows-vertical" size={14} style={{ color: dropdownOpen ? 'var(--gold)' : 'var(--text-muted)' }} />
      </button>

      {/* Dropdown */}
      {dropdownOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-10 right-2.5 z-20 rounded-[8px] overflow-hidden scrollbar-gold"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--glass-border)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            minWidth: '180px',
            maxHeight: '280px',
            overflowY: 'auto',
            animation: 'fade-up 0.15s ease-out',
          }}
        >
          <div className="p-1">
            {registry.map((mod) => {
              const isActive = mod.key === moduleKey;
              return (
                <button
                  key={mod.key}
                  onClick={() => {
                    if (!isActive) onSwap(mod.key);
                    setDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[6px] cursor-pointer transition-colors duration-100 border-none text-left"
                  style={{
                    background: 'transparent',
                    color: isActive ? 'var(--gold)' : 'var(--text-body)',
                    fontFamily: 'inherit',
                    fontSize: '11px',
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--glass)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <Icon name={mod.icon} size={16} style={{ color: isActive ? 'var(--gold)' : 'var(--text-muted)', flexShrink: 0 }} />
                  <span className="flex-1">{mod.name}</span>
                  {isActive && <Icon name="check" size={14} style={{ color: 'var(--gold)', flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Module Content */}
      {children}
    </div>
  );
}
