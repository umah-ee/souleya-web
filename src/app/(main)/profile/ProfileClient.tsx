'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { Profile } from '@/types/profile';
import { VIP_NAMES } from '@/types/profile';
import { fetchProfile, updateProfile, uploadAvatar, uploadBanner } from '@/lib/profile';
import { geocodeLocation } from '@/lib/events';
import { createClient } from '@/lib/supabase/client';
import EnsoRing from '@/components/ui/EnsoRing';

// ── Vorschlaege fuer Interest Tags ───────────────────────────
const INTEREST_SUGGESTIONS = [
  'Achtsamkeit', 'Yoga', 'Meditation', 'Atemarbeit', 'Heilung',
  'Buddhismus', 'Schamanismus', 'Ayurveda', 'Reiki', 'Tantra',
  'Naturheilkunde', 'Psychologie', 'Coaching', 'Tanz', 'Musik',
  'Kunst', 'Journaling', 'Fasten', 'Qigong', 'Tai Chi',
];

export default function ProfileClient() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Edit-Form State
  const [form, setForm] = useState({
    display_name: '',
    username: '',
    bio: '',
    location: '',
    location_lat: null as number | null,
    location_lng: null as number | null,
    interests: [] as string[],
  });

  // Tag-Input State
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchProfile()
      .then((p) => {
        setProfile(p);
        setForm({
          display_name: p.display_name ?? '',
          username: p.username ?? '',
          bio: p.bio ?? '',
          location: p.location ?? '',
          location_lat: p.location_lat,
          location_lng: p.location_lng,
          interests: p.interests ?? [],
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleEdit = () => {
    if (!profile) return;
    setForm({
      display_name: profile.display_name ?? '',
      username: profile.username ?? '',
      bio: profile.bio ?? '',
      location: profile.location ?? '',
      location_lat: profile.location_lat,
      location_lng: profile.location_lng,
      interests: profile.interests ?? [],
    });
    setEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setEditing(false);
    setError('');
  };

  // GPS-Standort erkennen
  const handleDetectLocation = async () => {
    if (!navigator.geolocation) {
      setError('Standorterkennung wird von deinem Browser nicht unterstuetzt');
      return;
    }

    setDetectingLocation(true);
    setError('');

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 10000,
        });
      });

      const { latitude, longitude } = position.coords;

      const res = await geocodeLocation(`${longitude},${latitude}`, 'reverse');
      if (res.results.length > 0) {
        const place = res.results[0];
        setForm((f) => ({
          ...f,
          location: place.place_name.split(',').slice(0, 2).join(',').trim(),
          location_lat: place.lat,
          location_lng: place.lng,
        }));
        setSuccess('Standort erkannt');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Standort konnte nicht aufgeloest werden');
      }
    } catch {
      setError('Standorterkennung fehlgeschlagen. Bitte erlaube den Zugriff.');
    } finally {
      setDetectingLocation(false);
    }
  };

  // Manuelle Ort-Eingabe → Forward Geocoding
  const handleLocationBlur = async () => {
    if (!form.location || form.location.length < 3) return;
    if (form.location_lat && form.location === (profile?.location ?? '')) return;

    try {
      const res = await geocodeLocation(form.location, 'forward');
      if (res.results.length > 0) {
        const place = res.results[0];
        setForm((f) => ({
          ...f,
          location_lat: place.lat,
          location_lng: place.lng,
        }));
      }
    } catch {
      // Geocoding fehlgeschlagen
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setError('');

    try {
      const updated = await updateProfile({
        display_name: form.display_name || undefined,
        username: form.username || undefined,
        bio: form.bio || undefined,
        location: form.location || undefined,
        location_lat: form.location_lat ?? undefined,
        location_lng: form.location_lng ?? undefined,
        interests: form.interests,
      });
      setProfile(updated);
      setEditing(false);
      setSuccess('Profil gespeichert');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarClick = () => {
    if (editing) fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Bild darf maximal 5 MB gross sein');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const avatarUrl = await uploadAvatar(file);
      const updated = await updateProfile({ avatar_url: avatarUrl });
      setProfile(updated);
      setSuccess('Avatar aktualisiert');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload fehlgeschlagen');
    } finally {
      setUploading(false);
    }
  };

  const handleBannerClick = () => {
    if (editing) bannerInputRef.current?.click();
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('Banner darf maximal 10 MB gross sein');
      return;
    }

    setUploadingBanner(true);
    setError('');

    try {
      const bannerUrl = await uploadBanner(file);
      const updated = await updateProfile({ banner_url: bannerUrl });
      setProfile(updated);
      setSuccess('Banner aktualisiert');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload fehlgeschlagen');
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleCopyReferral = async () => {
    if (!profile) return;
    try {
      await navigator.clipboard.writeText(`https://souleya.com?ref=${profile.referral_code}`);
      setSuccess('Referral-Link kopiert!');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Kopieren fehlgeschlagen');
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  // ── Tag Handlers ──────────────────────────────────────────
  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed || form.interests.length >= 10) return;
    if (form.interests.includes(trimmed)) return;
    setForm((f) => ({ ...f, interests: [...f.interests, trimmed] }));
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setForm((f) => ({ ...f, interests: f.interests.filter((t) => t !== tag) }));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  // ── Loading / Error States ────────────────────────────────
  if (loading) {
    return (
      <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
        <p className="font-label text-[0.7rem] tracking-[0.2em]">WIRD GELADEN ...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
        <p className="text-sm">Profil konnte nicht geladen werden.</p>
      </div>
    );
  }

  const initials = (profile.display_name ?? profile.username ?? profile.email ?? '?').slice(0, 1).toUpperCase();
  const vipName = VIP_NAMES[profile.vip_level] ?? `VIP ${profile.vip_level}`;
  const interests = profile.interests ?? [];

  return (
    <div className="-mx-4 -mt-6 flex justify-center">
      <div className="w-full max-w-[480px]">

        {/* ═══════════════════════════════════════════════════
            PROFIL-CARD (Style Guide Section 06)
        ═══════════════════════════════════════════════════ */}
        <div className="glass-card rounded-[18px] overflow-hidden">

          {/* ─── BANNER (140px) ─────────────────────────── */}
          <div
            className={`relative w-full h-[140px] overflow-hidden ${editing ? 'cursor-pointer' : ''}`}
            onClick={handleBannerClick}
          >
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
            {/* Banner-Upload Indicator */}
            {editing && (
              <div
                className="absolute top-3 right-3 w-8 h-8 backdrop-blur-sm rounded-full flex items-center justify-center text-sm"
                style={{ background: 'var(--glass-nav)', color: 'var(--gold-text)', border: '1px solid var(--gold-border-s)' }}
              >
                {uploadingBanner ? '...' : '📷'}
              </div>
            )}
            <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
          </div>

          {/* ─── AVATAR im Enso Ring (88px, zentriert) ── */}
          <div className="flex justify-center -mt-[44px] relative z-10">
            <EnsoRing
              vipLevel={profile.vip_level}
              isOriginSoul={profile.is_origin_soul}
              size="profile"
            >
              <div
                onClick={handleAvatarClick}
                className={`
                  w-full h-full rounded-full flex items-center justify-center
                  font-heading text-[22px] overflow-hidden relative
                  ${editing ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
                `}
                style={{
                  background: 'var(--avatar-bg)',
                  color: 'var(--gold-text)',
                }}
              >
                {profile.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : initials}
                {uploading && (
                  <div
                    className="absolute inset-0 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--img-overlay)' }}
                  >
                    <span className="font-label text-[0.6rem] tracking-[0.1em]" style={{ color: 'var(--gold-text)' }}>...</span>
                  </div>
                )}
              </div>
            </EnsoRing>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>

          {/* ─── BODY (zentriert) ──────────────────────── */}
          <div className="px-5 pb-5 pt-3 text-center">

            {/* ── Anzeige-Modus ─────────────────────────── */}
            {!editing ? (
              <>
                {/* Name */}
                <div
                  className="text-[18px] font-heading italic mb-[2px]"
                  style={{ color: 'var(--text-h)' }}
                >
                  {profile.display_name ?? profile.email}
                </div>

                {/* Handle + Soul Level */}
                <div
                  className="text-[11px] mb-[10px]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {profile.username ? `@${profile.username}` : profile.email}
                  {' · '}
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
                    <span
                      className="text-[9px] tracking-[1.5px] uppercase"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Beiträge
                    </span>
                  </div>
                  <div>
                    <span className="block text-[16px]" style={{ color: 'var(--text-h)' }}>
                      {profile.connections_count}
                    </span>
                    <span
                      className="text-[9px] tracking-[1.5px] uppercase"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Kontakte
                    </span>
                  </div>
                  <div>
                    <span className="block text-[16px]" style={{ color: 'var(--text-h)' }}>
                      0
                    </span>
                    <span
                      className="text-[9px] tracking-[1.5px] uppercase"
                      style={{ color: 'var(--text-muted)' }}
                    >
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
              </>
            ) : (
              /* ── Edit-Modus ───────────────────────────── */
              <div className="text-left">
                {/* Name + Username */}
                <div className="space-y-2 mb-4">
                  <input
                    type="text"
                    value={form.display_name}
                    onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
                    placeholder="Anzeigename"
                    maxLength={60}
                    className="w-full rounded-xl px-3 py-2 text-sm font-body outline-none transition-colors"
                    style={{ background: 'var(--glass)', border: '1px solid var(--gold-border-s)', color: 'var(--text-h)' }}
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>@</span>
                    <input
                      type="text"
                      value={form.username}
                      onChange={(e) => setForm((f) => ({ ...f, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
                      placeholder="username"
                      maxLength={30}
                      className="flex-1 rounded-xl px-3 py-2 text-sm font-body outline-none transition-colors"
                      style={{ background: 'var(--glass)', border: '1px solid var(--gold-border-s)', color: 'var(--text-h)' }}
                    />
                  </div>
                </div>

                {/* Bio */}
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                  placeholder="Ueber dich ..."
                  maxLength={300}
                  rows={3}
                  className="w-full rounded-xl px-3 py-2 text-sm font-body outline-none transition-colors resize-none mb-3"
                  style={{ background: 'var(--glass)', border: '1px solid var(--gold-border-s)', color: 'var(--text-h)' }}
                />

                {/* Location */}
                <div className="flex items-center gap-2 mb-1">
                  <span style={{ color: 'var(--text-muted)' }}>📍</span>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm((f) => ({ ...f, location: e.target.value, location_lat: null, location_lng: null }))}
                    onBlur={handleLocationBlur}
                    placeholder="Ort (z.B. München – Schwabing)"
                    maxLength={80}
                    className="flex-1 rounded-xl px-3 py-2 text-sm font-body outline-none transition-colors"
                    style={{ background: 'var(--glass)', border: '1px solid var(--gold-border-s)', color: 'var(--text-h)' }}
                  />
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={detectingLocation}
                    className="px-3 py-2 rounded-xl font-label text-[0.6rem] tracking-[0.1em] uppercase transition-all duration-200 flex-shrink-0"
                    style={{
                      background: detectingLocation ? 'var(--gold-bg)' : 'transparent',
                      border: '1px solid var(--gold-border-s)',
                      color: detectingLocation ? 'var(--text-muted)' : 'var(--gold-text)',
                      cursor: detectingLocation ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {detectingLocation ? '...' : '📍'}
                  </button>
                </div>
                {form.location_lat && (
                  <p className="text-[0.65rem] font-body ml-6 mb-3" style={{ color: 'var(--text-muted)' }}>
                    Standort gesetzt
                  </p>
                )}

                {/* Interest Tags Edit */}
                <div className="mb-4">
                  <p className="font-label text-[9px] tracking-[1.5px] uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
                    Vorlieben ({form.interests.length}/10)
                  </p>

                  {/* Aktuelle Tags */}
                  {form.interests.length > 0 && (
                    <div className="flex flex-wrap gap-[6px] mb-2">
                      {form.interests.map((tag) => (
                        <span
                          key={tag}
                          className="text-[8px] tracking-[1.5px] uppercase px-[10px] py-[4px] rounded-[12px] inline-flex items-center gap-1"
                          style={{
                            color: 'var(--gold-text)',
                            border: '1px solid var(--gold-border)',
                            background: 'var(--gold-bg)',
                          }}
                        >
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="ml-1 text-[10px] cursor-pointer bg-transparent border-none"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Tag Input */}
                  {form.interests.length < 10 && (
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      placeholder="Tag eingeben + Enter"
                      maxLength={30}
                      className="w-full rounded-xl px-3 py-2 text-xs font-body outline-none transition-colors mb-2"
                      style={{ background: 'var(--glass)', border: '1px solid var(--gold-border-s)', color: 'var(--text-h)' }}
                    />
                  )}

                  {/* Vorschlaege */}
                  <div className="flex flex-wrap gap-1">
                    {INTEREST_SUGGESTIONS
                      .filter((s) => !form.interests.includes(s))
                      .slice(0, 8)
                      .map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => addTag(suggestion)}
                          className="text-[7px] tracking-[1px] uppercase px-2 py-[3px] rounded-[10px] cursor-pointer transition-colors"
                          style={{
                            color: 'var(--text-muted)',
                            border: '1px solid var(--divider)',
                            background: 'transparent',
                          }}
                        >
                          + {suggestion}
                        </button>
                      ))}
                  </div>
                </div>

                {/* Save/Cancel */}
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 py-2.5 rounded-full font-label text-[0.7rem] tracking-[0.1em] uppercase transition-all duration-200"
                    style={{
                      background: saving ? 'var(--gold-bg-hover)' : 'linear-gradient(135deg, var(--gold-deep), var(--gold))',
                      color: saving ? 'var(--text-muted)' : 'var(--text-on-gold)',
                      cursor: saving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {saving ? '...' : 'Speichern'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-6 py-2.5 rounded-full font-label text-[0.7rem] tracking-[0.1em] uppercase cursor-pointer transition-colors duration-200"
                    style={{ border: '1px solid var(--divider)', color: 'var(--text-muted)' }}
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════
            UNTER DER PROFIL-CARD
        ═══════════════════════════════════════════════════ */}

        {/* Success/Error Messages */}
        {success && (
          <div
            className="mt-4 py-2 px-4 rounded-xl text-sm font-body text-center"
            style={{ background: 'var(--success-bg)', border: '1px solid var(--success-border)', color: 'var(--success)' }}
          >
            {success}
          </div>
        )}
        {error && (
          <div
            className="mt-4 py-2 px-4 rounded-xl text-sm font-body text-center"
            style={{ background: 'var(--error-bg)', border: '1px solid var(--error-border)', color: 'var(--error)' }}
          >
            {error}
          </div>
        )}

        {/* Profil bearbeiten Button */}
        {!editing && (
          <button
            onClick={handleEdit}
            className="w-full mt-4 py-2.5 rounded-full font-label text-[0.7rem] tracking-[0.1em] uppercase cursor-pointer transition-colors duration-200"
            style={{ border: '1px solid var(--gold-border-s)', color: 'var(--gold-text)' }}
          >
            Profil bearbeiten
          </button>
        )}

        {/* Einladungslink */}
        <div className="glass-card rounded-[18px] p-5 mt-4">
          <p className="font-label uppercase tracking-wider text-[10px] mb-2" style={{ color: 'var(--text-muted)' }}>
            Dein Einladungslink
          </p>
          <div className="flex items-center gap-3">
            <code
              className="flex-1 font-body text-sm rounded-xl px-3 py-2 truncate"
              style={{ color: 'var(--gold-text)', background: 'var(--glass)' }}
            >
              souleya.com?ref={profile.referral_code}
            </code>
            <button
              onClick={handleCopyReferral}
              className="px-3 py-2 rounded-xl font-label text-[0.65rem] tracking-[0.1em] uppercase cursor-pointer transition-colors duration-200 flex-shrink-0"
              style={{ border: '1px solid var(--gold-border-s)', color: 'var(--gold-text)' }}
            >
              Kopieren
            </button>
          </div>
        </div>

        {/* Einstellungen */}
        <div className="glass-card rounded-[18px] mt-4 mb-8">
          <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--divider-l)' }}>
            <p className="font-label uppercase tracking-wider text-[10px]" style={{ color: 'var(--text-muted)' }}>
              Einstellungen
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-5 py-4 text-sm font-body cursor-pointer transition-colors rounded-b-[18px]"
            style={{ color: 'var(--error)' }}
          >
            <span className="text-base">↩</span>
            Abmelden
          </button>
        </div>
      </div>
    </div>
  );
}
