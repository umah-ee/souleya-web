'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import type { Profile, UpdateProfileData } from '@/types/profile';
import { updateProfile, uploadAvatar, uploadBanner } from '@/lib/profile';
import { geocodeLocation } from '@/lib/events';
import { INTEREST_CATEGORIES, searchInterestTags } from '@/lib/interestTags';
import Panel from '@/components/ui/Panel';
import { Icon } from '@/components/ui/Icon';

const MAX_INTERESTS = 15;

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
    birthday: profile.birthday ?? '',
    location: profile.location ?? '',
    location_lat: profile.location_lat,
    location_lng: profile.location_lng,
    interests: profile.interests ?? [],
  });
  const [tagInput, setTagInput] = useState('');
  const [tagSearch, setTagSearch] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
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
  useEffect(() => {
    if (isOpen) {
      setForm({
        display_name: profile.display_name ?? '',
        username: profile.username ?? '',
        bio: profile.bio ?? '',
        birthday: profile.birthday ?? '',
        location: profile.location ?? '',
        location_lat: profile.location_lat,
        location_lng: profile.location_lng,
        interests: profile.interests ?? [],
      });
      setError('');
      setSuccess('');
    }
  }, [isOpen, profile]);

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
    if (!trimmed || form.interests.length >= MAX_INTERESTS || form.interests.includes(trimmed)) return;
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
        birthday: form.birthday || undefined,
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

  const inputStyle: React.CSSProperties = {
    background: 'var(--input-bg)',
    border: '1px solid var(--divider-l)',
    color: 'var(--text-h)',
    borderRadius: '8px',
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

      {/* ── Avatar + Banner Upload — Mockup: dashed-border cards ── */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 flex flex-col items-center justify-center cursor-pointer transition-colors"
          style={{
            padding: '16px 12px',
            borderRadius: '8px',
            border: '1.5px dashed var(--divider-l)',
            background: 'transparent',
            color: 'var(--text-sec)',
          }}
        >
          <Icon name="camera" size={18} style={{ color: 'var(--gold)', marginBottom: '6px' }} />
          <span className="font-label uppercase" style={{ fontSize: '9px', letterSpacing: '1px' }}>
            {uploading ? '...' : 'Avatar'}
          </span>
        </button>
        <button
          onClick={() => bannerInputRef.current?.click()}
          className="flex-1 flex flex-col items-center justify-center cursor-pointer transition-colors"
          style={{
            padding: '16px 12px',
            borderRadius: '8px',
            border: '1.5px dashed var(--divider-l)',
            background: 'transparent',
            color: 'var(--text-sec)',
          }}
        >
          <Icon name="image" size={18} style={{ color: 'var(--gold)', marginBottom: '6px' }} />
          <span className="font-label uppercase" style={{ fontSize: '9px', letterSpacing: '1px' }}>
            {uploadingBanner ? '...' : 'Banner'}
          </span>
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
        <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
      </div>

      {/* ── Name — Mockup: 10px Josefin label above ── */}
      <div style={{ marginBottom: '16px' }}>
        <FieldLabel>Name</FieldLabel>
        <input
          type="text"
          value={form.display_name}
          onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
          placeholder="Anzeigename"
          maxLength={60}
          className="w-full px-3 py-2.5 text-[14px] font-body outline-none"
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <FieldLabel>Benutzername</FieldLabel>
        <div className="flex items-center gap-2 w-full px-3 py-2.5" style={inputStyle}>
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
      <div style={{ marginBottom: '16px' }}>
        <FieldLabel>Ueber dich</FieldLabel>
        <textarea
          value={form.bio}
          onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
          placeholder="Ueber dich ..."
          maxLength={300}
          rows={3}
          className="w-full px-3 py-2.5 text-[14px] font-body outline-none resize-none"
          style={inputStyle}
        />
      </div>

      {/* ── Geburtstag ── */}
      <div style={{ marginBottom: '16px' }}>
        <FieldLabel>Geburtstag</FieldLabel>
        <input
          type="date"
          value={form.birthday}
          onChange={(e) => setForm((f) => ({ ...f, birthday: e.target.value }))}
          max={new Date().toISOString().split('T')[0]}
          className="w-full px-3 py-2.5 text-[14px] font-body outline-none"
          style={inputStyle}
        />
      </div>

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
      <InterestsSection
        selected={form.interests}
        onAdd={addTag}
        onRemove={removeTag}
        tagInput={tagInput}
        setTagInput={setTagInput}
        onTagKeyDown={handleTagKeyDown}
        tagSearch={tagSearch}
        setTagSearch={setTagSearch}
        expandedCategory={expandedCategory}
        setExpandedCategory={setExpandedCategory}
        inputStyle={inputStyle}
      />

      {/* ── Save Button — Mockup: gradient, letter-spacing 2px ── */}
      <div style={{ padding: '8px 0' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 rounded-full font-label uppercase transition-all duration-200"
          style={{
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '2px',
            background: saving ? 'var(--gold-bg-hover)' : 'linear-gradient(135deg, var(--gold-deep), var(--gold))',
            color: saving ? 'var(--text-muted)' : 'var(--text-on-gold)',
            cursor: saving ? 'not-allowed' : 'pointer',
            border: 'none',
            boxShadow: saving ? 'none' : '0 4px 16px var(--gold-glow)',
          }}
        >
          {saving ? '...' : 'Speichern'}
        </button>
      </div>
    </Panel>
  );
}

// ── Interests Section ─────────────────────────────────────────
function InterestsSection({
  selected,
  onAdd,
  onRemove,
  tagInput,
  setTagInput,
  onTagKeyDown,
  tagSearch,
  setTagSearch,
  expandedCategory,
  setExpandedCategory,
  inputStyle,
}: {
  selected: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
  tagInput: string;
  setTagInput: (v: string) => void;
  onTagKeyDown: (e: React.KeyboardEvent) => void;
  tagSearch: string;
  setTagSearch: (v: string) => void;
  expandedCategory: string | null;
  setExpandedCategory: (v: string | null) => void;
  inputStyle: React.CSSProperties;
}) {
  const isFull = selected.length >= MAX_INTERESTS;

  // Search results
  const searchResults = useMemo(() => {
    if (!tagSearch.trim()) return [];
    return searchInterestTags(tagSearch).filter((t) => !selected.includes(t));
  }, [tagSearch, selected]);

  return (
    <div className="mb-6">
      <p className="text-[10px] font-label tracking-[1.2px] uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
        Interessen ({selected.length}/{MAX_INTERESTS})
      </p>

      {/* Ausgewählte Tags */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-[6px] mb-3">
          {selected.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-label tracking-[0.8px] uppercase px-[10px] py-[4px] rounded-full inline-flex items-center gap-1"
              style={{ color: 'var(--gold-text)', border: '1px solid var(--gold-border)', background: 'var(--gold-bg)' }}
            >
              {tag}
              <button
                onClick={() => onRemove(tag)}
                className="ml-0.5 cursor-pointer bg-transparent border-none"
                style={{ color: 'var(--text-muted)' }}
              >
                <Icon name="x" size={10} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Eigenen Tag eingeben */}
      {!isFull && (
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={onTagKeyDown}
          placeholder="Eigenen Tag eingeben + Enter"
          maxLength={30}
          className="w-full rounded-input px-3 py-2 text-[13px] font-body outline-none mb-3"
          style={inputStyle}
        />
      )}

      {/* Suchfeld für Vorschläge */}
      {!isFull && (
        <div className="relative mb-3">
          <div className="flex items-center gap-2 w-full rounded-input px-3 py-2" style={inputStyle}>
            <Icon name="search" size={14} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={tagSearch}
              onChange={(e) => setTagSearch(e.target.value)}
              placeholder="Vorschläge durchsuchen …"
              maxLength={40}
              className="flex-1 text-[13px] font-body outline-none bg-transparent min-w-0"
              style={{ color: 'var(--text-h)' }}
            />
            {tagSearch && (
              <button
                onClick={() => setTagSearch('')}
                className="cursor-pointer bg-transparent border-none"
                style={{ color: 'var(--text-muted)' }}
              >
                <Icon name="x" size={14} />
              </button>
            )}
          </div>

          {/* Suchergebnisse */}
          {searchResults.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {searchResults.slice(0, 12).map((tag) => (
                <button
                  key={tag}
                  onClick={() => { onAdd(tag); setTagSearch(''); }}
                  className="text-[9px] tracking-[0.8px] uppercase px-2 py-[3px] rounded-full cursor-pointer transition-colors duration-150"
                  style={{ color: 'var(--gold-text)', border: '1px solid var(--gold-border-s)', background: 'transparent' }}
                >
                  + {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Kategorien (aufklappbar) */}
      {!isFull && !tagSearch && (
        <div className="space-y-1">
          {INTEREST_CATEGORIES.map((cat) => {
            const availableTags = cat.tags.filter((t) => !selected.includes(t));
            if (availableTags.length === 0) return null;
            const isOpen = expandedCategory === cat.label;

            return (
              <div key={cat.label}>
                <button
                  onClick={() => setExpandedCategory(isOpen ? null : cat.label)}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-colors duration-150 bg-transparent border-none text-left"
                  style={{
                    background: isOpen ? 'var(--gold-bg)' : 'transparent',
                  }}
                >
                  <span className="flex-1 text-[12px] font-body font-medium" style={{ color: 'var(--text-h)' }}>
                    {cat.label}
                  </span>
                  <span className="text-[10px] font-label" style={{ color: 'var(--text-muted)' }}>
                    {availableTags.length}
                  </span>
                  <Icon
                    name="chevron-right"
                    size={12}
                    style={{
                      color: 'var(--text-muted)',
                      transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.15s ease',
                    }}
                  />
                </button>

                {isOpen && (
                  <div className="flex flex-wrap gap-1 px-2.5 py-2">
                    {availableTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => onAdd(tag)}
                        className="text-[9px] tracking-[0.8px] uppercase px-2 py-[3px] rounded-full cursor-pointer transition-colors duration-150"
                        style={{ color: 'var(--text-muted)', border: '1px solid var(--divider)', background: 'transparent' }}
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Field Label — Mockup: 10px Josefin Sans uppercase */
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="font-label uppercase"
      style={{
        fontSize: '10px',
        fontWeight: 500,
        letterSpacing: '1.2px',
        color: 'var(--text-muted)',
        marginBottom: '8px',
      }}
    >
      {children}
    </div>
  );
}
