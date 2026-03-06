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

import { useTheme } from '@/hooks/useTheme';
import { ScreenHeader } from '@/components/common';
import { useGoBack } from '@/hooks/useGoBack';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  AppNotification,
} from '@/hooks/useNotifications';
import { SkeletonLoader } from '@/components/animations';

const NOTIFICATION_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  booking_created: 'calendar-outline',
  booking_accepted: 'checkmark-circle-outline',
  booking_rejected: 'close-circle-outline',
  booking_cancelled: 'ban-outline',
  message_received: 'chatbubble-outline',
  review_received: 'star-outline',
  payment_received: 'wallet-outline',
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
  const { colors } = useTheme();
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
      // Navigate based on notification data
      const nd = notification.data as Record<string, string> | null;
      if (nd?.bookingId) {
        router.push(`/booking/${nd.bookingId}` as any);
      } else if (nd?.listingId) {
        router.push(`/listing/${nd.listingId}` as any);
      }
    },
    [markRead, router]
  );

  const getIcon = useCallback((notification: AppNotification): keyof typeof Ionicons.glyphMap => {
    const nd = notification.data as Record<string, string> | null;
    const type = nd?.type as string | undefined;
    return (type && NOTIFICATION_ICONS[type]) || 'notifications-outline';
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: AppNotification; index: number }) => (
      <Animated.View
        entering={FadeInUp.delay(index * 50)
          .duration(300)
          .springify()}
      >
        <TouchableOpacity
          onPress={() => handlePress(item)}
          activeOpacity={0.7}
          style={[
            styles.notifItem,
            {
              backgroundColor: item.isRead ? 'transparent' : colors.primary + '08',
              borderBottomColor: colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.iconBox,
              { backgroundColor: item.isRead ? colors.card : colors.primary + '15' },
            ]}
          >
            <Ionicons
              name={getIcon(item)}
              size={20}
              color={item.isRead ? colors.textSecondary : colors.primary}
            />
          </View>
          <View style={styles.notifContent}>
            <Text
              style={[
                styles.notifTitle,
                { color: colors.text },
                !item.isRead && styles.notifTitleUnread,
              ]}
            >
              {item.title}
            </Text>
            <Text style={[styles.notifBody, { color: colors.textSecondary }]} numberOfLines={2}>
              {item.body}
            </Text>
            <Text style={[styles.notifTime, { color: colors.textSecondary }]}>
              {getTimeAgo(item.createdAt, isRTL, t)}
            </Text>
          </View>
          {!item.isRead && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
        </TouchableOpacity>
      </Animated.View>
    ),
    [colors, isRTL, t, handlePress, getIcon]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title={t('notifications.title')}
        right={
          unreadCount > 0 ? (
            <TouchableOpacity onPress={() => markAllRead.mutate()} style={styles.headerBtn}>
              <Ionicons name="checkmark-done-outline" size={22} color={colors.primary} />
            </TouchableOpacity>
          ) : undefined
        }
      />

      {isLoading ? (
        <View style={styles.skeletonList}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Animated.View
              key={`skel-${i}`}
              entering={FadeIn.delay(i * 60).duration(200)}
              style={styles.skeletonItem}
            >
              <SkeletonLoader width={40} height={40} borderRadius={12} />
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
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={() => refetch()}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <Animated.View entering={FadeIn.duration(300)} style={styles.emptyState}>
              <Ionicons name="notifications-off-outline" size={56} color={colors.textSecondary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {t('notifications.noNotifications')}
              </Text>
              <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
                {t('notifications.noNotificationsDescription')}
              </Text>
            </Animated.View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 } as ViewStyle,
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  } as ViewStyle,
  headerBtn: { width: 40, alignItems: 'center' } as ViewStyle,
  headerTitle: { fontSize: 18, fontWeight: '600' } as TextStyle,

  notifItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
  } as ViewStyle,
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  notifContent: { flex: 1 } as ViewStyle,
  notifTitle: { fontSize: 15, fontWeight: '500', marginBottom: 2 } as TextStyle,
  notifTitleUnread: { fontWeight: '700' } as TextStyle,
  notifBody: { fontSize: 13, lineHeight: 19, marginBottom: 4 } as TextStyle,
  notifTime: { fontSize: 12 } as TextStyle,
  unreadDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 } as ViewStyle,

  skeletonList: { padding: 16, gap: 0 } as ViewStyle,
  skeletonItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 14,
  } as ViewStyle,
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 120,
    gap: 12,
  } as ViewStyle,
  emptyTitle: { fontSize: 18, fontWeight: '600' } as TextStyle,
  emptyDesc: { fontSize: 14, textAlign: 'center', paddingHorizontal: 40 } as TextStyle,
});
