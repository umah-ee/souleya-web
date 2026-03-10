'use client';

import type { Profile } from '@/types/profile';
import { Icon } from '@/components/ui/Icon';

interface ProfileBannerProps {
  profile: Pick<Profile, 'banner_url'>;
  /** Optional: Zeigt Edit-Button nur wenn gesetzt */
  onSettingsClick?: () => void;
  onEditClick?: () => void;
}

/**
 * Profile Banner — exakt nach Mockup
 *
 * Buttons: 36px circle, blur(12px), bg rgba(0,0,0,.3), color rgba(255,255,255,.75)
 * Hover: scale(1.05) + bg rgba(0,0,0,.5)
 * Overlay: 3-Stop Gradient (bg-card 0%, rgba 40%, rgba 100%)
 */
export default function ProfileBanner({
  profile,
  onSettingsClick,
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

      {/* Gradient Overlay — Mockup: 3-Stop (bg-card 0%, rgba 40%, rgba 100%) */}
      <div
        className="absolute inset-0 banner-overlay"
        style={{
          background: 'linear-gradient(to top, var(--bg-card) 0%, rgba(0,0,0,.15) 40%, rgba(0,0,0,.02) 100%)',
        }}
      />

      {/* Action Buttons — Mockup: nur Edit + Settings, 36px, blur(12px) */}
      {(onEditClick || onSettingsClick) && (
      <div className="absolute top-4 right-4 flex items-center gap-2">
        {onEditClick && <button
          onClick={onEditClick}
          className="flex items-center justify-center cursor-pointer transition-all duration-200"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(0,0,0,.3)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,.12)',
            color: 'rgba(255,255,255,.75)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.background = 'rgba(0,0,0,.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.background = 'rgba(0,0,0,.3)';
          }}
          title="Profil bearbeiten"
        >
          <Icon name="edit" size={16} />
        </button>}
        {onSettingsClick && <button
          onClick={onSettingsClick}
          className="flex items-center justify-center cursor-pointer transition-all duration-200"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(0,0,0,.3)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,.12)',
            color: 'rgba(255,255,255,.75)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.background = 'rgba(0,0,0,.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.background = 'rgba(0,0,0,.3)';
          }}
          title="Einstellungen"
        >
          <Icon name="settings" size={16} />
        </button>}
      </div>
      )}
    </div>
  );
}
