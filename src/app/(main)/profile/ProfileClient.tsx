'use client';

import { useState, useEffect, useRef } from 'react';
import type { Profile } from '@/types/profile';
import { VIP_NAMES } from '@/types/profile';
import { fetchProfile, updateProfile, uploadAvatar } from '@/lib/profile';

export default function ProfileClient() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit-Form State
  const [form, setForm] = useState({
    display_name: '',
    username: '',
    bio: '',
    location: '',
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
    });
    setEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setEditing(false);
    setError('');
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

    // Max 5 MB
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

  if (loading) {
    return (
      <div className="text-center py-12 text-[#5A5450]">
        <p className="font-label text-[0.7rem] tracking-[0.2em]">
          WIRD GELADEN …
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
    <>
      {/* Desktop Header */}
      <div className="hidden md:flex md:items-center md:justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-light text-gold-1 tracking-wide">
            Profil
          </h1>
          <p className="text-sm text-[#5A5450] font-body mt-1">
            Dein Souleya-Profil
          </p>
        </div>
        {!editing && (
          <button
            onClick={handleEdit}
            className="px-4 py-2 border border-gold-1/30 rounded-full text-gold-1 font-label text-[0.7rem] tracking-[0.1em] uppercase cursor-pointer hover:border-gold-1/50 transition-colors duration-200"
          >
            Bearbeiten
          </button>
        )}
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

      {/* Profile Card */}
      <div className="bg-dark rounded-2xl border border-gold-1/10 p-6">
        {/* Avatar + Name Section */}
        <div className="flex items-start gap-4 mb-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div
              onClick={handleAvatarClick}
              className={`
                w-20 h-20 rounded-full bg-gold-1/15 flex items-center justify-center
                font-heading text-3xl text-gold-1 overflow-hidden
                border-2 ${profile.is_origin_soul ? 'border-gold-1/60 shadow-[0_0_15px_rgba(200,169,110,0.2)]' : 'border-gold-1/20'}
                ${editing ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
              `}
            >
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : initials}
              {uploading && (
                <div className="absolute inset-0 bg-dark-est/60 rounded-full flex items-center justify-center">
                  <span className="font-label text-[0.6rem] text-gold-1 tracking-[0.1em]">…</span>
                </div>
              )}
            </div>
            {editing && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gold-1 rounded-full flex items-center justify-center text-dark-est text-xs">
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

          {/* Name + Meta */}
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-3">
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
                <h2 className="text-[#F0EDE8] font-body font-medium text-lg truncate">
                  {profile.display_name ?? profile.email}
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
              </>
            )}

            {/* Mobile Edit Button */}
            {!editing && (
              <button
                onClick={handleEdit}
                className="md:hidden mt-3 px-3 py-1.5 border border-gold-1/30 rounded-full text-gold-1 font-label text-[0.65rem] tracking-[0.1em] uppercase cursor-pointer hover:border-gold-1/50 transition-colors duration-200"
              >
                Bearbeiten
              </button>
            )}
          </div>
        </div>

        {/* Bio + Location */}
        {editing ? (
          <div className="space-y-3 mb-6">
            <textarea
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              placeholder="Ueber dich …"
              maxLength={300}
              rows={3}
              className="w-full bg-white/[0.06] border border-gold-1/20 rounded-xl px-3 py-2 text-[#F0EDE8] text-sm font-body outline-none focus:border-gold-1 transition-colors resize-none"
            />
            <div className="flex items-center gap-2">
              <span className="text-[#5A5450]">📍</span>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                placeholder="Ort (z.B. Muenchen – Schwabing)"
                maxLength={80}
                className="flex-1 bg-white/[0.06] border border-gold-1/20 rounded-xl px-3 py-2 text-[#F0EDE8] text-sm font-body outline-none focus:border-gold-1 transition-colors"
              />
            </div>
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

        {/* Edit Actions */}
        {editing && (
          <div className="flex gap-3 mb-6">
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
              {saving ? '…' : 'Speichern'}
            </button>
            <button
              onClick={handleCancel}
              className="px-6 py-2.5 border border-[#5A5450]/30 rounded-full text-[#5A5450] font-label text-[0.7rem] tracking-[0.1em] uppercase cursor-pointer hover:border-[#5A5450]/50 transition-colors duration-200"
            >
              Abbrechen
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="border-t border-gold-1/10 pt-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[#5A5450] font-label uppercase tracking-wider text-[10px]">
              Seeds
            </span>
            <span className="text-gold-1 font-body">
              {profile.seeds_balance}
            </span>
          </div>
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

      {/* Referral Code */}
      <div className="mt-4 bg-dark rounded-2xl border border-gold-1/10 p-5">
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
    </>
  );
}
