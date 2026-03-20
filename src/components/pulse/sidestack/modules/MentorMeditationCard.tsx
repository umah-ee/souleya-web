'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Icon } from '@/components/ui/Icon';

// ── Platzhalter-Daten (spaeter aus API) ──
interface MentorPreview {
  name: string;
  role: string;
  avatarUrl: string;
  duration: string;
  profileUrl: string;
}

const MENTOR_PREVIEWS: MentorPreview[] = [
  {
    name: 'Artur Paulins',
    role: 'Breathwork & Mindset',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
    duration: '3:24',
    profileUrl: '/discover',
  },
  {
    name: 'Lena Yoga',
    role: 'Yoga & Achtsamkeit',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face',
    duration: '4:12',
    profileUrl: '/discover',
  },
  {
    name: 'Mascha Meditation',
    role: 'Meditation & Balance',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face',
    duration: '2:58',
    profileUrl: '/discover',
  },
];

// Deterministischer Mentor pro Tag
function getDailyMentor(): MentorPreview {
  const now = new Date();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
  return MENTOR_PREVIEWS[dayOfYear % MENTOR_PREVIEWS.length];
}

// ── Waveform-Balken generieren ──
function generateBars(count: number): number[] {
  // Pseudo-zufaellige Hoehen (deterministisch pro Session)
  const bars: number[] = [];
  for (let i = 0; i < count; i++) {
    bars.push(4 + Math.sin(i * 0.7) * 10 + Math.cos(i * 1.3) * 6 + 8);
  }
  return bars;
}

export default function MentorMeditationCard() {
  const mentor = useMemo(() => getDailyMentor(), []);
  const bars = useMemo(() => generateBars(35), []);
  const [playing, setPlaying] = useState(false);
  const animRef = useRef<number | null>(null);
  const [activeBar, setActiveBar] = useState(0);

  // Einfache Play-Animation (visuell, kein echtes Audio)
  useEffect(() => {
    if (playing) {
      let bar = 0;
      const tick = () => {
        bar = (bar + 1) % bars.length;
        setActiveBar(bar);
        animRef.current = requestAnimationFrame(() => {
          setTimeout(() => { animRef.current = requestAnimationFrame(tick); }, 120);
        });
      };
      animRef.current = requestAnimationFrame(tick);
    } else {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      setActiveBar(0);
    }
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [playing, bars.length]);

  return (
    <div className="h-full flex flex-col gap-2.5 p-4">
      {/* Label */}
      <span className="font-label text-[9px] tracking-[0.12em] uppercase" style={{ color: 'var(--gold)' }}>
        Mentor-Meditation
      </span>

      {/* Mentor Info */}
      <div className="flex items-center gap-2.5">
        <img
          src={mentor.avatarUrl}
          alt={mentor.name}
          className="w-9 h-9 rounded-full object-cover flex-shrink-0"
          style={{ border: '1.5px solid var(--gold)' }}
        />
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="font-body text-[12px] font-semibold truncate" style={{ color: 'var(--text-h)' }}>
            {mentor.name}
          </span>
          <span className="font-body text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
            {mentor.role}
          </span>
        </div>
      </div>

      {/* Waveform + Play */}
      <div className="flex items-center gap-2.5">
        <div className="flex-1 flex items-center gap-[1.5px] h-8">
          {bars.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm transition-all duration-100"
              style={{
                height: playing && i <= activeBar ? `${h}px` : '4px',
                background: 'var(--gold)',
                opacity: playing && i <= activeBar ? 0.7 : 0.25,
                maxHeight: '28px',
              }}
            />
          ))}
        </div>
        <button
          onClick={() => setPlaying(!playing)}
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-none cursor-pointer transition-transform duration-150"
          style={{ background: 'linear-gradient(135deg, var(--gold-deep), var(--gold))' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <Icon name={playing ? 'player-pause' : 'player-play'} size={14} style={{ color: 'var(--text-on-gold)' }} />
        </button>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="font-body text-[10px]" style={{ color: 'var(--text-muted)' }}>
          {mentor.duration} Hoerprobe
        </span>
        <a
          href={mentor.profileUrl}
          className="font-body text-[10px] no-underline transition-opacity duration-150"
          style={{ color: 'var(--gold)', opacity: 0.7 }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.7'; }}
        >
          Zum Mentor-Profil &rarr;
        </a>
      </div>
    </div>
  );
}
