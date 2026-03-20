'use client';

import { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import SignupForm from './SignupForm';
import { TOPICS, TOPIC_ORDER } from './TopicHeroData';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

const FL_TOTAL = 500;
const FL_EARLY = 200;

export default function TopicHero() {
  const [activeTopic, setActiveTopic] = useState('wachstum');
  const [inMorph, setInMorph] = useState(false);
  const [morphIdx, setMorphIdx] = useState(0);
  const [imgSrc, setImgSrc] = useState(TOPICS.wachstum.img);
  const [imgOpacity, setImgOpacity] = useState(1);
  const [flCount, setFlCount] = useState(0);
  const [displayCount, setDisplayCount] = useState(0);

  // Preload all topic images
  useEffect(() => {
    Object.values(TOPICS).forEach((t) => {
      const img = new Image();
      img.src = t.img;
      t.subs.forEach((s) => {
        const si = new Image();
        si.src = s.img;
      });
    });
  }, []);

  // Supabase: load First Light count + Realtime
  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase
          .from('public_stats')
          .select('first_light_count')
          .single();
        if (data?.first_light_count != null) {
          setFlCount(data.first_light_count);
        }
      } catch {
        // Silent fail
      }
    }
    load();

    const channel = supabase
      .channel('topic-hero-fl-counter')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, () => {
        load();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Sync display count directly (no animation needed for mini counter)
  useEffect(() => {
    setDisplayCount(flCount);
  }, [flCount]);

  // Crossfade image helper
  const crossfade = useCallback((src: string) => {
    setImgOpacity(0);
    setTimeout(() => {
      setImgSrc(src);
    }, 150);
  }, []);

  const handleImgLoad = useCallback(() => {
    setImgOpacity(1);
  }, []);

  // Set active topic
  const handleSetActive = useCallback((tid: string) => {
    if (inMorph) {
      setInMorph(false);
    }
    setActiveTopic(tid);
    crossfade(TOPICS[tid].img);
  }, [inMorph, crossfade]);

  // Morph functions
  const openMorph = useCallback((idx: number) => {
    setInMorph(true);
    setMorphIdx(idx);
    crossfade(TOPICS[activeTopic].subs[idx].img);
  }, [activeTopic, crossfade]);

  const morphBack = useCallback(() => {
    setInMorph(false);
    crossfade(TOPICS[activeTopic].img);
  }, [activeTopic, crossfade]);

  const morphNext = useCallback(() => {
    const subs = TOPICS[activeTopic].subs;
    const next = (morphIdx + 1) % subs.length;
    setMorphIdx(next);
    crossfade(subs[next].img);
  }, [activeTopic, morphIdx, crossfade]);

  const morphPrev = useCallback(() => {
    const subs = TOPICS[activeTopic].subs;
    const prev = (morphIdx - 1 + subs.length) % subs.length;
    setMorphIdx(prev);
    crossfade(subs[prev].img);
  }, [activeTopic, morphIdx, crossfade]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && inMorph) morphBack();
      if (inMorph && e.key === 'ArrowRight') morphNext();
      if (inMorph && e.key === 'ArrowLeft') morphPrev();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [inMorph, morphBack, morphNext, morphPrev]);

  const topic = TOPICS[activeTopic];
  const sub = topic.subs[morphIdx];

  // Mini progress bar calculations
  const earlyWidth = Math.min(flCount, FL_EARLY) / FL_EARLY * 40;
  const flWidth = Math.max(0, flCount - FL_EARLY) / (FL_TOTAL - FL_EARLY) * 60;
  const markerLeft = flCount / FL_TOTAL * 100;
  const shimmerClip = `inset(0 ${100 - (earlyWidth + flWidth)}% 0 0)`;

  return (
    <>
      {/* ═══ HERO ═══ */}
      <section id="anmeldung" className="th-hero">
        <div className="th-hero-img-wrap">
          <img
            src={imgSrc}
            alt=""
            className="th-hero-img"
            style={{ opacity: imgOpacity }}
            onLoad={handleImgLoad}
          />
          <div className="th-hero-dim" />

          {/* Topic info (hidden during morph) */}
          {!inMorph && (
            <div className="th-hero-info">
              <div className="th-hero-name">{topic.name}</div>
              <div className="th-hero-tag">{topic.tag}</div>
            </div>
          )}

          {/* Hotspots (hidden during morph) */}
          {!inMorph && (
            <div className="th-hs-layer">
              {topic.subs.map((s, i) => (
                <div
                  key={s.name}
                  className="th-hs"
                  style={{
                    left: `${s.x}%`,
                    top: `${s.y}%`,
                    animationDelay: `${200 + i * 120}ms`,
                  }}
                  onClick={() => openMorph(i)}
                >
                  <div className="th-hsd" />
                  <div className="th-hst">{s.name}</div>
                </div>
              ))}
            </div>
          )}

          {/* Kernaussagen (hidden during morph) */}
          {!inMorph && (
            <div className="th-kern">
              <div className="th-kern-line">
                <div className="th-kern-dot" />
                Triff Menschen, die zu <em>Dir passen.</em>
              </div>
              <div className="th-kern-line">
                <div className="th-kern-dot" />
                Sprich über Themen, die <em>dich bewegen.</em>
              </div>
              <div className="th-kern-line">
                <div className="th-kern-dot" />
                An Orten, die du <em>liebst.</em>
              </div>
            </div>
          )}

          {/* Morph navigation */}
          {inMorph && (
            <>
              <div className="th-morph-bar">
                <button className="th-morph-back" onClick={morphBack}>
                  ← Zurück
                </button>
                <button className="th-morph-arr" onClick={morphPrev}>‹</button>
                <span className="th-morph-counter">{morphIdx + 1}/{topic.subs.length}</span>
                <button className="th-morph-arr" onClick={morphNext}>›</button>
              </div>
              <div className="th-morph-info">
                <div className="th-morph-name">{sub.name}</div>
                <div className="th-morph-desc">{sub.desc}</div>
              </div>
            </>
          )}

          {/* ── Compact Signup Panel (bottom-right) ── */}
          <div className="th-signup-panel">
            <SignupForm />
            <div className="th-fl-mini">
              <div className="th-fl-mini-bar">
                <div
                  className="th-fl-mini-zone th-fl-mini-early"
                  style={{ width: `${earlyWidth}%` }}
                />
                <div
                  className="th-fl-mini-zone th-fl-mini-fl"
                  style={{ width: `${flWidth}%` }}
                />
                <div
                  className="th-fl-mini-shimmer"
                  style={{ clipPath: shimmerClip }}
                />
                <div className="th-fl-mini-div" />
                <svg
                  className="th-fl-mini-marker"
                  width="18"
                  height="18"
                  viewBox="0 0 100 100"
                  style={{ left: `${markerLeft}%` }}
                >
                  <defs>
                    <linearGradient id="th-fmg" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#A8894E" />
                      <stop offset="100%" stopColor="#D4BC8B" />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="50" cy="50" r="36" fill="none"
                    stroke="url(#th-fmg)" strokeWidth="9"
                    strokeLinecap="round" strokeDasharray="196 30" strokeDashoffset="15"
                  />
                </svg>
              </div>
              <div className="th-fl-mini-row">
                <div className="th-fl-mini-counter">
                  <span className="th-fl-mini-num">{displayCount}</span>
                  <span className="th-fl-mini-total"> / 500 vergeben</span>
                </div>
                <a href="#first-light-detail" className="th-fl-mini-link">
                  Was ist First Light? ↓
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 4 TOPIC CARDS ═══ */}
      <div className="th-cards-row">
        {TOPIC_ORDER.filter((id) => id !== activeTopic).map((id) => {
          const t = TOPICS[id];
          return (
            <div
              key={id}
              className="th-tcard"
              onClick={() => handleSetActive(id)}
            >
              <img
                src={t.img.replace('1600', '600').replace('900', '340')}
                alt={t.name}
                loading="lazy"
                className="th-tcard-img"
              />
              <div className="th-tcard-ov" />
              <div className="th-tcard-content">
                <div className="th-tcard-name">{t.name}</div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
