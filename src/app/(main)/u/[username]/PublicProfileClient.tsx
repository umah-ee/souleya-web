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
      <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
        <p className="font-label text-[0.7rem] tracking-[0.2em]">
          WIRD GELADEN ...
        </p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div
        className="text-center py-16 px-4 rounded-2xl"
        style={{ border: '1px dashed var(--gold-border-s)' }}
      >
        <p className="font-heading text-2xl mb-2" style={{ color: 'var(--gold)' }}>
          Nicht gefunden
        </p>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
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
          className="flex-1 py-2.5 rounded-full font-label text-[0.7rem] tracking-[0.1em] uppercase cursor-pointer transition-colors duration-200"
          style={{
            border: '1px solid var(--gold-border-s)',
            color: 'var(--gold-text)',
          }}
        >
          Profil bearbeiten
        </button>
      );
    }

    if (!currentUserId) return null;

    if (connectionStatus === 'connected') {
      return (
        <span
          className="flex-1 py-2.5 rounded-full font-label text-[0.7rem] tracking-[0.1em] uppercase text-center block"
          style={{ border: '1px solid var(--success-border)', color: 'var(--success)' }}
        >
          Verbunden
        </span>
      );
    }

    if (connectionStatus === 'pending_outgoing') {
      return (
        <span
          className="flex-1 py-2.5 rounded-full font-label text-[0.7rem] tracking-[0.1em] uppercase text-center block"
          style={{ border: '1px solid var(--gold-border-s)', color: 'var(--text-muted)' }}
        >
          Angefragt
        </span>
      );
    }

    if (connectionStatus === 'pending_incoming') {
      return (
        <span
          className="flex-1 py-2.5 rounded-full font-label text-[0.7rem] tracking-[0.1em] uppercase text-center block"
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
        className="flex-1 py-2.5 rounded-full font-label text-[0.7rem] tracking-[0.1em] uppercase transition-all duration-200"
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
          <div
            className="w-full h-full"
            style={{ background: 'linear-gradient(135deg, var(--gold-bg-hover), var(--bg-solid))' }}
          />
        )}

        {/* Gradient Overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, var(--bg-solid), transparent 60%)' }}
        />
      </div>

      <div className="px-4">
        {/* ─── AVATAR + NAME ────────────────────────────── */}
        <div className="flex items-end gap-4 -mt-12 mb-4 relative z-10">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div
              className="w-[88px] h-[88px] rounded-full flex items-center justify-center font-heading text-3xl overflow-hidden"
              style={{
                background: 'var(--bg-solid)',
                color: 'var(--gold-text)',
                border: `3px solid ${profile.is_origin_soul ? 'var(--gold-border)' : 'var(--gold-border-s)'}`,
                boxShadow: profile.is_origin_soul ? '0 0 20px var(--gold-glow)' : 'none',
              }}
            >
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : initials}
            </div>
          </div>

          {/* Name + Badges */}
          <div className="flex-1 min-w-0 pb-1">
            <h2 className="font-body font-semibold text-lg truncate" style={{ color: 'var(--text-h)' }}>
              {profile.display_name ?? profile.username ?? 'Anonym'}
            </h2>
            {profile.username && (
              <p className="text-sm font-body" style={{ color: 'var(--text-muted)' }}>@{profile.username}</p>
            )}
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span
                className="text-[0.6rem] tracking-[0.15em] uppercase font-label rounded-full px-2 py-0.5"
                style={{ color: 'var(--gold)', border: '1px solid var(--gold-border-s)' }}
              >
                {vipName}
              </span>
              {profile.is_origin_soul && (
                <span
                  className="text-[0.6rem] tracking-[0.15em] uppercase font-label rounded-full px-2 py-0.5"
                  style={{
                    color: 'var(--gold-text)',
                    border: '1px solid var(--gold-border)',
                    background: 'var(--gold-bg)',
                  }}
                >
                  Origin Soul
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ─── BIO + LOCATION ──────────────────────────── */}
        {profile.bio && (
          <p className="text-sm font-body leading-[1.8] mb-3" style={{ color: 'var(--text-body)' }}>
            {profile.bio}
          </p>
        )}
        {profile.location && (
          <p className="text-sm font-body mb-4" style={{ color: 'var(--text-muted)' }}>
            📍 {profile.location}
          </p>
        )}

        {/* ─── ACTION BUTTON ──────────────────────────── */}
        <div className="mb-5">
          {renderActionButton()}
        </div>

        {/* ─── STATS ──────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="glass-card rounded-2xl p-4 text-center">
            <p className="font-body font-semibold text-lg" style={{ color: 'var(--text-h)' }}>{profile.connections_count}</p>
            <p className="font-label text-[0.6rem] tracking-[0.15em] uppercase mt-1" style={{ color: 'var(--text-muted)' }}>Verbindungen</p>
          </div>
          <div className="glass-card rounded-2xl p-4 text-center">
            <p className="font-body text-sm" style={{ color: 'var(--text-sec)' }}>
              {new Date(profile.created_at).toLocaleDateString('de-DE', {
                month: 'long',
                year: 'numeric',
              })}
            </p>
            <p className="font-label text-[0.6rem] tracking-[0.15em] uppercase mt-1" style={{ color: 'var(--text-muted)' }}>Mitglied seit</p>
          </div>
        </div>
      </div>
    </div>
  );
}
