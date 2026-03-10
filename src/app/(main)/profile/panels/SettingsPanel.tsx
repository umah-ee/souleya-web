'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';
import { createClient } from '@/lib/supabase/client';
import Panel from '@/components/ui/Panel';
import { Icon, type IconName } from '@/components/ui/Icon';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type SubView = 'main' | 'appearance' | 'notifications' | 'privacy' | 'account';

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const router = useRouter();
  const { theme, colorScheme, toggleTheme, setColorScheme } = useTheme();
  const [subView, setSubView] = useState<SubView>('main');

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    onClose();
    router.push('/login');
  };

  const handleBack = () => setSubView('main');

  // Reset subView wenn Panel geschlossen wird
  const handleClose = () => {
    setSubView('main');
    onClose();
  };

  return (
    <Panel isOpen={isOpen} onClose={handleClose} title={subView === 'main' ? 'Einstellungen' : ''}>
      {/* ── Main View ─── */}
      {subView === 'main' && (
        <div className="space-y-1">
          <SettingsRow
            icon="bell"
            label="Benachrichtigungen"
            onClick={() => setSubView('notifications')}
          />
          <SettingsRow
            icon="shield"
            label="Datenschutz"
            onClick={() => setSubView('privacy')}
          />
          <SettingsRow
            icon="palette"
            label="Darstellung"
            onClick={() => setSubView('appearance')}
          />
          <SettingsRow
            icon="user"
            label="Konto"
            onClick={() => setSubView('account')}
          />
        </div>
      )}

      {/* ── Darstellung Sub-View ─── */}
      {subView === 'appearance' && (
        <div>
          <button
            onClick={handleBack}
            className="flex items-center gap-2 mb-5 cursor-pointer bg-transparent border-none"
            style={{ color: 'var(--gold-text)' }}
          >
            <Icon name="chevron-left" size={16} />
            <span className="text-[13px] font-body">Zurueck</span>
          </button>

          <h3 className="text-[15px] font-heading italic mb-4" style={{ color: 'var(--text-h)' }}>
            Darstellung
          </h3>

          {/* Theme Toggle (Light/Dark) */}
          <div className="mb-6">
            <p className="text-[10px] font-label tracking-[1.2px] uppercase mb-3" style={{ color: 'var(--text-muted)' }}>
              Modus
            </p>
            <div className="flex gap-2">
              <ToggleChip
                label="Hell"
                active={theme === 'light'}
                onClick={() => { if (theme !== 'light') toggleTheme(); }}
              />
              <ToggleChip
                label="Dunkel"
                active={theme === 'dark'}
                onClick={() => { if (theme !== 'dark') toggleTheme(); }}
              />
            </div>
          </div>

          {/* Color Scheme Toggle (Gold/Dusk) */}
          <div>
            <p className="text-[10px] font-label tracking-[1.2px] uppercase mb-3" style={{ color: 'var(--text-muted)' }}>
              Farbschema
            </p>
            <div className="flex gap-2">
              <ToggleChip
                label="Gold"
                active={colorScheme === 'gold'}
                onClick={() => setColorScheme('gold')}
                color="#C8A96E"
              />
              <ToggleChip
                label="Dusk"
                active={colorScheme === 'dusk'}
                onClick={() => setColorScheme('dusk')}
                color="#A78BFA"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Benachrichtigungen Sub-View ─── */}
      {subView === 'notifications' && (
        <div>
          <button
            onClick={handleBack}
            className="flex items-center gap-2 mb-5 cursor-pointer bg-transparent border-none"
            style={{ color: 'var(--gold-text)' }}
          >
            <Icon name="chevron-left" size={16} />
            <span className="text-[13px] font-body">Zurueck</span>
          </button>
          <h3 className="text-[15px] font-heading italic mb-4" style={{ color: 'var(--text-h)' }}>
            Benachrichtigungen
          </h3>
          <p className="text-[13px]" style={{ color: 'var(--text-sec)' }}>
            Kommt bald.
          </p>
        </div>
      )}

      {/* ── Datenschutz Sub-View ─── */}
      {subView === 'privacy' && (
        <div>
          <button
            onClick={handleBack}
            className="flex items-center gap-2 mb-5 cursor-pointer bg-transparent border-none"
            style={{ color: 'var(--gold-text)' }}
          >
            <Icon name="chevron-left" size={16} />
            <span className="text-[13px] font-body">Zurueck</span>
          </button>
          <h3 className="text-[15px] font-heading italic mb-4" style={{ color: 'var(--text-h)' }}>
            Datenschutz
          </h3>
          <p className="text-[13px]" style={{ color: 'var(--text-sec)' }}>
            Kommt bald.
          </p>
        </div>
      )}

      {/* ── Konto Sub-View ─── */}
      {subView === 'account' && (
        <div>
          <button
            onClick={handleBack}
            className="flex items-center gap-2 mb-5 cursor-pointer bg-transparent border-none"
            style={{ color: 'var(--gold-text)' }}
          >
            <Icon name="chevron-left" size={16} />
            <span className="text-[13px] font-body">Zurueck</span>
          </button>
          <h3 className="text-[15px] font-heading italic mb-4" style={{ color: 'var(--text-h)' }}>
            Konto
          </h3>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-[12px] text-[14px] font-body cursor-pointer transition-colors"
            style={{
              color: 'var(--error)',
              background: 'var(--error-bg)',
              border: '1px solid var(--error-border)',
            }}
          >
            <Icon name="logout" size={16} />
            Abmelden
          </button>
        </div>
      )}
    </Panel>
  );
}

// ── Helper Components ────────────────────────────────────

function SettingsRow({ icon, label, onClick }: { icon: IconName; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-[12px] text-[14px] font-body cursor-pointer transition-colors"
      style={{ color: 'var(--text-h)', background: 'transparent', border: 'none' }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--glass)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      <Icon name={icon} size={18} style={{ color: 'var(--text-sec)' }} />
      <span className="flex-1 text-left">{label}</span>
      <Icon name="chevron-right" size={16} style={{ color: 'var(--text-muted)' }} />
    </button>
  );
}

function ToggleChip({
  label,
  active,
  onClick,
  color,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-body cursor-pointer transition-all duration-200"
      style={{
        background: active ? 'var(--gold-bg)' : 'transparent',
        border: active ? '1px solid var(--gold-border)' : '1px solid var(--divider)',
        color: active ? 'var(--gold-text)' : 'var(--text-sec)',
      }}
    >
      {color && (
        <span
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ background: color }}
        />
      )}
      {label}
    </button>
  );
}
