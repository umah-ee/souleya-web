'use client';

import type { User } from '@supabase/supabase-js';
import PulseDashboard from '@/components/pulse/dashboard/PulseDashboard';

// ── Props ─────────────────────────────────────────────────────
interface Props {
  user: User | null;
  displayName: string | null;
  locationLat: number | null;
  locationLng: number | null;
  interests: string[];
  soulLevel: number;
  birthday?: string | null;
}

// ══════════════════════════════════════════════════════════════
// PULSE DASHBOARD
// ══════════════════════════════════════════════════════════════

export default function PulseClient({ user, displayName, locationLat, locationLng, interests, soulLevel, birthday }: Props) {
  if (!user) {
    return (
      <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
        <p className="font-label text-[0.7rem] tracking-[0.2em]">BITTE ANMELDEN</p>
      </div>
    );
  }

  return (
    <PulseDashboard
      displayName={displayName ?? ''}
      locationLat={locationLat ?? undefined}
      locationLng={locationLng ?? undefined}
      interests={interests}
      soulLevel={soulLevel}
      birthday={birthday}
    />
  );
}
