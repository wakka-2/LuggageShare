import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
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

import { useTheme } from '@/hooks/useTheme';
import { ThemeColors, RADIUS, SPACING, TYPOGRAPHY, SECTION_TINTS } from '@/providers/ThemeProvider';
import { useBookings, getMockBookings, ApiBooking } from '@/hooks/useBookings';
import { useMyListings } from '@/hooks/useListings';
import { useAuth } from '@/hooks/useAuth';
import { SolidCard, EmptyState, Avatar } from '@/components/common';
import { LiveIndicator, MiniStepper } from '@/components/status';
import { SkeletonLoader } from '@/components/animations';

// ─── Types ───────────────────────────────────────────────

type Segment = 'bookings' | 'listings';
type FilterTab = 'all' | 'active' | 'completed' | 'cancelled';

// ─── Constants ───────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  pending: '#F59E0B',
  accepted: '#3B82F6',
  picked_up: '#8B5CF6',
  in_transit: '#6366F1',
  delivered: '#10B981',
  rejected: '#EF4444',
  cancelled: '#6B7280',
  active: '#10B981',
  fulfilled: '#3B82F6',
  expired: '#6B7280',
  withdrawn: '#9CA3AF',
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

// ─── BookingCard (V2 — solid card with colored left strip) ─

const BookingCard = React.memo(function BookingCard({
  booking,
  isRTL,
  colors,
  onPress,
}: {
  booking: ApiBooking;
  isRTL: boolean;
  colors: ThemeColors;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const statusColor = STATUS_COLORS[booking.status] || colors.textSecondary;
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
      style={animatedStyle}
    >
      <View style={cardStyles.cardOuter}>
        {/* Colored left strip */}
        <View style={[cardStyles.leftStrip, { backgroundColor: statusColor }]} />

        <SolidCard accentColor={statusColor} style={cardStyles.card} noPadding>
          <View style={cardStyles.cardInner}>
            {/* Route */}
            <View style={cardStyles.routeRow}>
              <Text style={[TYPOGRAPHY.h3 as TextStyle, { color: colors.text }]}>
                {booking.listing.departureCity}
              </Text>
              <View style={[cardStyles.routeArrowCircle, { backgroundColor: statusColor + '15' }]}>
                <Ionicons name="airplane" size={14} color={statusColor} />
              </View>
              <Text style={[TYPOGRAPHY.h3 as TextStyle, { color: colors.text }]}>
                {booking.listing.arrivalCity}
              </Text>
            </View>

            {/* Status Badge */}
            <View style={[cardStyles.statusBadge, { backgroundColor: statusColor + '15' }]}>
              {isInTransit ? (
                <LiveIndicator
                  color={statusColor}
                  size="small"
                  label={statusKey ? t(statusKey) : booking.status}
                />
              ) : (
                <>
                  <View style={[cardStyles.statusDot, { backgroundColor: statusColor }]} />
                  <Text style={[TYPOGRAPHY.small, { color: statusColor, fontWeight: '700' }]}>
                    {statusKey ? t(statusKey) : booking.status}
                  </Text>
                </>
              )}
            </View>

            {/* Mini Stepper */}
            <MiniStepper currentStatus={booking.status} />

            {/* Details Row */}
            <View style={cardStyles.detailsRow}>
              <View style={[cardStyles.detailChip, { backgroundColor: SECTION_TINTS.blue }]}>
                <Ionicons name="calendar-outline" size={12} color="#3B82F6" />
                <Text style={[TYPOGRAPHY.small, { color: '#3B82F6' }]}>
                  {date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </Text>
              </View>
              <View style={[cardStyles.detailChip, { backgroundColor: SECTION_TINTS.purple }]}>
                <Ionicons name="scale-outline" size={12} color="#6C63FF" />
                <Text style={[TYPOGRAPHY.small, { color: '#6C63FF' }]}>
                  {Number(booking.totalWeight)} kg
                </Text>
              </View>
              <View style={[cardStyles.detailChip, { backgroundColor: SECTION_TINTS.green }]}>
                <Ionicons name="pricetag-outline" size={12} color="#00C48C" />
                <Text style={[TYPOGRAPHY.small, { color: '#00C48C' }]}>
                  {Number(booking.totalPrice)} {booking.currency}
                </Text>
              </View>
            </View>

            {/* Carrier Row */}
            <View style={[cardStyles.carrierRow, { borderTopColor: colors.borderSubtle }]}>
              <Avatar name={booking.carrier.name} avatarUrl={booking.carrier.avatarUrl} size={32} />
              <Text style={[TYPOGRAPHY.small, { color: colors.text, fontWeight: '600' }]}>
                {booking.carrier.name}
              </Text>
            </View>
          </View>
        </SolidCard>
      </View>
    </AnimatedTouchable>
  );
});

// ─── RouteCard (V2 — solid card for listings) ─────────────

const RouteCard = React.memo(function RouteCard({
  departureCity,
  arrivalCity,
  status,
  date,
  detail,
  isRTL,
  colors,
  onPress,
}: {
  departureCity: string;
  arrivalCity: string;
  status: string;
  date: string;
  detail: string;
  isRTL: boolean;
  colors: ThemeColors;
  onPress: () => void;
}) {
  const statusColor = STATUS_COLORS[status] || colors.textSecondary;
  const dateObj = new Date(date);

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.98, { damping: 20, stiffness: 300 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 200 });
      }}
      activeOpacity={1}
      style={animatedStyle}
    >
      <SolidCard accentColor={colors.primary} style={cardStyles.card}>
        {/* Route */}
        <View style={cardStyles.routeRow}>
          <Text style={[TYPOGRAPHY.h3 as TextStyle, { color: colors.text }]}>{departureCity}</Text>
          <View style={[cardStyles.routeArrowCircle, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name="airplane" size={14} color={colors.primary} />
          </View>
          <Text style={[TYPOGRAPHY.h3 as TextStyle, { color: colors.text }]}>{arrivalCity}</Text>
        </View>

        {/* Status Badge */}
        <View style={[cardStyles.statusBadge, { backgroundColor: statusColor + '15' }]}>
          <View style={[cardStyles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[TYPOGRAPHY.small, { color: statusColor, fontWeight: '700' }]}>
            {status}
          </Text>
        </View>

        {/* Details Row */}
        <View style={cardStyles.detailsRow}>
          <View style={[cardStyles.detailChip, { backgroundColor: SECTION_TINTS.blue }]}>
            <Ionicons name="calendar-outline" size={12} color="#3B82F6" />
            <Text style={[TYPOGRAPHY.small, { color: '#3B82F6' }]}>
              {dateObj.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
                day: 'numeric',
                month: 'short',
              })}
            </Text>
          </View>
          <View style={[cardStyles.detailChip, { backgroundColor: SECTION_TINTS.purple }]}>
            <Text style={[TYPOGRAPHY.small, { color: '#6C63FF' }]}>{detail}</Text>
          </View>
        </View>
      </SolidCard>
    </AnimatedTouchable>
  );
});

