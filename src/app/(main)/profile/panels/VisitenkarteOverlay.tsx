'use client';

import { useEffect, useCallback } from 'react';
import type { Profile } from '@/types/profile';
import { SOUL_LEVEL_NAMES } from '@/types/profile';
import EnsoRing from '@/components/ui/EnsoRing';
import { Icon } from '@/components/ui/Icon';

interface VisitenkarteOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
}

/**
 * Visitenkarte — Business-Card Overlay (zentriert, scale-Animation).
 * Exakt nach Mockup: Souleya_Profile_Redesign_Mockup.html
 *
 * Layout: Banner(90px) → Avatar(72px, -36px) → Body(Name 24px, Handle 12px,
 * Level 10px text, Bio 14px, Meta 12px, Interests, Mutual, Actions 14px-radius)
 */
export default function VisitenkarteOverlay({ isOpen, onClose, profile }: VisitenkarteOverlayProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const initials = (profile.display_name ?? profile.username ?? '?').slice(0, 1).toUpperCase();
  const vipName = SOUL_LEVEL_NAMES[profile.soul_level] ?? `Level ${profile.soul_level}`;
  const interests = (profile.interests ?? []).slice(0, 4);

  const handleShare = async () => {
    const url = `https://souleya.com/@${profile.username ?? profile.referral_code}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ padding: '20px' }}>
      {/* Backdrop — Mockup: rgba(0,0,0,.55) */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,.55)' }}
        onClick={onClose}
      />

      {/* Card — Mockup: 340px (420px web), bg-elevated, border, radius-xl(32px) */}
      <div
        className="relative w-full max-w-[420px] overflow-hidden animate-scale-in"
        style={{
          background: 'var(--bg-elevated)',
          borderRadius: '32px',
          border: '1px solid var(--divider-l)',
          boxShadow: '0 20px 60px rgba(0,0,0,.35)',
        }}
      >
        {/* ─── Banner (90px) ─── */}
        <div
          className="relative w-full h-[90px] overflow-hidden"
          style={{ background: 'linear-gradient(135deg, var(--gold-bg) 0%, var(--bg-elevated) 100%)' }}
        >
          {profile.banner_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.banner_url} alt="" className="w-full h-full object-cover" style={{ opacity: 0.5 }} />
          )}

          {/* Close — Mockup: right 10px, top 10px, 28px, rgba(0,0,0,.35) */}
          <button
            onClick={onClose}
            className="absolute flex items-center justify-center cursor-pointer"
            style={{
              right: '10px',
              top: '10px',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'rgba(0,0,0,.35)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              color: '#fff',
              border: 'none',
            }}
          >
            <Icon name="x" size={12} />
          </button>
        </div>

        {/* ─── Avatar (72px, -36px overlap) ─── */}
        <div className="flex justify-center -mt-[36px] relative z-10">
          <EnsoRing soulLevel={profile.soul_level} isFirstLight={profile.is_first_light} size="feed">
            <div
              className="w-full h-full rounded-full flex items-center justify-center font-heading text-[24px] overflow-hidden"
              style={{
                background: 'var(--avatar-bg)',
                color: 'var(--text-body)',
                boxShadow: '0 4px 16px rgba(0,0,0,.15)',
              }}
            >
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : initials}
            </div>
          </EnsoRing>
        </div>

        {/* ─── Body — Mockup: padding 12px 24px 24px ─── */}
        <div style={{ padding: '12px 24px 24px', textAlign: 'center' }}>
          {/* Name — Mockup: 24px, serif italic, weight 500 */}
          <div
            className="font-heading italic leading-[1.2]"
            style={{ fontSize: '24px', fontWeight: 500, color: 'var(--text-h)' }}
          >
            {profile.display_name ?? profile.email}
          </div>

          {/* Handle — Mockup: 12px, weight 400, text-s */}
          {profile.username && (
            <div style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text-sec)', marginTop: '2px' }}>
              @{profile.username}
            </div>
          )}

          {/* Level — Mockup: 10px, weight 500, uppercase, letter-spacing 1.2px, plain text (NO badge!) */}
          <div
            className="font-label"
            style={{
              fontSize: '10px',
              fontWeight: 500,
              letterSpacing: '1.2px',
              textTransform: 'uppercase' as const,
              color: 'var(--text-sec)',
              marginTop: '6px',
            }}
          >
            {vipName} · Level {profile.soul_level}
          </div>

          {/* Bio — Mockup: 14px, weight 500, line-height 1.6, line-clamp-2, margin-top 14px */}
          {profile.bio && (
            <div
              className="line-clamp-2"
              style={{
                fontSize: '14px',
                fontWeight: 500,
                lineHeight: 1.6,
                color: 'var(--text-body)',
                marginTop: '14px',
                maxHeight: '3.2em',
                overflow: 'hidden',
              }}
            >
              {profile.bio}
            </div>
          )}

          {/* Meta — Mockup: 12px, weight 500, gap 14px, margin-top 12px */}
          <div
            className="flex items-center justify-center"
            style={{ gap: '14px', marginTop: '12px', fontSize: '12px', fontWeight: 500, color: 'var(--text-sec)' }}
          >
            {profile.location && (
              <span className="flex items-center gap-1">
                <Icon name="map-pin" size={12} />
                {profile.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Icon name="users" size={12} />
              {profile.connections_count} Kontakte
            </span>
          </div>

          {/* Interests — Mockup: 10px, bg-glass, border, radius 12px, gap 6px */}
          {interests.length > 0 && (
            <div className="flex flex-wrap justify-center" style={{ gap: '6px', marginTop: '14px' }}>
              {interests.map((tag) => (
                <span
                  key={tag}
                  className="font-label"
                  style={{
                    fontSize: '10px',
                    fontWeight: 500,
                    letterSpacing: '0.8px',
                    textTransform: 'uppercase' as const,
                    padding: '4px 10px',
                    borderRadius: '12px',
                    background: 'var(--glass)',
                    border: '1px solid var(--divider-l)',
                    color: 'var(--text-sec)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Mutual Connections — Mockup: border-top, 12px, weight 500, avatar circles */}
          <div
            className="flex items-center justify-center"
            style={{
              gap: '6px',
              marginTop: '16px',
              paddingTop: '14px',
              borderTop: '1px solid var(--divider-l)',
              fontSize: '12px',
              fontWeight: 500,
              color: 'var(--text-sec)',
            }}
          >
            {/* Avatar circles (placeholder) */}
            <div className="flex" style={{ marginRight: '2px' }}>
              {['LW', 'JR'].map((initials, i) => (
                <div
                  key={initials}
                  className="flex items-center justify-center font-label"
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: 'var(--glass)',
                    border: '2px solid var(--bg-elevated)',
                    fontSize: '8px',
                    color: 'var(--text-sec)',
                    marginLeft: i > 0 ? '-6px' : 0,
                  }}
                >
                  {initials}
                </div>
              ))}
            </div>
            2 gemeinsame Kontakte
          </div>

          {/* Actions — Mockup: flex, gap 10px, margin-top 18px */}
          <div className="flex" style={{ gap: '10px', marginTop: '18px' }}>
            {/* Primary: Teilen — Mockup: solid gold, radius 14px */}
            <button
              onClick={handleShare}
              className="flex-1 font-label cursor-pointer"
              style={{
                padding: '10px 0',
                borderRadius: '14px',
                fontSize: '10px',
                fontWeight: 500,
                letterSpacing: '1.2px',
                textTransform: 'uppercase' as const,
                background: 'var(--gold)',
                color: 'var(--text-on-gold)',
                border: 'none',
                boxShadow: '0 4px 16px var(--gold-glow)',
              }}
            >
              Teilen
            </button>
            {/* Secondary: Schliessen — Mockup: glass bg, border */}
            <button
              onClick={onClose}
              className="flex-1 font-label cursor-pointer"
              style={{
                padding: '10px 0',
                borderRadius: '14px',
                fontSize: '10px',
                fontWeight: 500,
                letterSpacing: '1.2px',
                textTransform: 'uppercase' as const,
                background: 'var(--glass)',
                color: 'var(--text-body)',
                border: '1px solid var(--divider-l)',
              }}
            >
              Schliessen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
