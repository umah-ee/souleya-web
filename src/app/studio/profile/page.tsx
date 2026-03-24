'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Profile } from '@/types/profile';
import { fetchProfile, updateProfile } from '@/lib/profile';

// Profil-Komponenten (wiederverwendet)
import ProfileBanner from '../../(main)/profile/components/ProfileBanner';
import ProfileIdentity from '../../(main)/profile/components/ProfileIdentity';
import ProfileBio from '../../(main)/profile/components/ProfileBio';
import ProfileMentorSection from '../../(main)/profile/components/ProfileMentorSection';
import ProfileInterests from '../../(main)/profile/components/ProfileInterests';
import ProfilePrivateRow from '../../(main)/profile/components/ProfilePrivateRow';

// Panels (wiederverwendet)
import SettingsPanel from '../../(main)/profile/panels/SettingsPanel';
import SeedsPanel from '../../(main)/profile/panels/SeedsPanel';
import ReferralPanel from '../../(main)/profile/panels/ReferralPanel';
import EditProfilePanel from '../../(main)/profile/panels/EditProfilePanel';

type PanelType = 'settings' | 'seeds' | 'referral' | 'edit' | null;

export default function StudioProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePanel, setActivePanel] = useState<PanelType>(null);

  useEffect(() => {
    fetchProfile()
      .then(setProfile)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const openPanel = (panel: PanelType) => setActivePanel(panel);
  const closePanel = () => setActivePanel(null);

  const handleProfileUpdated = (updated: Profile) => {
    setProfile(updated);
  };

  if (loading) {
    return <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', paddingTop: 40 }}>Lade …</p>;
  }

  if (!profile) {
    return <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', paddingTop: 40 }}>Profil nicht gefunden.</p>;
  }

  return (
    <div className="max-w-[700px] mx-auto">
      {/* Banner (mit Settings + Edit Buttons) */}
      <ProfileBanner
        profile={profile}
        onSettingsClick={() => openPanel('settings')}
        onEditClick={() => openPanel('edit')}
        onRepositionSave={async (posX, posY) => {
          try {
            const updated = await updateProfile({ banner_pos_x: posX, banner_pos_y: posY });
            setProfile(updated);
          } catch { /* ignore */ }
        }}
      />

      {/* Identity (EnsoRing + Name) */}
      <ProfileIdentity profile={profile} />

      {/* Bio + Location */}
      <ProfileBio profile={profile} />

      {/* Mentor-Sektion (einklappbar) */}
      <ProfileMentorSection profile={profile} onUpdate={async (data) => {
        try {
          const updated = await updateProfile(data);
          setProfile(updated);
        } catch { /* ignore */ }
      }} />

      {/* Interests */}
      <ProfileInterests profile={profile} />

      {/* Seeds + Einladungen */}
      <ProfilePrivateRow
        profile={profile}
        onSeedsClick={() => openPanel('seeds')}
        onReferralClick={() => openPanel('referral')}
      />

      {/* ── Panels (Overlays, bleiben im Studio) ────── */}
      <SettingsPanel
        isOpen={activePanel === 'settings'}
        onClose={closePanel}
        postsVisibility={profile.posts_visibility ?? 'circle'}
        onPostsVisibilityChange={async (v) => {
          try {
            const updated = await updateProfile({ posts_visibility: v });
            setProfile(updated);
          } catch { /* ignore */ }
        }}
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
    </div>
  );
}
