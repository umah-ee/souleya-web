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
        // Profil laden
        const p = await fetchPublicProfile(username);
        setProfile(p);

        // Eigenen User pruefen
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id ?? null;
        setCurrentUserId(userId);

        if (userId && p.id === userId) {
          setIsOwnProfile(true);
        }

        // Verbindungsstatus laden (nur wenn eingeloggt und nicht eigenes Profil)
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
          WIRD GELADEN …
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
          className="px-4 py-2 border border-gold-1/30 rounded-full text-gold-1 font-label text-[0.7rem] tracking-[0.1em] uppercase cursor-pointer hover:border-gold-1/50 transition-colors duration-200"
        >
          Profil bearbeiten
        </button>
      );
    }

    if (!currentUserId) return null;

    if (connectionStatus === 'connected') {
      return (
        <span className="px-4 py-2 border border-[#52B788]/30 rounded-full text-[#52B788] font-label text-[0.7rem] tracking-[0.1em] uppercase">
          Verbunden
        </span>
      );
    }

    if (connectionStatus === 'pending_outgoing') {
      return (
        <span className="px-4 py-2 border border-gold-1/20 rounded-full text-[#5A5450] font-label text-[0.7rem] tracking-[0.1em] uppercase">
          Angefragt
        </span>
      );
    }

    if (connectionStatus === 'pending_incoming') {
      return (
        <span className="px-4 py-2 border border-gold-1/30 rounded-full text-gold-1 font-label text-[0.7rem] tracking-[0.1em] uppercase">
          Anfrage erhalten
        </span>
      );
    }

    return (
      <button
        onClick={handleConnect}
        disabled={sending}
        className={`
          px-4 py-2 rounded-full font-label text-[0.7rem] tracking-[0.1em] uppercase transition-all duration-200
          ${sending
            ? 'bg-gold-1/20 text-[#5A5450] cursor-not-allowed'
            : 'bg-gradient-to-br from-gold-3 to-gold-2 text-dark cursor-pointer hover:opacity-90'
          }
        `}
      >
        {sending ? '…' : 'Verbinden'}
      </button>
    );
  };

  return (
    <>
      {/* Header */}
      <div className="hidden md:flex md:items-center md:justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-light text-gold-1 tracking-wide">
            Profil
          </h1>
        </div>
        {renderActionButton()}
      </div>

      {/* Profile Card */}
      <div className="bg-dark rounded-2xl border border-gold-1/10 p-6">
        {/* Avatar + Name Section */}
        <div className="flex items-start gap-4 mb-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div
              className={`
                w-20 h-20 rounded-full bg-gold-1/15 flex items-center justify-center
                font-heading text-3xl text-gold-1 overflow-hidden
                border-2 ${profile.is_origin_soul ? 'border-gold-1/60 shadow-[0_0_15px_rgba(200,169,110,0.2)]' : 'border-gold-1/20'}
              `}
            >
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : initials}
            </div>
          </div>

          {/* Name + Meta */}
          <div className="flex-1 min-w-0">
            <h2 className="text-[#F0EDE8] font-body font-medium text-lg truncate">
              {profile.display_name ?? profile.username ?? 'Anonym'}
            </h2>
            {profile.username && (
              <p className="text-[#5A5450] text-sm font-body">
                @{profile.username}
              </p>
            )}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-[0.65rem] tracking-[0.15em] uppercase text-gold-3 font-label border border-gold-3/30 rounded-full px-2 py-0.5">
                {vipName}
              </span>
              {profile.is_origin_soul && (
                <span className="text-[0.65rem] tracking-[0.15em] uppercase text-gold-1 font-label border border-gold-1/40 rounded-full px-2 py-0.5 bg-gold-1/10">
                  Origin Soul
                </span>
              )}
            </div>

            {/* Mobile Action Button */}
            <div className="md:hidden mt-3">
              {renderActionButton()}
            </div>
          </div>
        </div>

        {/* Bio + Location */}
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

        {/* Stats */}
        <div className="border-t border-gold-1/10 pt-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[#5A5450] font-label uppercase tracking-wider text-[10px]">
              Verbindungen
            </span>
            <span className="text-[#9A9080] font-body text-sm">
              {profile.connections_count}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#5A5450] font-label uppercase tracking-wider text-[10px]">
              Mitglied seit
            </span>
            <span className="text-[#9A9080] font-body text-sm">
              {new Date(profile.created_at).toLocaleDateString('de-DE', {
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
