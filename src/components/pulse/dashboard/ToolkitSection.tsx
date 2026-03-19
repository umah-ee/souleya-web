'use client';

import { useState, useEffect, useCallback } from 'react';
import ToolkitAddCard from './ToolkitAddCard';
import ModulePickerModal from './ModulePickerModal';

// Lazy imports for modules
import BreathModule from '../modules/BreathModule';
import MeditationModule from '../modules/MeditationModule';
import GratitudeModule from '../modules/GratitudeModule';
import IntentionModule from '../modules/IntentionModule';
import JournalModule from '../modules/JournalModule';
import CheckinModule from '../modules/CheckinModule';
import OracleModule from '../modules/OracleModule';
import MovementModule from '../modules/MovementModule';

const MODULE_COMPONENTS: Record<string, React.ComponentType<{ onRemove: () => void }>> = {
  breath: BreathModule,
  meditation: MeditationModule,
  gratitude: GratitudeModule,
  intention: IntentionModule,
  journal: JournalModule,
  checkin: CheckinModule,
  oracle: OracleModule,
  movement: MovementModule,
};

const STORAGE_KEY = 'souleya_toolkit_modules';
const DEFAULT_MODULES = ['breath', 'gratitude'];

interface Props {
  displayName: string;
}

function getTimeLabel(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Dein Morgen';
  if (h < 17) return 'Dein Nachmittag';
  if (h < 21) return 'Dein Abend';
  return 'Deine Nacht';
}

export default function ToolkitSection({ displayName }: Props) {
  const [activeModules, setActiveModules] = useState<string[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      setActiveModules(stored ? JSON.parse(stored) : DEFAULT_MODULES);
    } catch {
      setActiveModules(DEFAULT_MODULES);
    }
    setMounted(true);
  }, []);

  const saveModules = useCallback((modules: string[]) => {
    setActiveModules(modules);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(modules)); } catch { /* noop */ }
  }, []);

  const handleAdd = useCallback((key: string) => {
    saveModules([...activeModules, key]);
  }, [activeModules, saveModules]);

  const handleRemove = useCallback((key: string) => {
    saveModules(activeModules.filter((k) => k !== key));
  }, [activeModules, saveModules]);

  if (!mounted) return null;

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <h2 className="font-heading italic text-lg" style={{ color: 'var(--text-h)' }}>
          {getTimeLabel()}
        </h2>
        <p className="text-xs font-body mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Stelle dir dein Ritual zusammen
        </p>
      </div>

      {/* Module Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {activeModules.map((key, index) => {
          const Component = MODULE_COMPONENTS[key];
          if (!Component) return null;
          return (
            <div
              key={key}
              style={{ animation: `toolkit-card-in 0.3s ease-out ${index * 0.05}s both` }}
            >
              <Component onRemove={() => handleRemove(key)} />
            </div>
          );
        })}

        {/* Add card */}
        <ToolkitAddCard onClick={() => setPickerOpen(true)} />
      </div>

      {/* Picker Modal */}
      <ModulePickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        activeModules={activeModules}
        onAdd={handleAdd}
      />
    </div>
  );
}
