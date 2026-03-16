'use client';

import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from 'react';
import { fetchNotifications, fetchUnreadCount, markNotificationRead, markAllNotificationsRead, type Notification } from '@/lib/notifications';
import { createClient } from '@/lib/supabase/client';

interface NotificationContextValue {
  unreadCount: number;
  notifications: Notification[];
  isLoading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue>({
  unreadCount: 0,
  notifications: [],
  isLoading: false,
  markAsRead: async () => {},
  markAllRead: async () => {},
  refreshNotifications: async () => {},
});

const STALE_MS = 30_000;

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
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshNotifications]);

  return (
    <NotificationContext.Provider value={{ unreadCount, notifications, isLoading, markAsRead, markAllRead, refreshNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
