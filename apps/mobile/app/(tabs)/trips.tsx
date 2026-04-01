import React, { useState, useMemo } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';

import {
  V2_COLORS,
  RADIUS,
  BUBBLE_SHADOWS,
  TYPOGRAPHY,
  GRADIENTS,
} from '@/providers/ThemeProvider';
import { useBookings, getMockBookings, ApiBooking } from '@/hooks/useBookings';
import { useMyFlights, ApiFlight } from '@/hooks/useFlights';
import { useMyOffers, ApiOffer } from '@/hooks/useOffers';
import { useAuth } from '@/hooks/useAuth';
import { EmptyState, Avatar, BackgroundBlobs, MetaChip } from '@/components/common';
import { LiveIndicator, MiniStepper } from '@/components/status';
import { SkeletonLoader } from '@/components/animations';
import {
  FloatingIcons,
  WaveDivider,
  GradientAccentStrip,
  SparkleGroup,
} from '@/components/decorations';

type MainTab = 'bookings' | 'flights' | 'offers';
type FilterTab = 'all' | 'active' | 'completed' | 'cancelled';

const BOOKING_STATUS_COLORS: Record<string, string> = {
  pending: '#FFBE5C',
  accepted: '#5CB8FF',
  picked_up: '#7C6AFF',
  in_transit: '#7C6AFF',
  delivered: '#56D8B1',
  rejected: '#FF6B9D',
  cancelled: '#A8A5C0',
};
const BOOKING_STATUS_KEYS: Record<string, string> = {
  pending: 'trips.statusPending',
  accepted: 'trips.statusAccepted',
  picked_up: 'trips.statusPickedUp',
  in_transit: 'trips.statusInTransit',
  delivered: 'trips.statusDelivered',
  rejected: 'trips.statusRejected',
  cancelled: 'trips.statusCancelled',
};
const FLIGHT_STATUS_COLORS: Record<string, string> = {
  active: '#56D8B1',
  full: '#FFBE5C',
  cancelled: '#A8A5C0',
  departed: '#A8A5C0',
};
const OFFER_STATUS_COLORS: Record<string, string> = {
  pending: '#FFBE5C',
  accepted: '#56D8B1',
  rejected: '#FF6B9D',
  withdrawn: '#A8A5C0',
  expired: '#A8A5C0',
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
  const statusColor = BOOKING_STATUS_COLORS[booking.status] || V2_COLORS.textMuted;
  const date = new Date((booking.listing as any)?.departureDate ?? booking.createdAt);
  const statusKey = BOOKING_STATUS_KEYS[booking.status];
  const isInTransit = booking.status === 'in_transit';
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const departureCity = (booking.listing as any)?.departureCity ?? '';
  const arrivalCity = (booking.listing as any)?.arrivalCity ?? '';
  const statusLabel = statusKey ? t(statusKey) : booking.status;
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
      style={[styles.card, animatedStyle]}
      accessibilityRole="button"
      accessibilityLabel={`${t('trips.booking')}: ${departureCity} to ${arrivalCity}, ${statusLabel}`}
    >
      <GradientAccentStrip
        gradient={
          booking.status === 'delivered'
            ? 'mint'
            : booking.status === 'in_transit'
              ? 'cool'
              : 'primary'
        }
        position="left"
      />
      <View style={styles.routeRow}>
        <View style={[styles.routeDot, { backgroundColor: V2_COLORS.accent1 }]} />
        <Text style={styles.cityText}>{(booking.listing as any)?.departureCity ?? '—'}</Text>
        <Ionicons name="airplane" size={14} color={V2_COLORS.textMuted} />
        <Text style={styles.cityText}>{(booking.listing as any)?.arrivalCity ?? '—'}</Text>
        <View style={[styles.routeDot, { backgroundColor: V2_COLORS.secondary }]} />
      </View>
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
      <MiniStepper currentStatus={booking.status} />
      <View style={styles.metaRow}>
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
          label={Number(booking.totalWeight) + ' kg'}
          color={V2_COLORS.accent1}
        />
        <MetaChip
          icon="pricetag"
          label={Number(booking.totalPrice) + ' ' + booking.currency}
          color={V2_COLORS.accent2}
        />
      </View>
      <View style={styles.userFooter}>
        <Avatar name={booking.carrier.name} avatarUrl={booking.carrier.avatarUrl} size={32} />
        <Text style={styles.userName}>{booking.carrier.name}</Text>
      </View>
    </AnimatedTouchable>
  );
});

