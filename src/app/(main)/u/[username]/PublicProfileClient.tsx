'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { PublicProfile } from '@/lib/users';
import type { ConnectionStatus } from '@/types/circles';
import { VIP_NAMES } from '@/types/profile';
import { fetchPublicProfile } from '@/lib/users';
import { getConnectionStatus, sendConnectionRequest } from '@/lib/circles';
import { createClient } from '@/lib/supabase/client';

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
      <div className="text-center py-12 text-[#5A5450]">
        <p className="font-label text-[0.7rem] tracking-[0.2em]">
          WIRD GELADEN ...
        </p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="text-center py-16 px-4 border border-dashed border-gold-1/15 rounded-2xl">
        <p className="text-gold-3 font-heading text-2xl font-light mb-2">
          Nicht gefunden
        </p>
        <p className="text-[#5A5450] text-sm">
          Dieses Profil existiert nicht oder ist nicht oeffentlich.
        </p>
      </div>
    );
  }

  const initials = (profile.display_name ?? profile.username ?? '?').slice(0, 1).toUpperCase();
  const vipName = VIP_NAMES[profile.vip_level] ?? `VIP ${profile.vip_level}`;

  // Verbinden-Button Rendering
  const renderActionButton = () => {
    if (isOwnProfile) {
      return (
        <button
          onClick={handleGoToOwnProfile}
          className="flex-1 py-2.5 border border-gold-1/25 rounded-full text-gold-1 font-label text-[0.7rem] tracking-[0.1em] uppercase cursor-pointer hover:border-gold-1/40 transition-colors duration-200"
        >
          Profil bearbeiten
        </button>
      );
    }

    if (!currentUserId) return null;

    if (connectionStatus === 'connected') {
      return (
        <span className="flex-1 py-2.5 border border-[#52B788]/30 rounded-full text-[#52B788] font-label text-[0.7rem] tracking-[0.1em] uppercase text-center block">
          Verbunden
        </span>
      );
    }

    if (connectionStatus === 'pending_outgoing') {
      return (
        <span className="flex-1 py-2.5 border border-gold-1/20 rounded-full text-[#5A5450] font-label text-[0.7rem] tracking-[0.1em] uppercase text-center block">
          Angefragt
        </span>
      );
    }

    if (connectionStatus === 'pending_incoming') {
      return (
        <span className="flex-1 py-2.5 border border-gold-1/30 rounded-full text-gold-1 font-label text-[0.7rem] tracking-[0.1em] uppercase text-center block">
          Anfrage erhalten
        </span>
      );
    }

    return (
      <button
        onClick={handleConnect}
        disabled={sending}
        className={`
          flex-1 py-2.5 rounded-full font-label text-[0.7rem] tracking-[0.1em] uppercase transition-all duration-200
          ${sending
            ? 'bg-gold-1/20 text-[#5A5450] cursor-not-allowed'
            : 'bg-gradient-to-br from-gold-3 to-gold-2 text-dark cursor-pointer hover:opacity-90'
          }
        `}
      >
        {sending ? '...' : 'Verbinden'}
      </button>
    );
  };

  return (
    <div className="-mx-4 -mt-6">
      {/* ─── BANNER ────────────────────────────────────────── */}
      <div className="relative w-full h-[180px] overflow-hidden">
        {profile.banner_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.banner_url}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gold-3/30 via-dark-er to-dark-est" />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-est via-dark-est/40 to-transparent" />
      </div>

      <div className="px-4">
        {/* ─── AVATAR + NAME ────────────────────────────── */}
        <div className="flex items-end gap-4 -mt-12 mb-4 relative z-10">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div
              className={`
                w-[88px] h-[88px] rounded-full bg-dark-est flex items-center justify-center
                font-heading text-3xl text-gold-1 overflow-hidden
                border-[3px] ${profile.is_origin_soul
                  ? 'border-gold-1/70 shadow-[0_0_20px_rgba(200,169,110,0.25)]'
                  : 'border-gold-1/30'
                }
              `}
            >
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : initials}
            </div>
          </div>

          {/* Name + Badges */}
          <div className="flex-1 min-w-0 pb-1">
            <h2 className="text-[#F0EDE8] font-body font-semibold text-lg truncate">
              {profile.display_name ?? profile.username ?? 'Anonym'}
            </h2>
            {profile.username && (
              <p className="text-[#5A5450] text-sm font-body">@{profile.username}</p>
            )}
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-[0.6rem] tracking-[0.15em] uppercase text-gold-3 font-label border border-gold-3/30 rounded-full px-2 py-0.5">
                {vipName}
              </span>
              {profile.is_origin_soul && (
                <span className="text-[0.6rem] tracking-[0.15em] uppercase text-gold-1 font-label border border-gold-1/40 rounded-full px-2 py-0.5 bg-gold-1/10">
                  Origin Soul
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ─── BIO + LOCATION ──────────────────────────── */}
        {profile.bio && (
          <p className="text-[#c8c0b8] text-sm font-body font-light leading-[1.8] mb-3">
            {profile.bio}
          </p>
        )}
        {profile.location && (
          <p className="text-[#5A5450] text-sm font-body mb-4">
            📍 {profile.location}
          </p>
        )}

        {/* ─── ACTION BUTTON ──────────────────────────── */}
        <div className="mb-5">
          {renderActionButton()}
        </div>

        {/* ─── STATS ──────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-dark rounded-2xl border border-gold-1/10 p-4 text-center">
            <p className="text-[#F0EDE8] font-body font-semibold text-lg">{profile.connections_count}</p>
            <p className="text-[#5A5450] font-label text-[0.6rem] tracking-[0.15em] uppercase mt-1">Verbindungen</p>
          </div>
          <div className="bg-dark rounded-2xl border border-gold-1/10 p-4 text-center">
            <p className="text-[#9A9080] font-body text-sm">
              {new Date(profile.created_at).toLocaleDateString('de-DE', {
                month: 'long',
                year: 'numeric',
              })}
            </p>
            <p className="text-[#5A5450] font-label text-[0.6rem] tracking-[0.15em] uppercase mt-1">Mitglied seit</p>
          </div>
        </div>
      </div>
    </div>
  );
}
