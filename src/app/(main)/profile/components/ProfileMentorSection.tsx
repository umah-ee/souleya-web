'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Profile, UpdateProfileData } from '@/types/profile';
import { Icon } from '@/components/ui/Icon';

interface Props {
  profile: Profile;
  onUpdate?: (data: UpdateProfileData) => Promise<void>;
}

export default function ProfileMentorSection({ profile, onUpdate }: Props) {
  if (!profile.is_mentor) return null;

  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [mentorBio, setMentorBio] = useState(profile.mentor_bio ?? '');
  const [tagline, setTagline] = useState(profile.mentor_tagline ?? '');
  const [specs, setSpecs] = useState((profile.specializations ?? []).join(', '));
  const [website, setWebsite] = useState(profile.mentor_website ?? '');
  const [saving, setSaving] = useState(false);

  const border = 'var(--gold-border-s)';

  const handleSave = async () => {
    if (!onUpdate) return;
    setSaving(true);
    try {
      await onUpdate({
        mentor_bio: mentorBio || undefined,
        mentor_tagline: tagline || undefined,
        specializations: specs.split(',').map(s => s.trim()).filter(Boolean),
        mentor_website: website || undefined,
      } as any);
      setEditing(false);
    } catch { /* ignore */ }
    setSaving(false);
  };

  return (
    <div className="px-6" style={{ marginTop: '24px' }}>
      {/* ── Mentor Banner ──────────────────────────────── */}
      <div
        className="rounded-[8px] overflow-hidden"
        style={{ border: `1px solid ${border}`, background: 'var(--card-bg)' }}
      >
        {/* Header — immer sichtbar */}
        <div
          className="flex items-center gap-3 p-4 cursor-pointer"
          onClick={() => setExpanded(e => !e)}
          style={{ background: 'linear-gradient(135deg, var(--gold-soft) 0%, var(--gold-softer) 100%)' }}
        >
          <span className="flex items-center justify-center flex-shrink-0" style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary-gradient)', boxShadow: 'var(--primary-glow)' }}>
            <Icon name="sparkles" size={18} style={{ color: 'var(--text-on-gold)' }} />
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-heading italic" style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-h)' }}>
                Mentor
              </span>
              {profile.mentor_tagline && (
                <span style={{ fontSize: 11, color: 'var(--text-sec)' }}>· {profile.mentor_tagline}</span>
              )}
            </div>
            {profile.specializations?.length > 0 && (
              <div className="flex items-center gap-1 mt-0.5">
                {profile.specializations.slice(0, 3).map(s => (
                  <span key={s} style={{ padding: '1px 6px', borderRadius: 4, fontSize: 8, background: 'var(--gold-bg)', color: 'var(--gold-text)', letterSpacing: '0.3px' }}>{s}</span>
                ))}
                {profile.specializations.length > 3 && (
                  <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>+{profile.specializations.length - 3}</span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link href="/studio" className="no-underline" onClick={e => e.stopPropagation()}>
              <span className="flex items-center gap-1" style={{ padding: '4px 10px', borderRadius: 9999, fontSize: 9, letterSpacing: '0.5px', textTransform: 'uppercase', background: 'var(--gold-bg)', color: 'var(--gold-text)', border: `1px solid ${border}` }}>
                <Icon name="layout-dashboard" size={10} /> Studio
              </span>
            </Link>
            <Icon name={expanded ? 'chevron-down' : 'chevron-right'} size={14} style={{ color: 'var(--text-muted)' }} />
          </div>
        </div>

        {/* ── Expandierter Bereich ─────────────────────── */}
        {expanded && (
          <div className="p-4" style={{ borderTop: `1px solid var(--divider-l)` }}>
            {editing ? (
              /* Edit Mode */
              <div className="flex flex-col gap-3">
                <div>
                  <label style={{ fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Tagline</label>
                  <input type="text" value={tagline} onChange={e => setTagline(e.target.value)} placeholder="z.B. Meditation & Achtsamkeit Coach" className="w-full py-2 px-3 text-sm outline-none" style={{ background: 'var(--glass)', border: `1px solid ${border}`, borderRadius: 8, color: 'var(--text-h)' }} />
                </div>
                <div>
                  <label style={{ fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Mentor-Bio</label>
                  <textarea value={mentorBio} onChange={e => setMentorBio(e.target.value)} rows={3} placeholder="Erzaehle deinen Teilnehmern ueber dich …" className="w-full p-3 text-sm outline-none resize-none font-body" style={{ background: 'var(--glass)', border: `1px solid ${border}`, borderRadius: 8, color: 'var(--text-h)' }} />
                </div>
                <div>
                  <label style={{ fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Spezialisierungen (kommagetrennt)</label>
                  <input type="text" value={specs} onChange={e => setSpecs(e.target.value)} placeholder="Meditation, Achtsamkeit, Breathwork" className="w-full py-2 px-3 text-sm outline-none" style={{ background: 'var(--glass)', border: `1px solid ${border}`, borderRadius: 8, color: 'var(--text-h)' }} />
                </div>
                <div>
                  <label style={{ fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Website</label>
                  <input type="url" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://…" className="w-full py-2 px-3 text-sm outline-none" style={{ background: 'var(--glass)', border: `1px solid ${border}`, borderRadius: 8, color: 'var(--text-h)' }} />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSave} disabled={saving} className="border-none cursor-pointer" style={{ padding: '7px 16px', borderRadius: 9999, fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase', background: 'linear-gradient(135deg, var(--gold-deep), var(--gold))', color: 'var(--text-on-gold)' }}>
                    {saving ? 'Speichern …' : 'Speichern'}
                  </button>
                  <button onClick={() => setEditing(false)} className="border-none cursor-pointer" style={{ background: 'none', color: 'var(--text-muted)', fontSize: 10, padding: '7px 12px' }}>Abbrechen</button>
                </div>
              </div>
            ) : (
              /* View Mode */
              <div>
                {profile.mentor_bio && (
                  <p style={{ fontSize: 13, color: 'var(--text-sec)', lineHeight: 1.6, marginBottom: 12 }}>{profile.mentor_bio}</p>
                )}
                {profile.specializations?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {profile.specializations.map(s => (
                      <span key={s} style={{ padding: '3px 10px', borderRadius: 9999, fontSize: 10, background: 'var(--glass)', color: 'var(--text-sec)', border: '1px solid var(--glass-border)' }}>{s}</span>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-3 flex-wrap" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {profile.mentor_website && (
                    <a href={profile.mentor_website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 no-underline" style={{ color: 'var(--gold-text)' }}>
                      <Icon name="world" size={12} /> Website
                    </a>
                  )}
                </div>
                <button onClick={() => setEditing(true)} className="border-none cursor-pointer flex items-center gap-1 mt-3" style={{ background: 'none', padding: 0, fontSize: 10, color: 'var(--gold-text)' }}>
                  <Icon name="edit" size={10} /> Mentor-Profil bearbeiten
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
