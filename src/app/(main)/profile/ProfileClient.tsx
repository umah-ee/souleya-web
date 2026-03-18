'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Profile } from '@/types/profile';
import type { Pulse } from '@/types/pulse';
import { fetchProfile, updateProfile } from '@/lib/profile';
import { fetchMyPulses } from '@/lib/pulse';
import { getConnections } from '@/lib/circles';
import type { Connection } from '@/types/circles';

// ── Pulse ──
import PulseCard from '@/components/pulse/PulseCard';

// ── Profile Components ──
import ProfileBanner from './components/ProfileBanner';
import ProfileIdentity from './components/ProfileIdentity';
import ProfileBio from './components/ProfileBio';
import ProfileStudioCard from './components/ProfileStudioCard';
import ProfileInterests from './components/ProfileInterests';
import ProfileStats from './components/ProfileStats';
import SoulProgressCard from '@/components/profile/SoulProgressCard';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import ProfilePrivateRow from './components/ProfilePrivateRow';

// ── Panels ──
import SettingsPanel from './panels/SettingsPanel';
import SeedsPanel from './panels/SeedsPanel';
import ReferralPanel from './panels/ReferralPanel';
import EditProfilePanel from './panels/EditProfilePanel';
import VisitenkarteOverlay from './panels/VisitenkarteOverlay';

type PanelType = 'settings' | 'seeds' | 'referral' | 'edit' | 'visitenkarte' | null;

