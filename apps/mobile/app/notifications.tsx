import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';

import { V2_COLORS, RADIUS, BUBBLE_SHADOWS } from '@/providers/ThemeProvider';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  AppNotification,
} from '@/hooks/useNotifications';
import { SkeletonLoader } from '@/components/animations';
import { BackgroundBlobs } from '@/components/common';

const NOTIFICATION_ICONS: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string }> =
  {
    booking_created: { icon: 'calendar-outline', color: V2_COLORS.primary },
    booking_accepted: { icon: 'checkmark-circle-outline', color: V2_COLORS.accent1 },
    booking_rejected: { icon: 'close-circle-outline', color: V2_COLORS.secondary },
    booking_cancelled: { icon: 'ban-outline', color: V2_COLORS.textMuted },
    message_received: { icon: 'chatbubble-outline', color: V2_COLORS.accent3 },
    review_received: { icon: 'star-outline', color: V2_COLORS.accent2 },
    payment_received: { icon: 'wallet-outline', color: V2_COLORS.accent1 },
  };

function getTimeAgo(
  dateStr: string,
  isRTL: boolean,
  t: (key: string, options?: Record<string, unknown>) => string
): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return t('notifications.justNow');
  if (minutes < 60) return t('notifications.minutesAgo', { count: minutes });
  if (hours < 24) return t('notifications.hoursAgo', { count: hours });
  if (days < 7) return t('notifications.daysAgo', { count: days });
  return new Date(dateStr).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export default function NotificationsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';

  const { data: notifications, isLoading, refetch } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;

  const handlePress = useCallback(
    (notification: AppNotification) => {
      if (!notification.isRead) {
        markRead.mutate(notification.id);
      }
      const nd = notification.data as Record<string, string> | null;
      if (nd?.bookingId) {
        router.push(`/booking/${nd.bookingId}` as any);
      } else if (nd?.listingId) {
        router.push(`/listing/${nd.listingId}` as any);
      }
    },
    [markRead, router]
  );

  const getIconConfig = useCallback((notification: AppNotification) => {
    const nd = notification.data as Record<string, string> | null;
    const type = nd?.type as string | undefined;
    return (
      (type && NOTIFICATION_ICONS[type]) || {
        icon: 'notifications-outline' as keyof typeof Ionicons.glyphMap,
        color: V2_COLORS.primary,
      }
    );
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: AppNotification; index: number }) => {
      const config = getIconConfig(item);
      return (
        <Animated.View
          entering={FadeInUp.delay(index * 50)
            .duration(300)
            .springify()}
        >
          <TouchableOpacity
            onPress={() => handlePress(item)}
            activeOpacity={0.7}
            style={[styles.notifItem, !item.isRead && styles.notifItemUnread]}
          >
            <View style={[styles.iconCircle, { backgroundColor: config.color + '15' }]}>
              <Ionicons name={config.icon} size={20} color={config.color} />
            </View>
            <View style={styles.notifContent}>
              <Text style={[styles.notifTitle, !item.isRead && styles.notifTitleUnread]}>
                {item.title}
              </Text>
              <Text style={styles.notifBody} numberOfLines={2}>
                {item.body}
              </Text>
              <View style={styles.timePill}>
                <Text style={styles.notifTime}>{getTimeAgo(item.createdAt, isRTL, t)}</Text>
              </View>
            </View>
            {!item.isRead && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        </Animated.View>
      );
    },
    [isRTL, t, handlePress, getIconConfig]
  );

  return (
    <SafeAreaView style={styles.container}>
      <BackgroundBlobs />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons
            name={isRTL ? 'arrow-forward' : 'arrow-back'}
            size={20}
            color={V2_COLORS.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('notifications.title')}</Text>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={() => markAllRead.mutate()} style={styles.backBtn}>
            <Ionicons name="checkmark-done-outline" size={20} color={V2_COLORS.primary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backBtn} />
        )}
      </View>

      {isLoading ? (
        <View style={styles.skeletonList}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Animated.View
              key={`skel-${i}`}
              entering={FadeIn.delay(i * 60).duration(200)}
              style={styles.skeletonItem}
            >
              <SkeletonLoader width={44} height={44} borderRadius={22} />
              <View style={{ flex: 1, gap: 6 }}>
                <SkeletonLoader width="70%" height={14} borderRadius={4} />
                <SkeletonLoader width="100%" height={12} borderRadius={4} />
                <SkeletonLoader width="30%" height={10} borderRadius={4} />
              </View>
            </Animated.View>
          ))}
        </View>
      ) : (
        <FlatList
          data={notifications || []}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={() => refetch()}
              tintColor={V2_COLORS.primary}
            />
          }
          ListEmptyComponent={
            <Animated.View entering={FadeIn.duration(300)} style={styles.emptyState}>
              <Ionicons name="notifications-off-outline" size={56} color={V2_COLORS.textMuted} />
              <Text style={styles.emptyTitle}>{t('notifications.noNotifications')}</Text>
              <Text style={styles.emptyDesc}>{t('notifications.noNotificationsDescription')}</Text>
            </Animated.View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: V2_COLORS.bg } as ViewStyle,
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  } as ViewStyle,
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.pill,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...BUBBLE_SHADOWS.xs,
  } as ViewStyle,
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: V2_COLORS.text,
  } as TextStyle,

  listContent: { padding: 16, gap: 10 } as ViewStyle,

  notifItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    ...BUBBLE_SHADOWS.sm,
  } as ViewStyle,
  notifItemUnread: {
    backgroundColor: V2_COLORS.primary + '08',
  } as ViewStyle,
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  notifContent: { flex: 1 } as ViewStyle,
  notifTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: V2_COLORS.text,
    marginBottom: 2,
  } as TextStyle,
  notifTitleUnread: { fontWeight: '700' } as TextStyle,
  notifBody: {
    fontSize: 13,
    lineHeight: 19,
    color: V2_COLORS.textSoft,
    marginBottom: 6,
  } as TextStyle,
  timePill: {
    alignSelf: 'flex-start',
    backgroundColor: V2_COLORS.cardShadow,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  } as ViewStyle,
  notifTime: {
    fontSize: 11,
    fontWeight: '500',
    color: V2_COLORS.textMuted,
  } as TextStyle,
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: V2_COLORS.primary,
    marginTop: 6,
  } as ViewStyle,

  skeletonList: { padding: 16, gap: 10 } as ViewStyle,
  skeletonItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
  } as ViewStyle,
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 120,
    gap: 12,
  } as ViewStyle,
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: V2_COLORS.text,
  } as TextStyle,
  emptyDesc: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
    color: V2_COLORS.textMuted,
  } as TextStyle,
});
