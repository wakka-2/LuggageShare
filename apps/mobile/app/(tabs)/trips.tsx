import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { V2_COLORS, RADIUS, BUBBLE_SHADOWS, TYPOGRAPHY } from '@/providers/ThemeProvider';
import { useBookings, getMockBookings, ApiBooking } from '@/hooks/useBookings';
import { useAuth } from '@/hooks/useAuth';
import { EmptyState, Avatar, BackgroundBlobs, MetaChip } from '@/components/common';
import { LiveIndicator, MiniStepper } from '@/components/status';
import { SkeletonLoader } from '@/components/animations';

type FilterTab = 'all' | 'active' | 'completed' | 'cancelled';

const STATUS_COLORS: Record<string, string> = {
  pending: '#FFBE5C',
  accepted: '#5CB8FF',
  picked_up: '#7C6AFF',
  in_transit: '#7C6AFF',
  delivered: '#56D8B1',
  rejected: '#FF6B9D',
  cancelled: '#A8A5C0',
};

const STATUS_KEYS: Record<string, string> = {
  pending: 'trips.statusPending',
  accepted: 'trips.statusAccepted',
  picked_up: 'trips.statusPickedUp',
  in_transit: 'trips.statusInTransit',
  delivered: 'trips.statusDelivered',
  rejected: 'trips.statusRejected',
  cancelled: 'trips.statusCancelled',
};

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const BookingCard = React.memo(function BookingCard({
  booking,
  isRTL,
  onPress,
}: {
  booking: ApiBooking;
  isRTL: boolean;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const statusColor = STATUS_COLORS[booking.status] || V2_COLORS.textMuted;
  const date = new Date(booking.listing.departureDate);
  const statusKey = STATUS_KEYS[booking.status];
  const isInTransit = booking.status === 'in_transit';

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 20, stiffness: 300 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 200 });
      }}
      activeOpacity={1}
      style={[styles.bookingCard, animatedStyle]}
    >
      {/* Route with colored dots */}
      <View style={styles.bookingRoute}>
        <View style={[styles.routeDot, { backgroundColor: V2_COLORS.accent1 }]} />
        <Text style={styles.bookingCity}>{booking.listing.departureCity}</Text>
        <Ionicons name="airplane" size={14} color={V2_COLORS.textMuted} />
        <Text style={styles.bookingCity}>{booking.listing.arrivalCity}</Text>
        <View style={[styles.routeDot, { backgroundColor: V2_COLORS.secondary }]} />
      </View>

      {/* Status badge */}
      <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
        {isInTransit ? (
          <LiveIndicator
            color={statusColor}
            size="small"
            label={statusKey ? t(statusKey) : booking.status}
          />
        ) : (
          <>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {statusKey ? t(statusKey) : booking.status}
            </Text>
          </>
        )}
      </View>

      {/* Mini progress stepper */}
      <MiniStepper currentStatus={booking.status} />

      {/* Meta chips */}
      <View style={styles.bookingDetails}>
        <MetaChip
          icon="calendar"
          label={date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
            day: 'numeric',
            month: 'short',
          })}
          color={V2_COLORS.primary}
        />
        <MetaChip
          icon="scale"
          label={`${Number(booking.totalWeight)} kg`}
          color={V2_COLORS.accent1}
        />
        <MetaChip
          icon="pricetag"
          label={`${Number(booking.totalPrice)} ${booking.currency}`}
          color={V2_COLORS.accent2}
        />
      </View>

      {/* User footer */}
      <View style={styles.bookingUser}>
        <Avatar name={booking.carrier.name} avatarUrl={booking.carrier.avatarUrl} size={32} />
        <Text style={styles.userName}>{booking.carrier.name}</Text>
      </View>
    </AnimatedTouchable>
  );
});

