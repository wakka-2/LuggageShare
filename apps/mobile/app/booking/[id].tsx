import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
  Image,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import {
  V2_COLORS,
  RADIUS,
  BUBBLE_SHADOWS,
  TYPOGRAPHY,
  GRADIENTS,
} from '@/providers/ThemeProvider';
import { showAlert } from '@/lib/alert';
import {
  useBooking,
  useAcceptBooking,
  useRejectBooking,
  useCancelBooking,
  useMarkPickedUp,
  useMarkInTransit,
  useMarkDelivered,
  useConfirmPayment,
  getMockBookings,
} from '@/hooks/useBookings';
import { useBookingReview, useCreateReview } from '@/hooks/useReviews';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, BackgroundBlobs, MetaChip } from '@/components/common';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { StarRating } from '@/components/common/StarRating';
import { StatusTimeline, LiveIndicator } from '@/components/status';
import { VerificationBadge } from '@/components/trust';
import { SkeletonLoader } from '@/components/animations';

const STATUS_COLORS: Record<string, string> = {
  pending: '#FFBE5C',
  accepted: '#5CB8FF',
  picked_up: '#7C6AFF',
  in_transit: '#7C6AFF',
  delivered: '#56D8B1',
  rejected: '#FF6B9D',
  cancelled: '#A8A5C0',
};

