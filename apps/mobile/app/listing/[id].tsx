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
import { LinearGradient } from 'expo-linear-gradient';

import {
  V2_COLORS,
  RADIUS,
  BUBBLE_SHADOWS,
  TYPOGRAPHY,
  GRADIENTS,
} from '@/providers/ThemeProvider';
import { useListing } from '@/hooks/useListings';
import { useBookings } from '@/hooks/useBookings';
import { useUserReviews } from '@/hooks/useReviews';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, BackgroundBlobs, MetaChip, SectionHeader } from '@/components/common';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { MOCK_LISTINGS, adaptMockListing } from '@/components/listings';
import { VerificationBadge } from '@/components/trust';
import { ReviewCard, RatingBars } from '@/components/trust';
import { SkeletonLoader } from '@/components/animations';
import { showAlert } from '@/lib/alert';

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const isRTL = i18n.language === 'ar';

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

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader title={t('listing.details')} />
        <View style={styles.scrollContent}>
          <SkeletonLoader
            width="100%"
            height={140}
            borderRadius={RADIUS.card}
            style={{ marginBottom: 16 }}
          />
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
            <SkeletonLoader width="48%" height={100} borderRadius={RADIUS.card} />
            <SkeletonLoader width="48%" height={100} borderRadius={RADIUS.card} />
          </View>
          <SkeletonLoader width="100%" height={120} borderRadius={RADIUS.card} />
        </View>
      </SafeAreaView>
    );
  }

  if (!listing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={V2_COLORS.textMuted} />
          <Text style={styles.errorText}>{t('listing.notFound')}</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>{t('listing.goBack')}</Text>
          </TouchableOpacity>
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
    <SafeAreaView style={styles.container}>
      <BackgroundBlobs variant="subtle" />
      <ScreenHeader title={t('listing.details')} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Route Card */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.routeCard}>
          <View style={styles.routeRow}>
            <View style={styles.routePoint}>
              <View style={[styles.routeDot, { backgroundColor: V2_COLORS.accent1 }]} />
              <Text style={styles.cityName}>{listing.departureCity}</Text>
              {listing.departureCode && (
                <Text style={styles.cityCode}>{listing.departureCode}</Text>
              )}
            </View>
            <View style={styles.routeLine}>
              <View style={styles.dashedLine} />
              <Ionicons name="airplane" size={20} color={V2_COLORS.primary} />
              <View style={styles.dashedLine} />
            </View>
            <View style={styles.routePoint}>
              <View style={[styles.routeDot, { backgroundColor: V2_COLORS.secondary }]} />
              <Text style={styles.cityName}>{listing.arrivalCity}</Text>
              {listing.arrivalCode && <Text style={styles.cityCode}>{listing.arrivalCode}</Text>}
            </View>
          </View>

          {/* Meta chips row replacing divider + details */}
          <View style={styles.metaRow}>
            <MetaChip
              icon="calendar"
              label={departureDate.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
              color={V2_COLORS.primary}
            />
            {listing.flightNumber && (
              <MetaChip icon="airplane" label={listing.flightNumber} color={V2_COLORS.accent3} />
            )}
          </View>
        </Animated.View>

        {/* Weight & Price — side-by-side bubble cards */}
        <Animated.View entering={FadeIn.delay(100).duration(400)} style={styles.statsCards}>
          <View style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: V2_COLORS.primary + '15' }]}>
              <Ionicons name="scale-outline" size={22} color={V2_COLORS.primary} />
            </View>
            <Text style={styles.statValue}>{weight} kg</Text>
            <Text style={styles.statLabel}>{t('listing.available')}</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: V2_COLORS.accent2 + '15' }]}>
              <Ionicons name="pricetag-outline" size={22} color={V2_COLORS.accent2} />
            </View>
            <Text style={styles.statValue}>
              {price} {listing.currency || 'SAR'}
            </Text>
            <Text style={styles.statLabel}>{t('listing.price')}</Text>
          </View>
        </Animated.View>

        {/* Notes — amber-tinted card */}
        {listing.notes && (
          <Animated.View entering={FadeIn.delay(150).duration(400)} style={styles.notesCard}>
            <View style={styles.notesTitleRow}>
              <Ionicons name="document-text-outline" size={16} color={V2_COLORS.accent2} />
              <Text style={styles.notesTitleText}>{t('listing.notes')}</Text>
            </View>
            <Text style={styles.notesText}>{listing.notes}</Text>
          </Animated.View>
        )}

        {/* Carrier Info — bubble card */}
        <Animated.View entering={FadeIn.delay(200).duration(400)} style={styles.section}>
          <SectionHeader title={t('listing.carrier')} />
          <View style={styles.carrierRow}>
            <Avatar
              name={listing.carrier.name}
              avatarUrl={listing.carrier.avatarUrl}
              size={48}
              isVerified={listing.carrier.isVerified}
            />
            <View style={styles.carrierInfo}>
              <Text style={styles.carrierName}>{listing.carrier.name}</Text>
              {listing.carrier.city && (
                <View style={styles.carrierLocationRow}>
                  <Ionicons name="location-outline" size={12} color={V2_COLORS.textMuted} />
                  <Text style={styles.carrierCity}>{listing.carrier.city}</Text>
                </View>
              )}
              {listing.carrier.isVerified && (
                <VerificationBadge type="verified" size="small" animated={false} />
              )}
            </View>
          </View>
          {listing.carrier.bio && <Text style={styles.carrierBio}>{listing.carrier.bio}</Text>}

          {/* Carrier Rating Summary */}
          {carrierReviews && carrierReviews.length > 0 && (
            <View style={styles.ratingSection}>
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
        </Animated.View>

        {/* Carrier Reviews */}
        {carrierReviews && carrierReviews.length > 0 && (
          <Animated.View entering={FadeInUp.delay(250).duration(400)} style={styles.reviewsSection}>
            <SectionHeader title={t('listing.carrierReviews')} />
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
          </Animated.View>
        )}
      </ScrollView>

      {/* Bottom Action Bar — gradient CTA */}
      {!isOwner && (
        <View style={styles.actionBar}>
          <TouchableOpacity onPress={handleMessage} style={styles.messageButton}>
            <Ionicons name="chatbubble-outline" size={20} color={V2_COLORS.primary} />
            <Text style={styles.messageButtonText}>{t('messages.title')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleBooking} style={styles.bookButtonWrap}>
            <LinearGradient
              colors={[...GRADIENTS.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.bookButton}
            >
              <Text style={styles.bookButtonText}>{t('listing.bookNow')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: V2_COLORS.bg } as ViewStyle,
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  } as ViewStyle,
  errorText: { ...TYPOGRAPHY.caption, color: V2_COLORS.textSoft, marginTop: 8 } as TextStyle,
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: RADIUS.pill,
    backgroundColor: V2_COLORS.primary,
  } as ViewStyle,
  backButtonText: { color: '#FFF', fontSize: 15, fontWeight: '600' } as TextStyle,

  scrollContent: { padding: 16, paddingBottom: 100 } as ViewStyle,

  // Route Card
  routeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    padding: 20,
    marginBottom: 16,
    ...BUBBLE_SHADOWS.lg,
  } as ViewStyle,
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as ViewStyle,
  routePoint: { alignItems: 'center', flex: 1 } as ViewStyle,
  routeDot: { width: 12, height: 12, borderRadius: 6, marginBottom: 8 } as ViewStyle,
  cityName: { ...TYPOGRAPHY.h2, color: V2_COLORS.text, textAlign: 'center' } as TextStyle,
  cityCode: { fontSize: 13, color: V2_COLORS.textMuted, marginTop: 2 } as TextStyle,
  routeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 6,
  } as ViewStyle,
  dashedLine: {
    width: 20,
    height: 1.5,
    backgroundColor: V2_COLORS.textMuted,
    opacity: 0.3,
  } as ViewStyle,
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: V2_COLORS.cardShadow,
  } as ViewStyle,

  // Stats
  statsCards: { flexDirection: 'row', gap: 12, marginBottom: 16 } as ViewStyle,
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    padding: 18,
    alignItems: 'center',
    gap: 8,
    ...BUBBLE_SHADOWS.md,
  } as ViewStyle,
  statIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  statValue: { ...TYPOGRAPHY.h2, color: V2_COLORS.text } as TextStyle,
  statLabel: { fontSize: 13, color: V2_COLORS.textSoft } as TextStyle,

  // Notes
  notesCard: {
    backgroundColor: V2_COLORS.accent2 + '12',
    borderRadius: RADIUS.card,
    padding: 18,
    marginBottom: 16,
  } as ViewStyle,
  notesTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  } as ViewStyle,
  notesTitleText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: V2_COLORS.accent2,
  } as TextStyle,
  notesText: { fontSize: 14, lineHeight: 22, color: V2_COLORS.text } as TextStyle,

  // Carrier section
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    padding: 20,
    marginBottom: 16,
    ...BUBBLE_SHADOWS.md,
  } as ViewStyle,
  carrierRow: { flexDirection: 'row', alignItems: 'center', gap: 12 } as ViewStyle,
  carrierInfo: { flex: 1 } as ViewStyle,
  carrierName: { ...TYPOGRAPHY.h3, color: V2_COLORS.text } as TextStyle,
  carrierLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  } as ViewStyle,
  carrierCity: { fontSize: 12, color: V2_COLORS.textMuted } as TextStyle,
  carrierBio: {
    fontSize: 14,
    lineHeight: 21,
    color: V2_COLORS.textSoft,
    marginTop: 12,
  } as TextStyle,
  ratingSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: V2_COLORS.cardShadow,
  } as ViewStyle,

  // Reviews
  reviewsSection: { marginBottom: 16 } as ViewStyle,

  // Action Bar
  actionBar: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#FFFFFF',
    ...BUBBLE_SHADOWS.lg,
  } as ViewStyle,
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 20,
    height: 50,
    borderRadius: RADIUS.pill,
    borderWidth: 1.5,
    borderColor: V2_COLORS.primary,
  } as ViewStyle,
  messageButtonText: { fontSize: 14, fontWeight: '600', color: V2_COLORS.primary } as TextStyle,
  bookButtonWrap: { flex: 1 } as ViewStyle,
  bookButton: {
    height: 50,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  bookButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' } as TextStyle,
});
