'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Profile } from '@/types/profile';
import { fetchProfile } from '@/lib/profile';

// ── Profile Components ──
import ProfileBanner from './components/ProfileBanner';
import ProfileIdentity from './components/ProfileIdentity';
import ProfileBio from './components/ProfileBio';
import ProfileStudioCard from './components/ProfileStudioCard';
import ProfileInterests from './components/ProfileInterests';
import ProfileStats from './components/ProfileStats';
import ProfilePrivateRow from './components/ProfilePrivateRow';

// ── Panels ──
import SettingsPanel from './panels/SettingsPanel';
import SeedsPanel from './panels/SeedsPanel';
import ReferralPanel from './panels/ReferralPanel';
import EditProfilePanel from './panels/EditProfilePanel';
import VisitenkarteOverlay from './panels/VisitenkarteOverlay';

type PanelType = 'settings' | 'seeds' | 'referral' | 'edit' | 'visitenkarte' | null;

export default function ProfileClient() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activePanel, setActivePanel] = useState<PanelType>(null);

  // ── Profil laden ──
  useEffect(() => {
    fetchProfile()
      .then((p) => setProfile(p))
      .catch((err) => {
        console.error('[ProfileClient]', err);
        if (err.message === 'Nicht angemeldet') {
          router.push('/login?next=/profile');
          return;
        }
        setError('Profil konnte nicht geladen werden.');
      })
      .finally(() => setLoading(false));
  }, [router]);

  // ── Panel Handlers ──
  const openPanel = (panel: PanelType) => setActivePanel(panel);
  const closePanel = () => setActivePanel(null);

  const handleProfileUpdated = (updated: Profile) => {
    setProfile(updated);
  };

  // ── Loading State ──
  if (loading) {
    return (
      <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
        <p className="font-label text-[10px] tracking-[1.2px] uppercase">Wird geladen ...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
        <p className="text-[14px]">Profil konnte nicht geladen werden.</p>
        {error && <p className="text-[13px] mt-2" style={{ color: 'var(--error)' }}>{error}</p>}
      </div>
    );
  }

  return (
    <div className="-mx-4 -mt-6 flex justify-center">
      <div className="w-full max-w-[700px]">

        {/* ═══════════════════════════════════════════
            PROFIL-REDESIGN v2 (Style Guide v2.1)
            Banner → Identity → Bio → Studio →
            Interests → Stats → Private Row
        ═══════════════════════════════════════════ */}

        {/* ─── Banner (200px) ─── */}
        <ProfileBanner
          profile={profile}
          onSettingsClick={() => openPanel('settings')}
          onEditClick={() => openPanel('edit')}
        />

        {/* ─── Identity (EnsoRing 112px + Name 32px) ─── */}
        <ProfileIdentity profile={profile} />

        {/* ─── Bio + Location + Member-Since ─── */}
        <ProfileBio profile={profile} />

        {/* ─── Coach Studio Card (nur Mentoren) ─── */}
        <ProfileStudioCard profile={profile} />

        {/* ─── Interest Tags ─── */}
        <ProfileInterests profile={profile} />

        {/* ─── Stats (Beitraege/Kontakte/Circles) ─── */}
        <ProfileStats profile={profile} />

        {/* ─── Seeds + Einladungen Chips ─── */}
        <ProfilePrivateRow
          profile={profile}
          onSeedsClick={() => openPanel('seeds')}
          onReferralClick={() => openPanel('referral')}
        />

        {/* ═══════════════════════════════════════════
            PANELS
        ═══════════════════════════════════════════ */}

        <SettingsPanel
          isOpen={activePanel === 'settings'}
          onClose={closePanel}
        />

        <SeedsPanel
          isOpen={activePanel === 'seeds'}
          onClose={closePanel}
          profile={profile}
        />

        <ReferralPanel
          isOpen={activePanel === 'referral'}
          onClose={closePanel}
          profile={profile}
        />

        <EditProfilePanel
          isOpen={activePanel === 'edit'}
          onClose={closePanel}
          profile={profile}
          onProfileUpdated={handleProfileUpdated}
        />

        <VisitenkarteOverlay
          isOpen={activePanel === 'visitenkarte'}
          onClose={closePanel}
          profile={profile}
        />
      </div>
    </div>
  );
}
