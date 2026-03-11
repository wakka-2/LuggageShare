import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { V2_COLORS, RADIUS, BUBBLE_SHADOWS } from '@/providers/ThemeProvider';
import { BackgroundBlobs } from '@/components/common/BackgroundBlobs';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { ReviewCard } from '@/components/trust';
import { useUserReviews } from '@/hooks/useReviews';
import { useAuth } from '@/hooks/useAuth';

export default function MyReviewsScreen() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  const { data: reviews, isLoading } = useUserReviews(user?.id ?? null);

  const avgRating =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const ratingDist = [0, 0, 0, 0, 0]; // index 0 = 5 stars, index 4 = 1 star
  if (reviews) {
    reviews.forEach((r) => {
      const idx = Math.min(Math.max(Math.round(r.rating), 1), 5);
      ratingDist[5 - idx]++;
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <BackgroundBlobs variant="subtle" />
      <ScreenHeader title={t('profile.myReviews', { defaultValue: 'My Reviews' })} />

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={V2_COLORS.primary} size="large" />
        </View>
      ) : !reviews || reviews.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Animated.View entering={FadeInDown.duration(400)} style={styles.emptyContent}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="star-outline" size={40} color={V2_COLORS.primary} />
            </View>
            <Text style={styles.emptyTitle}>
              {t('profile.noReviews', { defaultValue: 'No reviews yet' })}
            </Text>
            <Text style={styles.emptySubtitle}>
              {t('profile.noReviewsDesc', {
                defaultValue: 'Complete bookings to receive reviews from other users.',
              })}
            </Text>
          </Animated.View>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Summary card */}
          <Animated.View entering={FadeInDown.duration(400)} style={styles.summaryCard}>
            <View style={styles.summaryTop}>
              <View style={styles.avgBlock}>
                <Text style={styles.avgNumber}>{avgRating.toFixed(1)}</Text>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={
                        star <= Math.floor(avgRating)
                          ? 'star'
                          : star <= Math.ceil(avgRating)
                            ? 'star-half'
                            : 'star-outline'
                      }
                      size={18}
                      color={V2_COLORS.accent2}
                    />
                  ))}
                </View>
                <Text style={styles.reviewCount}>
                  {reviews.length} {t('profile.reviews', { defaultValue: 'reviews' })}
                </Text>
              </View>

              {/* Distribution bars */}
              <View style={styles.distBlock}>
                {ratingDist.map((count, idx) => {
                  const star = 5 - idx;
                  const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  return (
                    <View key={star} style={styles.distRow}>
                      <Text style={styles.distLabel}>{star}</Text>
                      <Ionicons name="star" size={10} color={V2_COLORS.accent2} />
                      <View style={styles.distBarBg}>
                        <View style={[styles.distBarFill, { width: `${pct}%` as any }]} />
                      </View>
                      <Text style={styles.distCount}>{count}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </Animated.View>

          {/* Review list */}
          {reviews.map((review, index) => (
            <ReviewCard key={review.id} review={review} index={index} />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: V2_COLORS.background,
  } as ViewStyle,
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  } as ViewStyle,
  emptyContent: {
    alignItems: 'center',
    gap: 12,
  } as ViewStyle,
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: V2_COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  } as ViewStyle,
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: V2_COLORS.textPrimary,
    textAlign: 'center',
  } as TextStyle,
  emptySubtitle: {
    fontSize: 14,
    color: V2_COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 260,
  } as TextStyle,
  // Summary card
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.card,
    padding: 20,
    marginBottom: 16,
    ...BUBBLE_SHADOWS.md,
  } as ViewStyle,
  summaryTop: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
  } as ViewStyle,
  avgBlock: {
    alignItems: 'center',
    gap: 4,
  } as ViewStyle,
  avgNumber: {
    fontSize: 40,
    fontWeight: '800',
    color: V2_COLORS.textPrimary,
    lineHeight: 44,
  } as TextStyle,
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  } as ViewStyle,
  reviewCount: {
    fontSize: 12,
    color: V2_COLORS.textSecondary,
    marginTop: 2,
  } as TextStyle,
  distBlock: {
    flex: 1,
    gap: 5,
  } as ViewStyle,
  distRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  } as ViewStyle,
  distLabel: {
    fontSize: 11,
    color: V2_COLORS.textSecondary,
    width: 10,
    textAlign: 'right',
  } as TextStyle,
  distBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: V2_COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  } as ViewStyle,
  distBarFill: {
    height: '100%',
    backgroundColor: V2_COLORS.accent2,
    borderRadius: 3,
  } as ViewStyle,
  distCount: {
    fontSize: 11,
    color: V2_COLORS.textSecondary,
    width: 16,
    textAlign: 'right',
  } as TextStyle,
});