// ─── TripsScreen ─────────────────────────────────────────

export default function TripsScreen() {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';

  const { user } = useAuth();
  const [segment, setSegment] = useState<Segment>('bookings');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  const { data: apiBookings, isLoading: bookingsLoading, refetch: refetchBookings } = useBookings();
  const {
    data: myListings,
    isLoading: listingsLoading,
    refetch: refetchListings,
  } = useMyListings();

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

  const filters: { key: FilterTab; labelKey: string; tint: string; activeColor: string }[] = [
    {
      key: 'all',
      labelKey: 'trips.filterAll',
      tint: SECTION_TINTS.purple,
      activeColor: colors.primary,
    },
    {
      key: 'active',
      labelKey: 'trips.filterActive',
      tint: SECTION_TINTS.blue,
      activeColor: '#3B82F6',
    },
    {
      key: 'completed',
      labelKey: 'trips.filterDone',
      tint: SECTION_TINTS.green,
      activeColor: '#00C48C',
    },
    {
      key: 'cancelled',
      labelKey: 'trips.filterCancelled',
      tint: SECTION_TINTS.pink,
      activeColor: '#FF647C',
    },
  ];

  const segments: { key: Segment; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    {
      key: 'bookings',
      label: t('myTrips.bookings', { defaultValue: 'Bookings' }),
      icon: 'receipt-outline',
    },
    {
      key: 'listings',
      label: t('myTrips.listings', { defaultValue: 'My Listings' }),
      icon: 'list-outline',
    },
  ];

  const isLoading = segment === 'bookings' ? bookingsLoading : listingsLoading;

  const handleRefresh = useCallback(() => {
    if (segment === 'bookings') refetchBookings();
    else refetchListings();
  }, [segment, refetchBookings, refetchListings]);

  // ─── Skeleton Loading ────────────────────────────────

  const renderSkeletons = () => (
    <View style={styles.skeletonContainer}>
      {[0, 1, 2].map((i) => (
        <Animated.View key={`skel-${i}`} entering={FadeInDown.delay(i * 80).duration(300)}>
          <SolidCard accentColor={colors.primary} style={cardStyles.card}>
            <SkeletonLoader width="65%" height={20} borderRadius={RADIUS.button} />
            <SkeletonLoader
              width="35%"
              height={SPACING[6]}
              borderRadius={RADIUS.pill}
              style={{ marginTop: SPACING[3] }}
            />
            <View style={styles.skeletonDetailsRow}>
              <SkeletonLoader width={80} height={SPACING[4]} borderRadius={RADIUS.button} />
              <SkeletonLoader width={60} height={SPACING[4]} borderRadius={RADIUS.button} />
              <SkeletonLoader width={70} height={SPACING[4]} borderRadius={RADIUS.button} />
            </View>
            <View style={styles.skeletonCarrierRow}>
              <SkeletonLoader width={32} height={32} borderRadius={SPACING[4]} />
              <SkeletonLoader width={100} height={SPACING[4]} borderRadius={RADIUS.button} />
            </View>
          </SolidCard>
        </Animated.View>
      ))}
    </View>
  );

  // ─── Render ──────────────────────────────────────────

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#FFFFFF' }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[TYPOGRAPHY.h1, { color: colors.text }]}>{t('trips.title')}</Text>
      </View>

      {/* Segment Control (V2 — solid pills with icons) */}
      <View style={styles.segmentBar}>
        {segments.map((s) => {
          const isActive = segment === s.key;
          return (
            <TouchableOpacity
              key={s.key}
              onPress={() => setSegment(s.key)}
              style={[
                styles.segmentPill,
                {
                  backgroundColor: isActive ? colors.primary : SECTION_TINTS.purple,
                },
              ]}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <Ionicons
                name={s.icon}
                size={16}
                color={isActive ? '#FFFFFF' : colors.primary}
                style={styles.segmentIcon}
              />
              <Text
                style={[
                  TYPOGRAPHY.small,
                  styles.segmentPillText,
                  { color: isActive ? '#FFFFFF' : colors.primary },
                ]}
              >
                {s.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Filter Chips (V2 — colored tint backgrounds) */}
      {segment === 'bookings' && (
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
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: isActive ? f.activeColor : f.tint,
                    borderColor: isActive ? f.activeColor : f.activeColor + '20',
                  },
                ]}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
              >
                <Text
                  style={[
                    TYPOGRAPHY.small,
                    { color: isActive ? '#FFFFFF' : f.activeColor, fontWeight: '600' },
                  ]}
                >
                  {t(f.labelKey)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Content */}
      <ScrollView
        style={styles.flex1}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
      >
        {isLoading && renderSkeletons()}

        {/* Bookings Segment */}
        {!isLoading && segment === 'bookings' && (
          <>
            {filteredBookings.length === 0 && (
              <EmptyState
                lottieAnimation="search"
                title={t('trips.empty')}
                description={t('trips.emptyDescription')}
                actionLabel={t('messages.browseListings')}
                onAction={() => router.push('/(tabs)')}
                style={styles.emptyState}
              />
            )}
            {filteredBookings.map((booking, index) => (
              <Animated.View
                key={booking.id}
                entering={FadeInDown.delay(index * 50)
                  .duration(300)
                  .springify()}
              >
                <BookingCard
                  booking={booking}
                  isRTL={isRTL}
                  colors={colors}
                  onPress={() => router.push(`/booking/${booking.id}`)}
                />
              </Animated.View>
            ))}
          </>
        )}

        {/* My Listings Segment */}
        {!isLoading && segment === 'listings' && (
          <>
            {(!myListings || myListings.length === 0) && (
              <EmptyState
                lottieAnimation="search"
                title={t('myTrips.noListings', {
                  defaultValue: 'No listings yet',
                })}
                description={t('myTrips.noListingsDesc', {
                  defaultValue: 'Post a listing to start earning from your travels',
                })}
                actionLabel={t('myTrips.createListing', {
                  defaultValue: 'Create Listing',
                })}
                onAction={() => router.push('/listing/create' as any)}
                style={styles.emptyState}
              />
            )}
            {myListings?.map((listing, index) => (
              <Animated.View
                key={listing.id}
                entering={FadeInDown.delay(index * 50)
                  .duration(300)
                  .springify()}
              >
                <RouteCard
                  departureCity={listing.departureCity}
                  arrivalCity={listing.arrivalCity}
                  status={listing.status}
                  date={listing.departureDate}
                  detail={`${Number(listing.availableWeight)} kg - SAR ${Number(listing.price)}`}
                  isRTL={isRTL}
                  colors={colors}
                  onPress={() => router.push(`/listing/${listing.id}` as any)}
                />
              </Animated.View>
            ))}
          </>
        )}

        {/* Bottom spacer for tab bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Card Styles (V2 — solid with colored accents) ──────

const cardStyles = StyleSheet.create({
  cardOuter: {
    flexDirection: 'row',
    marginBottom: SPACING[3],
  } as ViewStyle,

  leftStrip: {
    width: 4,
    borderRadius: 2,
    marginRight: -1,
    marginVertical: 4,
  } as ViewStyle,

  card: {
    flex: 1,
    marginBottom: SPACING[3],
  } as ViewStyle,

  cardInner: {
    padding: SPACING[4],
  } as ViewStyle,

  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING[3],
  } as ViewStyle,

  routeArrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SPACING[2],
  } as ViewStyle,

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[1],
    borderRadius: RADIUS.pill,
    gap: SPACING[2],
    marginBottom: SPACING[3],
  } as ViewStyle,

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  } as ViewStyle,

  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[2],
    marginBottom: SPACING[3],
  } as ViewStyle,

  detailChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[1],
    paddingHorizontal: SPACING[2],
    paddingVertical: SPACING[1],
    borderRadius: RADIUS.badge,
  } as ViewStyle,

  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[1],
  } as ViewStyle,

  carrierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
    paddingTop: SPACING[3],
    borderTopWidth: 1,
  } as ViewStyle,
});

// ─── Screen Styles (V2) ─────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  } as ViewStyle,

  flex1: {
    flex: 1,
  } as ViewStyle,

  header: {
    paddingHorizontal: SPACING[5],
    paddingVertical: SPACING[3],
  } as ViewStyle,

  segmentBar: {
    flexDirection: 'row',
    paddingHorizontal: SPACING[4],
    paddingBottom: SPACING[3],
    gap: SPACING[3],
  } as ViewStyle,

  segmentPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING[3],
    borderRadius: RADIUS.button,
    gap: SPACING[1],
  } as ViewStyle,

  segmentIcon: {
    marginRight: 2,
  } as TextStyle,

  segmentPillText: {
    fontWeight: '700',
  } as TextStyle,

  filterBar: {
    maxHeight: SPACING[9],
  } as ViewStyle,

  filterBarContent: {
    paddingHorizontal: SPACING[4],
    paddingBottom: SPACING[3],
    gap: SPACING[2],
  } as ViewStyle,

  filterPill: {
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[2],
    borderRadius: RADIUS.pill,
    borderWidth: 1,
  } as ViewStyle,

  scrollContent: {
    paddingHorizontal: SPACING[4],
    paddingTop: SPACING[3],
  } as ViewStyle,

  skeletonContainer: {
    gap: SPACING[3],
  } as ViewStyle,

  skeletonDetailsRow: {
    flexDirection: 'row',
    gap: SPACING[4],
    marginTop: SPACING[3],
  } as ViewStyle,

  skeletonCarrierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
    marginTop: SPACING[4],
    paddingTop: SPACING[3],
  } as ViewStyle,

  emptyState: {
    marginTop: SPACING[8],
  } as ViewStyle,

  bottomSpacer: {
    height: 80,
  } as ViewStyle,
});
