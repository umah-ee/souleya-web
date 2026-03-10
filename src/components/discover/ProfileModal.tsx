'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import type { MapNearbyUser } from './MapView';
import type { PublicProfile } from '@/lib/users';
import type { ConnectionStatus } from '@/types/circles';
import { SOUL_LEVEL_NAMES } from '@/types/profile';
import { fetchPublicProfile } from '@/lib/users';
import { useTheme } from '@/components/ThemeProvider';
import { Icon } from '@/components/ui/Icon';

interface Props {
  user: MapNearbyUser;
  userId?: string | null;
  connectionStatus?: ConnectionStatus;
  onConnect?: () => void;
  connecting?: boolean;
  onClose: () => void;
}

/**
 * ProfileModal — Visitenkarte-Style Overlay fuer Discover-Map
 * Exakt nach Mockup: Souleya_Profile_Redesign_Mockup.html (.vcard)
 *
 * Layout: Banner(90px) → Avatar(72px, -36px) → Body(Name 24px, Handle 12px,
 * Level 10px, Bio 14px, Meta 12px, Interests, Mutual, Actions 14px-radius)
 */
export default function ProfileModal({
  user,
  userId,
  connectionStatus = 'none',
  onConnect,
  connecting,
  onClose,
}: Props) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const { colorScheme } = useTheme();
  const [fullProfile, setFullProfile] = useState<PublicProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const isDusk = colorScheme === 'dusk';
  const primaryBtnBg = isDusk
    ? 'linear-gradient(135deg, #A78BFA, #F472B6)'
    : 'var(--gold)';
  const primaryBtnShadow = isDusk
    ? '0 4px 16px rgba(167,139,250,.22)'
    : '0 4px 16px var(--gold-glow)';

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
      if (e.target === backdropRef.current) onClose();
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
  const connectionsCount = fullProfile?.connections_count ?? user.connections_count;
  const interests = (fullProfile?.interests ?? []).slice(0, 4);
  const username = fullProfile?.username ?? user.username;
  const vipName = SOUL_LEVEL_NAMES[soulLevel] ?? `Level ${soulLevel}`;

  // ── Connection Button ───────────────────────────────────
  const renderConnectionButton = () => {
    if (!userId || user.id === userId) {
      // Eigenes Profil: kein Vernetzen-Button, nur Profil ansehen
      return null;
    }

    if (connectionStatus === 'connected') {
      return (
        <button
          className="flex-1 font-label cursor-default"
          style={{
            padding: '10px 0',
            borderRadius: '14px',
            fontSize: '10px',
            fontWeight: 500,
            letterSpacing: '1.2px',
            textTransform: 'uppercase',
            background: 'var(--success-bg)',
            color: 'var(--success)',
            border: '1px solid var(--success-border)',
          }}
        >
          Verbunden
        </button>
      );
    }

    if (connectionStatus === 'pending_outgoing') {
      return (
        <button
          className="flex-1 font-label cursor-default"
          style={{
            padding: '10px 0',
            borderRadius: '14px',
            fontSize: '10px',
            fontWeight: 500,
            letterSpacing: '1.2px',
            textTransform: 'uppercase',
            background: 'var(--glass)',
            color: 'var(--text-muted)',
            border: '1px solid var(--divider-l)',
          }}
        >
          Angefragt
        </button>
      );
    }

    if (connectionStatus === 'pending_incoming') {
      return (
        <button
          className="flex-1 font-label cursor-default"
          style={{
            padding: '10px 0',
            borderRadius: '14px',
            fontSize: '10px',
            fontWeight: 500,
            letterSpacing: '1.2px',
            textTransform: 'uppercase',
            background: 'var(--gold-bg)',
            color: 'var(--gold-text)',
            border: '1px solid var(--gold-border)',
          }}
        >
          Anfrage erhalten
        </button>
      );
    }

    return (
      <button
        onClick={onConnect}
        disabled={connecting}
        className="vcard-btn-primary flex-1 font-label cursor-pointer"
        style={{
          padding: '10px 0',
          borderRadius: '14px',
          fontSize: '10px',
          fontWeight: 500,
          letterSpacing: '1.2px',
          textTransform: 'uppercase',
          background: primaryBtnBg,
          color: 'var(--text-on-gold)',
          border: 'none',
          boxShadow: primaryBtnShadow,
          opacity: connecting ? 0.6 : 1,
        }}
      >
        {connecting ? '...' : 'Vernetzen'}
      </button>
    );
  };

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="absolute inset-0 z-30 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,.55)', padding: '20px' }}
    >
      {/* Card — Mockup: 420px web, bg-elevated, radius 32px */}
      <div
        className="relative w-full max-w-[420px] overflow-hidden animate-scale-in"
        style={{
          background: 'var(--bg-elevated)',
          borderRadius: '32px',
          border: '1px solid var(--divider-l)',
          boxShadow: '0 20px 60px rgba(0,0,0,.35)',
        }}
      >
        {/* ─── Banner (90px) — Mockup: gold-softer → bg-elevated gradient ─── */}
        <div
          className="relative w-full h-[90px] overflow-hidden"
          style={{ background: 'linear-gradient(135deg, var(--gold-softer, var(--gold-bg)) 0%, var(--bg-elevated) 100%)' }}
        >
          {bannerUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={bannerUrl} alt="" className="w-full h-full object-cover" style={{ opacity: 0.5 }} />
          )}

          {/* Close — Mockup: 28px, right 10px, top 10px */}
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

        {/* ─── Avatar — Mockup: 72px circle, 3px solid bg-card border, NO EnsoRing ─── */}
        <div className="flex justify-center -mt-[36px] relative z-10">
          <div
            className="avatar-circle rounded-full flex items-center justify-center font-heading overflow-hidden"
            style={{
              width: '72px',
              height: '72px',
              fontSize: '24px',
              fontWeight: 400,
              background: 'var(--avatar-bg)',
              color: 'var(--gold)',
              border: '3px solid var(--bg-card)',
              boxShadow: '0 4px 16px rgba(0,0,0,.15)',
            }}
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : initials}
          </div>
        </div>

        {/* ─── Body — Mockup: padding 12px 24px 24px ─── */}
        <div style={{ padding: '12px 24px 24px', textAlign: 'center' }}>
          {/* Name — Mockup: 24px, serif italic, weight 500 */}
          <div
            className="font-heading italic leading-[1.2]"
            style={{ fontSize: '24px', fontWeight: 500, color: 'var(--text-h)' }}
          >
            {displayName}
          </div>

          {/* Handle — Mockup: 12px, Josefin Sans, weight 400 */}
          {username && (
            <div
              className="font-label"
              style={{ fontSize: '12px', fontWeight: 400, letterSpacing: '1px', color: 'var(--text-sec)', marginTop: '2px' }}
            >
              @{username}
            </div>
          )}

          {/* Level — Mockup: 10px, weight 500, uppercase, letter-spacing 1.2px */}
          <div
            className="font-label"
            style={{
              fontSize: '10px',
              fontWeight: 500,
              letterSpacing: '1.2px',
              textTransform: 'uppercase',
              color: 'var(--text-sec)',
              marginTop: '6px',
            }}
          >
            {vipName} · Level {soulLevel}
          </div>

          {/* Bio — Mockup: 14px, weight 500, line-height 1.6, line-clamp-2 */}
          {bio && (
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
              {bio}
            </div>
          )}

          {/* Meta — Mockup: 12px, weight 500, gap 14px */}
          <div
            className="flex items-center justify-center"
            style={{ gap: '14px', marginTop: '12px', fontSize: '12px', fontWeight: 500, color: 'var(--text-sec)' }}
          >
            {location && (
              <span className="flex items-center gap-1">
                <Icon name="map-pin" size={12} />
                {location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Icon name="users" size={12} />
              {connectionsCount} Kontakte
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
                    textTransform: 'uppercase',
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

          {/* Loading Shimmer */}
          {loadingProfile && interests.length === 0 && (
            <div className="flex justify-center" style={{ gap: '6px', marginTop: '14px' }}>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse"
                  style={{ height: '20px', width: '64px', borderRadius: '12px', background: 'var(--glass)' }}
                />
              ))}
            </div>
          )}

          {/* Mutual Connections — Mockup: border-top, 12px, avatar circles */}
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
            <div className="flex" style={{ marginRight: '2px' }}>
              {['LW', 'JR'].map((init, i) => (
                <div
                  key={init}
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
                  {init}
                </div>
              ))}
            </div>
            2 gemeinsame Kontakte
          </div>

          {/* Actions — Mockup: flex, gap 10px, margin-top 18px */}
          <div className="flex" style={{ gap: '10px', marginTop: '18px' }}>
            {/* Primary: Vernetzen (or connection status) */}
            {renderConnectionButton() ?? (
              /* Eigenes Profil — kein Vernetzen, nur Teilen */
              <button
                className="vcard-btn-primary flex-1 font-label cursor-pointer"
                style={{
                  padding: '10px 0',
                  borderRadius: '14px',
                  fontSize: '10px',
                  fontWeight: 500,
                  letterSpacing: '1.2px',
                  textTransform: 'uppercase',
                  background: primaryBtnBg,
                  color: 'var(--text-on-gold)',
                  border: 'none',
                  boxShadow: primaryBtnShadow,
                }}
              >
                Teilen
              </button>
            )}

            {/* Secondary: Profil ansehen — Mockup: glass bg, border */}
            {username && (
              <Link
                href={`/u/${username}`}
                className="flex-1 font-label flex items-center justify-center"
                style={{
                  padding: '10px 0',
                  borderRadius: '14px',
                  fontSize: '10px',
                  fontWeight: 500,
                  letterSpacing: '1.2px',
                  textTransform: 'uppercase',
                  background: 'var(--glass)',
                  color: 'var(--text-body)',
                  border: '1px solid var(--divider-l)',
                  textDecoration: 'none',
                }}
              >
                Profil ansehen
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
