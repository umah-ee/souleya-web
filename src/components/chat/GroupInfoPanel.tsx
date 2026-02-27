'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { ChannelDetail, ChannelMember } from '@/types/chat';
import type { Connection } from '@/types/circles';
import { updateChannel, addChannelMember, removeChannelMember, fetchChannel } from '@/lib/chat';
import { getConnections } from '@/lib/circles';
import { Icon } from '@/components/ui/Icon';

interface Props {
  channel: ChannelDetail;
  currentUserId: string;
  onClose: () => void;
  onChannelUpdated: (updated: ChannelDetail) => void;
}

export default function GroupInfoPanel({ channel, currentUserId, onClose, onChannelUpdated }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(channel.name ?? '');
  const [description, setDescription] = useState(channel.description ?? '');
  const [saving, setSaving] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingConnections, setLoadingConnections] = useState(false);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);

  const isAdmin = channel.members.find((m) => m.user_id === currentUserId)?.role === 'admin';
  const memberIds = new Set(channel.members.map((m) => m.user_id));

  // Kontakte laden wenn "Hinzufuegen" geoeffnet wird
  const loadConnections = useCallback(async () => {
    setLoadingConnections(true);
    try {
      const result = await getConnections(1, 100);
      setConnections(result.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingConnections(false);
    }
  }, []);

  useEffect(() => {
    if (showAddMember) loadConnections();
  }, [showAddMember, loadConnections]);

  const refreshChannel = async () => {
    try {
      const updated = await fetchChannel(channel.id);
      onChannelUpdated(updated);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await updateChannel(channel.id, {
        name: name.trim(),
        description: description.trim() || undefined,
      });
      await refreshChannel();
      setEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleAddMember = async (userId: string) => {
    try {
      await addChannelMember(channel.id, userId);
      await refreshChannel();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    setRemovingUserId(userId);
    try {
      await removeChannelMember(channel.id, userId);
      await refreshChannel();
    } catch (e) {
      console.error(e);
    } finally {
      setRemovingUserId(null);
    }
  };

  const handleLeaveGroup = async () => {
    setLeaving(true);
    try {
      await removeChannelMember(channel.id, currentUserId);
      router.push('/chat');
    } catch (e) {
      console.error(e);
      setLeaving(false);
    }
  };

  const filteredConnections = connections.filter((c) => {
    if (memberIds.has(c.profile.id)) return false;
    if (!searchQuery.trim()) return true;
    const n = (c.profile.display_name ?? c.profile.username ?? '').toLowerCase();
    return n.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Panel */}
      <div
        className="relative w-full max-w-[380px] h-full flex flex-col overflow-y-auto"
        style={{
          background: 'var(--bg-solid)',
          borderLeft: '1px solid var(--glass-border)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: '1px solid var(--divider-l)' }}
        >
          <h2 className="font-heading text-lg" style={{ color: 'var(--text-h)' }}>Gruppeninfo</h2>
          <button onClick={onClose} className="cursor-pointer p-1" style={{ color: 'var(--text-muted)' }}>
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* Gruppen-Avatar */}
        <div className="flex flex-col items-center pt-6 pb-4 px-5">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ background: 'var(--avatar-bg)', border: '1.5px solid var(--gold-border-s)' }}
          >
            {channel.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={channel.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              <Icon name="users" size={28} style={{ color: 'var(--gold-text)' }} />
            )}
          </div>

          {/* Name */}
          {editing ? (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm font-body outline-none text-center mb-2"
              style={{
                background: 'var(--input-bg)',
                border: '1px solid var(--input-border)',
                borderRadius: '8px',
                color: 'var(--text-body)',
              }}
              placeholder="Gruppenname"
            />
          ) : (
            <h3 className="font-heading text-xl text-center" style={{ color: 'var(--text-h)' }}>
              {channel.name ?? 'Gruppe'}
            </h3>
          )}

          {/* Beschreibung */}
          {editing ? (
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm font-body outline-none resize-none mt-1"
              style={{
                background: 'var(--input-bg)',
                border: '1px solid var(--input-border)',
                borderRadius: '8px',
                color: 'var(--text-body)',
              }}
              placeholder="Beschreibung (optional)"
              rows={3}
            />
          ) : channel.description ? (
            <p className="text-sm text-center mt-1" style={{ color: 'var(--text-muted)' }}>
              {channel.description}
            </p>
          ) : null}

          {/* Edit/Save Buttons */}
          {isAdmin && (
            <div className="flex gap-2 mt-3">
              {editing ? (
                <>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setName(channel.name ?? '');
                      setDescription(channel.description ?? '');
                    }}
                    className="px-4 py-1.5 rounded-full font-label text-[0.65rem] tracking-[0.1em] uppercase cursor-pointer"
                    style={{ color: 'var(--text-muted)', border: '1px solid var(--glass-border)' }}
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || !name.trim()}
                    className="px-4 py-1.5 rounded-full font-label text-[0.65rem] tracking-[0.1em] uppercase cursor-pointer"
                    style={{
                      background: 'linear-gradient(135deg, var(--gold-deep), var(--gold))',
                      color: 'var(--text-on-gold)',
                      opacity: saving || !name.trim() ? 0.5 : 1,
                    }}
                  >
                    {saving ? 'Speichern ...' : 'Speichern'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full font-label text-[0.65rem] tracking-[0.1em] uppercase cursor-pointer"
                  style={{ color: 'var(--gold-text)', border: '1px solid var(--gold-border-s)' }}
                >
                  <Icon name="pencil" size={12} />
                  Bearbeiten
                </button>
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="mx-5" style={{ borderBottom: '1px solid var(--divider-l)' }} />

        {/* Mitglieder */}
        <div className="px-5 pt-4 pb-2">
          <p
            className="font-label text-[0.65rem] tracking-[0.15em] uppercase mb-3"
            style={{ color: 'var(--text-muted)' }}
          >
            Mitglieder ({channel.members.length})
          </p>

          <div className="space-y-1">
            {channel.members.map((member) => {
              const profile = member.profile;
              const memberName = profile.display_name ?? profile.username ?? 'Anonym';
              const initial = memberName.slice(0, 1).toUpperCase();
              const isSelf = member.user_id === currentUserId;

              return (
                <div
                  key={member.user_id}
                  className="flex items-center gap-3 px-2 py-2 rounded-xl"
                >
                  {/* Avatar */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center font-heading text-xs overflow-hidden shrink-0"
                    style={{
                      background: 'var(--avatar-bg)',
                      color: 'var(--gold-text)',
                      border: '1.5px solid var(--gold-border-s)',
                    }}
                  >
                    {profile.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : initial}
                  </div>

                  {/* Name + Rolle */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] truncate" style={{ color: 'var(--text-body)' }}>
                        {memberName}
                        {isSelf && <span style={{ color: 'var(--text-muted)' }}> (Du)</span>}
                      </span>
                      {member.role === 'admin' && (
                        <span
                          className="text-[9px] font-label tracking-[0.1em] uppercase px-1.5 py-0.5 rounded-full shrink-0"
                          style={{ background: 'var(--gold-bg)', color: 'var(--gold-text)' }}
                        >
                          Admin
                        </span>
                      )}
                    </div>
                    {profile.username && (
                      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        @{profile.username}
                      </span>
                    )}
                  </div>

                  {/* Entfernen-Button (Admin, nicht sich selbst) */}
                  {isAdmin && !isSelf && (
                    <button
                      onClick={() => handleRemoveMember(member.user_id)}
                      disabled={removingUserId === member.user_id}
                      className="p-1 cursor-pointer shrink-0"
                      style={{ color: 'var(--text-muted)', opacity: removingUserId === member.user_id ? 0.3 : 1 }}
                      title="Entfernen"
                    >
                      <Icon name="x" size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Mitglied hinzufuegen */}
        {isAdmin && (
          <div className="px-5 pb-3">
            {!showAddMember ? (
              <button
                onClick={() => setShowAddMember(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full font-label text-[0.65rem] tracking-[0.1em] uppercase cursor-pointer"
                style={{ color: 'var(--gold-text)', border: '1px solid var(--gold-border-s)' }}
              >
                <Icon name="plus" size={14} />
                Mitglied hinzufuegen
              </button>
            ) : (
              <div
                className="rounded-xl p-3 mt-1"
                style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="font-label text-[0.65rem] tracking-[0.1em] uppercase"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Kontakt hinzufuegen
                  </span>
                  <button
                    onClick={() => { setShowAddMember(false); setSearchQuery(''); }}
                    className="cursor-pointer p-0.5"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <Icon name="x" size={14} />
                  </button>
                </div>

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Suchen ..."
                  className="w-full px-3 py-2 text-sm font-body outline-none mb-2"
                  style={{
                    background: 'var(--input-bg)',
                    border: '1px solid var(--input-border)',
                    borderRadius: '8px',
                    color: 'var(--text-body)',
                  }}
                />

                <div className="max-h-[200px] overflow-y-auto space-y-0.5">
                  {loadingConnections ? (
                    <p className="text-center py-4 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      Wird geladen ...
                    </p>
                  ) : filteredConnections.length === 0 ? (
                    <p className="text-center py-4 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      {searchQuery ? 'Kein Kontakt gefunden' : 'Alle Kontakte sind bereits Mitglied'}
                    </p>
                  ) : (
                    filteredConnections.map((conn) => {
                      const p = conn.profile;
                      const n = p.display_name ?? p.username ?? 'Anonym';
                      return (
                        <button
                          key={conn.id}
                          onClick={() => handleAddMember(p.id)}
                          className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-left cursor-pointer transition-colors"
                        >
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center font-heading text-[10px] overflow-hidden shrink-0"
                            style={{
                              background: 'var(--avatar-bg)',
                              color: 'var(--gold-text)',
                              border: '1.5px solid var(--gold-border-s)',
                            }}
                          >
                            {p.avatar_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={p.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : n.slice(0, 1).toUpperCase()}
                          </div>
                          <span className="flex-1 text-[12px] truncate" style={{ color: 'var(--text-body)' }}>
                            {n}
                          </span>
                          <Icon name="plus" size={14} style={{ color: 'var(--gold-text)' }} />
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="mx-5 mt-auto" style={{ borderBottom: '1px solid var(--divider-l)' }} />

        {/* Gruppe verlassen */}
        <div className="px-5 py-4">
          <button
            onClick={handleLeaveGroup}
            disabled={leaving}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full font-label text-[0.65rem] tracking-[0.1em] uppercase cursor-pointer transition-colors"
            style={{
              color: 'var(--text-muted)',
              border: '1px solid var(--glass-border)',
              opacity: leaving ? 0.5 : 1,
            }}
          >
            <Icon name="logout" size={14} />
            {leaving ? 'Verlassen ...' : 'Gruppe verlassen'}
          </button>
        </div>
      </div>
    </div>
  );
}
