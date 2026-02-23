'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { Profile } from '@/types/profile';
import { VIP_NAMES } from '@/types/profile';
import { fetchProfile, updateProfile, uploadAvatar, uploadBanner } from '@/lib/profile';
import { geocodeLocation } from '@/lib/events';
import { createClient } from '@/lib/supabase/client';

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
  });

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
    if (editing) {
      fileInputRef.current?.click();
    }
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
    if (editing) {
      bannerInputRef.current?.click();
    }
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

  if (loading) {
    return (
      <div className="text-center py-12 text-[#5A5450]">
        <p className="font-label text-[0.7rem] tracking-[0.2em]">
          WIRD GELADEN ...
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12 text-[#5A5450]">
        <p className="text-sm">Profil konnte nicht geladen werden.</p>
      </div>
    );
  }

  const initials = (profile.display_name ?? profile.username ?? profile.email ?? '?').slice(0, 1).toUpperCase();
  const vipName = VIP_NAMES[profile.vip_level] ?? `VIP ${profile.vip_level}`;

  return (
    <div className="-mx-4 -mt-6">
      {/* ─── BANNER ────────────────────────────────────────── */}
      <div
        className={`relative w-full h-[180px] overflow-hidden ${editing ? 'cursor-pointer' : ''}`}
        onClick={handleBannerClick}
      >
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

        {/* Gradient Overlay nach unten */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-est via-dark-est/40 to-transparent" />

        {/* Banner-Upload Indicator */}
        {editing && (
          <div className="absolute top-3 right-3 w-8 h-8 bg-dark-est/70 backdrop-blur-sm rounded-full flex items-center justify-center text-gold-1 text-sm border border-gold-1/20">
            {uploadingBanner ? '...' : '📷'}
          </div>
        )}

        <input
          ref={bannerInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleBannerUpload}
        />
      </div>

      <div className="px-4">
        {/* ─── AVATAR + NAME (ueberlappt Banner) ──────────── */}
        <div className="flex items-end gap-4 -mt-12 mb-4 relative z-10">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div
              onClick={handleAvatarClick}
              className={`
                w-[88px] h-[88px] rounded-full bg-dark-est flex items-center justify-center
                font-heading text-3xl text-gold-1 overflow-hidden
                border-[3px] ${profile.is_origin_soul
                  ? 'border-gold-1/70 shadow-[0_0_20px_rgba(200,169,110,0.25)]'
                  : 'border-gold-1/30'
                }
                ${editing ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
              `}
            >
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : initials}
              {uploading && (
                <div className="absolute inset-0 bg-dark-est/60 rounded-full flex items-center justify-center">
                  <span className="font-label text-[0.6rem] text-gold-1 tracking-[0.1em]">...</span>
                </div>
              )}
            </div>
            {editing && (
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gold-1 rounded-full flex items-center justify-center text-dark-est text-xs shadow-lg">
                ✎
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>

          {/* Name + Badges */}
          <div className="flex-1 min-w-0 pb-1">
            {editing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={form.display_name}
                  onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
                  placeholder="Anzeigename"
                  maxLength={60}
                  className="w-full bg-white/[0.06] border border-gold-1/20 rounded-xl px-3 py-2 text-[#F0EDE8] text-sm font-body outline-none focus:border-gold-1 transition-colors"
                />
                <div className="flex items-center gap-1">
                  <span className="text-[#5A5450] text-sm">@</span>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm((f) => ({ ...f, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
                    placeholder="username"
                    maxLength={30}
                    className="flex-1 bg-white/[0.06] border border-gold-1/20 rounded-xl px-3 py-2 text-[#F0EDE8] text-sm font-body outline-none focus:border-gold-1 transition-colors"
                  />
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-[#F0EDE8] font-body font-semibold text-lg truncate">
                  {profile.display_name ?? profile.email}
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
              </>
            )}
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 py-2 px-4 bg-[rgba(82,183,136,0.1)] border border-[rgba(82,183,136,0.3)] rounded-xl text-[#52B788] text-sm font-body text-center">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 py-2 px-4 bg-[rgba(230,57,70,0.1)] border border-[rgba(230,57,70,0.3)] rounded-xl text-[#E63946] text-sm font-body text-center">
            {error}
          </div>
        )}

        {/* ─── BIO + LOCATION ─────────────────────────────── */}
        {editing ? (
          <div className="space-y-3 mb-5">
            <textarea
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              placeholder="Ueber dich ..."
              maxLength={300}
              rows={3}
              className="w-full bg-white/[0.06] border border-gold-1/20 rounded-xl px-3 py-2 text-[#F0EDE8] text-sm font-body outline-none focus:border-gold-1 transition-colors resize-none"
            />
            <div className="flex items-center gap-2">
              <span className="text-[#5A5450]">📍</span>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value, location_lat: null, location_lng: null }))}
                onBlur={handleLocationBlur}
                placeholder="Ort (z.B. Muenchen – Schwabing)"
                maxLength={80}
                className="flex-1 bg-white/[0.06] border border-gold-1/20 rounded-xl px-3 py-2 text-[#F0EDE8] text-sm font-body outline-none focus:border-gold-1 transition-colors"
              />
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={detectingLocation}
                className={`
                  px-3 py-2 rounded-xl font-label text-[0.6rem] tracking-[0.1em] uppercase transition-all duration-200 flex-shrink-0
                  ${detectingLocation
                    ? 'bg-gold-1/10 text-[#5A5450] cursor-not-allowed'
                    : 'border border-gold-1/20 text-gold-1 cursor-pointer hover:border-gold-1/40 hover:bg-gold-1/5'
                  }
                `}
                title="Standort automatisch erkennen"
              >
                {detectingLocation ? '...' : '📍 Erkennen'}
              </button>
            </div>
            {form.location_lat && (
              <p className="text-[#5A5450] text-[0.65rem] font-body ml-6">
                Standort gesetzt (Stadtteil-Genauigkeit)
              </p>
            )}
          </div>
        ) : (
          <>
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
          </>
        )}

        {/* ─── EDIT ACTIONS ──────────────────────────────── */}
        {editing ? (
          <div className="flex gap-3 mb-5">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`
                flex-1 py-2.5 rounded-full font-label text-[0.7rem] tracking-[0.1em] uppercase transition-all duration-200
                ${saving
                  ? 'bg-gold-1/30 text-dark cursor-not-allowed'
                  : 'bg-gradient-to-br from-gold-3 to-gold-2 text-dark cursor-pointer hover:opacity-90'
                }
              `}
            >
              {saving ? '...' : 'Speichern'}
            </button>
            <button
              onClick={handleCancel}
              className="px-6 py-2.5 border border-[#5A5450]/30 rounded-full text-[#5A5450] font-label text-[0.7rem] tracking-[0.1em] uppercase cursor-pointer hover:border-[#5A5450]/50 transition-colors duration-200"
            >
              Abbrechen
            </button>
          </div>
        ) : (
          <button
            onClick={handleEdit}
            className="w-full py-2.5 mb-5 border border-gold-1/25 rounded-full text-gold-1 font-label text-[0.7rem] tracking-[0.1em] uppercase cursor-pointer hover:border-gold-1/40 hover:bg-gold-1/5 transition-colors duration-200"
          >
            Profil bearbeiten
          </button>
        )}

        {/* ─── STATS KACHELN ─────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-dark rounded-2xl border border-gold-1/10 p-4 text-center">
            <p className="text-gold-1 font-body font-semibold text-lg">{profile.seeds_balance}</p>
            <p className="text-[#5A5450] font-label text-[0.6rem] tracking-[0.15em] uppercase mt-1">Seeds</p>
          </div>
          <div className="bg-dark rounded-2xl border border-gold-1/10 p-4 text-center">
            <p className="text-[#F0EDE8] font-body font-semibold text-lg">{profile.connections_count}</p>
            <p className="text-[#5A5450] font-label text-[0.6rem] tracking-[0.15em] uppercase mt-1">Verbindungen</p>
          </div>
          <div className="bg-dark rounded-2xl border border-gold-1/10 p-4 text-center">
            <p className="text-gold-3 font-body font-semibold text-lg">{profile.vip_level}</p>
            <p className="text-[#5A5450] font-label text-[0.6rem] tracking-[0.15em] uppercase mt-1">VIP</p>
          </div>
        </div>

        {/* ─── EINLADUNGSLINK ────────────────────────────── */}
        <div className="bg-dark rounded-2xl border border-gold-1/10 p-5 mb-5">
          <p className="text-[#5A5450] font-label uppercase tracking-wider text-[10px] mb-2">
            Dein Einladungslink
          </p>
          <div className="flex items-center gap-3">
            <code className="flex-1 text-gold-2 font-body text-sm bg-dark-est rounded-xl px-3 py-2 truncate">
              souleya.com?ref={profile.referral_code}
            </code>
            <button
              onClick={handleCopyReferral}
              className="px-3 py-2 border border-gold-1/30 rounded-xl text-gold-1 font-label text-[0.65rem] tracking-[0.1em] uppercase cursor-pointer hover:border-gold-1/50 hover:bg-gold-1/5 transition-colors duration-200 flex-shrink-0"
            >
              Kopieren
            </button>
          </div>
        </div>

        {/* ─── EINSTELLUNGEN ─────────────────────────────── */}
        <div className="bg-dark rounded-2xl border border-gold-1/10 mb-8">
          <div className="px-5 py-3 border-b border-gold-1/[0.06]">
            <p className="text-[#5A5450] font-label uppercase tracking-wider text-[10px]">
              Einstellungen
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-5 py-4 text-[#E63946] text-sm font-body cursor-pointer hover:bg-white/[0.02] transition-colors rounded-b-2xl"
          >
            <span className="text-base">↩</span>
            Abmelden
          </button>
        </div>
      </div>
    </div>
  );
}
