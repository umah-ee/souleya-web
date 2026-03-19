'use client';

import { Icon } from '@/components/ui/Icon';
import type { IconName } from '@/components/ui/Icon';

export interface ModuleDefinition {
  key: string;
  icon: IconName;
  name: string;
  description: string;
}

export const MODULE_REGISTRY: ModuleDefinition[] = [
  { key: 'breath', icon: 'droplet', name: 'Atemuebung', description: 'Box Breathing, 4-7-8 oder Wim Hof' },
  { key: 'meditation', icon: 'clock', name: 'Meditation', description: 'Timer fuer deine stille Praxis' },
  { key: 'gratitude', icon: 'heart', name: 'Dankbarkeit', description: 'Drei Dinge, fuer die du dankbar bist' },
  { key: 'intention', icon: 'target', name: 'Intention', description: 'Setze deine Absicht fuer den Tag' },
  { key: 'journal', icon: 'book', name: 'Journal', description: 'Tagesreflexion mit wechselnden Fragen' },
  { key: 'checkin', icon: 'face-smile', name: 'Check-in', description: 'Wie fuehlst du dich gerade?' },
  { key: 'oracle', icon: 'sparkles', name: 'Weisheitskarte', description: 'Ziehe eine Karte aus der Sammlung' },
  { key: 'movement', icon: 'run', name: 'Bewegung', description: 'Kurze Bewegungseinheit zum Start' },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  activeModules: string[];
  onAdd: (key: string) => void;
}

export default function ModulePickerModal({ isOpen, onClose, activeModules, onAdd }: Props) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 200, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="rounded-[8px] w-full max-w-md max-h-[80vh] overflow-y-auto scrollbar-gold"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--glass-border)',
          animation: 'fade-up 0.25s ease-out',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--divider)' }}>
          <h2 className="font-heading text-lg" style={{ color: 'var(--text-h)' }}>
            Modul hinzufuegen
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
            style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}
          >
            <Icon name="x" size={16} />
          </button>
        </div>

        {/* Module List */}
        <div className="p-3 space-y-1">
          {MODULE_REGISTRY.map((mod) => {
            const isAdded = activeModules.includes(mod.key);
            return (
              <button
                key={mod.key}
                onClick={() => { if (!isAdded) { onAdd(mod.key); onClose(); } }}
                disabled={isAdded}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-[8px] transition-colors duration-150 cursor-pointer border-none text-left"
                style={{
                  background: isAdded ? 'transparent' : 'transparent',
                  opacity: isAdded ? 0.4 : 1,
                }}
                onMouseEnter={(e) => { if (!isAdded) e.currentTarget.style.background = 'var(--glass)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <div
                  className="w-9 h-9 rounded-[8px] flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--gold-bg)', color: 'var(--gold-text)' }}
                >
                  {isAdded ? <Icon name="check" size={18} /> : <Icon name={mod.icon} size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-body font-medium" style={{ color: 'var(--text-h)' }}>
                    {mod.name}
                  </p>
                  <p className="text-[0.65rem] font-body" style={{ color: 'var(--text-muted)' }}>
                    {mod.description}
                  </p>
                </div>
                {isAdded && (
                  <span className="text-[0.55rem] font-label uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Aktiv
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
