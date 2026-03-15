'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { PublicProfile } from '@/lib/users';
import type { ConnectionStatus } from '@/types/circles';
import { fetchPublicProfile } from '@/lib/users';
import { fetchUserPulses } from '@/lib/pulse';
import { getConnectionStatus, sendConnectionRequest, cancelRequest } from '@/lib/circles';
import { createClient } from '@/lib/supabase/client';
import type { Pulse } from '@/types/pulse';

// ── Neue Profil-Komponenten (wiederverwendet) ──
import ProfileBanner from '../../profile/components/ProfileBanner';
import ProfileIdentity from '../../profile/components/ProfileIdentity';
import ProfileBio from '../../profile/components/ProfileBio';
import ProfileStudioCard from '../../profile/components/ProfileStudioCard';
import ProfileInterests from '../../profile/components/ProfileInterests';
import ProfileStats from '../../profile/components/ProfileStats';
import PulseCard from '@/components/pulse/PulseCard';

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
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [showPulses, setShowPulses] = useState(false);
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const [pulsesLoading, setPulsesLoading] = useState(false);
  const [pulsesRestricted, setPulsesRestricted] = useState(false);
  const [pulsesFetched, setPulsesFetched] = useState(false);

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
            setConnectionId(status.connectionId);
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
      const connection = await sendConnectionRequest(profile.id);
      setConnectionStatus('pending_outgoing');
      setConnectionId(connection.id);
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!connectionId) return;
    setSending(true);
    try {
      await cancelRequest(connectionId);
      setConnectionStatus('none');
      setConnectionId(null);
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const handleBeitraegeClick = async () => {
    if (showPulses) {
      setShowPulses(false);
      return;
    }
    setShowPulses(true);
    if (pulsesFetched) return;
    setPulsesLoading(true);
    try {
      const res = await fetchUserPulses(username);
      if (res.visibility === 'restricted') {
        setPulsesRestricted(true);
      } else {
        setPulses(res.data);
      }
      setPulsesFetched(true);
    } catch (e) {
      console.error('Beitraege laden fehlgeschlagen:', e);
    } finally {
      setPulsesLoading(false);
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
        <button
          onClick={handleCancelRequest}
          disabled={sending}
          className="py-2.5 px-8 rounded-full font-label text-[0.7rem] tracking-[0.1em] uppercase cursor-pointer transition-colors duration-200"
          style={{
            border: '1px solid var(--gold-border-s)',
            color: 'var(--text-muted)',
            background: 'none',
          }}
        >
          {sending ? '...' : 'Anfrage abbrechen'}
        </button>
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

        {/* ─── Stats (Beitraege / Circle) ─── */}
        <ProfileStats
          profile={profile}
          onBeitraegeClick={handleBeitraegeClick}
          beitraegeActive={showPulses}
        />

        {/* ─── Beitraege-Sektion (toggle) ─── */}
        {showPulses && (
          <div className="px-6" style={{ marginTop: '24px' }}>
            {pulsesLoading && (
              <div className="text-center py-8">
                <p className="font-label text-[0.7rem] tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
                  WIRD GELADEN …
                </p>
              </div>
            )}

            {!pulsesLoading && pulsesRestricted && (
              <div
                className="text-center py-8 px-6 rounded-2xl animate-scale-in"
                style={{
                  background: 'var(--glass)',
                  border: '1px solid var(--glass-border)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                }}
              >
                <p className="font-heading text-lg italic mb-2" style={{ color: 'var(--text-h)' }}>
                  Nur fuer den Circle sichtbar
                </p>
                <p className="text-sm" style={{ color: 'var(--text-sec)', maxWidth: '360px', margin: '0 auto' }}>
                  {profile.display_name ?? 'Dieser User'} teilt Beitraege nur mit dem eigenen Circle.
                  Vernetze dich doch – wer weiss, was fuer schoene Begegnungen daraus entstehen.
                </p>
              </div>
            )}

            {!pulsesLoading && !pulsesRestricted && pulses.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Noch keine Beitraege vorhanden.
                </p>
              </div>
            )}

            {!pulsesLoading && !pulsesRestricted && pulses.length > 0 && (
              <div className="flex flex-col gap-4">
                {pulses.map((pulse) => (
                  <PulseCard key={pulse.id} pulse={pulse} currentUserId={currentUserId ?? undefined} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── Action Button (Verbinden / Bearbeiten) ─── */}
        <div className="text-center px-6" style={{ marginTop: '32px', marginBottom: '40px' }}>
          {renderActionButton()}
        </div>

      </div>
    </div>
  );
}
