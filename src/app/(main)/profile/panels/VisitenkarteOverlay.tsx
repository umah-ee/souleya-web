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
 * Business-Card Overlay (zentriert, scale-Animation).
 * Mockup: 420px Breite, var(--bg-elevated), border 1px solid var(--divider-l),
 * border-radius 32px, scale(.92)→scale(1) Animation.
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,.55)' }}
        onClick={onClose}
      />

      {/* Card — Mockup: 420px, bg-elevated, border, rounded-[32px], scale animation */}
      <div
        className="relative w-full max-w-[420px] overflow-hidden animate-scale-in"
        style={{
          background: 'var(--bg-elevated)',
          borderRadius: '32px',
          border: '1px solid var(--divider-l)',
          boxShadow: '0 20px 60px rgba(0,0,0,.35)',
        }}
      >
        {/* ─── Banner (90px, Mockup) ─── */}
        <div className="relative w-full h-[90px] overflow-hidden">
          {profile.banner_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.banner_url} alt="" className="w-full h-full object-cover" style={{ opacity: 0.5 }} />
          ) : (
            <div
              className="w-full h-full"
              style={{ background: 'linear-gradient(135deg, var(--gold-bg) 0%, var(--bg-elevated) 100%)' }}
            />
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-colors"
            style={{
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

        {/* ─── Avatar (72px, zentriert, -36px overlap) ─── */}
        <div className="flex justify-center -mt-[36px] relative z-10">
          <EnsoRing soulLevel={profile.soul_level} isFirstLight={profile.is_first_light} size="feed">
            <div
              className="w-full h-full rounded-full flex items-center justify-center text-[12px] font-heading overflow-hidden"
              style={{
                background: 'var(--avatar-bg)',
                color: 'var(--gold-text)',
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

        {/* ─── Body ─── */}
        <div className="px-6 pb-6 pt-3 text-center">
          {/* Name — Mockup: 24px, weight 500, italic */}
          <h3
            className="text-[24px] font-heading italic leading-[1.2]"
            style={{ color: 'var(--text-h)', fontWeight: 500 }}
          >
            {profile.display_name ?? profile.email}
          </h3>

          {/* Handle — Mockup: 12px */}
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-sec)' }}>
            {profile.username ? `@${profile.username}` : profile.email}
          </p>

          {/* Level Badge */}
          <div className="mt-2">
            <span
              className="inline-block text-[10px] font-label tracking-[1.2px] uppercase px-3 py-[3px] rounded-[12px]"
              style={{
                color: 'var(--gold-text)',
                background: 'var(--gold-bg)',
                border: '1px solid var(--gold-border)',
              }}
            >
              {vipName}
            </span>
          </div>

          {/* Bio — Mockup: 14px, weight 500, line-clamp-2 */}
          {profile.bio && (
            <p
              className="text-[14px] leading-[1.6] mt-3.5 mx-auto max-w-[320px] line-clamp-2"
              style={{ color: 'var(--text-body)', fontWeight: 500 }}
            >
              {profile.bio}
            </p>
          )}

          {/* Meta — Location + Member Since */}
          <div
            className="flex items-center justify-center gap-3.5 mt-3 text-[12px]"
            style={{ color: 'var(--text-sec)', fontWeight: 500 }}
          >
            {profile.location && (
              <span className="flex items-center gap-1">
                <Icon name="map-pin" size={12} /> {profile.location}
              </span>
            )}
            {profile.created_at && (
              <span className="flex items-center gap-1">
                <Icon name="heart" size={12} /> Seit {new Date(profile.created_at).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
              </span>
            )}
          </div>

          {/* Tags (max 4) — Mockup: bg-glass, border, 10px uppercase */}
          {interests.length > 0 && (
            <div className="flex flex-wrap justify-center gap-[6px] mt-3.5">
              {interests.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-label tracking-[0.8px] uppercase px-[10px] py-[4px] rounded-[12px]"
                  style={{
                    color: 'var(--text-sec)',
                    border: '1px solid var(--divider-l)',
                    background: 'var(--glass)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Mutual Connections (Placeholder) */}
          <div
            className="flex items-center justify-center gap-1.5 mt-4 pt-3.5 text-[12px]"
            style={{
              color: 'var(--text-sec)',
              fontWeight: 500,
              borderTop: '1px solid var(--divider-l)',
            }}
          >
            <span>3 gemeinsame Kontakte</span>
          </div>

          {/* Action Buttons — Mockup: gap 10px, border-radius 14px, solid gold */}
          <div className="flex gap-[10px] mt-[18px]">
            <button
              className="flex-1 py-[10px] font-label text-[10px] tracking-[1.2px] uppercase cursor-pointer transition-all duration-200"
              style={{
                background: 'var(--gold)',
                color: 'var(--text-on-gold)',
                border: 'none',
                borderRadius: '14px',
                boxShadow: '0 4px 16px var(--gold-glow)',
              }}
            >
              Verbinden
            </button>
            <button
              className="flex-1 py-[10px] font-label text-[10px] tracking-[1.2px] uppercase cursor-pointer transition-all duration-200"
              style={{
                background: 'var(--glass)',
                color: 'var(--text-body)',
                border: '1px solid var(--divider-l)',
                borderRadius: '14px',
              }}
            >
              Nachricht
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
