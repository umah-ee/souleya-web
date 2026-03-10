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

/**
 * Settings Panel — exakt nach Mockup
 *
 * Main: Kategorie-Rows mit 36px Icon-Boxen + Descriptions, Card-Wrapper
 * Sub-Views: Back-Button 10px Josefin, Title 20px serif italic
 * Notifications: 7 Toggles, Privacy: 8 Toggles
 * Account: Logout
 * Version: "Souleya v1.0.0" am Ende
 */
export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const router = useRouter();
  const { theme, colorScheme, toggleTheme, setColorScheme } = useTheme();
  const [subView, setSubView] = useState<SubView>('main');

  // Notification toggles state
  const [notifs, setNotifs] = useState({
    messages: true,
    circles: true,
    events: true,
    mentions: true,
    pulses: false,
    seeds: true,
    marketing: false,
  });

  // Privacy toggles state
  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    showOnline: true,
    showLocation: true,
    showInterests: true,
    allowMessages: true,
    showStats: true,
    showCircles: true,
    dataAnalytics: false,
  });

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    onClose();
    router.push('/login');
  };

  const handleBack = () => setSubView('main');
  const handleClose = () => { setSubView('main'); onClose(); };

  const panelTitle = subView === 'main' ? 'Einstellungen' : '';

  return (
    <Panel isOpen={isOpen} onClose={handleClose} title={panelTitle}>
      {/* ── Main View ─── */}
      {subView === 'main' && (
        <div>
          {/* Card Wrapper — Mockup: glass bg, border, radius 16px */}
          <div
            style={{
              borderRadius: '16px',
              background: 'var(--glass)',
              border: '1px solid var(--divider-l)',
              overflow: 'hidden',
            }}
          >
            <CategoryRow
              icon="bell"
              label="Benachrichtigungen"
              description="Push, E-Mail & In-App"
              onClick={() => setSubView('notifications')}
            />
            <CategoryRow
              icon="shield"
              label="Datenschutz"
              description="Sichtbarkeit & Privatsphäre"
              onClick={() => setSubView('privacy')}
              border
            />
            <CategoryRow
              icon="palette"
              label="Darstellung"
              description="Theme & Farbschema"
              onClick={() => setSubView('appearance')}
              border
            />
            <CategoryRow
              icon="user"
              label="Konto"
              description="Abmelden & Daten"
              onClick={() => setSubView('account')}
              border
            />
          </div>

          {/* Version — Mockup: centered, 10px, bottom */}
          <div
            className="text-center font-label"
            style={{
              fontSize: '10px',
              fontWeight: 400,
              letterSpacing: '1px',
              color: 'var(--text-muted)',
              marginTop: '32px',
              opacity: 0.6,
            }}
          >
            Souleya v1.0.0
          </div>
        </div>
      )}

      {/* ── Darstellung Sub-View ─── */}
      {subView === 'appearance' && (
        <div>
          <SubViewHeader onBack={handleBack} title="Darstellung" />

          {/* Theme Toggle (Light/Dark) */}
          <div style={{ marginBottom: '24px' }}>
            <SectionLabel>Modus</SectionLabel>
            <div className="flex" style={{ gap: '8px' }}>
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
            <SectionLabel>Farbschema</SectionLabel>
            <div className="flex" style={{ gap: '8px' }}>
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
          <SubViewHeader onBack={handleBack} title="Benachrichtigungen" />

          <div
            style={{
              borderRadius: '16px',
              background: 'var(--glass)',
              border: '1px solid var(--divider-l)',
              overflow: 'hidden',
            }}
          >
            <ToggleRow
              label="Nachrichten"
              checked={notifs.messages}
              onChange={(v) => setNotifs({ ...notifs, messages: v })}
            />
            <ToggleRow
              label="Circle-Aktivitaeten"
              checked={notifs.circles}
              onChange={(v) => setNotifs({ ...notifs, circles: v })}
              border
            />
            <ToggleRow
              label="Event-Erinnerungen"
              checked={notifs.events}
              onChange={(v) => setNotifs({ ...notifs, events: v })}
              border
            />
            <ToggleRow
              label="Erwahnungen"
              checked={notifs.mentions}
              onChange={(v) => setNotifs({ ...notifs, mentions: v })}
              border
            />
            <ToggleRow
              label="Pulse-Reaktionen"
              checked={notifs.pulses}
              onChange={(v) => setNotifs({ ...notifs, pulses: v })}
              border
            />
            <ToggleRow
              label="Seeds-Transaktionen"
              checked={notifs.seeds}
              onChange={(v) => setNotifs({ ...notifs, seeds: v })}
              border
            />
            <ToggleRow
              label="Marketing & Updates"
              checked={notifs.marketing}
              onChange={(v) => setNotifs({ ...notifs, marketing: v })}
              border
            />
          </div>
        </div>
      )}

      {/* ── Datenschutz Sub-View ─── */}
      {subView === 'privacy' && (
        <div>
          <SubViewHeader onBack={handleBack} title="Datenschutz" />

          <div
            style={{
              borderRadius: '16px',
              background: 'var(--glass)',
              border: '1px solid var(--divider-l)',
              overflow: 'hidden',
            }}
          >
            <ToggleRow
              label="Oeffentliches Profil"
              checked={privacy.profilePublic}
              onChange={(v) => setPrivacy({ ...privacy, profilePublic: v })}
            />
            <ToggleRow
              label="Online-Status anzeigen"
              checked={privacy.showOnline}
              onChange={(v) => setPrivacy({ ...privacy, showOnline: v })}
              border
            />
            <ToggleRow
              label="Standort anzeigen"
              checked={privacy.showLocation}
              onChange={(v) => setPrivacy({ ...privacy, showLocation: v })}
              border
            />
            <ToggleRow
              label="Interessen anzeigen"
              checked={privacy.showInterests}
              onChange={(v) => setPrivacy({ ...privacy, showInterests: v })}
              border
            />
            <ToggleRow
              label="Nachrichten erlauben"
              checked={privacy.allowMessages}
              onChange={(v) => setPrivacy({ ...privacy, allowMessages: v })}
              border
            />
            <ToggleRow
              label="Statistiken anzeigen"
              checked={privacy.showStats}
              onChange={(v) => setPrivacy({ ...privacy, showStats: v })}
              border
            />
            <ToggleRow
              label="Circles anzeigen"
              checked={privacy.showCircles}
              onChange={(v) => setPrivacy({ ...privacy, showCircles: v })}
              border
            />
            <ToggleRow
              label="Analyse & Tracking"
              checked={privacy.dataAnalytics}
              onChange={(v) => setPrivacy({ ...privacy, dataAnalytics: v })}
              border
            />
          </div>
        </div>
      )}

      {/* ── Konto Sub-View ─── */}
      {subView === 'account' && (
        <div>
          <SubViewHeader onBack={handleBack} title="Konto" />

          <div
            style={{
              borderRadius: '16px',
              background: 'var(--glass)',
              border: '1px solid var(--divider-l)',
              overflow: 'hidden',
            }}
          >
            <button
              onClick={handleLogout}
              className="w-full flex items-center cursor-pointer transition-colors"
              style={{
                gap: '14px',
                padding: '16px 18px',
                color: 'var(--error)',
                background: 'transparent',
                border: 'none',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--error-bg)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'var(--error-bg)',
                  border: '1px solid var(--error-border)',
                }}
              >
                <Icon name="logout" size={16} style={{ color: 'var(--error)' }} />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>Abmelden</span>
            </button>
          </div>
        </div>
      )}
    </Panel>
  );
}

