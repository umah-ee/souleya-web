'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';
import { fetchProfile, updateProfile } from '@/lib/profile';
import type { Profile, UpdateProfileData } from '@/types/profile';
import { createClient } from '@/lib/supabase/client';

// Profil-Komponenten (wiederverwendet aus dem Community-Profil)
import ProfileBanner from '../../(main)/profile/components/ProfileBanner';
import ProfileIdentity from '../../(main)/profile/components/ProfileIdentity';
import ProfileBio from '../../(main)/profile/components/ProfileBio';
import ProfileMentorSection from '../../(main)/profile/components/ProfileMentorSection';
import ProfileInterests from '../../(main)/profile/components/ProfileInterests';

export default function StudioProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile()
      .then(setProfile)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = async (data: UpdateProfileData) => {
    try {
      const updated = await updateProfile(data);
      setProfile(updated);
    } catch { /* ignore */ }
  };

  if (loading) {
    return <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', paddingTop: 40 }}>Lade …</p>;
  }

  if (!profile) {
    return <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', paddingTop: 40 }}>Profil nicht gefunden.</p>;
  }

  return (
    <div className="max-w-[700px] mx-auto">
      {/* Banner */}
      <ProfileBanner profile={profile} />

      {/* Identity (EnsoRing + Name) */}
      <ProfileIdentity profile={profile} />

      {/* Bio + Location */}
      <ProfileBio profile={profile} />

      {/* Mentor-Sektion (einklappbar) */}
      <ProfileMentorSection profile={profile} onUpdate={handleUpdate} />

      {/* Interests */}
      <ProfileInterests profile={profile} />

      {/* Quick Links */}
      <div className="px-6 mt-6 flex flex-col gap-2">
        <button
          onClick={() => window.open('/profile', '_blank')}
          className="w-full flex items-center gap-2 p-3 rounded-[8px] border-none cursor-pointer text-left"
          style={{ background: 'var(--glass)', border: '1px solid var(--gold-border-s)', fontSize: 12, color: 'var(--text-sec)' }}
        >
          <Icon name="edit" size={14} style={{ color: 'var(--gold)' }} />
          Profil vollstaendig bearbeiten
          <Icon name="chevron-right" size={12} style={{ color: 'var(--text-muted)', marginLeft: 'auto' }} />
        </button>
        <button
          onClick={async () => {
            const supabase = createClient();
            await supabase.auth.signOut();
            router.push('/login');
          }}
          className="w-full flex items-center gap-2 p-3 rounded-[8px] border-none cursor-pointer text-left"
          style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', fontSize: 12, color: 'var(--danger)' }}
        >
          <Icon name="logout" size={14} />
          Abmelden
        </button>
      </div>
    </div>
  );
}
