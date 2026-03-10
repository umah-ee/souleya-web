'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { PublicProfile } from '@/lib/users';
import type { ConnectionStatus } from '@/types/circles';
import { fetchPublicProfile } from '@/lib/users';
import { getConnectionStatus, sendConnectionRequest } from '@/lib/circles';
import { createClient } from '@/lib/supabase/client';

// ── Neue Profil-Komponenten (wiederverwendet) ──
import ProfileBanner from '../../profile/components/ProfileBanner';
import ProfileIdentity from '../../profile/components/ProfileIdentity';
import ProfileBio from '../../profile/components/ProfileBio';
import ProfileStudioCard from '../../profile/components/ProfileStudioCard';
import ProfileInterests from '../../profile/components/ProfileInterests';
import ProfileStats from '../../profile/components/ProfileStats';

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

  // ── Action Button ─────────────────────────────────────────
  const renderActionButton = () => {
    if (isOwnProfile) {
      return (
        <button
          onClick={() => router.push('/profile')}
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
          background: sending ? 'var(--gold-bg)' : 'var(--primary-gradient)',
          color: sending ? 'var(--text-muted)' : 'var(--text-on-gold)',
          cursor: sending ? 'not-allowed' : 'pointer',
          boxShadow: sending ? 'none' : 'var(--primary-glow)',
        }}
      >
        {sending ? '...' : 'Verbinden'}
      </button>
    );
  };

  return (
    <div className="-mx-4 -mt-6 flex justify-center">
      <div className="w-full max-w-[700px]">

        {/* ═══════════════════════════════════════════
            OEFFENTLICHES PROFIL (Redesign v2)
            Gleiche Komponenten wie eigenes Profil,
            ohne Edit/Settings Buttons
        ═══════════════════════════════════════════ */}

        {/* ─── Banner (200px, ohne Buttons) ─── */}
        <ProfileBanner profile={profile} />

        {/* ─── Identity (EnsoRing 112px + Name 32px) ─── */}
        <ProfileIdentity profile={profile} />

        {/* ─── Bio + Location + Member-Since ─── */}
        <ProfileBio profile={profile} />

        {/* ─── Coach Studio Card (nur Mentoren) ─── */}
        <ProfileStudioCard profile={profile} />

        {/* ─── Interest Tags ─── */}
        <ProfileInterests profile={profile} />

        {/* ─── Stats (Beitraege/Kontakte/Circles) ─── */}
        <ProfileStats profile={profile} />

        {/* ─── Action Button (Verbinden / Bearbeiten) ─── */}
        <div className="text-center px-6" style={{ marginTop: '32px', marginBottom: '40px' }}>
          {renderActionButton()}
        </div>

      </div>
    </div>
  );
}
