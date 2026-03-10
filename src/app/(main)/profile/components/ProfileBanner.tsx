'use client';

import type { Profile } from '@/types/profile';
import { Icon } from '@/components/ui/Icon';

interface ProfileBannerProps {
  profile: Profile;
  /** Drei Action-Buttons oben rechts */
  onSettingsClick: () => void;
  onShareClick: () => void;
  onEditClick: () => void;
}

export default function ProfileBanner({
  profile,
  onSettingsClick,
  onShareClick,
  onEditClick,
}: ProfileBannerProps) {
  return (
    <div className="relative w-full h-[200px] overflow-hidden">
      {/* Banner-Bild oder Gradient-Fallback */}
      {profile.banner_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={profile.banner_url} alt="" className="w-full h-full object-cover" />
      ) : (
        <div
          className="w-full h-full"
          style={{ background: 'linear-gradient(135deg, #D8CFBE 0%, var(--gold) 50%, #B08840 100%)' }}
        />
      )}

      {/* Gradient Overlay (fade to bg) */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, var(--bg-solid) 0%, transparent 60%)' }}
      />

      {/* Action Buttons (oben rechts) */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <button
          onClick={onShareClick}
          className="w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-opacity hover:opacity-80"
          style={{
            background: 'rgba(0,0,0,.35)',
            border: '1px solid rgba(255,255,255,.12)',
            color: '#fff',
          }}
          title="Teilen"
        >
          <Icon name="share" size={14} />
        </button>
        <button
          onClick={onEditClick}
          className="w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-opacity hover:opacity-80"
          style={{
            background: 'rgba(0,0,0,.35)',
            border: '1px solid rgba(255,255,255,.12)',
            color: '#fff',
          }}
          title="Profil bearbeiten"
        >
          <Icon name="edit" size={14} />
        </button>
        <button
          onClick={onSettingsClick}
          className="w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-opacity hover:opacity-80"
          style={{
            background: 'rgba(0,0,0,.35)',
            border: '1px solid rgba(255,255,255,.12)',
            color: '#fff',
          }}
          title="Einstellungen"
        >
          <Icon name="settings" size={14} />
        </button>
      </div>
    </div>
  );
}
