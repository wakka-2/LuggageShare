'use client';

import { useCallback } from 'react';
import { Bell, CheckCheck, Package, MessageSquare, Star, Wallet, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useLanguage } from '@/providers/LanguageProvider';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '@/hooks/useNotifications';
import PushEnableBanner from '@/components/pwa/PushEnableBanner';

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

type NotificationType =
  | 'BOOKING_UPDATE'
  | 'NEW_MESSAGE'
  | 'REVIEW_RECEIVED'
  | 'PAYMENT_UPDATE'
  | 'SYSTEM';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  data?: { bookingId?: string; listingId?: string };
  createdAt: string;
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function getRelativeTime(
  dateStr: string,
  t: (key: string, params?: Record<string, string | number>) => string,
  lang: string
): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return t('wp.justNow');
  if (diffMin < 60) return t('wp.minutesAgo', { count: diffMin });
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return t('wp.hoursAgo', { count: diffHr });
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return t('wp.daysAgo', { count: diffDay });
  return date.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US');
}

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case 'BOOKING_UPDATE':
      return <Package className="w-5 h-5 text-v2-primary" />;
    case 'NEW_MESSAGE':
      return <MessageSquare className="w-5 h-5 text-blue-500" />;
    case 'REVIEW_RECEIVED':
      return <Star className="w-5 h-5 text-amber-500" />;
    case 'PAYMENT_UPDATE':
      return <Wallet className="w-5 h-5 text-emerald-500" />;
    case 'SYSTEM':
    default:
      return <AlertCircle className="w-5 h-5 text-v2-text-soft" />;
  }
}

function getNotificationIconBg(type: NotificationType): string {
  switch (type) {
    case 'BOOKING_UPDATE':
      return 'bg-v2-primary/10';
    case 'NEW_MESSAGE':
      return 'bg-blue-50';
    case 'REVIEW_RECEIVED':
      return 'bg-amber-50';
    case 'PAYMENT_UPDATE':
      return 'bg-emerald-50';
    case 'SYSTEM':
    default:
      return 'bg-gray-100';
  }
}

function getNotificationLink(notification: Notification): string | null {
  const data = notification.data;
  switch (notification.type) {
    case 'BOOKING_UPDATE':
      return data?.bookingId ? `/booking/${data.bookingId}` : null;
    case 'NEW_MESSAGE':
      return data?.bookingId ? `/messages?booking=${data.bookingId}` : '/messages';
    case 'REVIEW_RECEIVED':
      return data?.bookingId ? `/booking/${data.bookingId}` : null;
    case 'PAYMENT_UPDATE':
      return '/profile'; // wallet section
    case 'SYSTEM':
    default:
      return null;
  }
}

/* -------------------------------------------------------------------------- */
/*  Skeleton                                                                  */
/* -------------------------------------------------------------------------- */

function NotificationSkeleton() {
  return (
    <div className="flex items-start gap-3 bg-white rounded-[22px] p-4 shadow-bubble-sm animate-pulse">
      <div className="w-10 h-10 rounded-full bg-v2-primary/10 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <div className="h-4 w-36 bg-v2-primary/10 rounded-full" />
          <div className="h-3 w-16 bg-v2-primary/5 rounded-full" />
        </div>
        <div className="h-3 w-full bg-v2-primary/5 rounded-full mb-1.5" />
        <div className="h-3 w-2/3 bg-v2-primary/5 rounded-full" />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function NotificationsPage() {
  const { t, lang } = useLanguage();
  const router = useRouter();
  const { data: rawNotifications, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  // Cast the raw data to our richer Notification type.
  // The API may return records with or without a `type` field; we default to SYSTEM.
  const notifications: Notification[] = (rawNotifications ?? []).map((n) => ({
    id: n.id,
    type: ((n as unknown as Notification).type ?? 'SYSTEM') as NotificationType,
    title: n.title,
    body: n.body,
    isRead: n.isRead,
    data: n.data as Notification['data'],
    createdAt: n.createdAt,
  }));

  const hasNotifications = notifications.length > 0;
  const hasUnread = notifications.some((n) => !n.isRead);

  const handleNotificationClick = useCallback(
    (notification: Notification) => {
      if (!notification.isRead) {
        markRead.mutate(notification.id);
      }
      const link = getNotificationLink(notification);
      if (link) {
        router.push(link);
      }
    },
    [markRead, router]
  );

  const handleMarkAllRead = useCallback(() => {
    markAllRead.mutate();
  }, [markAllRead]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col blob-background">
        <Header />

        <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
          {/* ---- Page header ---- */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full v2-gradient-primary flex items-center justify-center shadow-bubble-xs">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-v2-text">{t('notifications.title')}</h1>
                <p className="text-sm text-v2-text-soft">{t('wp.notificationsSubtitle')}</p>
              </div>
            </div>

            {hasUnread && (
              <button
                onClick={handleMarkAllRead}
                disabled={markAllRead.isPending}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold
                  bg-white text-v2-primary shadow-bubble-xs hover:shadow-bubble-sm
                  transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCheck className="w-4 h-4" />
                <span>{t('wp.markAllRead')}</span>
              </button>
            )}
          </div>

          {/* ---- OS push opt-in ---- */}
          <PushEnableBanner />

          {/* ---- Content ---- */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <NotificationSkeleton key={i} />
              ))}
            </div>
          ) : hasNotifications ? (
            <div className="space-y-3">
              {notifications.map((notification) => {
                const link = getNotificationLink(notification);
                return (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full text-start flex items-start gap-3 rounded-[22px] p-4 transition-all
                      ${
                        notification.isRead
                          ? 'bg-white shadow-bubble-sm hover:shadow-bubble-md'
                          : 'bg-white ring-2 ring-v2-primary/20 shadow-bubble-md hover:shadow-bubble-lg'
                      }
                      ${link ? 'cursor-pointer' : 'cursor-default'}
                    `}
                  >
                    {/* Icon */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationIconBg(
                        notification.type
                      )}`}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3
                          className={`text-sm font-semibold truncate ${
                            notification.isRead ? 'text-v2-text' : 'text-v2-text font-bold'
                          }`}
                        >
                          {notification.title}
                        </h3>
                        <span className="text-xs text-v2-text-muted whitespace-nowrap flex-shrink-0">
                          {getRelativeTime(notification.createdAt, t, lang)}
                        </span>
                      </div>
                      <p className="text-sm text-v2-text-soft line-clamp-2">{notification.body}</p>
                    </div>

                    {/* Unread dot */}
                    {!notification.isRead && (
                      <div className="w-2.5 h-2.5 rounded-full bg-v2-primary flex-shrink-0 mt-1.5" />
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            /* ---- Empty state ---- */
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-v2-primary/10 flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-v2-primary" />
              </div>
              <h3 className="text-lg font-bold text-v2-text mb-2">
                {t('notifications.noNotifications')}
              </h3>
              <p className="text-v2-text-soft">{t('wp.notificationsEmptyDesc')}</p>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