const FlightCard = React.memo(function FlightCard({
  flight,
  isRTL,
  onPress,
}: {
  flight: ApiFlight;
  isRTL: boolean;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const statusColor = FLIGHT_STATUS_COLORS[flight.status] || V2_COLORS.textMuted;
  const date = new Date(flight.departureDate);
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
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
      style={[styles.card, animatedStyle]}
      accessibilityRole="button"
      accessibilityLabel={`${t('trips.flight')}: ${flight.departureCity} to ${flight.arrivalCity}, ${flight.status}`}
    >
      <GradientAccentStrip gradient="mint" position="left" />
      <View style={styles.routeRow}>
        <View style={[styles.routeDot, { backgroundColor: V2_COLORS.accent1 }]} />
        <Text style={styles.cityText}>{flight.departureCity}</Text>
        <Ionicons name="airplane" size={14} color={V2_COLORS.textMuted} />
        <Text style={styles.cityText}>{flight.arrivalCity}</Text>
        <View style={[styles.routeDot, { backgroundColor: V2_COLORS.secondary }]} />
      </View>
      <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        <Text style={[styles.statusText, { color: statusColor }]}>
          {t('flight.status.' + flight.status, { defaultValue: flight.status })}
        </Text>
      </View>
      <View style={styles.metaRow}>
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
          label={Number(flight.remainingWeight) + '/' + Number(flight.totalWeight) + ' kg'}
          color={V2_COLORS.accent1}
        />
        <MetaChip
          icon="pricetag"
          label={Number(flight.pricePerKg) + ' ' + flight.currency + '/kg'}
          color={V2_COLORS.accent2}
        />
        {flight._count?.offers ? (
          <MetaChip
            icon="list"
            label={flight._count.offers + ' ' + t('flight.offers')}
            color={V2_COLORS.primary}
          />
        ) : null}
      </View>
    </AnimatedTouchable>
  );
});

const OfferCard = React.memo(function OfferCard({
  offer,
  onPress,
}: {
  offer: ApiOffer;
  isRTL: boolean;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const statusColor = OFFER_STATUS_COLORS[offer.status] || V2_COLORS.textMuted;
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
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
      style={[styles.card, animatedStyle]}
      accessibilityRole="button"
      accessibilityLabel={`${t('trips.offer')}: ${offer.flight.departureCity} to ${offer.flight.arrivalCity}, ${offer.status}`}
    >
      <GradientAccentStrip gradient="warm" position="left" />
      <View style={styles.routeRow}>
        <View style={[styles.routeDot, { backgroundColor: V2_COLORS.accent1 }]} />
        <Text style={styles.cityText}>{offer.flight.departureCity}</Text>
        <Ionicons name="airplane" size={14} color={V2_COLORS.textMuted} />
        <Text style={styles.cityText}>{offer.flight.arrivalCity}</Text>
        <View style={[styles.routeDot, { backgroundColor: V2_COLORS.secondary }]} />
      </View>
      <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        <Text style={[styles.statusText, { color: statusColor }]}>{offer.status}</Text>
      </View>
      <View style={styles.metaRow}>
        <MetaChip
          icon="scale"
          label={Number(offer.offeredWeight) + ' kg'}
          color={V2_COLORS.accent1}
        />
        <MetaChip
          icon="pricetag"
          label={Number(offer.offeredPrice) + ' ' + offer.currency}
          color={V2_COLORS.accent2}
        />
      </View>
      {offer.booking && (
        <View style={styles.bookingLinkRow}>
          <Ionicons name="checkmark-circle" size={14} color="#56D8B1" />
          <Text style={styles.bookingLinkText}>{t('offer.bookingCreated')}</Text>
        </View>
      )}
    </AnimatedTouchable>
  );
});

