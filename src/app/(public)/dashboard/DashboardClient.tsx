'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

/* ── Seed-Aktionen ── */
const SEED_ACTIONS = [
  { label: 'Freund einladen', amount: 100 },
  { label: 'Social Media folgen', amount: 50 },
  { label: 'Artikel teilen', amount: 25 },
  { label: 'Artikel liken', amount: 10 },
];

/* ── Reason-Labels ── */
const REASON_LABELS: Record<string, string> = {
  signup: 'Registrierung',
  referral: 'Freund eingeladen',
  social_follow: 'Social Media Follow',
  article_like: 'Artikel geliked',
  article_share: 'Artikel geteilt',
};

interface Activity {
  id: string;
  amount: number;
  reason: string;
  created_at: string;
}

export default function DashboardClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [seeds, setSeeds] = useState(0);
  const [isFirstLight, setIsFirstLight] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showActivities, setShowActivities] = useState(false);
  const [showSeedInfo, setShowSeedInfo] = useState(false);
  const [copyText, setCopyText] = useState('Kopieren');

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      setEmail(user.email || '');

      // Profile laden
      const { data: profile } = await supabase
        .from('profiles')
        .select('seeds_balance, is_first_light, referral_code')
        .eq('id', user.id)
        .single();

      if (profile) {
        setSeeds(profile.seeds_balance || 0);
        setIsFirstLight(profile.is_first_light || false);
        setReferralCode(profile.referral_code || '');
      }

      setLoading(false);
    }
    load();
  }, [router]);

  /* ── Aktivitäten laden ── */
  const loadActivities = async () => {
    if (activities.length > 0) {
      setShowActivities(!showActivities);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Versuche über profiles.id → seed_transactions
    const { data } = await supabase
      .from('seed_transactions')
      .select('id, amount, reason, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    setActivities(data || []);
    setShowActivities(true);
  };

  /* ── Referral Link kopieren ── */
  const handleCopy = async () => {
    const link = `${window.location.origin}/?ref=${referralCode}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopyText('Kopiert');
      setTimeout(() => setCopyText('Kopieren'), 2000);
    } catch {
      // Fallback
    }
  };

  /* ── WhatsApp teilen ── */
  const shareWhatsApp = () => {
    const link = `${window.location.origin}/?ref=${referralCode}`;
    const text = `Werde Teil von Souleya und sichere dir den First Light Status! ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <p style={{ color: 'var(--text-muted)' }}>Laden …</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="mb-10">
        <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: 'var(--gold-text)' }}>
          Willkommen zurück
        </p>
        <h1 className="font-heading text-2xl md:text-3xl italic mb-1" style={{ color: 'var(--text-h)' }}>
          Dein Souleya Dashboard
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{email}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        {/* ── Seeds Card ── */}
        <div
          className="rounded-2xl border p-6"
          style={{
            background: 'var(--glass)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderColor: 'var(--glass-border)',
          }}
        >
          <p className="font-heading text-4xl italic mb-1" style={{ color: 'var(--gold-text)' }}>
            {seeds}
          </p>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Seeds gesammelt</p>

          {/* Progress Bar */}
          <div className="h-1.5 rounded-full mb-4" style={{ background: 'var(--glass-border)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                background: 'var(--gold-text)',
                width: `${Math.min((seeds / 1000) * 100, 100)}%`,
              }}
            />
          </div>

          <button
            onClick={() => setShowSeedInfo(!showSeedInfo)}
            className="text-xs font-medium transition-colors"
            style={{ color: 'var(--gold-text)' }}
          >
            {showSeedInfo ? 'Weniger anzeigen' : 'Bekomme mehr Seeds'}
          </button>

          {showSeedInfo && (
            <div className="grid grid-cols-2 gap-3 mt-4">
              {SEED_ACTIONS.map((a) => (
                <div
                  key={a.label}
                  className="rounded-xl border p-3 text-center"
                  style={{ borderColor: 'var(--glass-border)' }}
                >
                  <p className="font-heading text-lg italic" style={{ color: 'var(--gold-text)' }}>
                    {a.amount}
                  </p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{a.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Status Card ── */}
        <div
          className="rounded-2xl border p-6 flex flex-col items-center justify-center text-center"
          style={{
            background: 'var(--glass)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderColor: 'var(--glass-border)',
          }}
        >
          {/* Enso */}
          <svg viewBox="0 0 100 100" className="w-16 h-16 mb-3">
            <circle
              cx="50" cy="50" r="38"
              fill="none"
              stroke="var(--gold-text)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="196 30"
              transform="rotate(-30 50 50)"
            />
            {isFirstLight && (
              <>
                <circle cx="83" cy="31" r="5" fill="var(--gold-text)" opacity="0.6" style={{ animation: 'soft-pulse 2s ease-in-out infinite' }} />
                <circle cx="83" cy="31" r="3" fill="var(--gold-text)" opacity="0.9" />
              </>
            )}
          </svg>
          <p className="font-medium mb-1" style={{ color: 'var(--text-h)' }}>
            {isFirstLight ? 'First Light · VIP 2' : 'Soul Spark · VIP 1'}
          </p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {isFirstLight
              ? 'Du gehörst zu den Ersten. Dein Lichtpunkt am Enso-Ring bleibt für immer.'
              : 'Sammle Seeds und steige im Level auf. Der Launch wartet auf dich.'}
          </p>
        </div>
      </div>

      {/* ── Referral Card ── */}
      {referralCode && (
        <div
          className="rounded-2xl border p-6 mb-6"
          style={{
            background: 'var(--glass)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderColor: 'var(--glass-border)',
          }}
        >
          <p className="font-medium mb-2" style={{ color: 'var(--text-h)' }}>
            Dein Empfehlungs-Link
          </p>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
            Teile deinen Link und verdiene 100 Seeds für jede Einladung.
          </p>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              readOnly
              value={`${typeof window !== 'undefined' ? window.location.origin : 'https://souleya.com'}/?ref=${referralCode}`}
              className="flex-1 px-3 py-2 rounded-lg text-xs border"
              style={{
                background: 'var(--bg-input, var(--glass))',
                borderColor: 'var(--glass-border)',
                color: 'var(--text-body)',
              }}
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-lg text-xs font-medium transition-colors"
              style={{ background: 'var(--gold-bg)', color: 'var(--gold-text)' }}
            >
              {copyText}
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={shareWhatsApp}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium border transition-colors"
              style={{ borderColor: 'var(--glass-border)', color: 'var(--text-body)' }}
            >
              {/* WhatsApp Icon */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9" />
                <path d="M9 10a.5 .5 0 0 0 1 0v-1a.5 .5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a.5 .5 0 0 0 0 -1h-1a.5 .5 0 0 0 0 1" />
              </svg>
              WhatsApp
            </button>
          </div>

          {/* Aktivitäten */}
          <button
            onClick={loadActivities}
            className="text-xs font-medium mt-4 transition-colors"
            style={{ color: 'var(--gold-text)' }}
          >
            {showActivities ? 'Aktivitäten ausblenden' : 'Meine Aktivitäten'}
          </button>

          {showActivities && (
            <div className="mt-3 space-y-2">
              {activities.length === 0 ? (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Noch keine Aktivitäten …
                </p>
              ) : (
                activities.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between py-2 border-t text-xs"
                    style={{ borderColor: 'var(--glass-border)' }}
                  >
                    <div>
                      <p style={{ color: 'var(--text-body)' }}>
                        {REASON_LABELS[a.reason] || a.reason}
                      </p>
                      <p style={{ color: 'var(--text-muted)' }}>
                        {new Date(a.created_at).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                    <span className="font-medium" style={{ color: a.amount > 0 ? 'var(--gold-text)' : 'var(--text-muted)' }}>
                      {a.amount > 0 ? '+' : ''}{a.amount} Seeds
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
