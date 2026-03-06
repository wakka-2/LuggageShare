import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';
import { useGoBack } from '@/hooks/useGoBack';
import { useListing } from '@/hooks/useListings';
import { useBookings } from '@/hooks/useBookings';
import { useUserReviews } from '@/hooks/useReviews';
import { useAuth } from '@/hooks/useAuth';
import { SolidCard, Avatar, ScreenHeader, GradientButton } from '@/components/common';
import { MOCK_LISTINGS, adaptMockListing } from '@/components/listings';
import { VerificationBadge, ReviewCard, RatingBars } from '@/components/trust';
import { SkeletonLoader } from '@/components/animations';
import { showAlert } from '@/lib/alert';
import {
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
  SPACING,
  SECTION_TINTS,
  ThemeColors,
} from '@/providers/ThemeProvider';

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const isRTL = i18n.language === 'ar';

  const goBack = useGoBack();
  const { data: apiListing, isLoading } = useListing(id ?? null);
  const { data: bookings } = useBookings();

  // Fall back to mock data when the API doesn't return a result
  const mockMatch = !apiListing && id ? MOCK_LISTINGS.find((m) => m.id === id) : undefined;
  const listing = apiListing ?? (mockMatch ? adaptMockListing(mockMatch) : undefined);

  const { data: carrierReviews } = useUserReviews(listing?.carrierId ?? null);

  // Check if the user already has an active booking for this listing
  const existingBooking = listing
    ? bookings?.find(
        (b) => b.listingId === listing.id && !['cancelled', 'rejected'].includes(b.status)
      )
    : undefined;

  // ─── Loading State ──────────────────────────────────────────
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
        <ScreenHeader title={t('listing.details')} onBack={goBack} />
        <View style={styles.scrollContent}>
          <SolidCard tint={SECTION_TINTS.blue} style={{ marginBottom: SPACING[4] }}>
            <SkeletonLoader width="100%" height={100} borderRadius={RADIUS.card} />
          </SolidCard>
          <View style={styles.statsRow}>
            <SolidCard tint={SECTION_TINTS.purple} style={styles.statCardSkeleton}>
              <SkeletonLoader width={SPACING[6]} height={SPACING[6]} borderRadius={SPACING[3]} />
              <SkeletonLoader
                width="60%"
                height={SPACING[5]}
                borderRadius={SPACING[2]}
                style={{ marginTop: SPACING[2] }}
              />
            </SolidCard>
            <SolidCard tint={SECTION_TINTS.green} style={styles.statCardSkeleton}>
              <SkeletonLoader width={SPACING[6]} height={SPACING[6]} borderRadius={SPACING[3]} />
              <SkeletonLoader
                width="60%"
                height={SPACING[5]}
                borderRadius={SPACING[2]}
                style={{ marginTop: SPACING[2] }}
              />
            </SolidCard>
          </View>
          <SolidCard style={{ marginBottom: SPACING[4] }}>
            <SkeletonLoader width="100%" height={80} borderRadius={RADIUS.card} />
          </SolidCard>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Not Found State ────────────────────────────────────────
  if (!listing) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
        <ScreenHeader title={t('listing.details')} onBack={goBack} />
        <View style={styles.emptyContainer}>
          <SolidCard tint={SECTION_TINTS.pink} style={styles.emptyCard}>
            <View style={[styles.emptyIcon, { backgroundColor: '#FFF1F2' }]}>
              <Ionicons name="alert-circle-outline" size={32} color="#FF647C" />
            </View>
            <Text style={[TYPOGRAPHY.body, { color: colors.textSecondary, marginTop: SPACING[3] }]}>
              {t('listing.notFound')}
            </Text>
            <GradientButton
              title={t('listing.goBack')}
              onPress={goBack}
              size="medium"
              style={{ marginTop: SPACING[5] }}
            />
          </SolidCard>
        </View>
      </SafeAreaView>
    );
  }

  const isOwner = user?.id === listing.carrierId;
  const weight = Number(listing.availableWeight) || 0;
  const price = Number(listing.price) || 0;
  const departureDate = new Date(listing.departureDate);

  const handleBooking = () => {
    router.push(`/booking/create?listingId=${listing.id}`);
  };

  const handleMessage = () => {
    if (existingBooking) {
      router.push(`/chat/${existingBooking.id}`);
    } else {
      showAlert(t('listing.bookToChat'), t('listing.bookToChatDescription'), () =>
        router.push(`/booking/create?listingId=${listing.id}`)
      );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
      {/* Header */}
      <ScreenHeader title={t('listing.details')} onBack={goBack} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ── Route Card (V2 — blue tint with colored dots) ──── */}
        <Animated.View entering={FadeInDown.duration(400).springify()}>
          <SolidCard tint={SECTION_TINTS.blue} accentColor="#3B82F6" style={styles.routeCard}>
            <View style={styles.routeRow}>
              {/* Departure */}
              <View style={styles.routePoint}>
                <View style={[styles.routeDot, { backgroundColor: colors.primary }]} />
                <Text
                  style={[TYPOGRAPHY.h3, { color: colors.text, textAlign: 'center' }]}
                  numberOfLines={2}
                >
                  {listing.departureCity}
                </Text>
                {listing.departureCode && (
                  <Text
                    style={[
                      TYPOGRAPHY.small,
                      { color: colors.textSecondary, marginTop: SPACING[1] },
                    ]}
                  >
                    {listing.departureCode}
                  </Text>
                )}
              </View>

              {/* Airplane */}
              <View style={styles.routeLine}>
                <View style={[styles.routeLineDash, { backgroundColor: '#3B82F6' + '40' }]} />
                <View style={[styles.airplaneCircle, { backgroundColor: '#DBEAFE' }]}>
                  <Ionicons name="airplane" size={20} color="#3B82F6" />
                </View>
                <View style={[styles.routeLineDash, { backgroundColor: '#3B82F6' + '40' }]} />
              </View>

              {/* Arrival */}
              <View style={styles.routePoint}>
                <View style={[styles.routeDot, { backgroundColor: colors.success }]} />
                <Text
                  style={[TYPOGRAPHY.h3, { color: colors.text, textAlign: 'center' }]}
                  numberOfLines={2}
                >
                  {listing.arrivalCity}
                </Text>
                {listing.arrivalCode && (
                  <Text
                    style={[
                      TYPOGRAPHY.small,
                      { color: colors.textSecondary, marginTop: SPACING[1] },
                    ]}
                  >
                    {listing.arrivalCode}
                  </Text>
                )}
              </View>
            </View>

            {/* Divider */}
            <View style={[styles.divider, { backgroundColor: '#3B82F6' + '20' }]} />

            {/* Date + Flight as tinted chips */}
            <View style={styles.detailsRow}>
              <View style={[styles.detailChip, { backgroundColor: '#DBEAFE' }]}>
                <Ionicons name="calendar-outline" size={14} color="#3B82F6" />
                <Text style={[TYPOGRAPHY.small, { color: '#3B82F6' }]}>
                  {departureDate.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </Text>
              </View>
              {listing.flightNumber && (
                <View style={[styles.detailChip, { backgroundColor: SECTION_TINTS.purple }]}>
                  <Ionicons name="airplane-outline" size={14} color={colors.primary} />
                  <Text style={[TYPOGRAPHY.small, { color: colors.primary }]}>
                    {listing.flightNumber}
                  </Text>
                </View>
              )}
            </View>
          </SolidCard>
        </Animated.View>

        {/* ── Stats Row (V2 — colored tint cards) ────────────── */}
        <Animated.View entering={FadeIn.delay(100).duration(400)} style={styles.statsRow}>
          <SolidCard
            tint={SECTION_TINTS.purple}
            accentColor={colors.primary}
            style={styles.statCard}
          >
            <View style={[styles.statIconWrap, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="scale-outline" size={22} color={colors.primary} />
            </View>
            <Text style={[TYPOGRAPHY.h2, { color: colors.text }]}>{weight} kg</Text>
            <Text style={[TYPOGRAPHY.small, { color: colors.textSecondary }]}>
              {t('listing.available')}
            </Text>
          </SolidCard>

          <SolidCard tint={SECTION_TINTS.green} accentColor="#00C48C" style={styles.statCard}>
            <View style={[styles.statIconWrap, { backgroundColor: '#00C48C' + '20' }]}>
              <Ionicons name="pricetag-outline" size={22} color="#00C48C" />
            </View>
            <Text style={[TYPOGRAPHY.h2, { color: colors.text }]}>
              {price} {listing.currency || 'SAR'}
            </Text>
            <Text style={[TYPOGRAPHY.small, { color: colors.textSecondary }]}>
              {t('listing.price')}
            </Text>
          </SolidCard>
        </Animated.View>

        {/* ── Notes (V2 — amber tint) ─────────────────────────── */}
        {listing.notes && (
          <Animated.View entering={FadeIn.delay(150).duration(400)}>
            <SolidCard tint={SECTION_TINTS.amber} accentColor="#FFB946" style={styles.section}>
              <View style={styles.notesHeader}>
                <View style={[styles.notesIcon, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="chatbox-ellipses-outline" size={16} color="#F59E0B" />
                </View>
                <Text style={[TYPOGRAPHY.h3, { color: colors.text }]}>{t('listing.notes')}</Text>
              </View>
              <Text
                style={[TYPOGRAPHY.body, { color: colors.textSecondary, marginTop: SPACING[2] }]}
              >
                {listing.notes}
              </Text>
            </SolidCard>
          </Animated.View>
        )}

        {/* ── Carrier Info (V2 — solid card with avatar) ──────── */}
        <Animated.View entering={FadeIn.delay(200).duration(400)}>
          <SolidCard style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.sectionIcon, { backgroundColor: SECTION_TINTS.purple }]}>
                <Ionicons name="person-outline" size={16} color={colors.primary} />
              </View>
              <Text style={[TYPOGRAPHY.h3, { color: colors.text }]}>{t('listing.carrier')}</Text>
            </View>

            <View style={styles.carrierRow}>
              <Avatar
                name={listing.carrier.name}
                avatarUrl={listing.carrier.avatarUrl}
                size={48}
                isVerified={listing.carrier.isVerified}
              />
              <View style={styles.carrierInfo}>
                <View style={styles.carrierNameRow}>
                  <Text style={[TYPOGRAPHY.h3, { color: colors.text }]}>
                    {listing.carrier.name}
                  </Text>
                  {listing.carrier.isVerified && (
                    <VerificationBadge type="verified" size="small" animated={false} />
                  )}
                </View>
                {listing.carrier.city && (
                  <View style={styles.carrierCityRow}>
                    <Ionicons name="location-outline" size={14} color={colors.textMuted} />
                    <Text style={[TYPOGRAPHY.caption, { color: colors.textSecondary }]}>
                      {listing.carrier.city}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {listing.carrier.bio && (
              <View style={[styles.carrierBio, { backgroundColor: SECTION_TINTS.neutral }]}>
                <Text style={[TYPOGRAPHY.body, { color: colors.textSecondary }]}>
                  {listing.carrier.bio}
                </Text>
              </View>
            )}

            {/* Carrier Rating Summary */}
            {carrierReviews && carrierReviews.length > 0 && (
              <View style={[styles.ratingSection, { borderTopColor: colors.borderSubtle }]}>
                <RatingBars
                  distribution={(() => {
                    const dist = [0, 0, 0, 0, 0];
                    carrierReviews.forEach((r) => {
                      if (r.rating >= 1 && r.rating <= 5) dist[5 - r.rating]++;
                    });
                    return dist;
                  })()}
                  average={
                    carrierReviews.reduce((sum, r) => sum + r.rating, 0) / carrierReviews.length
                  }
                  total={carrierReviews.length}
                />
              </View>
            )}
          </SolidCard>
        </Animated.View>

        {/* ── Reviews (V2 — with count pill) ───────────────────── */}
        {carrierReviews && carrierReviews.length > 0 && (
          <Animated.View entering={FadeInUp.delay(250).duration(400)}>
            <SolidCard style={styles.section}>
              <View style={styles.reviewsHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: SECTION_TINTS.amber }]}>
                  <Ionicons name="star-outline" size={16} color="#F59E0B" />
                </View>
                <Text style={[TYPOGRAPHY.h3, { color: colors.text }]}>
                  {t('listing.carrierReviews', { defaultValue: 'Reviews' })}
                </Text>
                <View style={[styles.countPill, { backgroundColor: SECTION_TINTS.amber }]}>
                  <Text style={[TYPOGRAPHY.small, { color: '#F59E0B', fontWeight: '700' }]}>
                    {carrierReviews.length}
                  </Text>
                </View>
              </View>

              {carrierReviews.slice(0, 3).map((review, index) => (
                <ReviewCard
                  key={review.id}
                  review={{
                    id: review.id,
                    rating: review.rating,
                    comment: review.comment,
                    createdAt: review.createdAt,
                    reviewer: {
                      name: review.reviewer.name,
                      avatarUrl: review.reviewer.avatarUrl,
                    },
                  }}
                  index={index}
                />
              ))}
            </SolidCard>
          </Animated.View>
        )}

        {/* Bottom spacer for action bar */}
        <View style={{ height: SPACING[9] }} />
      </ScrollView>

      {/* ── Bottom Action Bar (V2 — solid white) ─────────────── */}
      {!isOwner && (
        <View
          style={[
            styles.actionBar,
            {
              backgroundColor: '#FFFFFF',
              borderTopColor: colors.border,
            },
            SHADOWS.m as ViewStyle,
          ]}
        >
          <View style={styles.actionBarInner}>
            {/* Message button — solid tint */}
            <TouchableOpacity
              onPress={handleMessage}
              style={[
                styles.messageButton,
                {
                  borderColor: colors.primary + '30',
                  borderBottomColor: colors.primary,
                  backgroundColor: SECTION_TINTS.purple,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Send message"
            >
              <Ionicons name="chatbubble-outline" size={22} color={colors.primary} />
            </TouchableOpacity>

            {/* Book Now gradient button */}
            <GradientButton
              title={t('listing.bookNow')}
              onPress={handleBooking}
              size="large"
              fullWidth
              style={styles.bookButton}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

// ─── Styles (V2 — solid, colorful) ──────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  } as ViewStyle,

  // ── Empty / Error ───────────────────────────────
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING[5],
  } as ViewStyle,
  emptyCard: {
    alignItems: 'center',
    paddingVertical: SPACING[8],
    width: '100%',
  } as ViewStyle,
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  // ── Scroll ──────────────────────────────────────
  scrollContent: {
    padding: SPACING[4],
    paddingBottom: SPACING[9],
  } as ViewStyle,

  // ── Route Card ──────────────────────────────────
  routeCard: {
    marginBottom: SPACING[4],
  } as ViewStyle,
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as ViewStyle,
  routePoint: {
    alignItems: 'center',
    flex: 1,
  } as ViewStyle,
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: SPACING[2],
  } as ViewStyle,
  routeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[2],
    flex: 0.8,
  } as ViewStyle,
  routeLineDash: {
    flex: 1,
    height: 2,
    borderRadius: 1,
  } as ViewStyle,
  airplaneCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SPACING[1],
  } as ViewStyle,
  divider: {
    height: 1,
    marginVertical: SPACING[4],
  } as ViewStyle,
  detailsRow: {
    flexDirection: 'row',
    gap: SPACING[2],
  } as ViewStyle,
  detailChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[1],
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[1],
    borderRadius: RADIUS.pill,
  } as ViewStyle,

  // ── Stats ───────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    gap: SPACING[3],
    marginBottom: SPACING[4],
  } as ViewStyle,
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: SPACING[2],
  } as ViewStyle,
  statCardSkeleton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING[5],
  } as ViewStyle,
  statIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  // ── Sections ────────────────────────────────────
  section: {
    marginBottom: SPACING[4],
  } as ViewStyle,

  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
    marginBottom: SPACING[3],
  } as ViewStyle,

  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  // ── Notes ───────────────────────────────────────
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
  } as ViewStyle,
  notesIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  // ── Carrier ─────────────────────────────────────
  carrierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3],
  } as ViewStyle,
  carrierInfo: {
    flex: 1,
  } as ViewStyle,
  carrierNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
  } as ViewStyle,
  carrierCityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[1],
    marginTop: SPACING[1],
  } as ViewStyle,
  carrierBio: {
    marginTop: SPACING[3],
    padding: SPACING[3],
    borderRadius: RADIUS.button,
  } as ViewStyle,
  ratingSection: {
    marginTop: SPACING[4],
    paddingTop: SPACING[4],
    borderTopWidth: 1,
  } as ViewStyle,

  // ── Reviews ─────────────────────────────────────
  reviewsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
    marginBottom: SPACING[3],
  } as ViewStyle,
  countPill: {
    paddingHorizontal: SPACING[2],
    paddingVertical: SPACING[1],
    borderRadius: RADIUS.pill,
  } as ViewStyle,

  // ── Action Bar (V2 — solid) ─────────────────────
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
  } as ViewStyle,
  actionBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING[4],
    gap: SPACING[3],
  } as ViewStyle,
  messageButton: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderBottomWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  bookButton: {
    flex: 1,
  } as ViewStyle,
});