export default function TripsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';
  const { user } = useAuth();
  const [mainTab, setMainTab] = useState<MainTab>('bookings');
  const [bookingFilter, setBookingFilter] = useState<FilterTab>('all');

  const { data: apiBookings, isLoading: bookingsLoading, refetch: refetchBookings } = useBookings();
  const { data: myFlights, isLoading: flightsLoading, refetch: refetchFlights } = useMyFlights();
  const { data: myOffersData, isLoading: offersLoading, refetch: refetchOffers } = useMyOffers();

  const bookings = apiBookings?.length ? apiBookings : user?.id ? getMockBookings(user.id) : [];
  const flights = myFlights ?? [];
  const offers = myOffersData?.data ?? [];

  const filteredBookings = useMemo(() => {
    if (bookingFilter === 'all') return bookings;
    if (bookingFilter === 'active')
      return bookings.filter((b) =>
        ['pending', 'accepted', 'picked_up', 'in_transit'].includes(b.status)
      );
    if (bookingFilter === 'completed') return bookings.filter((b) => b.status === 'delivered');
    return bookings.filter((b) => ['rejected', 'cancelled'].includes(b.status));
  }, [bookings, bookingFilter]);

  const isLoading =
    (mainTab === 'bookings' && bookingsLoading) ||
    (mainTab === 'flights' && flightsLoading) ||
    (mainTab === 'offers' && offersLoading);

  const onRefresh = () => {
    if (mainTab === 'bookings') refetchBookings();
    else if (mainTab === 'flights') refetchFlights();
    else refetchOffers();
  };

  const bookingFilters: { key: FilterTab; labelKey: string }[] = [
    { key: 'all', labelKey: 'trips.filterAll' },
    { key: 'active', labelKey: 'trips.filterActive' },
    { key: 'completed', labelKey: 'trips.filterDone' },
    { key: 'cancelled', labelKey: 'trips.filterCancelled' },
  ];

  const mainTabs: { key: MainTab; icon: string; label: string }[] = [
    { key: 'bookings', icon: 'cube', label: t('trips.bookingsTab') },
    {
      key: 'flights',
      icon: 'airplane',
      label: t('trips.flightsTab'),
    },
    { key: 'offers', icon: 'pricetag', label: t('trips.offersTab') },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <BackgroundBlobs variant="subtle" />
      <FloatingIcons variant="sparse" />
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.title}>{t('trips.title')}</Text>
          <SparkleGroup variant="accent" style={{ marginStart: 8, marginTop: -4 }} />
        </View>
        <TouchableOpacity
          onPress={() => router.push('/flight/create' as any)}
          style={styles.postFlightBtn}
          accessibilityRole="button"
          accessibilityLabel={t('flight.postFlight')}
        >
          <LinearGradient colors={[...GRADIENTS.primary]} style={styles.postFlightGradient}>
            <Ionicons name="add" size={18} color="#FFF" />
            <Text style={styles.postFlightText}>{t('flight.postFlight')}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.mainTabBar}>
        {mainTabs.map((tab) => {
          const isActive = mainTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setMainTab(tab.key)}
              style={[styles.mainTabBtn, isActive && styles.mainTabBtnActive]}
              accessibilityRole="tab"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: isActive }}
            >
              <Ionicons
                name={tab.icon as any}
                size={15}
                color={isActive ? '#FFF' : V2_COLORS.textSoft}
              />
              <Text style={[styles.mainTabText, isActive && styles.mainTabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {mainTab === 'bookings' && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterBar}
          contentContainerStyle={styles.filterBarContent}
        >
          {bookingFilters.map((f) => {
            const isActive = bookingFilter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                onPress={() => setBookingFilter(f.key)}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                accessibilityRole="button"
                accessibilityLabel={t(f.labelKey)}
                accessibilityState={{ selected: isActive }}
              >
                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                  {t(f.labelKey)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      <WaveDivider
        color={mainTab === 'bookings' ? 'primary' : mainTab === 'flights' ? 'mint' : 'warm'}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={onRefresh} tintColor={V2_COLORS.primary} />
        }
      >
        {isLoading && (
          <View style={styles.loading}>
            {[0, 1, 2].map((i) => (
              <Animated.View
                key={'skel-' + i}
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
                </View>
              </Animated.View>
            ))}
          </View>
        )}

        {!isLoading &&
          mainTab === 'bookings' &&
          (filteredBookings.length === 0 ? (
            <EmptyState
              lottieAnimation="search"
              title={t('trips.empty')}
              description={t('trips.emptyDescription')}
              actionLabel={t('messages.browseListings')}
              onAction={() => router.push('/(tabs)')}
              style={styles.emptyState}
            />
          ) : (
            filteredBookings.map((booking, index) => (
              <Animated.View key={booking.id} entering={FadeInDown.delay(index * 50).duration(300)}>
                <BookingCard
                  booking={booking}
                  isRTL={isRTL}
                  onPress={() => router.push(('/booking/' + booking.id) as any)}
                />
              </Animated.View>
            ))
          ))}

        {!isLoading &&
          mainTab === 'flights' &&
          (flights.length === 0 ? (
            <EmptyState
              lottieAnimation="search"
              title={t('flight.emptyTitle')}
              description={t('flight.emptyDescription')}
              actionLabel={t('flight.postFlight')}
              onAction={() => router.push('/flight/create' as any)}
              style={styles.emptyState}
            />
          ) : (
            flights.map((flight, index) => (
              <Animated.View key={flight.id} entering={FadeInDown.delay(index * 50).duration(300)}>
                <FlightCard
                  flight={flight}
                  isRTL={isRTL}
                  onPress={() => router.push(('/flight/' + flight.id) as any)}
                />
              </Animated.View>
            ))
          ))}

        {!isLoading &&
          mainTab === 'offers' &&
          (offers.length === 0 ? (
            <EmptyState
              lottieAnimation="search"
              title={t('offer.emptyTitle')}
              description={t('offer.emptyDescription')}
              actionLabel={t('home.marketplace')}
              onAction={() => router.push('/(tabs)')}
              style={styles.emptyState}
            />
          ) : (
            offers.map((offer, index) => (
              <Animated.View key={offer.id} entering={FadeInDown.delay(index * 50).duration(300)}>
                <OfferCard
                  offer={offer}
                  isRTL={isRTL}
                  onPress={() => router.push(('/chat/offer/' + offer.id) as any)}
                />
              </Animated.View>
            ))
          ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: V2_COLORS.bg } as ViewStyle,
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 8,
  } as ViewStyle,
  title: { ...TYPOGRAPHY.h1, color: V2_COLORS.text } as TextStyle,
  postFlightBtn: { borderRadius: RADIUS.pill, overflow: 'hidden' } as ViewStyle,
  postFlightGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: RADIUS.pill,
  } as ViewStyle,
  postFlightText: { fontSize: 13, fontWeight: '700', color: '#FFF' } as TextStyle,
  mainTabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 8,
  } as ViewStyle,
  mainTabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
    backgroundColor: '#FFFFFF',
    ...BUBBLE_SHADOWS.xs,
  } as ViewStyle,
  mainTabBtnActive: { backgroundColor: V2_COLORS.primary } as ViewStyle,
  mainTabText: { fontSize: 13, fontWeight: '600', color: V2_COLORS.textSoft } as TextStyle,
  mainTabTextActive: { color: '#FFFFFF' } as TextStyle,
  filterBar: { maxHeight: 52 } as ViewStyle,
  filterBarContent: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 } as ViewStyle,
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
    backgroundColor: '#FFFFFF',
    ...BUBBLE_SHADOWS.xs,
  } as ViewStyle,
  filterChipActive: { backgroundColor: V2_COLORS.primary } as ViewStyle,
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    padding: 18,
    marginBottom: 12,
    ...BUBBLE_SHADOWS.lg,
  } as ViewStyle,
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 } as ViewStyle,
  routeDot: { width: 10, height: 10, borderRadius: 5 } as ViewStyle,
  cityText: { ...TYPOGRAPHY.h3, color: V2_COLORS.text } as TextStyle,
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
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 } as ViewStyle,
  userFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: V2_COLORS.cardShadow,
  } as ViewStyle,
  userName: { fontSize: 14, fontWeight: '600', color: V2_COLORS.text } as TextStyle,
  bookingLinkRow: { flexDirection: 'row', alignItems: 'center', gap: 6 } as ViewStyle,
  bookingLinkText: { fontSize: 12, color: '#56D8B1', fontWeight: '600' } as TextStyle,
});
