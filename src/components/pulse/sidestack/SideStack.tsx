'use client';

import { useState, useEffect, useCallback } from 'react';
import SlotCard from './SlotCard';
import type { SideStackModule } from './SlotCard';
import type { IconName } from '@/components/ui/Icon';

// Module
import ZodiacCard from './modules/ZodiacCard';
import DayNumberCard from './modules/DayNumberCard';
import MoonPhaseCard from './modules/MoonPhaseCard';
import AffirmationCard from './modules/AffirmationCard';
import ChakraCard from './modules/ChakraCard';
import ElementCard from './modules/ElementCard';
import MentorMeditationCard from './modules/MentorMeditationCard';

// ── Registry ──
const SIDESTACK_REGISTRY: (SideStackModule & { component: React.ComponentType<{ birthday?: string | null }> })[] = [
  { key: 'zodiac',     name: 'Horoskop',          icon: 'star' as IconName,     component: ZodiacCard },
  { key: 'daynum',     name: 'Tageszahl',         icon: 'sparkles' as IconName, component: DayNumberCard },
  { key: 'moon',       name: 'Mondphase',         icon: 'moon' as IconName,     component: MoonPhaseCard },
  { key: 'affirm',     name: 'Affirmation',       icon: 'heart' as IconName,    component: AffirmationCard },
  { key: 'chakra',     name: 'Chakra des Tages',  icon: 'target' as IconName,   component: ChakraCard },
  { key: 'element',    name: 'Element des Tages', icon: 'droplet' as IconName,  component: ElementCard },
  { key: 'meditation', name: 'Mentor-Meditation', icon: 'clock' as IconName,    component: MentorMeditationCard },
];

// Registry ohne Component (fuer SlotCard Dropdown)
const REGISTRY_FOR_DROPDOWN: SideStackModule[] = SIDESTACK_REGISTRY.map(({ key, name, icon }) => ({ key, name, icon }));

const STORAGE_KEY = 'souleya_sidestack_slots';
const DEFAULT_SLOTS = ['zodiac', 'meditation'];

interface Props {
  birthday?: string | null;
}

export default function SideStack({ birthday }: Props) {
  const [slots, setSlots] = useState<string[]>(DEFAULT_SLOTS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length === 2) {
          setSlots(parsed);
        }
      }
    } catch { /* noop */ }
    setMounted(true);
  }, []);

  const saveSlots = useCallback((newSlots: string[]) => {
    setSlots(newSlots);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(newSlots)); } catch { /* noop */ }
  }, []);

  const handleSwap = useCallback((slotIndex: number, newKey: string) => {
    const newSlots = [...slots];
    newSlots[slotIndex] = newKey;
    saveSlots(newSlots);
  }, [slots, saveSlots]);

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-3">
      {slots.map((moduleKey, slotIndex) => {
        const moduleDef = SIDESTACK_REGISTRY.find((m) => m.key === moduleKey);
        if (!moduleDef) return null;
        const Component = moduleDef.component;

        return (
          <SlotCard
            key={`slot-${slotIndex}`}
            moduleKey={moduleKey}
            registry={REGISTRY_FOR_DROPDOWN}
            onSwap={(newKey) => handleSwap(slotIndex, newKey)}
          >
            <Component birthday={birthday} />
          </SlotCard>
        );
      })}
    </div>
  );
}
