import { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { V2_COLORS, RADIUS, BUBBLE_SHADOWS } from '@/providers/ThemeProvider';
import {
  useNotifications,
  useMarkNotificationRead,
  useUnreadCount,
} from '@/hooks/useNotifications';
import { webTransition } from './styles';

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const router = useRouter();
  const dropdownRef = useRef<View>(null);

  const { data: notifications } = useNotifications();
  const markRead = useMarkNotificationRead();
  const unreadCount = useUnreadCount();

  const recent = (notifications ?? []).slice(0, 5);

  // Close on outside click (web)
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-notification-dropdown]')) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleNotificationPress = (id: string) => {
    markRead.mutate(id);
    setOpen(false);
    router.push('/notifications');
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  return (
    <View {...({ 'data-notification-dropdown': true } as any)} style={styles.wrapper}>
      <TouchableOpacity onPress={() => setOpen(!open)} style={styles.bellButton}>
        <Ionicons name="notifications-outline" size={20} color={V2_COLORS.text} />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      {open && (
        <View ref={dropdownRef} style={styles.dropdown}>
          <View style={styles.header}>
            <Text style={styles.headerText}>{t('web.notifications.title')}</Text>
            {unreadCount > 0 && (
              <View style={styles.headerBadge}>
                <Text style={styles.headerBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {recent.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="notifications-off-outline" size={32} color={V2_COLORS.textMuted} />
                <Text style={styles.emptyText}>{t('web.notifications.empty')}</Text>
              </View>
            ) : (
              recent.map((notif) => (
                <TouchableOpacity
                  key={notif.id}
                  style={[
                    styles.notifItem,
                    !notif.isRead && styles.notifItemUnread,
                    webTransition('background-color', '0.15s'),
                  ]}
                  onPress={() => handleNotificationPress(notif.id)}
                >
                  <View style={styles.notifContent}>
                    <View style={styles.notifRow}>
                      <Text style={styles.notifTitle} numberOfLines={1}>
                        {notif.title}
                      </Text>
                      <Text style={styles.notifTime}>{timeAgo(notif.createdAt)}</Text>
                    </View>
                    <Text style={styles.notifBody} numberOfLines={2}>
                      {notif.body}
                    </Text>
                  </View>
                  {!notif.isRead && <View style={styles.unreadDot} />}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>

          {recent.length > 0 && (
            <TouchableOpacity
              style={styles.viewAll}
              onPress={() => {
                setOpen(false);
                router.push('/notifications');
              }}
            >
              <Text style={styles.viewAllText}>{t('web.notifications.viewAll')}</Text>
              <Ionicons name="arrow-forward" size={14} color={V2_COLORS.primary} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.pill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: V2_COLORS.bg,
    ...({ cursor: 'pointer' } as any),
  },
  badge: {
    position: 'absolute',
    top: 4,
    end: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    backgroundColor: V2_COLORS.secondary,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  dropdown: {
    position: 'absolute',
    top: 48,
    end: 0,
    width: 360,
    maxHeight: 440,
    borderRadius: RADIUS.card,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    ...BUBBLE_SHADOWS.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '700',
    color: V2_COLORS.text,
  },
  headerBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    backgroundColor: V2_COLORS.primary,
  },
  headerBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  list: {
    maxHeight: 320,
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    color: V2_COLORS.textMuted,
  },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: RADIUS.card,
    marginHorizontal: 8,
    ...({ cursor: 'pointer' } as any),
  },
  notifItemUnread: {
    backgroundColor: V2_COLORS.primary + '08',
  },
  notifContent: {
    flex: 1,
    gap: 4,
  },
  notifRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    color: V2_COLORS.text,
  },
  notifTime: {
    fontSize: 11,
    marginStart: 8,
    color: V2_COLORS.textMuted,
  },
  notifBody: {
    fontSize: 12,
    lineHeight: 16,
    color: V2_COLORS.textSoft,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginStart: 8,
    backgroundColor: V2_COLORS.primary,
  },
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: V2_COLORS.cardShadow,
    gap: 4,
    ...({ cursor: 'pointer' } as any),
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: V2_COLORS.primary,
  },
});
