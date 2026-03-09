'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, X } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { useNotifications, type AppNotification } from '@/hooks/useNotifications';
import { useLanguage } from '@/providers/LanguageProvider';

function timeAgo(dateStr: string, lang: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return lang === 'ar' ? 'الآن' : 'Just now';
  if (mins < 60) return lang === 'ar' ? `منذ ${mins} د` : `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return lang === 'ar' ? `منذ ${hrs} س` : `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return lang === 'ar' ? `منذ ${days} ي` : `${days}d ago`;
}

export default function NotificationPopup() {
  const { isAuthenticated } = useAuth();
  const { data: notifications } = useNotifications();
  const { t, lang } = useLanguage();
  const [popups, setPopups] = useState<AppNotification[]>([]);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const initialLoadRef = useRef(true);

  // Track new unread notifications and show popup
  useEffect(() => {
    if (!notifications || !isAuthenticated) return;

    // On initial load, just record all existing IDs without showing popups
    if (initialLoadRef.current) {
      notifications.forEach((n) => seenIdsRef.current.add(n.id));
      initialLoadRef.current = false;
      return;
    }

    const newOnes = notifications.filter((n) => !n.isRead && !seenIdsRef.current.has(n.id));

    if (newOnes.length > 0) {
      newOnes.forEach((n) => seenIdsRef.current.add(n.id));
      setPopups((prev) => [...prev, ...newOnes].slice(-3)); // Show max 3
    }
  }, [notifications, isAuthenticated]);

  const dismiss = useCallback((id: string) => {
    setPopups((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // Auto-dismiss after 6s
  useEffect(() => {
    if (popups.length === 0) return;
    const timer = setTimeout(() => {
      setPopups((prev) => prev.slice(1));
    }, 6000);
    return () => clearTimeout(timer);
  }, [popups]);

  if (!isAuthenticated || popups.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 rtl:right-auto rtl:left-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {popups.map((notif) => (
        <div
          key={notif.id}
          className="bg-white rounded-2xl shadow-bubble-md border border-v2-primary/10 p-4 pointer-events-auto animate-slideUp"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-v2-primary/10 flex items-center justify-center flex-shrink-0">
              <Bell className="w-4 h-4 text-v2-primary" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-v2-text truncate">{notif.title}</p>
              <p className="text-xs text-v2-text-soft mt-0.5 line-clamp-2">{notif.body}</p>
              <p className="text-[10px] text-v2-text-muted mt-1">
                {timeAgo(notif.createdAt, lang)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => dismiss(notif.id)}
              className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-v2-bg transition-colors flex-shrink-0 text-v2-text-muted hover:text-v2-text"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <Link
            href="/notifications"
            onClick={() => dismiss(notif.id)}
            className="block mt-2.5 text-center text-xs font-semibold text-v2-primary hover:underline"
          >
            {t('notifications.viewAll')}
          </Link>
        </div>
      ))}
    </div>
  );
}
