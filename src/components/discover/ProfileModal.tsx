'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import type { MapNearbyUser } from './MapView';
import type { PublicProfile } from '@/lib/users';
import type { ConnectionStatus } from '@/types/circles';
import { SOUL_LEVEL_NAMES } from '@/types/profile';
import { fetchPublicProfile } from '@/lib/users';
import EnsoRing from '@/components/ui/EnsoRing';
import { Icon } from '@/components/ui/Icon';

interface Props {
  user: MapNearbyUser;
  userId?: string | null;
  connectionStatus?: ConnectionStatus;
  onConnect?: () => void;
  connecting?: boolean;
  onClose: () => void;
}

export default function ProfileModal({
  user,
  userId,
  connectionStatus = 'none',
  onConnect,
  connecting,
  onClose,
}: Props) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const [fullProfile, setFullProfile] = useState<PublicProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Vollstaendiges Profil nachladen
  useEffect(() => {
    if (!user.username) return;
    setLoadingProfile(true);
    fetchPublicProfile(user.username)
      .then(setFullProfile)
      .catch(() => {
        // Fallback: nur MapNearbyUser-Daten nutzen
      })
      .finally(() => setLoadingProfile(false));
  }, [user.username]);

  // Klick auf Backdrop schliesst Modal
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === backdropRef.current) {
        onClose();
      }
    },
    [onClose],
  );

  // Escape schliesst Modal
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Daten: Vollprofil bevorzugen, Fallback auf MapNearbyUser
  const displayName = fullProfile?.display_name ?? user.display_name ?? user.username ?? 'Anonym';
  const initials = displayName.slice(0, 1).toUpperCase();
  const avatarUrl = fullProfile?.avatar_url ?? user.avatar_url;
  const bannerUrl = fullProfile?.banner_url ?? null;
  const bio = fullProfile?.bio ?? user.bio;
  const location = fullProfile?.location ?? user.location;
  const soulLevel = fullProfile?.soul_level ?? user.soul_level;
  const isFirstLight = fullProfile?.is_first_light ?? user.is_first_light;
  const connectionsCount = fullProfile?.connections_count ?? user.connections_count;
  const pulsesCount = fullProfile?.pulses_count ?? 0;
  const interests = fullProfile?.interests ?? [];
  const createdAt = fullProfile?.created_at ?? null;
  const username = fullProfile?.username ?? user.username;
  const vipName = SOUL_LEVEL_NAMES[soulLevel] ?? `Level ${soulLevel}`;

  // ── Action Button ─────────────────────────────────────────
  const renderActionButton = () => {
    if (!userId || user.id === userId) return null;

    if (connectionStatus === 'connected') {
      return (
        <span
          className="py-2.5 px-8 rounded-full font-label text-[0.7rem] tracking-[0.1em] uppercase"
          style={{ border: '1px solid var(--success-border)', color: 'var(--success)' }}
        >
          Verbunden
        </span>
      );
    }

    if (connectionStatus === 'pending_outgoing') {
      return (
        <span
          className="py-2.5 px-8 rounded-full font-label text-[0.7rem] tracking-[0.1em] uppercase"
          style={{ border: '1px solid var(--gold-border-s)', color: 'var(--text-muted)' }}
        >
          Angefragt
        </span>
      );
    }

    if (connectionStatus === 'pending_incoming') {
      return (
        <span
          className="py-2.5 px-8 rounded-full font-label text-[0.7rem] tracking-[0.1em] uppercase"
          style={{ border: '1px solid var(--gold-border-s)', color: 'var(--gold-text)' }}
        >
          Anfrage erhalten
        </span>
      );
    }

    return (
      <button
        onClick={onConnect}
        disabled={connecting}
        className="py-2.5 px-8 rounded-full font-label text-[0.7rem] tracking-[0.1em] uppercase transition-all duration-200"
        style={{
          background: connecting ? 'var(--gold-bg)' : 'linear-gradient(135deg, var(--gold-deep), var(--gold))',
          color: connecting ? 'var(--text-muted)' : 'var(--text-on-gold)',
          cursor: connecting ? 'not-allowed' : 'pointer',
        }}
      >
        {connecting ? '...' : 'Verbinden'}
      </button>
    );
  };

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="absolute inset-0 z-30 flex items-center justify-center overflow-y-auto py-4"
      style={{ background: 'rgba(0,0,0,.5)' }}
    >
      <div
        className="relative mx-4 w-full max-w-[420px] animate-slide-up"
        style={{ maxHeight: 'calc(100% - 32px)' }}
      >
        <div
          className="rounded-[18px] overflow-hidden"
          style={{
            background: 'var(--bg-solid)',
            border: '1px solid var(--glass-border)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.35)',
          }}
        >
          {/* ─── BANNER (140px) ─────────────────────────── */}
          <div className="relative w-full h-[140px] overflow-hidden">
            {bannerUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={bannerUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div
                className="w-full h-full"
                style={{ background: 'linear-gradient(135deg, #D8CFBE 0%, var(--gold) 50%, #B08840 100%)' }}
              />
            )}
            {/* Gradient Overlay */}
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, var(--bg-solid) 0%, transparent 60%)' }}
            />

            {/* Schliessen-Button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer z-10 transition-colors"
              style={{
                background: 'rgba(0,0,0,.35)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,.2)',
              }}
            >
              <Icon name="x" size={14} />
            </button>
          </div>

          {/* ─── AVATAR im Enso Ring (88px, zentriert) ── */}
          <div className="flex justify-center -mt-[44px] relative z-10">
            <EnsoRing
              soulLevel={soulLevel}
              isFirstLight={isFirstLight}
              size="profile"
            >
              <div
                className="w-full h-full rounded-full flex items-center justify-center font-heading text-[22px] overflow-hidden"
                style={{
                  background: 'var(--avatar-bg)',
                  color: 'var(--gold-text)',
                }}
              >
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : initials}
              </div>
            </EnsoRing>
          </div>

          {/* ─── BODY (zentriert) ──────────────────────── */}
          <div className="px-5 pb-5 pt-3 text-center">
            {/* Name */}
            <div
              className="text-[18px] font-heading italic mb-[2px]"
              style={{ color: 'var(--text-h)' }}
            >
              {displayName}
            </div>

            {/* Handle + Soul Level */}
            <div
              className="text-[11px] mb-[10px]"
              style={{ color: 'var(--text-muted)' }}
            >
              {username ? `@${username}` : ''}
              {username && ' · '}
              {vipName}
              {isFirstLight && ' · First Light'}
            </div>

            {/* Bio */}
            {bio && (
              <div
                className="text-[12px] leading-[1.65] mx-auto max-w-[320px] mb-[14px]"
                style={{ color: 'var(--text-body)' }}
              >
                {bio}
              </div>
            )}

            {/* Stats */}
            <div className="flex justify-center gap-6 mb-[14px]">
              <div>
                <span className="block text-[16px]" style={{ color: 'var(--text-h)' }}>
                  {pulsesCount}
                </span>
                <span className="text-[9px] tracking-[1.5px] uppercase" style={{ color: 'var(--text-muted)' }}>
                  Beitraege
                </span>
              </div>
              <div>
                <span className="block text-[16px]" style={{ color: 'var(--text-h)' }}>
                  {connectionsCount}
                </span>
                <span className="text-[9px] tracking-[1.5px] uppercase" style={{ color: 'var(--text-muted)' }}>
                  Kontakte
                </span>
              </div>
              <div>
                <span className="block text-[16px]" style={{ color: 'var(--text-h)' }}>
                  0
                </span>
                <span className="text-[9px] tracking-[1.5px] uppercase" style={{ color: 'var(--text-muted)' }}>
                  Circles
                </span>
              </div>
            </div>

            {/* Interest Tags (nur wenn vollstaendiges Profil geladen) */}
            {interests.length > 0 && (
              <div className="flex flex-wrap justify-center gap-[6px] mb-[14px]">
                {interests.map((tag) => (
                  <span
                    key={tag}
                    className="text-[8px] tracking-[1.5px] uppercase px-[10px] py-[4px] rounded-[12px] inline-block"
                    style={{
                      color: 'var(--gold-text)',
                      border: '1px solid var(--gold-border)',
                      background: 'var(--gold-bg)',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Loading Shimmer fuer Profildaten */}
            {loadingProfile && interests.length === 0 && (
              <div className="flex justify-center gap-[6px] mb-[14px]">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-[18px] w-16 rounded-[12px] animate-pulse"
                    style={{ background: 'var(--glass)' }}
                  />
                ))}
              </div>
            )}

            {/* Action Button */}
            <div className="mb-[14px]">
              {renderActionButton()}
            </div>

            {/* Meta Row */}
            <div
              className="flex flex-wrap justify-center gap-4 pt-3 text-[10px]"
              style={{ color: 'var(--text-sec)', borderTop: '1px solid var(--divider-l)' }}
            >
              {location && (
                <span className="flex items-center gap-1"><Icon name="map-pin" size={12} /> {location}</span>
              )}
              {createdAt && (
                <span className="flex items-center gap-1">
                  <Icon name="heart" size={12} /> Seit {new Date(createdAt).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
                </span>
              )}
              {isFirstLight && (
                <span className="flex items-center gap-1"><Icon name="sparkles" size={12} /> First Light</span>
              )}
            </div>

            {/* Profil ansehen Link */}
            {username && (
              <div className="mt-4">
                <Link
                  href={`/u/${username}`}
                  className="inline-flex items-center gap-1.5 py-2 px-6 rounded-full font-label text-[0.65rem] tracking-[0.1em] uppercase transition-colors duration-200"
                  style={{
                    border: '1px solid var(--gold-border-s)',
                    color: 'var(--gold-text)',
                  }}
                >
                  <Icon name="user" size={12} />
                  Profil ansehen
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
