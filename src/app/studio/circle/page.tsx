'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';
import { fetchCourses, fetchEnrollments, fetchF2FBookings } from '@/lib/studio';
import { createDirectChannel } from '@/lib/chat';
import type { Course, Enrollment, F2FBooking } from '@/types/studio';

// ── Typen ─────────────────────────────────────────────────
type Filter = 'all' | 'courses' | 'f2f' | 'active';

interface CircleMember {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  sources: Set<string>; // 'course', 'f2f'
  courseCount: number;
  f2fCount: number;
  lastActive: string | null; // ISO Date
  progressAvg: number; // Durchschnittlicher Kurs-Fortschritt
}

export default function CirclePage() {
  const router = useRouter();
  const [members, setMembers] = useState<CircleMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');

  // KPIs
  const [totalMembers, setTotalMembers] = useState(0);
  const [activeCourseMembers, setActiveCourseMembers] = useState(0);
  const [totalF2FSessions, setTotalF2FSessions] = useState(0);
  const [avgProgress, setAvgProgress] = useState(0);

  // Broadcast
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState('');

  // ── Daten laden und Circle-Mitglieder zusammenfuehren ───
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [coursesRes, bookingsRes] = await Promise.all([
        fetchCourses({ limit: 100 }).catch(() => ({ data: [] })),
        fetchF2FBookings({ limit: 100 }).catch(() => ({ data: [] })),
      ]);

      const courses = (coursesRes as { data: Course[] }).data ?? [];
      const bookings = (bookingsRes as unknown as { data: F2FBooking[] }).data ?? [];

      // Alle Enrollments laden
      const allEnrollments: Enrollment[] = [];
      for (const c of courses) {
        try {
          const res = await fetchEnrollments(c.id, { limit: 100 });
          allEnrollments.push(...((res as { data: Enrollment[] }).data ?? []));
        } catch { /* ignore */ }
      }

      // Circle-Mitglieder aggregieren
      const memberMap = new Map<string, CircleMember>();

      // Aus Enrollments
      for (const e of allEnrollments) {
        if (!e.user) continue;
        const existing = memberMap.get(e.user.id);
        if (existing) {
          existing.sources.add('course');
          existing.courseCount++;
          existing.progressAvg = (existing.progressAvg + e.progress_percent) / 2;
          if (e.enrolled_at && (!existing.lastActive || e.enrolled_at > existing.lastActive)) {
            existing.lastActive = e.enrolled_at;
          }
        } else {
          memberMap.set(e.user.id, {
            id: e.user.id,
            display_name: e.user.display_name,
            username: e.user.username,
            avatar_url: e.user.avatar_url,
            sources: new Set(['course']),
            courseCount: 1,
            f2fCount: 0,
            lastActive: e.enrolled_at,
            progressAvg: e.progress_percent,
          });
        }
      }

      // Aus F2F Bookings
      for (const b of bookings) {
        if (!b.client) continue;
        const existing = memberMap.get(b.client.id);
        if (existing) {
          existing.sources.add('f2f');
          existing.f2fCount++;
          if (b.created_at && (!existing.lastActive || b.created_at > existing.lastActive)) {
            existing.lastActive = b.created_at;
          }
        } else {
          memberMap.set(b.client.id, {
            id: b.client.id,
            display_name: b.client.display_name,
            username: b.client.username,
            avatar_url: b.client.avatar_url,
            sources: new Set(['f2f']),
            courseCount: 0,
            f2fCount: 1,
            lastActive: b.created_at,
            progressAvg: 0,
          });
        }
      }

      const memberList = Array.from(memberMap.values())
        .sort((a, b) => (b.lastActive ?? '').localeCompare(a.lastActive ?? ''));

      setMembers(memberList);
      setTotalMembers(memberList.length);
      setActiveCourseMembers(memberList.filter(m => m.sources.has('course')).length);
      setTotalF2FSessions(bookings.filter(b => b.status === 'completed').length);
      const progresses = memberList.filter(m => m.progressAvg > 0).map(m => m.progressAvg);
      setAvgProgress(progresses.length > 0 ? Math.round(progresses.reduce((a, b) => a + b, 0) / progresses.length) : 0);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Filtern + Suchen ────────────────────────────────────
  const filteredMembers = useMemo(() => {
    let list = members;
    if (filter === 'courses') list = list.filter(m => m.sources.has('course'));
    if (filter === 'f2f') list = list.filter(m => m.sources.has('f2f'));
    if (filter === 'active') {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      list = list.filter(m => m.lastActive && m.lastActive > weekAgo);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(m =>
        (m.display_name?.toLowerCase().includes(q)) ||
        (m.username?.toLowerCase().includes(q))
      );
    }
    return list;
  }, [members, filter, search]);

  // ── Direkt-Nachricht ────────────────────────────────────
  const handleDirectMessage = async (userId: string) => {
    try {
      const channel = await createDirectChannel(userId);
      router.push(`/chat/${channel.id}`);
    } catch {
      router.push('/chat');
    }
  };

  // ── Zeitangabe ──────────────────────────────────────────
  const timeAgo = (dateStr: string | null) => {
    if (!dateStr) return 'Unbekannt';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `Vor ${mins} Min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Vor ${hours} Std`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `Vor ${days} Tagen`;
    return `Vor ${Math.floor(days / 7)} Wochen`;
  };

  const cardBg = 'var(--card-bg)';
  const border = 'var(--gold-border-s)';

  return (
    <div>
      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5">
        <h2 style={{ fontSize: 11, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Dein Circle
        </h2>
        <button
          onClick={() => setShowBroadcast(s => !s)}
          className="border-none cursor-pointer flex items-center gap-1.5"
          style={{
            padding: '6px 14px', borderRadius: 9999, fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase',
            background: showBroadcast ? 'var(--gold-bg)' : 'var(--glass)',
            color: showBroadcast ? 'var(--gold-text)' : 'var(--text-sec)',
            border: `1px solid ${showBroadcast ? border : 'var(--glass-border)'}`,
          }}
        >
          <Icon name="speakerphone" size={12} />
          Nachricht an alle
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', paddingTop: 40 }}>Lade …</p>
      ) : (
        <>
          {/* ── Insights KPIs ──────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            {[
              { label: 'Circle', value: totalMembers, icon: 'users-group' as const },
              { label: 'Kurs-Teilnehmer', value: activeCourseMembers, icon: 'school' as const },
              { label: 'F2F Sessions', value: totalF2FSessions, icon: 'video' as const },
              { label: 'Ø Fortschritt', value: `${avgProgress}%`, icon: 'target' as const },
            ].map(kpi => (
              <div key={kpi.label} className="glass-card rounded-[8px] p-3 text-center" style={{ background: cardBg, border: `1px solid ${border}` }}>
                <Icon name={kpi.icon} size={18} style={{ color: 'var(--gold)', margin: '0 auto 4px' }} />
                <div style={{ fontSize: 20, fontStyle: 'italic', color: 'var(--text-h)', fontFamily: 'Cormorant Garamond, serif' }}>{kpi.value}</div>
                <div style={{ fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{kpi.label}</div>
              </div>
            ))}
          </div>

          {/* ── Broadcast ──────────────────────────────── */}
          {showBroadcast && (
            <div className="glass-card rounded-[8px] p-4 mb-5" style={{ background: cardBg, border: `1px solid ${border}` }}>
              <h3 style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
                Nachricht an deinen Circle
              </h3>
              <textarea
                placeholder="Was moechtest du deinem Circle mitteilen?"
                value={broadcastMsg}
                onChange={e => setBroadcastMsg(e.target.value)}
                rows={3}
                className="w-full p-3 text-sm outline-none resize-none font-body"
                style={{ background: 'var(--glass)', border: `1px solid ${border}`, borderRadius: 8, color: 'var(--text-h)', marginBottom: 8 }}
              />
              <div className="flex items-center justify-between">
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                  Wird an {filteredMembers.length} Mitglieder gesendet
                </span>
                <button
                  disabled={!broadcastMsg.trim()}
                  className="border-none cursor-pointer flex items-center gap-1"
                  style={{
                    padding: '6px 16px', borderRadius: 9999, fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase',
                    background: broadcastMsg.trim() ? 'linear-gradient(135deg, var(--gold-deep), var(--gold))' : 'var(--glass)',
                    color: broadcastMsg.trim() ? 'var(--text-on-gold)' : 'var(--text-muted)',
                  }}
                >
                  <Icon name="send" size={10} /> Senden
                </button>
              </div>
            </div>
          )}

          {/* ── Suche + Filter ─────────────────────────── */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Icon name="search" size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Mitglied suchen …"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full py-2 pl-8 pr-3 text-sm outline-none"
                  style={{ background: 'var(--glass)', border: `1px solid ${border}`, borderRadius: 8, color: 'var(--text-h)' }}
                />
              </div>
            </div>
            {([
              { key: 'all' as Filter, label: 'Alle' },
              { key: 'courses' as Filter, label: 'Kurse' },
              { key: 'f2f' as Filter, label: 'F2F' },
              { key: 'active' as Filter, label: 'Aktiv (7 Tage)' },
            ]).map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)} className="border-none cursor-pointer" style={{
                padding: '6px 12px', borderRadius: 8, fontSize: 10,
                background: filter === f.key ? 'var(--gold-bg)' : 'var(--glass)',
                color: filter === f.key ? 'var(--gold-text)' : 'var(--text-muted)',
                border: `1px solid ${filter === f.key ? border : 'var(--glass-border)'}`,
              }}>{f.label}</button>
            ))}
          </div>

          {/* ── Mitglieder-Liste ───────────────────────── */}
          {filteredMembers.length === 0 ? (
            <div className="glass-card rounded-[8px] p-8 text-center" style={{ background: cardBg }}>
              <Icon name="users-group" size={36} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
              <p style={{ fontSize: 12, color: 'var(--text-sec)', fontStyle: 'italic' }}>
                {members.length === 0 ? 'Noch keine Mitglieder in deinem Circle.' : 'Keine Treffer fuer diesen Filter.'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredMembers.map(m => (
                <div key={m.id} className="glass-card rounded-[8px] p-4 flex items-center gap-3" style={{ background: cardBg, border: `1px solid ${border}` }}>
                  {/* Avatar */}
                  <div className="flex-shrink-0 rounded-full overflow-hidden" style={{ width: 44, height: 44, background: 'var(--avatar-bg)' }}>
                    {m.avatar_url ? (
                      <img src={m.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon name="user" size={20} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-h)' }}>
                      {m.display_name ?? m.username ?? 'User'}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap" style={{ fontSize: 11, color: 'var(--text-sec)' }}>
                      {m.courseCount > 0 && (
                        <span className="flex items-center gap-1">
                          <Icon name="school" size={10} style={{ color: 'var(--text-muted)' }} />
                          {m.courseCount} {m.courseCount === 1 ? 'Kurs' : 'Kurse'}
                        </span>
                      )}
                      {m.f2fCount > 0 && (
                        <span className="flex items-center gap-1">
                          <Icon name="video" size={10} style={{ color: 'var(--text-muted)' }} />
                          {m.f2fCount} F2F
                        </span>
                      )}
                      {m.progressAvg > 0 && (
                        <span className="flex items-center gap-1">
                          <Icon name="target" size={10} style={{ color: 'var(--text-muted)' }} />
                          {Math.round(m.progressAvg)}%
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                      {timeAgo(m.lastActive)}
                    </div>
                  </div>

                  {/* Source Badges */}
                  <div className="flex-shrink-0 flex flex-col items-end gap-1">
                    <div className="flex gap-1">
                      {m.sources.has('course') && (
                        <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 8, letterSpacing: '0.5px', textTransform: 'uppercase', background: 'rgba(110,170,120,.12)', color: '#6EAA78' }}>Kurs</span>
                      )}
                      {m.sources.has('f2f') && (
                        <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 8, letterSpacing: '0.5px', textTransform: 'uppercase', background: 'rgba(123,160,212,.12)', color: '#7BA0D4' }}>F2F</span>
                      )}
                    </div>
                    {/* Aktions-Buttons */}
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleDirectMessage(m.id)}
                        className="border-none cursor-pointer flex items-center gap-1"
                        style={{ padding: '3px 8px', borderRadius: 9999, fontSize: 9, background: 'var(--gold-bg)', color: 'var(--gold-text)', border: `1px solid ${border}` }}
                        title="Nachricht senden"
                      >
                        <Icon name="message-circle" size={10} /> Chat
                      </button>
                      <button
                        onClick={() => router.push(`/u/${m.username ?? m.id}`)}
                        className="border-none cursor-pointer"
                        style={{ padding: '3px 6px', borderRadius: 9999, fontSize: 9, background: 'var(--glass)', color: 'var(--text-muted)', border: '1px solid var(--glass-border)' }}
                        title="Profil ansehen"
                      >
                        <Icon name="user" size={10} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
