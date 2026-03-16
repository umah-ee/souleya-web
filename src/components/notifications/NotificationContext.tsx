'use client';

import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from 'react';
import {
  fetchNotifications, fetchUnreadCount, markNotificationRead, markAllNotificationsRead,
  deleteNotification as apiDeleteNotification, deleteReadNotifications as apiDeleteRead,
  type Notification,
} from '@/lib/notifications';
import { createClient } from '@/lib/supabase/client';

interface NotificationContextValue {
  unreadCount: number;
  notifications: Notification[];
  isLoading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  deleteOne: (id: string) => Promise<void>;
  deleteRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue>({
  unreadCount: 0,
  notifications: [],
  isLoading: false,
  markAsRead: async () => {},
  markAllRead: async () => {},
  deleteOne: async () => {},
  deleteRead: async () => {},
  refreshNotifications: async () => {},
});

const STALE_MS = 30_000;

/**
 * Klangschalen-Sound via Web Audio API — sanft, warm, kurz (~1.2s)
 * Zwei ueberlagerte Sinustoene mit Fade-Out fuer den typischen "Pling"-Charakter.
 */
function playSingingBowlSound() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const now = ctx.currentTime;

    // Grundton (F5 ~698 Hz) — warm und klar
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(698, now);
    osc1.frequency.exponentialRampToValueAtTime(694, now + 1.2);

    // Oberton (leichter Shimmer, ~1396 Hz)
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1396, now);
    osc2.frequency.exponentialRampToValueAtTime(1390, now + 1.0);

    // Gain Envelopes
    const gain1 = ctx.createGain();
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(0.06, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.0);

    osc1.connect(gain1).connect(ctx.destination);
    osc2.connect(gain2).connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 1.3);
    osc2.stop(now + 1.1);

    // AudioContext nach Abspielen aufraumen
    setTimeout(() => ctx.close().catch(() => {}), 2000);
  } catch {
    // Silent — Browser unterstuetzt kein Web Audio oder autoplay blockiert
  }
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const lastUpdatedRef = useRef(0);
  const isFetchingRef = useRef(false);

  const refreshNotifications = useCallback(async () => {
    if (isFetchingRef.current) return;
    if (Date.now() - lastUpdatedRef.current < STALE_MS) return;
    isFetchingRef.current = true;
    setIsLoading(true);
    try {
      const [countRes, notifRes] = await Promise.all([
        fetchUnreadCount(),
        fetchNotifications(1, 20),
      ]);
      setUnreadCount(countRes.count);
      setNotifications(notifRes.data);
      lastUpdatedRef.current = Date.now();
    } catch {
      // silent — API-Modul existiert evtl. noch nicht
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // silent
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      // silent
    }
  }, []);

  const deleteOne = useCallback(async (id: string) => {
    try {
      const wasUnread = notifications.find((n) => n.id === id && !n.is_read);
      await apiDeleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // silent
    }
  }, [notifications]);

  const deleteRead = useCallback(async () => {
    try {
      await apiDeleteRead();
      setNotifications((prev) => prev.filter((n) => !n.is_read));
    } catch {
      // silent
    }
  }, []);

  // Initial fetch + 30s Polling
  useEffect(() => {
    refreshNotifications();
    const interval = setInterval(() => {
      lastUpdatedRef.current = 0; // Force refresh
      refreshNotifications();
    }, 30_000);
    return () => clearInterval(interval);
  }, [refreshNotifications]);

  // Supabase Realtime — neue Notifications
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        () => {
          lastUpdatedRef.current = 0;
          refreshNotifications();
          playSingingBowlSound();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshNotifications]);

  return (
    <NotificationContext.Provider value={{ unreadCount, notifications, isLoading, markAsRead, markAllRead, deleteOne, deleteRead, refreshNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