export default function ProfileClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activePanel, setActivePanel] = useState<PanelType>(null);
  const tabParam = searchParams.get('tab');

  // Deep-Link: ?tab=notifications oeffnet Settings direkt auf Benachrichtigungen
  useEffect(() => {
    if (tabParam === 'notifications') {
      setActivePanel('settings');
    }
  }, [tabParam]);
  const [showBeitraege, setShowBeitraege] = useState(false);
  const [beitraegePulses, setBeitraegePulses] = useState<Pulse[]>([]);
  const [beitraegeLoading, setBeitraegeLoading] = useState(false);
  const [beitraegeFetched, setBeitraegeFetched] = useState(false);
  const [showCircle, setShowCircle] = useState(false);
  const [circleConnections, setCircleConnections] = useState<Connection[]>([]);
  const [circleLoading, setCircleLoading] = useState(false);
  const [circleFetched, setCircleFetched] = useState(false);

  // ── Profil laden ──
  useEffect(() => {
    fetchProfile()
      .then((p) => setProfile(p))
      .catch((err) => {
        console.error('[ProfileClient]', err);
        if (err.message === 'Nicht angemeldet') {
          router.push('/login?next=/profile');
          return;
        }
        setError('Profil konnte nicht geladen werden.');
      })
      .finally(() => setLoading(false));
  }, [router]);

  // ── Panel Handlers ──
  const openPanel = (panel: PanelType) => setActivePanel(panel);
  const closePanel = () => setActivePanel(null);

  const handleProfileUpdated = (updated: Profile) => {
    setProfile(updated);
  };

  const handleBeitraegeClick = async () => {
    // Schließe Circle wenn offen
    if (showCircle) setShowCircle(false);

    if (showBeitraege) {
      setShowBeitraege(false);
      return;
    }
    setShowBeitraege(true);
    if (beitraegeFetched) return;
    setBeitraegeLoading(true);
    try {
      const res = await fetchMyPulses(1, 50);
      setBeitraegePulses(res.data);
      setBeitraegeFetched(true);
    } catch (e) {
      console.error('Beitraege laden fehlgeschlagen:', e);
    } finally {
      setBeitraegeLoading(false);
    }
  };

  const handlePulseDeleted = (id: string) => {
    setBeitraegePulses((prev) => prev.filter((p) => p.id !== id));
  };

  const handleCircleClick = async () => {
    // Schließe Beiträge wenn offen
    if (showBeitraege) setShowBeitraege(false);

    if (showCircle) {
      setShowCircle(false);
      return;
    }
    setShowCircle(true);
    if (circleFetched) return;
    setCircleLoading(true);
    try {
      const res = await getConnections(1, 100);
      setCircleConnections(res.data);
      setCircleFetched(true);
    } catch (e) {
      console.error('Circle laden fehlgeschlagen:', e);
    } finally {
      setCircleLoading(false);
    }
  };

  // ── Loading State ──
  if (loading) {
    return (
      <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
        <p className="font-label text-[10px] tracking-[1.2px] uppercase">Wird geladen ...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
        <p className="text-[14px]">Profil konnte nicht geladen werden.</p>
        {error && <p className="text-[13px] mt-2" style={{ color: 'var(--error)' }}>{error}</p>}
      </div>
    );
  }

  return (
    <div className="-mx-4 -mt-6 flex justify-center">
      <div className="w-full max-w-[700px]">

        {/* ═══════════════════════════════════════════
            PROFIL-REDESIGN v2 (Style Guide v2.1)
            Banner → Identity → Bio → Studio →
            Interests → Stats → Private Row
        ═══════════════════════════════════════════ */}

        {/* ─── Banner (200px) ─── */}
        <ProfileBanner
          profile={profile}
          onSettingsClick={() => openPanel('settings')}
          onEditClick={() => openPanel('edit')}
          onRepositionSave={async (posX, posY) => {
            try {
              const updated = await updateProfile({ banner_pos_x: posX, banner_pos_y: posY });
              setProfile(updated);
            } catch { /* ignore */ }
          }}
        />

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
          beitraegeActive={showBeitraege}
          onCircleClick={handleCircleClick}
          circleActive={showCircle}
        />

        {/* ─── Onboarding Wizard (Soul 1, Fullscreen Overlay, Inline) ─── */}
        <OnboardingWizard
          soulLevel={profile.soul_level ?? 1}
          isFirstLight={profile.is_first_light}
          avatarUrl={profile.avatar_url}
          profile={profile}
          onLevelUp={() => fetchProfile().then((p) => setProfile(p))}
          onProfileUpdated={handleProfileUpdated}
        />

        {/* ─── Soul Progress Card (ab Level 2) ─── */}
        <div className="px-6 mt-6">
          <SoulProgressCard soulLevel={profile.soul_level} />
        </div>

        {/* ─── Beitraege-Liste (toggle) ─── */}
        {showBeitraege && (
          <div className="px-6" style={{ marginTop: '24px' }}>
            {beitraegeLoading && (
              <div className="text-center py-8">
                <p className="font-label text-[0.7rem] tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
                  WIRD GELADEN …
                </p>
              </div>
            )}

            {!beitraegeLoading && beitraegePulses.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Du hast noch keine Beiträge verfasst.
                </p>
              </div>
            )}

            {!beitraegeLoading && beitraegePulses.length > 0 && (
              <div className="flex flex-col gap-4">
                {beitraegePulses.map((pulse) => (
                  <PulseCard
                    key={pulse.id}
                    pulse={pulse}
                    currentUserId={profile.id}
                    onDelete={handlePulseDeleted}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── Circle-Liste (toggle) ─── */}
        {showCircle && (
          <div className="px-6" style={{ marginTop: '24px' }}>
            {circleLoading && (
              <div className="text-center py-8">
                <p className="font-label text-[0.7rem] tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
                  WIRD GELADEN …
                </p>
              </div>
            )}

            {!circleLoading && circleConnections.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Du hast noch keine Verbindungen in deinem Circle.
                </p>
              </div>
            )}

            {!circleLoading && circleConnections.length > 0 && (
              <div className="flex flex-col gap-3">
                {circleConnections.map((conn) => (
                  <a
                    key={conn.id}
                    href={`/u/${conn.profile.username}`}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 transition-colors duration-200"
                    style={{
                      background: 'var(--glass)',
                      border: '1px solid var(--glass-border)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      textDecoration: 'none',
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-heading text-sm overflow-hidden"
                      style={{
                        background: 'var(--gold-bg)',
                        border: '1px solid var(--gold-border-s)',
                        color: 'var(--gold-text)',
                      }}
                    >
                      {conn.profile.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={conn.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        (conn.profile.display_name ?? conn.profile.username ?? '?')[0].toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-heading text-sm truncate" style={{ color: 'var(--text-h)' }}>
                        {conn.profile.display_name ?? conn.profile.username}
                      </p>
                      {conn.profile.username && (
                        <p className="font-label text-[0.65rem] tracking-[0.08em] uppercase" style={{ color: 'var(--text-muted)' }}>
                          @{conn.profile.username}
                        </p>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── Seeds + Einladungen Chips ─── */}
        <ProfilePrivateRow
          profile={profile}
          onSeedsClick={() => openPanel('seeds')}
          onReferralClick={() => openPanel('referral')}
        />

        {/* ═══════════════════════════════════════════
            PANELS
        ═══════════════════════════════════════════ */}

        <SettingsPanel
          isOpen={activePanel === 'settings'}
          onClose={closePanel}
          initialSubView={tabParam === 'notifications' ? 'notifications' : undefined}
          postsVisibility={profile.posts_visibility ?? 'circle'}
          onPostsVisibilityChange={async (v) => {
            try {
              const updated = await updateProfile({ posts_visibility: v });
              setProfile(updated);
            } catch (e) {
              console.error('posts_visibility update failed:', e);
            }
          }}
        />

        <SeedsPanel
          isOpen={activePanel === 'seeds'}
          onClose={closePanel}
          profile={profile}
        />

        <ReferralPanel
          isOpen={activePanel === 'referral'}
          onClose={closePanel}
          profile={profile}
        />

        <EditProfilePanel
          isOpen={activePanel === 'edit'}
          onClose={closePanel}
          profile={profile}
          onProfileUpdated={handleProfileUpdated}
        />

        <VisitenkarteOverlay
          isOpen={activePanel === 'visitenkarte'}
          onClose={closePanel}
          profile={profile}
        />
      </div>
    </div>
  );
}