const BOOKING_STATUS_KEYS: Record<string, string> = {
  pending: 'booking.statusPendingApproval',
  accepted: 'booking.statusAccepted',
  picked_up: 'booking.statusPickedUp',
  in_transit: 'booking.statusInTransit',
  delivered: 'booking.statusDelivered',
  rejected: 'booking.statusRejected',
  cancelled: 'booking.statusCancelled',
};

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const isRTL = i18n.language === 'ar';

  const { data: apiBooking, isLoading } = useBooking(id ?? null);
  const { data: existingReview } = useBookingReview(id ?? null);

  // Fall back to mock bookings when the API doesn't return data
  const mockMatch =
    !apiBooking && id && user?.id ? getMockBookings(user.id).find((b) => b.id === id) : undefined;
  const booking = apiBooking ?? mockMatch;
  const acceptBooking = useAcceptBooking();
  const rejectBooking = useRejectBooking();
  const cancelBooking = useCancelBooking();
  const confirmPayment = useConfirmPayment();
  const markPickedUp = useMarkPickedUp();
  const markInTransit = useMarkInTransit();
  const markDelivered = useMarkDelivered();
  const createReview = useCreateReview();

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader title={t('booking.details')} />
        <View style={styles.scrollContent}>
          <SkeletonLoader
            width="100%"
            height={48}
            borderRadius={RADIUS.pill}
            style={{ marginBottom: 16 }}
          />
          <SkeletonLoader
            width="100%"
            height={120}
            borderRadius={RADIUS.card}
            style={{ marginBottom: 16 }}
          />
          <SkeletonLoader
            width="100%"
            height={100}
            borderRadius={RADIUS.card}
            style={{ marginBottom: 16 }}
          />
          <SkeletonLoader width="100%" height={80} borderRadius={RADIUS.card} />
        </View>
      </SafeAreaView>
    );
  }

  if (!booking) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <Text style={styles.emptyText}>{t('listing.notFound')}</Text>
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
            <Text style={styles.goBackText}>{t('listing.goBack')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isCarrier = user?.id === booking.carrierId;
  const isSender = user?.id === booking.senderId;
  const statusColor = STATUS_COLORS[booking.status] || V2_COLORS.textMuted;
  const statusKey = BOOKING_STATUS_KEYS[booking.status];
  const otherUser = isCarrier ? booking.sender : booking.carrier;

  const handleAccept = () => {
    showAlert(t('booking.acceptBooking'), t('booking.acceptBookingConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('booking.accept'), onPress: () => acceptBooking.mutate(booking.id) },
    ]);
  };

  const handleReject = () => {
    showAlert(t('booking.rejectBooking'), t('booking.rejectBookingConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('booking.reject'),
        style: 'destructive',
        onPress: () => rejectBooking.mutate(booking.id),
      },
    ]);
  };

  const handleCancel = () => {
    showAlert(t('booking.cancelBooking'), t('booking.cancelBookingConfirm'), [
      { text: t('booking.no'), style: 'cancel' },
      {
        text: t('booking.yesCancel'),
        style: 'destructive',
        onPress: () => cancelBooking.mutate(booking.id),
      },
    ]);
  };

  const handleConfirmPayment = () => {
    showAlert(t('booking.confirmPaymentTitle'), t('booking.confirmPaymentMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.confirm'), onPress: () => confirmPayment.mutate(booking.id) },
    ]);
  };

  const handleMarkPickedUp = () => {
    showAlert(t('booking.confirmPickup'), t('booking.confirmPickupMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.confirm'), onPress: () => markPickedUp.mutate(booking.id) },
    ]);
  };

  const handleMarkInTransit = () => {
    showAlert(t('booking.confirmInTransit'), t('booking.confirmInTransitMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.confirm'), onPress: () => markInTransit.mutate(booking.id) },
    ]);
  };

  const handleMarkDelivered = () => {
    showAlert(t('booking.confirmDelivery'), t('booking.confirmDeliveryMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.confirm'), onPress: () => markDelivered.mutate(booking.id) },
    ]);
  };

  const handleSubmitReview = async () => {
    if (reviewRating === 0) {
      showAlert(t('common.errorTitle'), t('booking.selectRating'));
      return;
    }
    try {
      await createReview.mutateAsync({
        bookingId: booking.id,
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
      });
      setShowReviewForm(false);
      showAlert(t('booking.thankYou'), t('booking.reviewSubmitted'));
    } catch {
      showAlert(t('common.errorTitle'), t('booking.failedReview'));
    }
  };

  const canReview = booking.status === 'delivered' && !existingReview;

  return (
    <SafeAreaView style={styles.container}>
      <BackgroundBlobs variant="subtle" />
      <ScreenHeader title={t('booking.details')} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Status Pill */}
        <Animated.View
          entering={FadeIn.duration(300)}
          style={[styles.statusCard, { backgroundColor: statusColor + '15' }]}
        >
          {booking.status === 'in_transit' ? (
            <LiveIndicator color={statusColor} label={statusKey ? t(statusKey) : booking.status} />
          ) : (
            <>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusLabel, { color: statusColor }]}>
                {statusKey ? t(statusKey) : booking.status}
              </Text>
            </>
          )}
        </Animated.View>

        {/* Status Timeline — show for active bookings */}
        {!['rejected', 'cancelled'].includes(booking.status) && (
          <Animated.View entering={FadeInUp.delay(150).springify()} style={styles.card}>
            <Text style={styles.cardTitle}>
              {t('booking.progress', { defaultValue: 'Progress' })}
            </Text>
            <StatusTimeline
              events={[
                {
                  key: 'pending',
                  label: t('booking.statusPendingApproval'),
                  icon: 'time-outline',
                  date: booking.createdAt,
                },
                {
                  key: 'accepted',
                  label: t('booking.statusAccepted'),
                  icon: 'checkmark-circle-outline',
                  date: booking.status !== 'pending' ? booking.updatedAt : null,
                },
                { key: 'picked_up', label: t('booking.statusPickedUp'), icon: 'cube-outline' },
                {
                  key: 'in_transit',
                  label: t('booking.statusInTransit'),
                  icon: 'airplane-outline',
                },
                {
                  key: 'delivered',
                  label: t('booking.statusDelivered'),
                  icon: 'checkmark-done-outline',
                },
              ]}
              currentKey={booking.status}
            />
          </Animated.View>
        )}

        {/* Route */}
        <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.card}>
          <View style={styles.routeRow}>
            <View style={[styles.routeDot, { backgroundColor: V2_COLORS.accent1 }]} />
            <Text style={styles.city}>{booking.listing.departureCity}</Text>
            <Ionicons
              name="airplane"
              size={18}
              color={V2_COLORS.primary}
              style={{ marginHorizontal: 10 }}
            />
            <Text style={styles.city}>{booking.listing.arrivalCity}</Text>
            <View style={[styles.routeDot, { backgroundColor: V2_COLORS.secondary }]} />
          </View>
          <View style={styles.routeMetaRow}>
            <MetaChip
              icon="calendar"
              label={new Date(booking.listing.departureDate).toLocaleDateString(
                isRTL ? 'ar-SA' : 'en-US',
                { day: 'numeric', month: 'long', year: 'numeric' }
              )}
              color={V2_COLORS.primary}
            />
          </View>
        </Animated.View>

        {/* Price Summary */}
        <Animated.View entering={FadeInUp.delay(250).springify()} style={styles.card}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>{t('booking.weight')}</Text>
            <Text style={styles.priceValue}>{Number(booking.totalWeight) || 0} kg</Text>
          </View>
          <View style={styles.priceDivider} />
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>{t('booking.total')}</Text>
            <Text style={styles.totalValue}>
              {Number(booking.totalPrice) || 0} {booking.currency || 'SAR'}
            </Text>
          </View>
        </Animated.View>

        {/* Items with Photos */}
        {booking.items && booking.items.length > 0 && (
          <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.card}>
            <Text style={styles.cardTitle}>
              {t('booking.items')} ({booking.items.length})
            </Text>
            {booking.items.map((item, idx) => (
              <View
                key={item.id}
                style={[
                  styles.itemRow,
                  idx < booking.items.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: V2_COLORS.cardShadow,
                  },
                ]}
              >
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {item.description && <Text style={styles.itemDesc}>{item.description}</Text>}
                  <View style={styles.itemMeta}>
                    <MetaChip
                      icon="scale"
                      label={`${Number(item.weight)} kg`}
                      color={V2_COLORS.primary}
                    />
                    {item.value > 0 && (
                      <MetaChip
                        icon="pricetag"
                        label={`${Number(item.value)} SAR`}
                        color={V2_COLORS.accent2}
                      />
                    )}
                  </View>
                </View>
                {item.imageUrls && item.imageUrls.length > 0 && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.itemImageScroll}
                  >
                    {item.imageUrls.map((url, imgIdx) => (
                      <Image key={imgIdx} source={{ uri: url }} style={styles.itemThumb} />
                    ))}
                  </ScrollView>
                )}
              </View>
            ))}
          </Animated.View>
        )}

        {/* Other User */}
        <Animated.View entering={FadeInUp.delay(350).springify()} style={styles.card}>
          <Text style={styles.cardTitle}>
            {isCarrier ? t('booking.sender') : t('booking.carrier')}
          </Text>
          <View style={styles.userRow}>
            <Avatar
              name={otherUser.name}
              avatarUrl={otherUser.avatarUrl}
              size={44}
              isVerified={otherUser.isVerified}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{otherUser.name}</Text>
              {otherUser.isVerified && (
                <VerificationBadge type="verified" size="small" animated={false} />
              )}
            </View>
            <TouchableOpacity
              onPress={() => router.push(`/chat/${booking.id}`)}
              style={styles.chatBtn}
            >
              <Ionicons name="chatbubble-outline" size={18} color={V2_COLORS.primary} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Existing Review */}
        {existingReview && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('booking.review')}</Text>
            <View style={styles.reviewDisplay}>
              <StarRating rating={existingReview.rating} size={22} />
              {existingReview.comment && (
                <Text style={styles.reviewComment}>{existingReview.comment}</Text>
              )}
              <Text style={styles.reviewAuthor}>
                {t('booking.reviewBy')} {existingReview.reviewer.name}
              </Text>
            </View>
          </View>
        )}

        {/* Review Prompt */}
        {canReview && !showReviewForm && (
          <TouchableOpacity onPress={() => setShowReviewForm(true)} style={styles.reviewPrompt}>
            <Ionicons name="star-outline" size={24} color={V2_COLORS.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.reviewPromptTitle}>{t('booking.rateExperience')}</Text>
              <Text style={styles.reviewPromptDesc}>{t('booking.shareExperience')}</Text>
            </View>
            <Ionicons
              name={isRTL ? 'chevron-back' : 'chevron-forward'}
              size={20}
              color={V2_COLORS.primary}
            />
          </TouchableOpacity>
        )}

        {/* Review Form */}
        {canReview && showReviewForm && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('booking.yourReview')}</Text>
            <View style={styles.reviewFormContent}>
              <StarRating rating={reviewRating} onRate={setReviewRating} size={36} />
              <TextInput
                style={styles.reviewInput}
                value={reviewComment}
                onChangeText={setReviewComment}
                placeholder={t('booking.addComment')}
                placeholderTextColor={V2_COLORS.textMuted}
                multiline
                numberOfLines={3}
                maxLength={500}
                textAlign={isRTL ? 'right' : 'left'}
                textAlignVertical="top"
              />
              <View style={styles.reviewActions}>
                <TouchableOpacity
                  onPress={() => setShowReviewForm(false)}
                  style={styles.reviewCancelBtn}
                >
                  <Text style={styles.reviewCancelText}>{t('common.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSubmitReview}
                  disabled={createReview.isPending || reviewRating === 0}
                  style={[styles.reviewSubmitBtn, { opacity: reviewRating === 0 ? 0.5 : 1 }]}
                >
                  {createReview.isPending ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <Text style={styles.reviewSubmitText}>{t('booking.submit')}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Payment Button for Sender */}
      {booking.status === 'accepted' && isSender && (
        <View style={styles.actionBar}>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: '/booking/payment',
                params: {
                  bookingId: booking.id,
                  amount: String(Number(booking.totalPrice)),
                  currency: booking.currency,
                  carrierName: booking.carrier.name,
                  carrierIban: booking.carrier.iban || '',
                  carrierBankName: booking.carrier.bankName || '',
                },
              })
            }
            style={styles.primaryBtn}
          >
            <LinearGradient
              colors={[...GRADIENTS.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryBtnGradient}
            >
              <Ionicons name="card-outline" size={20} color="#FFF" style={{ marginEnd: 8 }} />
              <Text style={styles.primaryBtnText}>{t('payment.title')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Carrier: Confirm Payment */}
      {isCarrier && booking.paymentStatus === 'proof_submitted' && (
        <View style={styles.actionBar}>
          <TouchableOpacity
            onPress={handleConfirmPayment}
            disabled={confirmPayment.isPending}
            style={[
              styles.solidActionBtn,
              { backgroundColor: V2_COLORS.accent1, opacity: confirmPayment.isPending ? 0.7 : 1 },
            ]}
          >
            {confirmPayment.isPending ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                <Ionicons
                  name="checkmark-done-outline"
                  size={20}
                  color="#FFF"
                  style={{ marginEnd: 8 }}
                />
                <Text style={styles.primaryBtnText}>{t('booking.confirmPayment')}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Carrier Status Progression */}
      {isCarrier && booking.status === 'accepted' && (
        <View style={styles.actionBar}>
          <TouchableOpacity
            onPress={handleMarkPickedUp}
            disabled={markPickedUp.isPending}
            style={[
              styles.solidActionBtn,
              { backgroundColor: V2_COLORS.primary, opacity: markPickedUp.isPending ? 0.7 : 1 },
            ]}
          >
            {markPickedUp.isPending ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                <Ionicons name="cube-outline" size={20} color="#FFF" style={{ marginEnd: 8 }} />
                <Text style={styles.primaryBtnText}>{t('booking.markPickedUp')}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {isCarrier && booking.status === 'picked_up' && (
        <View style={styles.actionBar}>
          <TouchableOpacity
            onPress={handleMarkInTransit}
            disabled={markInTransit.isPending}
            style={[
              styles.solidActionBtn,
              { backgroundColor: V2_COLORS.primary, opacity: markInTransit.isPending ? 0.7 : 1 },
            ]}
          >
            {markInTransit.isPending ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                <Ionicons name="airplane-outline" size={20} color="#FFF" style={{ marginEnd: 8 }} />
                <Text style={styles.primaryBtnText}>{t('booking.markInTransit')}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {isCarrier && booking.status === 'in_transit' && (
        <View style={styles.actionBar}>
          <TouchableOpacity
            onPress={handleMarkDelivered}
            disabled={markDelivered.isPending}
            style={[
              styles.solidActionBtn,
              { backgroundColor: V2_COLORS.accent1, opacity: markDelivered.isPending ? 0.7 : 1 },
            ]}
          >
            {markDelivered.isPending ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color="#FFF"
                  style={{ marginEnd: 8 }}
                />
                <Text style={styles.primaryBtnText}>{t('booking.markDelivered')}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Action Buttons — pending booking */}
      {booking.status === 'pending' && (
        <View style={styles.actionBar}>
          {isCarrier && (
            <>
              <TouchableOpacity onPress={handleReject} style={styles.rejectBtn}>
                <Text style={styles.rejectText}>{t('booking.reject')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAccept} style={styles.primaryBtn}>
                <LinearGradient
                  colors={[...GRADIENTS.primary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryBtnGradient}
                >
                  <Text style={styles.primaryBtnText}>{t('booking.accept')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}
          {isSender && (
            <TouchableOpacity onPress={handleCancel} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>{t('booking.cancelBooking')}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: V2_COLORS.bg } as ViewStyle,
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' } as ViewStyle,
  emptyText: { ...TYPOGRAPHY.caption, color: V2_COLORS.textSoft } as TextStyle,
  goBackText: { ...TYPOGRAPHY.caption, fontWeight: '600', color: V2_COLORS.primary } as TextStyle,
  scrollContent: { padding: 16, paddingBottom: 100 } as ViewStyle,

  // Status pill
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: RADIUS.pill,
    gap: 10,
    marginBottom: 16,
  } as ViewStyle,
  statusDot: { width: 10, height: 10, borderRadius: 5 } as ViewStyle,
  statusLabel: { fontSize: 16, fontWeight: '700' } as TextStyle,

  // Cards
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    padding: 20,
    marginBottom: 16,
    ...BUBBLE_SHADOWS.md,
  } as ViewStyle,
  cardTitle: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: V2_COLORS.text,
    marginBottom: 12,
  } as TextStyle,

  // Route
  routeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 } as ViewStyle,
  routeDot: { width: 10, height: 10, borderRadius: 5 } as ViewStyle,
  city: { ...TYPOGRAPHY.h3, color: V2_COLORS.text } as TextStyle,
  routeMetaRow: { marginTop: 8 } as ViewStyle,

  // Price
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  } as ViewStyle,
  priceLabel: { fontSize: 14, color: V2_COLORS.textSoft } as TextStyle,
  priceValue: { fontSize: 14, fontWeight: '500', color: V2_COLORS.text } as TextStyle,
  priceDivider: {
    height: 1,
    backgroundColor: V2_COLORS.cardShadow,
    marginVertical: 8,
  } as ViewStyle,
  totalLabel: { ...TYPOGRAPHY.h3, color: V2_COLORS.text } as TextStyle,
  totalValue: { ...TYPOGRAPHY.h2, color: V2_COLORS.primary } as TextStyle,

  // Items
  itemRow: { paddingVertical: 12 } as ViewStyle,
  itemInfo: { marginBottom: 8 } as ViewStyle,
  itemName: { ...TYPOGRAPHY.caption, fontWeight: '600', color: V2_COLORS.text } as TextStyle,
  itemDesc: { fontSize: 13, color: V2_COLORS.textSoft, marginTop: 2 } as TextStyle,
  itemMeta: { flexDirection: 'row', gap: 8, marginTop: 6 } as ViewStyle,
  itemImageScroll: { marginTop: 4 } as ViewStyle,
  itemThumb: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.card / 2,
    marginEnd: 8,
  } as ImageStyle,

  // User
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 12 } as ViewStyle,
  userName: { ...TYPOGRAPHY.h3, color: V2_COLORS.text } as TextStyle,
  chatBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.pill,
    borderWidth: 1.5,
    borderColor: V2_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  // Review display
  reviewDisplay: { gap: 8 } as ViewStyle,
  reviewComment: { fontSize: 14, lineHeight: 21, color: V2_COLORS.text } as TextStyle,
  reviewAuthor: { fontSize: 12, color: V2_COLORS.textMuted } as TextStyle,

  // Review prompt
  reviewPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: RADIUS.card,
    gap: 12,
    marginBottom: 16,
    backgroundColor: V2_COLORS.primary + '10',
    borderWidth: 1,
    borderColor: V2_COLORS.primary + '30',
  } as ViewStyle,
  reviewPromptTitle: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: V2_COLORS.primary,
  } as TextStyle,
  reviewPromptDesc: { fontSize: 13, color: V2_COLORS.textSoft, marginTop: 2 } as TextStyle,

  // Review form
  reviewFormContent: { gap: 16, alignItems: 'center' } as ViewStyle,
  reviewInput: {
    width: '100%',
    minHeight: 80,
    borderRadius: RADIUS.input,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: V2_COLORS.cardShadow,
    backgroundColor: V2_COLORS.bg,
    color: V2_COLORS.text,
  } as TextStyle,
  reviewActions: { flexDirection: 'row', gap: 12, width: '100%' } as ViewStyle,
  reviewCancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: RADIUS.pill,
    borderWidth: 1.5,
    borderColor: V2_COLORS.cardShadow,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  reviewCancelText: { fontSize: 15, fontWeight: '600', color: V2_COLORS.textSoft } as TextStyle,
  reviewSubmitBtn: {
    flex: 2,
    height: 44,
    borderRadius: RADIUS.pill,
    backgroundColor: V2_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  reviewSubmitText: { color: '#FFF', fontSize: 15, fontWeight: '700' } as TextStyle,

  // Action Bar
  actionBar: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#FFFFFF',
    ...BUBBLE_SHADOWS.lg,
  } as ViewStyle,
  primaryBtn: { flex: 2, overflow: 'hidden' as const, borderRadius: RADIUS.pill } as ViewStyle,
  primaryBtnGradient: {
    height: 50,
    borderRadius: RADIUS.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  primaryBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' } as TextStyle,
  solidActionBtn: {
    flex: 1,
    height: 50,
    borderRadius: RADIUS.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  rejectBtn: {
    flex: 1,
    height: 50,
    borderRadius: RADIUS.pill,
    borderWidth: 1.5,
    borderColor: V2_COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  rejectText: { fontSize: 16, fontWeight: '600', color: V2_COLORS.secondary } as TextStyle,
  cancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: RADIUS.pill,
    borderWidth: 1.5,
    borderColor: V2_COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  cancelText: { fontSize: 16, fontWeight: '600', color: V2_COLORS.secondary } as TextStyle,
});
