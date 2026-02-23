'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { PublicProfile } from '@/lib/users';
import type { ConnectionStatus } from '@/types/circles';
import { VIP_NAMES } from '@/types/profile';
import { fetchPublicProfile } from '@/lib/users';
import { getConnectionStatus, sendConnectionRequest } from '@/lib/circles';
import { createClient } from '@/lib/supabase/client';
import EnsoRing from '@/components/ui/EnsoRing';

interface Props {
  username: string;
}

export default function PublicProfileClient({ username }: Props) {
  const router = useRouter();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('none');
  const [sending, setSending] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const p = await fetchPublicProfile(username);
        setProfile(p);

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id ?? null;
        setCurrentUserId(userId);

        if (userId && p.id === userId) {
          setIsOwnProfile(true);
        }

        if (userId && p.id !== userId) {
          try {
            const status = await getConnectionStatus(p.id);
            setConnectionStatus(status.status);
          } catch {
            // Nicht eingeloggt oder Fehler
          }
        }
      } catch {
        setError('Profil nicht gefunden');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [username]);

  const handleConnect = async () => {
    if (!profile || !currentUserId) return;
    setSending(true);
    try {
      await sendConnectionRequest(profile.id);
      setConnectionStatus('pending_outgoing');
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const handleGoToOwnProfile = () => {
    router.push('/profile');
  };

  if (loading) {
    return (
      <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
        <p className="font-label text-[0.7rem] tracking-[0.2em]">WIRD GELADEN ...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="text-center py-16 px-4 rounded-2xl" style={{ border: '1px dashed var(--gold-border-s)' }}>
        <p className="font-heading text-2xl mb-2" style={{ color: 'var(--gold)' }}>Nicht gefunden</p>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Dieses Profil existiert nicht oder ist nicht oeffentlich.</p>
      </div>
    );
  }

  const initials = (profile.display_name ?? profile.username ?? '?').slice(0, 1).toUpperCase();
  const vipName = VIP_NAMES[profile.vip_level] ?? `VIP ${profile.vip_level}`;
  const interests = profile.interests ?? [];

  // ── Action Button ─────────────────────────────────────────
  const renderActionButton = () => {
    if (isOwnProfile) {
      return (
        <button
          onClick={handleGoToOwnProfile}
          className="py-2.5 px-8 rounded-full font-label text-[0.7rem] tracking-[0.1em] uppercase cursor-pointer transition-colors duration-200"
          style={{ border: '1px solid var(--gold-border-s)', color: 'var(--gold-text)' }}
        >
          Profil bearbeiten
        </button>
      );
    }

    if (!currentUserId) return null;

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
        onClick={handleConnect}
        disabled={sending}
        className="py-2.5 px-8 rounded-full font-label text-[0.7rem] tracking-[0.1em] uppercase transition-all duration-200"
        style={{
          background: sending ? 'var(--gold-bg)' : 'linear-gradient(135deg, var(--gold-deep), var(--gold))',
          color: sending ? 'var(--text-muted)' : 'var(--text-on-gold)',
          cursor: sending ? 'not-allowed' : 'pointer',
        }}
      >
        {sending ? '...' : 'Verbinden'}
      </button>
    );
  };

  return (
    <div className="-mx-4 -mt-6 flex justify-center">
      <div className="w-full max-w-[480px]">

        {/* ═══════════════════════════════════════════════════
            PROFIL-CARD (Style Guide Section 06)
        ═══════════════════════════════════════════════════ */}
        <div className="glass-card rounded-[18px] overflow-hidden">

          {/* ─── BANNER (140px) ─────────────────────────── */}
          <div className="relative w-full h-[140px] overflow-hidden">
            {profile.banner_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.banner_url} alt="" className="w-full h-full object-cover" />
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
          </div>

          {/* ─── AVATAR im Enso Ring (88px, zentriert) ── */}
          <div className="flex justify-center -mt-[44px] relative z-10">
            <EnsoRing
              vipLevel={profile.vip_level}
              isOriginSoul={profile.is_origin_soul}
              size="profile"
            >
              <div
                className="w-full h-full rounded-full flex items-center justify-center font-heading text-[22px] overflow-hidden"
                style={{
                  background: 'var(--avatar-bg)',
                  color: 'var(--gold-text)',
                }}
              >
                {profile.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
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
              {profile.display_name ?? profile.username ?? 'Anonym'}
            </div>

            {/* Handle + Soul Level */}
            <div
              className="text-[11px] mb-[10px]"
              style={{ color: 'var(--text-muted)' }}
            >
              {profile.username ? `@${profile.username}` : ''}
              {profile.username && ' · '}
              {vipName}
              {profile.is_origin_soul && ' · First Light'}
            </div>

            {/* Bio */}
            {profile.bio && (
              <div
                className="text-[12px] leading-[1.65] mx-auto max-w-[320px] mb-[14px]"
                style={{ color: 'var(--text-body)' }}
              >
                {profile.bio}
              </div>
            )}

            {/* Stats */}
            <div className="flex justify-center gap-6 mb-[14px]">
              <div>
                <span className="block text-[16px]" style={{ color: 'var(--text-h)' }}>
                  {profile.pulses_count ?? 0}
                </span>
                <span className="text-[9px] tracking-[1.5px] uppercase" style={{ color: 'var(--text-muted)' }}>
                  Beiträge
                </span>
              </div>
              <div>
                <span className="block text-[16px]" style={{ color: 'var(--text-h)' }}>
                  {profile.connections_count}
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

            {/* Interest Tags */}
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

            {/* Action Button */}
            <div className="mb-[14px]">
              {renderActionButton()}
            </div>

            {/* Meta Row */}
            <div
              className="flex flex-wrap justify-center gap-4 pt-3 text-[10px]"
              style={{ color: 'var(--text-sec)', borderTop: '1px solid var(--divider-l)' }}
            >
              {profile.location && (
                <span className="flex items-center gap-1">☸ {profile.location}</span>
              )}
              <span className="flex items-center gap-1">
                ♡ Seit {new Date(profile.created_at).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
              </span>
              {profile.is_origin_soul && (
                <span className="flex items-center gap-1">✧ First Light</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
