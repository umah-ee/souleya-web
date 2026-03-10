'use client';

import { useState, useRef } from 'react';
import type { Profile, UpdateProfileData } from '@/types/profile';
import { updateProfile, uploadAvatar, uploadBanner } from '@/lib/profile';
import { geocodeLocation } from '@/lib/events';
import Panel from '@/components/ui/Panel';
import { Icon } from '@/components/ui/Icon';

// ── Vorschlaege fuer Interest Tags ─────────────────────────
const INTEREST_SUGGESTIONS = [
  'Achtsamkeit', 'Yoga', 'Meditation', 'Atemarbeit', 'Heilung',
  'Buddhismus', 'Schamanismus', 'Ayurveda', 'Reiki', 'Tantra',
  'Naturheilkunde', 'Psychologie', 'Coaching', 'Tanz', 'Musik',
  'Kunst', 'Journaling', 'Fasten', 'Qigong', 'Tai Chi',
];

interface EditProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
  onProfileUpdated: (updated: Profile) => void;
}

export default function EditProfilePanel({
  isOpen,
  onClose,
  profile,
  onProfileUpdated,
}: EditProfilePanelProps) {
  const [form, setForm] = useState({
    display_name: profile.display_name ?? '',
    username: profile.username ?? '',
    bio: profile.bio ?? '',
    location: profile.location ?? '',
    location_lat: profile.location_lat,
    location_lng: profile.location_lng,
    interests: profile.interests ?? [],
  });
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<Array<{ place_name: string; lat: number; lng: number }>>([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const locationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Sync form when panel opens with new profile ──
  // (useEffect would be better but useState initializer suffices for now)

  // ── GPS Standort ──
  const handleDetectLocation = async () => {
    if (!navigator.geolocation) {
      setError('Standorterkennung wird nicht unterstuetzt');
      return;
    }
    setDetectingLocation(true);
    setError('');
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: false, timeout: 10000 });
      });
      const { latitude, longitude } = pos.coords;
      const res = await geocodeLocation(`${longitude},${latitude}`, 'reverse');
      if (res.results.length > 0) {
        const place = res.results[0];
        setForm((f) => ({
          ...f,
          location: place.place_name.split(',').slice(0, 2).join(',').trim(),
          location_lat: place.lat,
          location_lng: place.lng,
        }));
      } else {
        setError('Standort konnte nicht aufgeloest werden');
      }
    } catch {
      setError('Standorterkennung fehlgeschlagen');
    } finally {
      setDetectingLocation(false);
    }
  };

  // ── Location Autocomplete ──
  const handleLocationChange = (value: string) => {
    setForm((f) => ({ ...f, location: value, location_lat: null, location_lng: null }));
    if (locationTimer.current) clearTimeout(locationTimer.current);
    if (value.trim().length < 3) {
      setLocationSuggestions([]);
      setShowLocationDropdown(false);
      return;
    }
    locationTimer.current = setTimeout(async () => {
      try {
        const res = await geocodeLocation(value, 'forward');
        if (res.results?.length > 0) {
          setLocationSuggestions(res.results.map((r) => ({ place_name: r.place_name, lat: r.lat, lng: r.lng })));
          setShowLocationDropdown(true);
        } else {
          setLocationSuggestions([]);
          setShowLocationDropdown(false);
        }
      } catch {
        setLocationSuggestions([]);
        setShowLocationDropdown(false);
      }
    }, 400);
  };

  const handleLocationSelect = (geo: { place_name: string; lat: number; lng: number }) => {
    setForm((f) => ({
      ...f,
      location: geo.place_name.split(',').slice(0, 2).join(',').trim(),
      location_lat: geo.lat,
      location_lng: geo.lng,
    }));
    setShowLocationDropdown(false);
  };

  // ── Tags ──
  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed || form.interests.length >= 10 || form.interests.includes(trimmed)) return;
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

  // ── Avatar Upload ──
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('Bild max. 5 MB'); return; }
    setUploading(true);
    setError('');
    try {
      const url = await uploadAvatar(file);
      const updated = await updateProfile({ avatar_url: url });
      onProfileUpdated(updated);
      setSuccess('Avatar aktualisiert');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload fehlgeschlagen');
    } finally {
      setUploading(false);
    }
  };

  // ── Banner Upload ──
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError('Banner max. 10 MB'); return; }
    setUploadingBanner(true);
    setError('');
    try {
      const url = await uploadBanner(file);
      const updated = await updateProfile({ banner_url: url });
      onProfileUpdated(updated);
      setSuccess('Banner aktualisiert');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload fehlgeschlagen');
    } finally {
      setUploadingBanner(false);
    }
  };

  // ── Save ──
  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const data: UpdateProfileData = {
        display_name: form.display_name || undefined,
        username: form.username || undefined,
        bio: form.bio || undefined,
        location: form.location || undefined,
        location_lat: form.location_lat ?? undefined,
        location_lng: form.location_lng ?? undefined,
        interests: form.interests,
      };
      const updated = await updateProfile(data);
      onProfileUpdated(updated);
      setSuccess('Profil gespeichert');
      setTimeout(() => {
        setSuccess('');
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    background: 'var(--glass)',
    border: '1px solid var(--gold-border-s)',
    color: 'var(--text-h)',
  };

  return (
    <Panel isOpen={isOpen} onClose={onClose} title="Profil bearbeiten">
      {/* ── Messages ── */}
      {error && (
        <div className="mb-4 py-2 px-3 rounded-xl text-[13px] font-body" style={{ background: 'var(--error-bg)', border: '1px solid var(--error-border)', color: 'var(--error)' }}>
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 py-2 px-3 rounded-xl text-[13px] font-body" style={{ background: 'var(--success-bg)', border: '1px solid var(--success-border)', color: 'var(--success)' }}>
          {success}
        </div>
      )}

      {/* ── Avatar + Banner Upload ── */}
      <div className="flex gap-3 mb-5">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 flex items-center gap-2 justify-center py-2.5 rounded-[12px] text-[12px] font-body cursor-pointer transition-colors"
          style={{ ...inputStyle }}
        >
          <Icon name="camera" size={14} style={{ color: 'var(--gold-text)' }} />
          {uploading ? '...' : 'Avatar'}
        </button>
        <button
          onClick={() => bannerInputRef.current?.click()}
          className="flex-1 flex items-center gap-2 justify-center py-2.5 rounded-[12px] text-[12px] font-body cursor-pointer transition-colors"
          style={{ ...inputStyle }}
        >
          <Icon name="image" size={14} style={{ color: 'var(--gold-text)' }} />
          {uploadingBanner ? '...' : 'Banner'}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
        <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
      </div>

      {/* ── Name ── */}
      <div className="space-y-3 mb-4">
        <input
          type="text"
          value={form.display_name}
          onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
          placeholder="Anzeigename"
          maxLength={60}
          className="w-full rounded-input px-3 py-2.5 text-[14px] font-body outline-none"
          style={inputStyle}
        />
        <div className="flex items-center gap-2 w-full rounded-input px-3 py-2.5" style={inputStyle}>
          <span className="text-[14px] shrink-0" style={{ color: 'var(--text-muted)' }}>@</span>
          <input
            type="text"
            value={form.username}
            onChange={(e) => setForm((f) => ({ ...f, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
            placeholder="username"
            maxLength={30}
            className="flex-1 text-[14px] font-body outline-none bg-transparent min-w-0"
            style={{ color: 'var(--text-h)' }}
          />
        </div>
      </div>

      {/* ── Bio ── */}
      <textarea
        value={form.bio}
        onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
        placeholder="Ueber dich ..."
        maxLength={300}
        rows={3}
        className="w-full rounded-input px-3 py-2.5 text-[14px] font-body outline-none resize-none mb-4"
        style={inputStyle}
      />

      {/* ── Location ── */}
      <div className="relative mb-4">
        <div className="flex items-center gap-2 w-full rounded-input px-3 py-2.5" style={inputStyle}>
          <Icon name="map-pin" size={14} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={form.location}
            onChange={(e) => handleLocationChange(e.target.value)}
            onBlur={() => setTimeout(() => setShowLocationDropdown(false), 200)}
            onFocus={() => { if (locationSuggestions.length > 0) setShowLocationDropdown(true); }}
            placeholder="Ort (z.B. Muenchen)"
            maxLength={80}
            className="flex-1 text-[14px] font-body outline-none bg-transparent min-w-0"
            style={{ color: 'var(--text-h)' }}
          />
          {form.location_lat != null && (
            <Icon name="map-pin" size={12} style={{ color: 'var(--success)' }} />
          )}
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={detectingLocation}
            className="shrink-0 bg-transparent border-none cursor-pointer"
            style={{ color: detectingLocation ? 'var(--text-muted)' : 'var(--gold-text)' }}
          >
            {detectingLocation ? '...' : <Icon name="current-location" size={16} />}
          </button>
        </div>
        {showLocationDropdown && locationSuggestions.length > 0 && (
          <div
            className="absolute left-0 right-0 top-full mt-1 z-50 rounded-lg overflow-hidden"
            style={{ background: 'var(--bg-solid)', border: '1px solid var(--glass-border)', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}
          >
            {locationSuggestions.map((geo, i) => (
              <button
                key={i}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleLocationSelect(geo)}
                className="w-full text-left px-3 py-2.5 text-[13px] font-body flex items-center gap-2 cursor-pointer"
                style={{ color: 'var(--text-h)', borderBottom: i < locationSuggestions.length - 1 ? '1px solid var(--divider-l)' : undefined }}
              >
                <Icon name="map-pin" size={12} style={{ color: 'var(--gold)', flexShrink: 0 }} />
                <span className="truncate">{geo.place_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Interests ── */}
      <div className="mb-6">
        <p className="text-[10px] font-label tracking-[1.2px] uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
          Interessen ({form.interests.length}/10)
        </p>
        {form.interests.length > 0 && (
          <div className="flex flex-wrap gap-[6px] mb-2">
            {form.interests.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-label tracking-[0.8px] uppercase px-[10px] py-[4px] rounded-full inline-flex items-center gap-1"
                style={{ color: 'var(--gold-text)', border: '1px solid var(--gold-border)', background: 'var(--gold-bg)' }}
              >
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-0.5 cursor-pointer bg-transparent border-none"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <Icon name="x" size={10} />
                </button>
              </span>
            ))}
          </div>
        )}
        {form.interests.length < 10 && (
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="Tag eingeben + Enter"
            maxLength={30}
            className="w-full rounded-input px-3 py-2 text-[13px] font-body outline-none mb-2"
            style={inputStyle}
          />
        )}
        <div className="flex flex-wrap gap-1">
          {INTEREST_SUGGESTIONS.filter((s) => !form.interests.includes(s)).slice(0, 8).map((s) => (
            <button
              key={s}
              onClick={() => addTag(s)}
              className="text-[9px] tracking-[0.8px] uppercase px-2 py-[3px] rounded-full cursor-pointer"
              style={{ color: 'var(--text-muted)', border: '1px solid var(--divider)', background: 'transparent' }}
            >
              + {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Save Button ── */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 rounded-full font-label text-[11px] tracking-[1px] uppercase transition-all duration-200"
        style={{
          background: saving ? 'var(--gold-bg-hover)' : 'var(--gold)',
          color: saving ? 'var(--text-muted)' : 'var(--text-on-gold)',
          cursor: saving ? 'not-allowed' : 'pointer',
          border: 'none',
        }}
      >
        {saving ? '...' : 'Speichern'}
      </button>
    </Panel>
  );
}
