import { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/hooks/useTheme';
import {
  useNotifications,
  useMarkNotificationRead,
  useUnreadCount,
} from '@/hooks/useNotifications';
import { glassBackground, glassBorder, webTransition } from './styles';

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
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
      <TouchableOpacity
        onPress={() => setOpen(!open)}
        style={[
          styles.bellButton,
          { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' },
        ]}
      >
        <Ionicons name="notifications-outline" size={20} color={colors.text} />
        {unreadCount > 0 && (
          <View style={[styles.badge, { backgroundColor: colors.error }]}>
            <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      {open && (
        <View
          ref={dropdownRef}
          style={[
            styles.dropdown,
            glassBackground(colors, isDark),
            glassBorder(isDark),
            { borderColor: colors.border },
          ]}
        >
          <View style={styles.header}>
            <Text style={[styles.headerText, { color: colors.text }]}>
              {t('web.notifications.title')}
            </Text>
            {unreadCount > 0 && (
              <View style={[styles.headerBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.headerBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {recent.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="notifications-off-outline" size={32} color={colors.textTertiary} />
                <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
                  {t('web.notifications.empty')}
                </Text>
              </View>
            ) : (
              recent.map((notif) => (
                <TouchableOpacity
                  key={notif.id}
                  style={[
                    styles.notifItem,
                    !notif.isRead && {
                      backgroundColor: isDark
                        ? 'rgba(74, 122, 184, 0.1)'
                        : 'rgba(46, 90, 143, 0.05)',
                    },
                    webTransition('background-color', '0.15s'),
                  ]}
                  onPress={() => handleNotificationPress(notif.id)}
                >
                  <View style={styles.notifContent}>
                    <View style={styles.notifRow}>
                      <Text style={[styles.notifTitle, { color: colors.text }]} numberOfLines={1}>
                        {notif.title}
                      </Text>
                      <Text style={[styles.notifTime, { color: colors.textTertiary }]}>
                        {timeAgo(notif.createdAt)}
                      </Text>
                    </View>
                    <Text
                      style={[styles.notifBody, { color: colors.textSecondary }]}
                      numberOfLines={2}
                    >
                      {notif.body}
                    </Text>
                  </View>
                  {!notif.isRead && (
                    <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
                  )}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>

          {recent.length > 0 && (
            <TouchableOpacity
              style={[styles.viewAll, { borderTopColor: colors.border }]}
              onPress={() => {
                setOpen(false);
                router.push('/notifications');
              }}
            >
              <Text style={[styles.viewAllText, { color: colors.primary }]}>
                {t('web.notifications.viewAll')}
              </Text>
              <Ionicons name="arrow-forward" size={14} color={colors.primary} />
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
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
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
    borderRadius: 16,
    overflow: 'hidden',
    ...({ boxShadow: '0 8px 32px rgba(0,0,0,0.12)' } as any),
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
  },
  headerBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
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
  },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...({ cursor: 'pointer' } as any),
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
  },
  notifTime: {
    fontSize: 11,
    marginStart: 8,
  },
  notifBody: {
    fontSize: 12,
    lineHeight: 16,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginStart: 8,
  },
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 4,
    ...({ cursor: 'pointer' } as any),
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
