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
import { useListing } from '@/hooks/useListings';
import { useBookings } from '@/hooks/useBookings';
import { useUserReviews } from '@/hooks/useReviews';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/common';
import { MOCK_LISTINGS, adaptMockListing } from '@/components/listings';
import { VerificationBadge } from '@/components/trust';
import { ReviewCard, RatingBars } from '@/components/trust';
import { SkeletonLoader } from '@/components/animations';
import { showAlert } from '@/lib/alert';

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
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
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerButton} />
          <SkeletonLoader width={120} height={18} borderRadius={6} />
          <View style={styles.headerButton} />
        </View>
        <View style={styles.scrollContent}>
          <SkeletonLoader
            width="100%"
            height={140}
            borderRadius={16}
            style={{ marginBottom: 16 }}
          />
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
            <SkeletonLoader width="48%" height={100} borderRadius={16} />
            <SkeletonLoader width="48%" height={100} borderRadius={16} />
          </View>
          <SkeletonLoader width="100%" height={120} borderRadius={16} />
        </View>
      </SafeAreaView>
    );
  }

  if (!listing) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>
            {t('listing.notFound')}
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: colors.primary }]}
          >
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('listing.details')}</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Route Card */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={[styles.routeCard, { backgroundColor: colors.card }]}
        >
          <View style={styles.routeRow}>
            <View style={styles.routePoint}>
              <View style={[styles.routeDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.cityName, { color: colors.text }]}>{listing.departureCity}</Text>
              {listing.departureCode && (
                <Text style={[styles.cityCode, { color: colors.textSecondary }]}>
                  {listing.departureCode}
                </Text>
              )}
            </View>
            <View style={styles.routeLine}>
              <Ionicons name="airplane" size={20} color={colors.primary} />
            </View>
            <View style={styles.routePoint}>
              <View style={[styles.routeDot, { backgroundColor: colors.success }]} />
              <Text style={[styles.cityName, { color: colors.text }]}>{listing.arrivalCity}</Text>
              {listing.arrivalCode && (
                <Text style={[styles.cityCode, { color: colors.textSecondary }]}>
                  {listing.arrivalCode}
                </Text>
              )}
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.detailText, { color: colors.text }]}>
                {departureDate.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
            </View>
            {listing.flightNumber && (
              <View style={styles.detailItem}>
                <Ionicons name="airplane-outline" size={18} color={colors.textSecondary} />
                <Text style={[styles.detailText, { color: colors.text }]}>
                  {listing.flightNumber}
                </Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Weight & Price */}
        <Animated.View entering={FadeIn.delay(100).duration(400)} style={styles.statsCards}>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Ionicons name="scale-outline" size={24} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.text }]}>{weight} kg</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {t('listing.available')}
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Ionicons name="pricetag-outline" size={24} color={colors.success} />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {price} {listing.currency || 'SAR'}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {t('listing.price')}
            </Text>
          </View>
        </Animated.View>

        {/* Notes */}
        {listing.notes && (
          <Animated.View
            entering={FadeIn.delay(150).duration(400)}
            style={[styles.section, { backgroundColor: colors.card }]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('listing.notes')}</Text>
            <Text style={[styles.notesText, { color: colors.textSecondary }]}>{listing.notes}</Text>
          </Animated.View>
        )}

        {/* Carrier Info */}
        <Animated.View
          entering={FadeIn.delay(200).duration(400)}
          style={[styles.section, { backgroundColor: colors.card }]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('listing.carrier')}</Text>
          <View style={styles.carrierRow}>
            <Avatar
              name={listing.carrier.name}
              avatarUrl={listing.carrier.avatarUrl}
              size={48}
              isVerified={listing.carrier.isVerified}
            />
            <View style={styles.carrierInfo}>
              <Text style={[styles.carrierName, { color: colors.text }]}>
                {listing.carrier.name}
              </Text>
              {listing.carrier.city && (
                <Text style={[styles.carrierCity, { color: colors.textSecondary }]}>
                  {listing.carrier.city}
                </Text>
              )}
              {listing.carrier.isVerified && (
                <VerificationBadge type="verified" size="small" animated={false} />
              )}
            </View>
          </View>
          {listing.carrier.bio && (
            <Text style={[styles.carrierBio, { color: colors.textSecondary }]}>
              {listing.carrier.bio}
            </Text>
          )}

          {/* Carrier Rating Summary */}
          {carrierReviews && carrierReviews.length > 0 && (
            <View style={[styles.ratingSection]}>
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
          <Animated.View
            entering={FadeInUp.delay(250).duration(400)}
            style={[styles.section, { backgroundColor: colors.card }]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('listing.carrierReviews', { defaultValue: 'Reviews' })}
            </Text>
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

      {/* Bottom Action Bar */}
      {!isOwner && (
        <View
          style={[
            styles.actionBar,
            { backgroundColor: colors.card, borderTopColor: colors.border },
          ]}
        >
          <TouchableOpacity
            onPress={handleMessage}
            style={[styles.messageButton, { borderColor: colors.primary }]}
          >
            <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleBooking}
            style={[styles.bookButton, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.bookButtonText}>{t('listing.bookNow')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 } as ViewStyle,
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  } as ViewStyle,
  errorText: { fontSize: 16, marginTop: 8 } as TextStyle,
  backButton: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 } as ViewStyle,
  backButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' } as TextStyle,

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  } as ViewStyle,
  headerButton: { width: 40, alignItems: 'center' } as ViewStyle,
  headerTitle: { fontSize: 18, fontWeight: '600' } as TextStyle,

  scrollContent: { padding: 16, paddingBottom: 100 } as ViewStyle,

  // Route Card
  routeCard: { borderRadius: 16, padding: 20, marginBottom: 16 } as ViewStyle,
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as ViewStyle,
  routePoint: { alignItems: 'center', flex: 1 } as ViewStyle,
  routeDot: { width: 12, height: 12, borderRadius: 6, marginBottom: 8 } as ViewStyle,
  cityName: { fontSize: 18, fontWeight: '700', textAlign: 'center' } as TextStyle,
  cityCode: { fontSize: 13, marginTop: 2 } as TextStyle,
  routeLine: { paddingHorizontal: 16 } as ViewStyle,
  divider: { height: 1, marginVertical: 16 } as ViewStyle,
  detailsRow: { flexDirection: 'row', gap: 24 } as ViewStyle,
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 } as ViewStyle,
  detailText: { fontSize: 14 } as TextStyle,

  // Stats
  statsCards: { flexDirection: 'row', gap: 12, marginBottom: 16 } as ViewStyle,
  statCard: { flex: 1, borderRadius: 16, padding: 16, alignItems: 'center', gap: 8 } as ViewStyle,
  statValue: { fontSize: 22, fontWeight: '700' } as TextStyle,
  statLabel: { fontSize: 13 } as TextStyle,

  // Sections
  section: { borderRadius: 16, padding: 20, marginBottom: 16 } as ViewStyle,
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 } as TextStyle,
  notesText: { fontSize: 14, lineHeight: 22 } as TextStyle,

  // Carrier
  carrierRow: { flexDirection: 'row', alignItems: 'center', gap: 12 } as ViewStyle,
  carrierInfo: { flex: 1 } as ViewStyle,
  carrierName: { fontSize: 16, fontWeight: '600' } as TextStyle,
  carrierCity: { fontSize: 13, marginTop: 2 } as TextStyle,
  carrierBio: { fontSize: 14, lineHeight: 20, marginTop: 12 } as TextStyle,
  ratingSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  } as ViewStyle,

  // Action Bar
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
  } as ViewStyle,
  messageButton: {
    width: 52,
    height: 52,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  bookButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  bookButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' } as TextStyle,
});
