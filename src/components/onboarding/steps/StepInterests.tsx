'use client';

import { useState, useMemo } from 'react';
import { updateProfile } from '@/lib/profile';
import { INTEREST_CATEGORIES, searchInterestTags } from '@/lib/interestTags';

const MAX_INTERESTS = 15;
const MIN_INTERESTS = 3;

interface Props {
  currentInterests?: string[];
  onComplete: () => void;
  onBack: () => void;
  isFirst: boolean;
}

export default function StepInterests({ currentInterests, onComplete, onBack, isFirst }: Props) {
  const [selected, setSelected] = useState<string[]>(currentInterests ?? []);
  const [search, setSearch] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isFull = selected.length >= MAX_INTERESTS;
  const isValid = selected.length >= MIN_INTERESTS;

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    return searchInterestTags(search).filter((t) => !selected.includes(t));
  }, [search, selected]);

  const addTag = (tag: string) => {
    if (isFull || selected.includes(tag)) return;
    setSelected((prev) => [...prev, tag]);
    setSearch('');
  };

  const removeTag = (tag: string) => {
    setSelected((prev) => prev.filter((t) => t !== tag));
  };

  const handleSave = async () => {
    if (!isValid) return;
    setSaving(true);
    setError('');
    try {
      await updateProfile({ interests: selected });
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Speichern fehlgeschlagen');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Ausgewaehlte Tags */}
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
                onClick={() => removeTag(tag)}
                className="ml-0.5 bg-transparent border-none cursor-pointer p-0 leading-none"
                style={{ color: 'var(--gold-text)' }}
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}

      <p className="text-[10px] font-label tracking-[1.2px] uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
        {selected.length}/{MAX_INTERESTS} (mind. {MIN_INTERESTS})
      </p>

      {/* Suche */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Interessen suchen …"
        className="w-full px-3 py-2 text-[12px] rounded-lg outline-none mb-2"
        style={{
          background: 'var(--bg-tertiary, rgba(255,255,255,0.04))',
          border: '1px solid rgba(255,255,255,0.08)',
          color: 'var(--text-body, #D0C8B8)',
          fontFamily: "'Quicksand', sans-serif",
          borderRadius: '8px',
        }}
      />

      {/* Suchergebnisse */}
      {searchResults.length > 0 && (
        <div className="flex flex-wrap gap-[5px] mb-3">
          {searchResults.slice(0, 12).map((tag) => (
            <button
              key={tag}
              onClick={() => addTag(tag)}
              disabled={isFull}
              className="text-[10px] font-label tracking-[0.6px] uppercase px-[9px] py-[3px] rounded-full border-none cursor-pointer transition-all hover:scale-105 disabled:opacity-30"
              style={{
                background: 'var(--accent-muted, rgba(200,169,110,0.12))',
                color: 'var(--accent, #C8A96E)',
              }}
            >
              + {tag}
            </button>
          ))}
        </div>
      )}

      {/* Kategorien */}
      {!search && (
        <div className="max-h-[180px] overflow-y-auto scrollbar-gold pr-1">
          {INTEREST_CATEGORIES.map((cat) => {
            const isExpanded = expandedCategory === cat.label;
            const availableTags = cat.tags.filter((t) => !selected.includes(t));

            return (
              <div key={cat.label} className="mb-1.5">
                <button
                  onClick={() => setExpandedCategory(isExpanded ? null : cat.label)}
                  className="w-full flex items-center justify-between py-1.5 px-2 rounded-lg text-left border-none cursor-pointer transition-all"
                  style={{
                    background: isExpanded ? 'var(--accent-muted, rgba(200,169,110,0.08))' : 'transparent',
                    color: 'var(--text-body, #D0C8B8)',
                    fontFamily: "'Quicksand', sans-serif",
                    fontSize: '12px',
                  }}
                >
                  <span>{cat.label}</span>
                  <svg
                    viewBox="0 0 24 24" width="14" height="14" fill="none"
                    stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                  >
                    <path d="M6 9l6 6l6 -6" />
                  </svg>
                </button>

                {isExpanded && availableTags.length > 0 && (
                  <div className="flex flex-wrap gap-[5px] px-2 py-1.5">
                    {availableTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => addTag(tag)}
                        disabled={isFull}
                        className="text-[10px] font-label tracking-[0.6px] uppercase px-[9px] py-[3px] rounded-full border-none cursor-pointer transition-all hover:scale-105 disabled:opacity-30"
                        style={{
                          background: 'var(--accent-muted, rgba(200,169,110,0.12))',
                          color: 'var(--accent, #C8A96E)',
                        }}
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

      {error && (
        <p className="text-[12px] mt-2" style={{ color: '#E57373' }}>{error}</p>
      )}

      {/* Buttons */}
      <div className="flex items-center justify-between mt-4">
        {!isFirst ? (
          <button
            onClick={onBack}
            className="text-[12px] border-none bg-transparent cursor-pointer"
            style={{ color: 'var(--text-muted, #807870)', fontFamily: "'Quicksand', sans-serif" }}
          >
            Zurueck
          </button>
        ) : <span />}
        <button
          onClick={handleSave}
          disabled={!isValid || saving}
          className="font-label text-[0.65rem] tracking-[0.1em] uppercase px-6 py-2.5 rounded-full border-none cursor-pointer transition-all hover:-translate-y-px disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          style={{
            background: isValid && !saving ? 'linear-gradient(135deg, #A8894E, #C8A96E)' : 'var(--bg-tertiary)',
            color: isValid && !saving ? 'var(--text-on-gold, #1A1714)' : 'var(--text-muted)',
            boxShadow: isValid && !saving ? '0 4px 16px rgba(200,169,110,0.25)' : 'none',
          }}
        >
          {saving ? '…' : 'Weiter'}
        </button>
      </div>
    </div>
  );
}
