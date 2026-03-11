import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  Alert,
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
import { useFlight, useCancelFlight } from '@/hooks/useFlights';
import { useFlightOffers } from '@/hooks/useOffers';
import { useAuth } from '@/hooks/useAuth';
import { useUserReviews } from '@/hooks/useReviews';
import { Avatar, BackgroundBlobs, MetaChip, SectionHeader } from '@/components/common';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { VerificationBadge } from '@/components/trust';
import { ReviewCard, RatingBars } from '@/components/trust';
import { SkeletonLoader } from '@/components/animations';

const OFFER_STATUS_COLORS: Record<string, string> = {
  pending: '#FFBE5C',
  accepted: '#56D8B1',
  rejected: '#FF6B9D',
  withdrawn: '#A8A5C0',
  expired: '#A8A5C0',
};

export default function FlightDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const isRTL = i18n.language === 'ar';

  const { data: flight, isLoading } = useFlight(id ?? null);
  const { data: offers } = useFlightOffers(flight?.posterId === user?.id ? (id ?? null) : null);
  const { data: posterReviews } = useUserReviews(flight?.posterId ?? null);
  const cancelFlight = useCancelFlight();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader title={t('flight.details', { defaultValue: 'Flight Details' })} />
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

  if (!flight) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={V2_COLORS.textMuted} />
          <Text style={styles.errorText}>
            {t('flight.notFound', { defaultValue: 'Flight not found' })}
          </Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>
              {t('listing.goBack', { defaultValue: 'Go Back' })}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isOwner = user?.id === flight.posterId;
  const remaining = Number(flight.remainingWeight) || 0;
  const total = Number(flight.totalWeight) || 0;
  const pricePerKg = Number(flight.pricePerKg) || 0;
  const departureDate = new Date(flight.departureDate);
  const capacityPercent = total > 0 ? Math.round(((total - remaining) / total) * 100) : 0;

  const FLIGHT_STATUS_COLOR: Record<string, string> = {
    active: '#56D8B1',
    full: '#FF6B9D',
    cancelled: '#A8A5C0',
    departed: '#A8A5C0',
  };
  const statusColor = FLIGHT_STATUS_COLOR[flight.status] || V2_COLORS.textMuted;

  const handleMakeOffer = () => {
    router.push(`/flight/${id}/offer`);
  };

  const handleCancelFlight = () => {
    Alert.alert(
      t('flight.cancelTitle', { defaultValue: 'Cancel Flight' }),
      t('flight.cancelConfirm', {
        defaultValue:
          'Are you sure you want to cancel this flight? All pending offers will be rejected.',
      }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('flight.cancelConfirmBtn', { defaultValue: 'Cancel Flight' }),
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelFlight.mutateAsync(flight.id);
              router.back();
            } catch {
              Alert.alert(t('common.errorTitle'), t('common.error'));
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackgroundBlobs variant="subtle" />
      <ScreenHeader title={t('flight.details', { defaultValue: 'Flight Details' })} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Route Card */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.routeCard}>
          {/* Status badge */}
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {t(`flight.status${flight.status.charAt(0).toUpperCase() + flight.status.slice(1)}`, {
                defaultValue: flight.status,
              })}
            </Text>
          </View>

          <View style={styles.routeRow}>
            <View style={styles.routePoint}>
              <View style={[styles.routeDot, { backgroundColor: V2_COLORS.accent1 }]} />
              <Text style={styles.cityName}>{flight.departureCity}</Text>
              {flight.departureCode && <Text style={styles.cityCode}>{flight.departureCode}</Text>}
            </View>
            <View style={styles.routeLine}>
              <View style={styles.dashedLine} />
              <Ionicons name="airplane" size={20} color={V2_COLORS.primary} />
              <View style={styles.dashedLine} />
            </View>
            <View style={styles.routePoint}>
              <View style={[styles.routeDot, { backgroundColor: V2_COLORS.secondary }]} />
              <Text style={styles.cityName}>{flight.arrivalCity}</Text>
              {flight.arrivalCode && <Text style={styles.cityCode}>{flight.arrivalCode}</Text>}
            </View>
          </View>

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
            {flight.flightNumber && (
              <MetaChip icon="airplane" label={flight.flightNumber} color={V2_COLORS.accent3} />
            )}
          </View>
        </Animated.View>

        {/* Capacity & Price */}
        <Animated.View entering={FadeIn.delay(100).duration(400)} style={styles.statsCards}>
          {/* Remaining Weight */}
          <View style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: V2_COLORS.primary + '15' }]}>
              <Ionicons name="scale-outline" size={22} color={V2_COLORS.primary} />
            </View>
            <Text style={styles.statValue}>{remaining} kg</Text>
            <Text style={styles.statLabel}>
              {t('flight.remaining', { defaultValue: 'Remaining' })}
            </Text>
            {/* Capacity bar */}
            <View style={styles.capacityBar}>
              <View
                style={[
                  styles.capacityFill,
                  {
                    width: `${capacityPercent}%` as any,
                    backgroundColor: capacityPercent >= 90 ? '#FF6B9D' : V2_COLORS.primary,
                  },
                ]}
              />
            </View>
            <Text style={styles.capacityLabel}>
              {total} kg {t('flight.total', { defaultValue: 'total' })}
            </Text>
          </View>

          {/* Price per KG */}
          <View style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: V2_COLORS.accent2 + '15' }]}>
              <Ionicons name="pricetag-outline" size={22} color={V2_COLORS.accent2} />
            </View>
            <Text style={styles.statValue}>{pricePerKg}</Text>
            <Text style={styles.statLabel}>{flight.currency || 'SAR'} / kg</Text>
          </View>
        </Animated.View>

        {/* Notes */}
        {flight.notes && (
          <Animated.View entering={FadeIn.delay(150).duration(400)} style={styles.notesCard}>
            <View style={styles.notesTitleRow}>
              <Ionicons name="document-text-outline" size={16} color={V2_COLORS.accent2} />
              <Text style={styles.notesTitleText}>
                {t('listing.notes', { defaultValue: 'Notes' })}
              </Text>
            </View>
            <Text style={styles.notesText}>{flight.notes}</Text>
          </Animated.View>
        )}

        {/* Poster Info */}
        <Animated.View entering={FadeIn.delay(200).duration(400)} style={styles.section}>
          <SectionHeader title={t('flight.poster', { defaultValue: 'Traveler' })} />
          <View style={styles.carrierRow}>
            <Avatar
              name={flight.poster.name}
              avatarUrl={flight.poster.avatarUrl}
              size={48}
              isVerified={flight.poster.isVerified}
            />
            <View style={styles.carrierInfo}>
              <Text style={styles.carrierName}>{flight.poster.name}</Text>
              {flight.poster.city && (
                <View style={styles.carrierLocationRow}>
                  <Ionicons name="location-outline" size={12} color={V2_COLORS.textMuted} />
                  <Text style={styles.carrierCity}>{flight.poster.city}</Text>
                </View>
              )}
              {flight.poster.isVerified && (
                <VerificationBadge type="verified" size="small" animated={false} />
              )}
            </View>
          </View>
          {flight.poster.bio && <Text style={styles.carrierBio}>{flight.poster.bio}</Text>}

          {posterReviews && posterReviews.length > 0 && (
            <View style={styles.ratingSection}>
              <RatingBars
                distribution={(() => {
                  const dist = [0, 0, 0, 0, 0];
                  posterReviews.forEach((r) => {
                    if (r.rating >= 1 && r.rating <= 5) dist[5 - r.rating]++;
                  });
                  return dist;
                })()}
                average={posterReviews.reduce((sum, r) => sum + r.rating, 0) / posterReviews.length}
                total={posterReviews.length}
              />
            </View>
          )}
        </Animated.View>

        {/* Offers list — visible only to the poster */}
        {isOwner && offers && offers.length > 0 && (
          <Animated.View entering={FadeInUp.delay(250).duration(400)} style={styles.offersSection}>
            <SectionHeader
              title={t('flight.offers', { defaultValue: 'Offers' })}
              count={offers.length}
            />
            {offers.map((offer, index) => {
              const offerColor = OFFER_STATUS_COLORS[offer.status] || V2_COLORS.textMuted;
              return (
                <Animated.View
                  key={offer.id}
                  entering={FadeInDown.delay(index * 50).duration(300)}
                  style={styles.offerCard}
                >
                  <View style={styles.offerHeader}>
                    <Avatar
                      name={offer.sender.name}
                      avatarUrl={offer.sender.avatarUrl}
                      size={36}
                      isVerified={offer.sender.isVerified}
                    />
                    <View style={styles.offerSenderInfo}>
                      <Text style={styles.offerSenderName}>{offer.sender.name}</Text>
                      <View
                        style={[styles.offerStatusBadge, { backgroundColor: offerColor + '18' }]}
                      >
                        <Text style={[styles.offerStatusText, { color: offerColor }]}>
                          {offer.status}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.offerPriceCol}>
                      <Text style={styles.offerWeight}>{Number(offer.offeredWeight)} kg</Text>
                      <Text style={styles.offerPrice}>
                        {Number(offer.offeredPrice)} {offer.currency}
                      </Text>
                    </View>
                  </View>
                  {offer.note && <Text style={styles.offerNote}>{offer.note}</Text>}
                  {offer.status === 'pending' && (
                    <View style={styles.offerActions}>
                      <TouchableOpacity
                        onPress={() => router.push(`/chat/offer/${offer.id}`)}
                        style={styles.offerChatBtn}
                      >
                        <Ionicons name="chatbubble-outline" size={16} color={V2_COLORS.primary} />
                        <Text style={styles.offerChatBtnText}>
                          {t('messages.title', { defaultValue: 'Chat' })}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </Animated.View>
              );
            })}
          </Animated.View>
        )}

        {/* Reviews */}
        {posterReviews && posterReviews.length > 0 && (
          <Animated.View entering={FadeInUp.delay(300).duration(400)} style={styles.reviewsSection}>
            <SectionHeader title={t('listing.carrierReviews', { defaultValue: 'Reviews' })} />
            {posterReviews.slice(0, 3).map((review, index) => (
              <ReviewCard
                key={review.id}
                review={{
                  id: review.id,
                  rating: review.rating,
                  comment: review.comment,
                  createdAt: review.createdAt,
                  reviewer: { name: review.reviewer.name, avatarUrl: review.reviewer.avatarUrl },
                }}
                index={index}
              />
            ))}
          </Animated.View>
        )}
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.actionBar}>
        {isOwner ? (
          <>
            <TouchableOpacity
              onPress={() => router.push(`/chat/offer/${flight.id}`)}
              style={styles.secondaryBtn}
            >
              <Ionicons name="list-outline" size={20} color={V2_COLORS.primary} />
              <Text style={styles.secondaryBtnText}>
                {t('flight.viewOffers', { defaultValue: 'View Offers' })}{' '}
                {offers?.length ? `(${offers.length})` : ''}
              </Text>
            </TouchableOpacity>
            {flight.status === 'active' && (
              <TouchableOpacity onPress={handleCancelFlight} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>
                  {t('flight.cancel', { defaultValue: 'Cancel' })}
                </Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <>
            <TouchableOpacity
              onPress={() => router.push(`/chat/offer/${id}`)}
              style={styles.secondaryBtn}
            >
              <Ionicons name="chatbubble-outline" size={20} color={V2_COLORS.primary} />
              <Text style={styles.secondaryBtnText}>
                {t('messages.title', { defaultValue: 'Chat' })}
              </Text>
            </TouchableOpacity>
            {flight.status === 'active' && (
              <TouchableOpacity onPress={handleMakeOffer} style={styles.primaryBtnWrap}>
                <LinearGradient
                  colors={[...GRADIENTS.primary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryBtn}
                >
                  <Text style={styles.primaryBtnText}>
                    {t('offer.makeOffer', { defaultValue: 'Make Offer' })}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
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
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
    gap: 6,
    marginBottom: 16,
  } as ViewStyle,
  statusDot: { width: 7, height: 7, borderRadius: 4 } as ViewStyle,
  statusText: { fontSize: 12, fontWeight: '700' } as TextStyle,
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
  capacityBar: {
    width: '100%',
    height: 4,
    backgroundColor: V2_COLORS.cardShadow,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 4,
  } as ViewStyle,
  capacityFill: { height: '100%', borderRadius: 2 } as ViewStyle,
  capacityLabel: { fontSize: 11, color: V2_COLORS.textMuted } as TextStyle,

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

  // Poster section
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

  // Offers section
  offersSection: { marginBottom: 16 } as ViewStyle,
  offerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    padding: 16,
    marginBottom: 10,
    ...BUBBLE_SHADOWS.md,
  } as ViewStyle,
  offerHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 } as ViewStyle,
  offerSenderInfo: { flex: 1 } as ViewStyle,
  offerSenderName: { ...TYPOGRAPHY.body, fontWeight: '600', color: V2_COLORS.text } as TextStyle,
  offerStatusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
    marginTop: 4,
  } as ViewStyle,
  offerStatusText: { fontSize: 11, fontWeight: '700' } as TextStyle,
  offerPriceCol: { alignItems: 'flex-end', gap: 2 } as ViewStyle,
  offerWeight: { fontSize: 15, fontWeight: '700', color: V2_COLORS.primary } as TextStyle,
  offerPrice: { fontSize: 13, color: V2_COLORS.textSoft } as TextStyle,
  offerNote: {
    fontSize: 13,
    color: V2_COLORS.textSoft,
    marginTop: 10,
    fontStyle: 'italic',
  } as TextStyle,
  offerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: V2_COLORS.cardShadow,
  } as ViewStyle,
  offerChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
    borderWidth: 1.5,
    borderColor: V2_COLORS.primary,
  } as ViewStyle,
  offerChatBtnText: { fontSize: 13, fontWeight: '600', color: V2_COLORS.primary } as TextStyle,

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
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 16,
    height: 50,
    borderRadius: RADIUS.pill,
    borderWidth: 1.5,
    borderColor: V2_COLORS.primary,
  } as ViewStyle,
  secondaryBtnText: { fontSize: 14, fontWeight: '600', color: V2_COLORS.primary } as TextStyle,
  cancelBtn: {
    paddingHorizontal: 16,
    height: 50,
    borderRadius: RADIUS.pill,
    borderWidth: 1.5,
    borderColor: '#FF6B9D',
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  cancelBtnText: { fontSize: 14, fontWeight: '600', color: '#FF6B9D' } as TextStyle,
  primaryBtnWrap: { flex: 1 } as ViewStyle,
  primaryBtn: {
    height: 50,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  primaryBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' } as TextStyle,
});
