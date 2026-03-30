'use client';

import { useEffect, useState } from 'react';
import {
  getEbook, generateEbook, updateEbook, generateEbookPdf,
  publishEbook, deleteEbook, getEbookLeads,
} from '@/lib/ebooks';

const COVER_LAYOUTS = [
  { key: 'minimalistisch', label: 'Minimalistisch', desc: 'Dunkler Hintergrund, Enso-Ring zentriert, Titel darunter' },
  { key: 'foto-dominant', label: 'Foto-dominant', desc: 'Vollbild-Foto mit Gradient-Overlay, Titel unten' },
  { key: 'zentriert', label: 'Zentriert', desc: 'Oben Foto, unten dunkel, Titel auf Glasmorphism-Karte' },
  { key: 'split', label: 'Split', desc: 'Links Foto, rechts dunkler Bereich mit Titel + Enso' },
];

const CTA_POSITIONS = [
  { key: 'after_first_third', label: 'Nach dem ersten Drittel' },
  { key: 'after_half', label: 'Nach der Haelfte' },
  { key: 'end_only', label: 'Nur am Ende' },
];

const STYLES = [
  { key: 'practical', label: 'Praktisch', desc: 'Uebungen, Checklisten, Anleitungen' },
  { key: 'balanced', label: 'Ausgewogen', desc: 'Mix aus Theorie und Praxis' },
  { key: 'deep', label: 'Tiefgehend', desc: 'Erklaerungen, Hintergruende, Reflexion' },
];

interface Props {
  article: any;
  onUpdate: () => void;
}