export default function TripsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';

  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const { data: apiBookings, isLoading, refetch } = useBookings();

  // Fall back to mock bookings when the API doesn't return data
  const bookings = apiBookings?.length ? apiBookings : user?.id ? getMockBookings(user.id) : [];

  const filteredBookings = useMemo(() => {
    if (!bookings) return [];
    if (activeFilter === 'all') return bookings;
    if (activeFilter === 'active')
      return bookings.filter((b) =>
        ['pending', 'accepted', 'picked_up', 'in_transit'].includes(b.status)
      );
    if (activeFilter === 'completed') return bookings.filter((b) => b.status === 'delivered');
    return bookings.filter((b) => ['rejected', 'cancelled'].includes(b.status));
  }, [bookings, activeFilter]);

  const filters: { key: FilterTab; labelKey: string }[] = [
    { key: 'all', labelKey: 'trips.filterAll' },
    { key: 'active', labelKey: 'trips.filterActive' },
    { key: 'completed', labelKey: 'trips.filterDone' },
    { key: 'cancelled', labelKey: 'trips.filterCancelled' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <BackgroundBlobs variant="subtle" />

      <View style={styles.header}>
        <Text style={styles.title}>{t('trips.title')}</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filterBarContent}
      >
        {filters.map((f) => {
          const isActive = activeFilter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              onPress={() => setActiveFilter(f.key)}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
            >
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                {t(f.labelKey)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => refetch()}
            tintColor={V2_COLORS.primary}
          />
        }
      >
        {isLoading && (
          <View style={styles.loading}>
            {[0, 1, 2].map((i) => (
              <Animated.View
                key={`skel-${i}`}
                entering={FadeInDown.delay(i * 80).duration(300)}
                style={styles.skeletonCard}
              >
                <SkeletonLoader width="60%" height={18} borderRadius={RADIUS.pill} />
                <SkeletonLoader
                  width="35%"
                  height={14}
                  borderRadius={RADIUS.pill}
                  style={{ marginTop: 10 }}
                />
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                  <SkeletonLoader width={80} height={26} borderRadius={RADIUS.pill} />
                  <SkeletonLoader width={60} height={26} borderRadius={RADIUS.pill} />
                  <SkeletonLoader width={70} height={26} borderRadius={RADIUS.pill} />
                </View>
              </Animated.View>
            ))}
          </View>
        )}

        {!isLoading && filteredBookings.length === 0 && (
          <EmptyState
            lottieAnimation="search"
            title={t('trips.empty')}
            description={t('trips.emptyDescription')}
            actionLabel={t('messages.browseListings')}
            onAction={() => router.push('/(tabs)')}
            style={styles.emptyState}
          />
        )}

        {!isLoading &&
          filteredBookings.map((booking, index) => (
            <Animated.View key={booking.id} entering={FadeInDown.delay(index * 50).duration(300)}>
              <BookingCard
                booking={booking}
                isRTL={isRTL}
                onPress={() => router.push(`/booking/${booking.id}`)}
              />
            </Animated.View>
          ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: V2_COLORS.bg } as ViewStyle,
  header: { padding: 16, paddingBottom: 8 } as ViewStyle,
  title: { ...TYPOGRAPHY.h1, color: V2_COLORS.text } as TextStyle,
  filterBar: { maxHeight: 56 } as ViewStyle,
  filterBarContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 } as ViewStyle,
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
    backgroundColor: '#FFFFFF',
    ...BUBBLE_SHADOWS.xs,
  } as ViewStyle,
  filterChipActive: {
    backgroundColor: V2_COLORS.primary,
  } as ViewStyle,
  filterChipText: { fontSize: 13, fontWeight: '600', color: V2_COLORS.textSoft } as TextStyle,
  filterChipTextActive: { color: '#FFFFFF' } as TextStyle,
  scrollContent: { padding: 16, paddingBottom: 32 } as ViewStyle,
  loading: { paddingVertical: 16 } as ViewStyle,
  skeletonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    padding: 18,
    marginBottom: 12,
    ...BUBBLE_SHADOWS.sm,
  } as ViewStyle,
  emptyState: { marginTop: 40 } as ViewStyle,
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    padding: 18,
    marginBottom: 12,
    ...BUBBLE_SHADOWS.lg,
  } as ViewStyle,
  bookingRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  } as ViewStyle,
  routeDot: { width: 10, height: 10, borderRadius: 5 } as ViewStyle,
  bookingCity: { ...TYPOGRAPHY.h3, color: V2_COLORS.text } as TextStyle,
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
    gap: 6,
    marginBottom: 10,
  } as ViewStyle,
  statusDot: { width: 7, height: 7, borderRadius: 4 } as ViewStyle,
  statusText: { fontSize: 12, fontWeight: '700' } as TextStyle,
  bookingDetails: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 } as ViewStyle,
  bookingUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: V2_COLORS.cardShadow,
  } as ViewStyle,
  userName: { fontSize: 14, fontWeight: '600', color: V2_COLORS.text } as TextStyle,
});