// ── Helper Components ────────────────────────────────────

/** Section Label — Mockup: 10px Josefin uppercase */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="font-label uppercase"
      style={{
        fontSize: '10px',
        fontWeight: 500,
        letterSpacing: '1.2px',
        color: 'var(--text-muted)',
        marginBottom: '10px',
      }}
    >
      {children}
    </div>
  );
}

/** Sub-View Header — Mockup: Back 10px Josefin + Title 20px serif */
function SubViewHeader({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <button
        onClick={onBack}
        className="flex items-center cursor-pointer bg-transparent border-none"
        style={{ gap: '6px', color: 'var(--gold-text)', marginBottom: '12px' }}
      >
        <Icon name="chevron-left" size={14} />
        <span
          className="font-label uppercase"
          style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '1.2px' }}
        >
          Einstellungen
        </span>
      </button>
      <h3
        className="font-heading italic"
        style={{ fontSize: '20px', fontWeight: 500, color: 'var(--text-h)', margin: 0 }}
      >
        {title}
      </h3>
    </div>
  );
}

/** Category Row — Mockup: 36px icon box, title 14px/600, description 11px */
function CategoryRow({
  icon,
  label,
  description,
  onClick,
  border,
}: {
  icon: IconName;
  label: string;
  description: string;
  onClick: () => void;
  border?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center cursor-pointer transition-colors"
      style={{
        gap: '14px',
        padding: '16px 18px',
        color: 'var(--text-h)',
        background: 'transparent',
        border: 'none',
        borderTop: border ? '1px solid var(--divider-l)' : undefined,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--glass)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      {/* Icon Box — Mockup: 36px, radius 10px, glass bg */}
      <div
        className="flex items-center justify-center flex-shrink-0"
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: 'var(--glass)',
          border: '1px solid var(--divider-l)',
        }}
      >
        <Icon name={icon} size={16} style={{ color: 'var(--text-sec)' }} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0 text-left">
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-h)' }}>
          {label}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-sec)', marginTop: '1px' }}>
          {description}
        </div>
      </div>

      <Icon name="chevron-right" size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
    </button>
  );
}

/** Toggle Row — Mockup: label 14px, toggle track */
function ToggleRow({
  label,
  checked,
  onChange,
  border,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  border?: boolean;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between cursor-pointer"
      style={{
        padding: '14px 18px',
        background: 'transparent',
        border: 'none',
        borderTop: border ? '1px solid var(--divider-l)' : undefined,
      }}
    >
      <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-body)' }}>
        {label}
      </span>

      {/* Toggle — Mockup: 40×22px track, 18px knob */}
      <div
        className="relative flex-shrink-0 transition-colors duration-200"
        style={{
          width: '40px',
          height: '22px',
          borderRadius: '11px',
          background: checked ? 'var(--gold)' : 'var(--toggle-track)',
        }}
      >
        <div
          className="absolute transition-transform duration-200"
          style={{
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: '#FFFFFF',
            top: '2px',
            left: '2px',
            transform: checked ? 'translateX(18px)' : 'translateX(0)',
            boxShadow: '0 1px 3px rgba(0,0,0,.15)',
          }}
        />
      </div>
    </button>
  );
}

/** Toggle Chip — Mockup: pill shape for theme/color selection */
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
      className="flex items-center cursor-pointer transition-all duration-200"
      style={{
        gap: '8px',
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: 500,
        background: active ? 'var(--gold-bg)' : 'transparent',
        border: active ? '1px solid var(--gold-border)' : '1px solid var(--divider-l)',
        color: active ? 'var(--gold-text)' : 'var(--text-sec)',
      }}
    >
      {color && (
        <span
          className="flex-shrink-0"
          style={{ width: '12px', height: '12px', borderRadius: '50%', background: color }}
        />
      )}
      {label}
    </button>
  );
}
