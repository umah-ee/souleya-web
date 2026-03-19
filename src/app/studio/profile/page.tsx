'use client';
import { useState, useEffect, useCallback } from 'react';
import { Icon } from '@/components/ui/Icon';
import { fetchMentorProfile, updateMentorProfile } from '@/lib/studio';
import type { MentorProfile, UpdateMentorProfileData } from '@/types/studio';

const SPECIALIZATION_SUGGESTIONS = [
  'Yoga', 'Meditation', 'Breathwork', 'Achtsamkeit', 'Kakao-Zeremonie',
  'Sound Healing', 'Tantra', 'Ayurveda', 'Schamanismus', 'Astrologie',
  'Reiki', 'Qigong', 'Pilates', 'Ernaehrung', 'Coaching',
  'Tarot', 'Naturverbindung', 'Tanz', 'Journaling', 'Kreativitaet',
];

const SOCIAL_PLATFORMS = [
  { key: 'instagram', label: 'Instagram', placeholder: '@deinname' },
  { key: 'youtube', label: 'YouTube', placeholder: 'youtube.com/c/...' },
  { key: 'tiktok', label: 'TikTok', placeholder: '@deinname' },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/in/...' },
];

export default function StudioProfilePage() {
  const [profile, setProfile] = useState<MentorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [tagInput, setTagInput] = useState('');

  const [form, setForm] = useState<UpdateMentorProfileData>({
    mentor_bio: '',
    mentor_tagline: '',
    specializations: [],
    mentor_website: '',
    mentor_social: {},
  });

  useEffect(() => {
    fetchMentorProfile()
      .then((p) => {
        setProfile(p);
        setForm({
          mentor_bio: p.mentor_bio ?? '',
          mentor_tagline: p.mentor_tagline ?? '',
          specializations: p.specializations ?? [],
          mentor_website: p.mentor_website ?? '',
          mentor_social: p.mentor_social ?? {},
        });
      })
      .catch(() => setError('Profil konnte nicht geladen werden'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const updated = await updateMentorProfile(form);
      setProfile(updated);
      setSuccess('Profil gespeichert');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Speichern fehlgeschlagen');
    } finally {
      setSaving(false);
    }
  }, [form]);

  const addSpecialization = useCallback((tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed || (form.specializations ?? []).includes(trimmed)) return;
    setForm((f) => ({ ...f, specializations: [...(f.specializations ?? []), trimmed] }));
    setTagInput('');
  }, [form.specializations]);

  const removeSpecialization = useCallback((tag: string) => {
    setForm((f) => ({ ...f, specializations: (f.specializations ?? []).filter((t) => t !== tag) }));
  }, []);

  const updateSocial = useCallback((key: string, value: string) => {
    setForm((f) => ({ ...f, mentor_social: { ...(f.mentor_social ?? {}), [key]: value } }));
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <div className="spinner" />
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>Profil laden...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontSize: 11, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--text-muted)', margin: 0 }}>
          Profil & Branding
        </h2>
        {success && (
          <span style={{ fontSize: 12, color: 'var(--color-success, #4ade80)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="check" size={14} /> {success}
          </span>
        )}
        {error && (
          <span style={{ fontSize: 12, color: 'var(--color-error, #f87171)' }}>{error}</span>
        )}
      </div>

      <div style={{ display: 'grid', gap: 20 }}>

        {/* Profilinfo */}
        {profile && (
          <div className="glass-card rounded-[8px] p-6" style={{ background: 'var(--card-bg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt=""
                  style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--gold)' }}
                />
              ) : (
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--glass)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="user" size={24} style={{ color: 'var(--text-muted)' }} />
                </div>
              )}
              <div>
                <p style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-h)', margin: 0 }}>
                  {profile.display_name || profile.username || 'Unbenannt'}
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-sec)', margin: 0 }}>
                  {profile.email}
                </p>
              </div>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Name, Avatar und E-Mail werden ueber dein allgemeines Profil bearbeitet.
            </p>
          </div>
        )}

        {/* Tagline */}
        <div className="glass-card rounded-[8px] p-6" style={{ background: 'var(--card-bg)' }}>
          <label style={{ display: 'block', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
            Tagline
          </label>
          <input
            type="text"
            value={form.mentor_tagline ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, mentor_tagline: e.target.value }))}
            placeholder="z.B. Yoga-Lehrerin & Achtsamkeits-Coach"
            maxLength={120}
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 8,
              border: '1px solid var(--glass-border)', background: 'var(--glass)',
              color: 'var(--text-h)', fontSize: 14, outline: 'none',
            }}
          />
          <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, textAlign: 'right' }}>
            {(form.mentor_tagline ?? '').length}/120
          </p>
        </div>

        {/* Bio */}
        <div className="glass-card rounded-[8px] p-6" style={{ background: 'var(--card-bg)' }}>
          <label style={{ display: 'block', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
            Mentor Bio
          </label>
          <textarea
            value={form.mentor_bio ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, mentor_bio: e.target.value }))}
            placeholder="Erzaehle ueber dich, deine Erfahrung und deine Philosophie..."
            rows={5}
            maxLength={2000}
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 8,
              border: '1px solid var(--glass-border)', background: 'var(--glass)',
              color: 'var(--text-h)', fontSize: 14, outline: 'none',
              resize: 'vertical', minHeight: 120,
            }}
          />
          <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, textAlign: 'right' }}>
            {(form.mentor_bio ?? '').length}/2000
          </p>
        </div>

        {/* Spezialisierungen */}
        <div className="glass-card rounded-[8px] p-6" style={{ background: 'var(--card-bg)' }}>
          <label style={{ display: 'block', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
            Spezialisierungen
          </label>

          {/* Aktive Tags */}
          {(form.specializations ?? []).length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {(form.specializations ?? []).map((tag) => (
                <span
                  key={tag}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '4px 10px', borderRadius: 9999,
                    background: 'var(--gold)', color: '#1a1a1a',
                    fontSize: 11, fontWeight: 500, cursor: 'pointer',
                  }}
                  onClick={() => removeSpecialization(tag)}
                >
                  {tag}
                  <Icon name="x" size={12} style={{ opacity: 0.7 }} />
                </span>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSpecialization(tagInput); } }}
              placeholder="Spezialisierung eingeben..."
              style={{
                flex: 1, padding: '8px 12px', borderRadius: 8,
                border: '1px solid var(--glass-border)', background: 'var(--glass)',
                color: 'var(--text-h)', fontSize: 13, outline: 'none',
              }}
            />
            <button
              onClick={() => addSpecialization(tagInput)}
              disabled={!tagInput.trim()}
              style={{
                padding: '8px 16px', borderRadius: 9999,
                background: tagInput.trim() ? 'var(--gold)' : 'var(--glass)',
                color: tagInput.trim() ? '#1a1a1a' : 'var(--text-muted)',
                border: 'none', fontSize: 12, fontWeight: 500, cursor: tagInput.trim() ? 'pointer' : 'default',
              }}
            >
              Hinzufuegen
            </button>
          </div>

          {/* Vorschlaege */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {SPECIALIZATION_SUGGESTIONS
              .filter((s) => !(form.specializations ?? []).includes(s))
              .map((s) => (
                <button
                  key={s}
                  onClick={() => addSpecialization(s)}
                  style={{
                    padding: '4px 10px', borderRadius: 9999,
                    background: 'var(--glass)', border: '1px solid var(--glass-border)',
                    color: 'var(--text-sec)', fontSize: 11, cursor: 'pointer',
                  }}
                >
                  + {s}
                </button>
              ))}
          </div>
        </div>

        {/* Website */}
        <div className="glass-card rounded-[8px] p-6" style={{ background: 'var(--card-bg)' }}>
          <label style={{ display: 'block', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
            Website
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="world" size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              type="url"
              value={form.mentor_website ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, mentor_website: e.target.value }))}
              placeholder="https://deine-website.de"
              style={{
                flex: 1, padding: '10px 14px', borderRadius: 8,
                border: '1px solid var(--glass-border)', background: 'var(--glass)',
                color: 'var(--text-h)', fontSize: 14, outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Social Links */}
        <div className="glass-card rounded-[8px] p-6" style={{ background: 'var(--card-bg)' }}>
          <label style={{ display: 'block', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>
            Social Media
          </label>
          <div style={{ display: 'grid', gap: 10 }}>
            {SOCIAL_PLATFORMS.map((platform) => (
              <div key={platform.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-sec)', width: 80, flexShrink: 0 }}>
                  {platform.label}
                </span>
                <input
                  type="text"
                  value={(form.mentor_social ?? {})[platform.key] ?? ''}
                  onChange={(e) => updateSocial(platform.key, e.target.value)}
                  placeholder={platform.placeholder}
                  style={{
                    flex: 1, padding: '8px 12px', borderRadius: 8,
                    border: '1px solid var(--glass-border)', background: 'var(--glass)',
                    color: 'var(--text-h)', fontSize: 13, outline: 'none',
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Speichern */}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%', padding: '14px 24px', borderRadius: 9999,
            background: 'var(--gold)', color: '#1a1a1a',
            border: 'none', fontSize: 14, fontWeight: 500,
            cursor: saving ? 'wait' : 'pointer',
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? 'Speichere...' : 'Profil speichern'}
        </button>

      </div>
    </div>
  );
}