export default function ArticleEbookTab({ article, onUpdate }: Props) {
  const [ebook, setEbook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('balanced');
  const [leads, setLeads] = useState<any[]>([]);
  const [leadsTotal, setLeadsTotal] = useState(0);
  const [showLeads, setShowLeads] = useState(false);
  const [editingChapter, setEditingChapter] = useState<number | null>(null);

  useEffect(() => {
    loadEbook();
  }, [article.id]);

  async function loadEbook() {
    try {
      const data = await getEbook(article.id);
      setEbook(data);
    } catch {
      setEbook(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      const data = await generateEbook(article.id, { style: selectedStyle });
      setEbook(data);
    } catch (err: any) {
      alert(err.message || 'Generierung fehlgeschlagen');
    } finally {
      setGenerating(false);
    }
  }

  async function handleCoverChange(layout: string) {
    try {
      const data = await updateEbook(article.id, { cover_layout: layout });
      setEbook(data);
    } catch {}
  }

  async function handleCtaUpdate(field: string, value: any) {
    try {
      const data = await updateEbook(article.id, { [field]: value });
      setEbook(data);
    } catch {}
  }

  async function handleGeneratePdf() {
    setGeneratingPdf(true);
    try {
      const data = await generateEbookPdf(article.id);
      setEbook(data);
    } catch (err: any) {
      alert(err.message || 'PDF-Generierung fehlgeschlagen');
    } finally {
      setGeneratingPdf(false);
    }
  }

  async function handlePublish() {
    setPublishing(true);
    try {
      const data = await publishEbook(article.id);
      setEbook(data);
      onUpdate();
    } catch (err: any) {
      alert(err.message || 'Veroeffentlichung fehlgeschlagen');
    } finally {
      setPublishing(false);
    }
  }

  async function handleDelete() {
    if (!confirm('eBook wirklich loeschen? Alle Daten und Dateien werden entfernt.')) return;
    setDeleting(true);
    try {
      await deleteEbook(article.id);
      setEbook(null);
      onUpdate();
    } catch (err: any) {
      alert(err.message || 'Loeschen fehlgeschlagen');
    } finally {
      setDeleting(false);
    }
  }

  async function loadLeads() {
    try {
      const res = await getEbookLeads(article.id);
      setLeads(res.data || []);
      setLeadsTotal(res.total || 0);
    } catch {}
  }

  if (loading) return <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Lade eBook-Daten …</p>;

  // ── No eBook yet ──────────────────────────────────────────────
  if (!ebook) {
    return (
      <div style={{ maxWidth: 600 }}>
        <div style={{
          padding: 24, borderRadius: 8, background: 'var(--glass)', border: '1px solid var(--glass-border)',
          textAlign: 'center',
        }}>
          {/* Enso Ring */}
          <svg viewBox="0 0 100 100" width={48} height={48} style={{ margin: '0 auto 12px', display: 'block' }}>
            <defs>
              <linearGradient id="ebook-enso" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A8894E" />
                <stop offset="100%" stopColor="#D4BC8B" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="36" fill="none" stroke="url(#ebook-enso)" strokeWidth="8" strokeLinecap="round" strokeDasharray="196 30" strokeDashoffset="15" />
          </svg>

          <h3 style={{ fontSize: 16, fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 400, fontStyle: 'italic', color: 'var(--text-h)', marginBottom: 6 }}>
            eBook aus Artikel generieren
          </h3>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 16 }}>
            Die KI erstellt ein umfangreiches eBook mit Kapiteln, Uebungen, Checklisten und Reflexionsfragen — basierend auf dem Artikel-Inhalt.
          </p>

          {/* Style Selector */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
            {STYLES.map((s) => (
              <button
                key={s.key}
                onClick={() => setSelectedStyle(s.key)}
                style={{
                  padding: '8px 14px', borderRadius: 8, fontSize: 11, cursor: 'pointer',
                  border: selectedStyle === s.key ? '1px solid var(--gold-text)' : '1px solid var(--glass-border)',
                  background: selectedStyle === s.key ? 'var(--gold-bg)' : 'var(--glass)',
                  color: selectedStyle === s.key ? 'var(--gold-text)' : 'var(--text-muted)',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontWeight: 500 }}>{s.label}</div>
                <div style={{ fontSize: 9, opacity: 0.7, marginTop: 2 }}>{s.desc}</div>
              </button>
            ))}
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating}
            style={{
              padding: '10px 28px', borderRadius: 20, fontSize: 12,
              background: 'linear-gradient(135deg, #A8894E, #D4BC8B)', color: '#fff',
              border: 'none', cursor: generating ? 'wait' : 'pointer',
              opacity: generating ? 0.6 : 1,
            }}
          >
            {generating ? 'Wird generiert …' : 'eBook generieren'}
          </button>
        </div>
      </div>
    );
  }

  // ── eBook exists ──────────────────────────────────────────────
  const chapters = ebook.content?.chapters || [];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
      {/* Left: Content Editor */}
      <div>
        {/* Status Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span style={{
            padding: '3px 10px', borderRadius: 8, fontSize: 9, letterSpacing: '0.5px',
            background: ebook.status === 'published' ? 'var(--gold-bg)' : 'var(--glass)',
            color: ebook.status === 'published' ? 'var(--gold-text)' : 'var(--text-muted)',
            border: '1px solid var(--glass-border)',
          }}>
            {ebook.status?.toUpperCase()}
          </span>
          {ebook.pdf_url && (
            <a href={ebook.pdf_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: 'var(--gold-text)', textDecoration: 'none' }}>
              PDF herunterladen ({ebook.page_count} Seiten, {Math.round((ebook.pdf_size_bytes || 0) / 1024)} KB)
            </a>
          )}
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            {ebook.downloads_count} Downloads · {ebook.leads_count} Leads
          </span>
        </div>

        {/* Chapters */}
        <h3 style={{ fontSize: 14, color: 'var(--text-h)', marginBottom: 10 }}>
          {ebook.content?.title || 'eBook'} — {chapters.length} Kapitel
        </h3>

        {ebook.content?.intro_html && (
          <div style={{ padding: '12px', borderRadius: 8, background: 'var(--glass)', border: '1px solid var(--glass-border)', marginBottom: 10, fontSize: 12, color: 'var(--text-body)', lineHeight: 1.6 }}>
            <div style={{ fontSize: 9, color: 'var(--gold-text)', letterSpacing: '0.5px', marginBottom: 4 }}>EINLEITUNG</div>
            <div dangerouslySetInnerHTML={{ __html: ebook.content.intro_html }} />
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {chapters.map((ch: any, i: number) => (
            <div key={i} style={{
              borderRadius: 8, background: 'var(--glass)', border: '1px solid var(--glass-border)', overflow: 'hidden',
            }}>
              {/* Chapter Header */}
              <div
                onClick={() => setEditingChapter(editingChapter === i ? null : i)}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 14px', cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: 12, color: 'var(--text-h)', fontWeight: 500 }}>
                  Kapitel {i + 1}: {ch.title}
                </div>
                <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="var(--text-muted)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
                  style={{ transform: editingChapter === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}>
                  <path d="M6 9l6 6l6-6" />
                </svg>
              </div>

              {/* Chapter Body (Expandable) */}
              {editingChapter === i && (
                <div style={{ padding: '0 14px 14px', borderTop: '1px solid var(--glass-border)' }}>
                  {/* Body */}
                  <div style={{ fontSize: 12, color: 'var(--text-body)', lineHeight: 1.7, marginTop: 10 }}
                    dangerouslySetInnerHTML={{ __html: ch.body_html }} />

                  {/* Exercises */}
                  {ch.exercises?.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontSize: 9, color: 'var(--gold-text)', letterSpacing: '0.5px', marginBottom: 4 }}>UEBUNGEN</div>
                      <ul style={{ margin: 0, paddingLeft: 16 }}>
                        {ch.exercises.map((ex: string, j: number) => (
                          <li key={j} style={{ fontSize: 11, color: 'var(--text-body)', lineHeight: 1.8 }}>{ex}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Reflection Questions */}
                  {ch.reflection_questions?.length > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ fontSize: 9, color: 'var(--gold-text)', letterSpacing: '0.5px', marginBottom: 4 }}>REFLEXIONSFRAGEN</div>
                      <ul style={{ margin: 0, paddingLeft: 16 }}>
                        {ch.reflection_questions.map((q: string, j: number) => (
                          <li key={j} style={{ fontSize: 11, color: 'var(--text-body)', lineHeight: 1.8 }}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Checklist */}
                  {ch.checklist?.length > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ fontSize: 9, color: 'var(--gold-text)', letterSpacing: '0.5px', marginBottom: 4 }}>CHECKLISTE</div>
                      {ch.checklist.map((item: string, j: number) => (
                        <div key={j} style={{ fontSize: 11, color: 'var(--text-body)', lineHeight: 1.8, paddingLeft: 16, position: 'relative' }}>
                          <span style={{ position: 'absolute', left: 0 }}>☐</span> {item}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {ebook.content?.outro_html && (
          <div style={{ padding: '12px', borderRadius: 8, background: 'var(--glass)', border: '1px solid var(--glass-border)', marginTop: 10, fontSize: 12, color: 'var(--text-body)', lineHeight: 1.6 }}>
            <div style={{ fontSize: 9, color: 'var(--gold-text)', letterSpacing: '0.5px', marginBottom: 4 }}>SCHLUSSWORT</div>
            <div dangerouslySetInnerHTML={{ __html: ebook.content.outro_html }} />
          </div>
        )}
      </div>

      {/* Right: Settings Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Cover Layout */}
        <div style={{ padding: 16, borderRadius: 8, background: 'var(--glass)', border: '1px solid var(--glass-border)' }}>
          <h4 style={{ fontSize: 12, color: 'var(--text-h)', marginBottom: 10 }}>Cover-Layout</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {COVER_LAYOUTS.map((cl) => (
              <button
                key={cl.key}
                onClick={() => handleCoverChange(cl.key)}
                style={{
                  padding: '8px', borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                  border: ebook.cover_layout === cl.key ? '1px solid var(--gold-text)' : '1px solid var(--glass-border)',
                  background: ebook.cover_layout === cl.key ? 'var(--gold-bg)' : 'transparent',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontSize: 10, color: 'var(--text-h)', fontWeight: 500 }}>{cl.label}</div>
                <div style={{ fontSize: 8, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.4 }}>{cl.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* CTA Settings */}
        <div style={{ padding: 16, borderRadius: 8, background: 'var(--glass)', border: '1px solid var(--glass-border)' }}>
          <h4 style={{ fontSize: 12, color: 'var(--text-h)', marginBottom: 10 }}>CTA-Einstellungen</h4>

          {/* CTA Enabled */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={ebook.cta_enabled !== false}
              onChange={(e) => handleCtaUpdate('cta_enabled', e.target.checked)}
              style={{ accentColor: '#C8A96E' }}
            />
            <span style={{ fontSize: 11, color: 'var(--text-body)' }}>CTA im Blog anzeigen</span>
          </label>

          {/* Position */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 4 }}>Position</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {CTA_POSITIONS.map((pos) => (
                <label key={pos.key} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="cta_position"
                    checked={ebook.cta_position === pos.key}
                    onChange={() => handleCtaUpdate('cta_position', pos.key)}
                    style={{ accentColor: '#C8A96E' }}
                  />
                  <span style={{ fontSize: 11, color: 'var(--text-body)' }}>{pos.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={ebook.cta_show_sticky_footer !== false}
              onChange={(e) => handleCtaUpdate('cta_show_sticky_footer', e.target.checked)}
              style={{ accentColor: '#C8A96E' }}
            />
            <span style={{ fontSize: 11, color: 'var(--text-body)' }}>Sticky Footer</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={ebook.cta_show_exit_intent !== false}
              onChange={(e) => handleCtaUpdate('cta_show_exit_intent', e.target.checked)}
              style={{ accentColor: '#C8A96E' }}
            />
            <span style={{ fontSize: 11, color: 'var(--text-body)' }}>Exit-Intent Popup</span>
          </label>

          {/* Custom Headline */}
          <div style={{ marginBottom: 6 }}>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 2 }}>CTA-Headline (optional)</div>
            <input
              type="text"
              placeholder="Dein kostenloses eBook wartet"
              value={ebook.cta_headline || ''}
              onChange={(e) => handleCtaUpdate('cta_headline', e.target.value)}
              style={{
                width: '100%', padding: '6px 10px', borderRadius: 8, fontSize: 11,
                border: '1px solid var(--glass-border)', background: 'var(--glass)', color: 'var(--text-body)', outline: 'none',
              }}
            />
          </div>

          <div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 2 }}>CTA-Beschreibung (optional)</div>
            <textarea
              placeholder="Tauche tiefer in das Thema ein …"
              value={ebook.cta_description || ''}
              onChange={(e) => handleCtaUpdate('cta_description', e.target.value)}
              rows={2}
              style={{
                width: '100%', padding: '6px 10px', borderRadius: 8, fontSize: 11, resize: 'none',
                border: '1px solid var(--glass-border)', background: 'var(--glass)', color: 'var(--text-body)', outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Actions */}
        <div style={{ padding: 16, borderRadius: 8, background: 'var(--glass)', border: '1px solid var(--glass-border)' }}>
          <h4 style={{ fontSize: 12, color: 'var(--text-h)', marginBottom: 10 }}>Aktionen</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <button
              onClick={handleGenerate}
              disabled={generating}
              style={{
                padding: '8px 14px', borderRadius: 8, fontSize: 11, cursor: generating ? 'wait' : 'pointer',
                background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'var(--text-body)',
              }}
            >
              {generating ? 'Generiert …' : 'Inhalt neu generieren'}
            </button>
            <button
              onClick={handleGeneratePdf}
              disabled={generatingPdf}
              style={{
                padding: '8px 14px', borderRadius: 8, fontSize: 11, cursor: generatingPdf ? 'wait' : 'pointer',
                background: 'linear-gradient(135deg, #A8894E, #D4BC8B)', color: '#fff', border: 'none',
              }}
            >
              {generatingPdf ? 'PDF wird erstellt …' : 'PDF generieren'}
            </button>
            {ebook.status !== 'published' && ebook.pdf_url && (
              <button
                onClick={handlePublish}
                disabled={publishing}
                style={{
                  padding: '8px 14px', borderRadius: 8, fontSize: 11, cursor: publishing ? 'wait' : 'pointer',
                  background: '#2d7d46', color: '#fff', border: 'none',
                }}
              >
                {publishing ? 'Wird veroeffentlicht …' : 'Veroeffentlichen'}
              </button>
            )}
            <button
              onClick={() => { setShowLeads(!showLeads); if (!showLeads) loadLeads(); }}
              style={{
                padding: '8px 14px', borderRadius: 8, fontSize: 11, cursor: 'pointer',
                background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'var(--text-body)',
              }}
            >
              {showLeads ? 'Leads ausblenden' : `Leads anzeigen (${ebook.leads_count || 0})`}
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              style={{
                padding: '8px 14px', borderRadius: 8, fontSize: 11, cursor: deleting ? 'wait' : 'pointer',
                background: 'transparent', border: '1px solid rgba(220,60,60,0.3)', color: '#c44',
              }}
            >
              {deleting ? 'Wird geloescht …' : 'eBook loeschen'}
            </button>
          </div>
        </div>

        {/* Leads Table */}
        {showLeads && (
          <div style={{ padding: 16, borderRadius: 8, background: 'var(--glass)', border: '1px solid var(--glass-border)' }}>
            <h4 style={{ fontSize: 12, color: 'var(--text-h)', marginBottom: 10 }}>
              Leads ({leadsTotal})
            </h4>
            {leads.length === 0 ? (
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Noch keine Leads gesammelt.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {leads.map((lead) => (
                  <div key={lead.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '6px 10px', borderRadius: 6, background: 'var(--bg-elevated)',
                  }}>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-h)' }}>{lead.email}</div>
                      {lead.name && <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{lead.name}</div>}
                    </div>
                    <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>
                      {lead.source} · {new Date(lead.created_at).toLocaleDateString('de')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
