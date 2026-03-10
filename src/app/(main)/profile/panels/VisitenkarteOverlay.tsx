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
 * Business-Card Overlay (zentriert, nicht slide-up).
 * Opaker Hintergrund (var(--bg-solid)), kein Glasmorphism.
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
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,.60)' }}
        onClick={onClose}
      />

      {/* Card */}
      <div
        className="relative w-full max-w-[360px] rounded-[24px] overflow-hidden animate-slide-up"
        style={{
          background: 'var(--bg-solid)',
          boxShadow: '0 20px 60px rgba(0,0,0,.40)',
        }}
      >
        {/* Mini-Banner */}
        <div className="relative w-full h-[80px] overflow-hidden">
          {profile.banner_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.banner_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div
              className="w-full h-full"
              style={{ background: 'linear-gradient(135deg, #D8CFBE 0%, var(--gold) 50%, #B08840 100%)' }}
            />
          )}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, var(--bg-solid) 0%, transparent 80%)' }}
          />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer"
            style={{ background: 'rgba(0,0,0,.35)', color: '#fff', border: 'none' }}
          >
            <Icon name="x" size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 pb-5 -mt-[28px] text-center relative z-10">
          {/* Avatar */}
          <div className="flex justify-center">
            <EnsoRing soulLevel={profile.soul_level} isFirstLight={profile.is_first_light} size="feed">
              <div
                className="w-full h-full rounded-full flex items-center justify-center text-[12px] font-heading overflow-hidden"
                style={{ background: 'var(--avatar-bg)', color: 'var(--gold-text)' }}
              >
                {profile.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : initials}
              </div>
            </EnsoRing>
          </div>

          {/* Name */}
          <h3
            className="mt-2 text-[22px] font-heading italic"
            style={{ color: 'var(--text-h)' }}
          >
            {profile.display_name ?? profile.email}
          </h3>

          {/* Handle + Level */}
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-sec)' }}>
            {profile.username ? `@${profile.username}` : profile.email} · {vipName}
          </p>

          {/* Bio (gekuerzt) */}
          {profile.bio && (
            <p
              className="text-[13px] leading-[1.6] mt-3 mx-auto max-w-[280px] line-clamp-2"
              style={{ color: 'var(--text-body)' }}
            >
              {profile.bio}
            </p>
          )}

          {/* Tags (max 4) */}
          {interests.length > 0 && (
            <div className="flex flex-wrap justify-center gap-[6px] mt-3">
              {interests.map((tag) => (
                <span
                  key={tag}
                  className="text-[9px] font-label tracking-[0.8px] uppercase px-[10px] py-[3px] rounded-full"
                  style={{ color: 'var(--gold-text)', border: '1px solid var(--gold-border)', background: 'var(--gold-bg)' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 mt-5">
            <button
              className="flex-1 py-2.5 rounded-full font-label text-[10px] tracking-[0.8px] uppercase"
              style={{
                background: 'linear-gradient(135deg, var(--gold-deep), var(--gold))',
                color: 'var(--text-on-gold)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Verbinden
            </button>
            <button
              className="py-2.5 px-4 rounded-full"
              style={{
                border: '1px solid var(--gold-border-s)',
                color: 'var(--gold-text)',
                background: 'transparent',
                cursor: 'pointer',
              }}
            >
              <Icon name="message" size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
