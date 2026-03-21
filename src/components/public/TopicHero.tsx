'use client';

import { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import SignupForm from './SignupForm';
import SignupModal from './SignupModal';
import ArticleOverlay from './ArticleOverlay';
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
  const [hasSession, setHasSession] = useState(false);
  const [spotLinks, setSpotLinks] = useState<Record<string, { title: string; excerpt: string; category: string; reading_time_min: number; slug: string; og_image_url?: string; label?: string }>>({});
  const [showSignup, setShowSignup] = useState(false);
  const [overlaySlug, setOverlaySlug] = useState<string | null>(null);

  // Load spot-links (dynamic blog data)
  useEffect(() => {
    async function loadSpotLinks() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-5821e.up.railway.app';
        const res = await fetch(`${apiUrl}/articles/spot-links`);
        if (res.ok) {
          const data = await res.json();
          const map: typeof spotLinks = {};
          for (const link of data) {
            if (link.article) {
              map[`${link.topic_index}-${link.subtopic_index}`] = {
                title: link.article.title,
                excerpt: link.article.excerpt || '',
                category: link.article.category || '',
                reading_time_min: link.article.reading_time_min || 5,
                slug: link.article.slug,
                og_image_url: link.article.og_image_url || undefined,
                label: link.label || undefined,
              };
            }
          }
          setSpotLinks(map);
        }
      } catch {
        // Fallback to hardcoded data silently
      }
    }
    loadSpotLinks();
  }, []);

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

  // Session-Check
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setHasSession(true);
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

  // Helper: Artikel-Bild oder Fallback-Subtopic-Bild
  const getSpotImage = useCallback((topicId: string, subIdx: number) => {
    const topicIdx = TOPIC_ORDER.indexOf(topicId);
    const link = spotLinks[`${topicIdx}-${subIdx}`];
    let url = link?.og_image_url || TOPICS[topicId].subs[subIdx].img;
    // Unsplash: hochaufgeloest fuer Fullscreen
    if (url.includes('images.unsplash.com') && url.includes('w=1080')) {
      url = url.replace('w=1080', 'w=1920');
    }
    return url;
  }, [spotLinks]);

  // Morph functions
  const openMorph = useCallback((idx: number) => {
    setInMorph(true);
    setMorphIdx(idx);
    crossfade(getSpotImage(activeTopic, idx));
  }, [activeTopic, crossfade, getSpotImage]);

  const morphBack = useCallback(() => {
    setInMorph(false);
    setOverlaySlug(null);
    crossfade(TOPICS[activeTopic].img);
  }, [activeTopic, crossfade]);

  const morphNext = useCallback(() => {
    const subs = TOPICS[activeTopic].subs;
    const next = (morphIdx + 1) % subs.length;
    setMorphIdx(next);
    crossfade(getSpotImage(activeTopic, next));
  }, [activeTopic, morphIdx, crossfade, getSpotImage]);

  const morphPrev = useCallback(() => {
    const subs = TOPICS[activeTopic].subs;
    const prev = (morphIdx - 1 + subs.length) % subs.length;
    setMorphIdx(prev);
    crossfade(getSpotImage(activeTopic, prev));
  }, [activeTopic, morphIdx, crossfade, getSpotImage]);

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

          {/* Hotspots (hidden during morph, nur wenn Blog-Artikel verknuepft) */}
          {!inMorph && (
            <div className="th-hs-layer">
              {topic.subs.map((s, i) => {
                const topicIdx = TOPIC_ORDER.indexOf(activeTopic);
                const link = spotLinks[`${topicIdx}-${i}`];
                if (!link) return null;
                const label = link.label || s.name;
                return (
                  <div
                    key={s.name}
                    className={`th-hs${s.flip ? ' th-hs--flip' : ''}`}
                    style={{
                      left: `${s.x}%`,
                      top: `${s.y}%`,
                      animationDelay: `${200 + i * 120}ms`,
                    }}
                    onClick={() => openMorph(i)}
                  >
                    <div className="th-hsd" />
                    <div className="th-hst" onClick={(e) => { e.stopPropagation(); openMorph(i); }}>{label}</div>
                  </div>
                );
              })}
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

              {/* Sub-topic name bottom-left */}
              <div className="th-morph-info">
                <div className="th-morph-name">{sub.name}</div>
              </div>

              {/* Floating Blog Card */}
              {(() => {
                const topicIdx = TOPIC_ORDER.indexOf(activeTopic);
                const dynamicBlog = spotLinks[`${topicIdx}-${morphIdx}`];
                const blogCat = dynamicBlog?.category || sub.blog.cat;
                const blogTime = dynamicBlog ? `${dynamicBlog.reading_time_min} Min.` : sub.blog.time;
                const blogTitle = dynamicBlog?.title || sub.blog.title;
                const blogExcerpt = dynamicBlog?.excerpt || sub.blog.excerpt;
                const blogSlug = dynamicBlog?.slug;
                return (
                <div className="th-float-card th-card-blog" key={`blog-${activeTopic}-${morphIdx}`}>
                  <div className="th-fc-header">
                    <span className="th-fc-tag">{blogCat}</span>
                    <span className="th-fc-time">
                      <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>
                      </svg>
                      {blogTime}
                    </span>
                  </div>
                  <div className="th-fc-title">{blogTitle}</div>
                  <div className="th-fc-excerpt">{blogExcerpt}</div>
                  <button onClick={() => blogSlug ? setOverlaySlug(blogSlug) : setShowSignup(true)} className="th-fc-cta">
                    Weiterlesen
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M13 6l6 6-6 6"/>
                    </svg>
                  </button>
                </div>
                );
              })()}

              {/* Floating Talk Card */}
              <div className="th-float-card th-card-talk" key={`talk-${activeTopic}-${morphIdx}`}>
                <div className="th-fc-header">
                  <span className="th-fc-tag th-fc-tag--talk">Community</span>
                  <span className="th-fc-members">
                    <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/><path d="M16 3.13a4 4 0 010 7.75"/>
                    </svg>
                    {sub.members}
                  </span>
                </div>
                <div className="th-fc-circle-name">{sub.circle}</div>
                <div className="th-talk-msgs">
                  {sub.msgs.map((msg, mi) => (
                    <div key={mi} className={`th-talk-msg${mi === sub.msgs.length - 1 ? ' th-talk-msg--blur' : ''}`}>
                      <div className="th-talk-avatar">
                        {msg.name.charAt(0)}
                      </div>
                      <div className="th-talk-bubble">
                        <div className="th-talk-meta">
                          <span className="th-talk-name">{msg.name}</span>
                          <span className="th-talk-soul">{msg.soul}</span>
                          <span className="th-talk-ts">{msg.time}</span>
                        </div>
                        <div className="th-talk-txt">{msg.txt}</div>
                      </div>
                    </div>
                  ))}
                  <div className="th-talk-lock">
                    <div className="th-talk-lock-overlay" />
                    <div className="th-talk-lock-cta">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                      </svg>
                      <button onClick={() => hasSession ? window.location.href = '/circles' : setShowSignup(true)} className="th-talk-lock-btn">Jetzt mitmachen</button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── Compact Signup Panel (bottom-right) – nur für nicht eingeloggte User und nicht im Morph-Modus ── */}
          {!hasSession && !inMorph && <div className="th-signup-panel">
            <p className="th-fl-urgency-teaser">
              Sei schnell – sichere dir einen <strong>First Light</strong> Platz und erhalte lebenslange Vorteile.
            </p>
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
              </div>
              <a href="#first-light-detail" className="th-fl-firstlight-btn">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v4m0 4h.01" />
                </svg>
                Was ist First Light?
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M6 9l6 6l6 -6" />
                </svg>
              </a>
            </div>
          </div>}
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
      {/* Signup Modal */}
      {showSignup && <SignupModal onClose={() => setShowSignup(false)} />}

      {/* Article Overlay */}
      {overlaySlug && (
        <ArticleOverlay
          slug={overlaySlug}
          hasSession={hasSession}
          onClose={() => setOverlaySlug(null)}
          onSignup={() => setShowSignup(true)}
        />
      )}
    </>
  );
}
