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

import { useTheme } from '@/hooks/useTheme';
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
import { Avatar } from '@/components/common';
import { StarRating } from '@/components/common/StarRating';
import { StatusTimeline, LiveIndicator } from '@/components/status';
import { VerificationBadge } from '@/components/trust';
import { SkeletonLoader } from '@/components/animations';

const STATUS_COLORS: Record<string, string> = {
  pending: '#F59E0B',
  accepted: '#3B82F6',
  picked_up: '#8B5CF6',
  in_transit: '#6366F1',
  delivered: '#10B981',
  rejected: '#EF4444',
  cancelled: '#6B7280',
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
  const { colors } = useTheme();
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
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerBtn} />
          <SkeletonLoader width={120} height={18} borderRadius={6} />
          <View style={styles.headerBtn} />
        </View>
        <View style={styles.scrollContent}>
          <SkeletonLoader width="100%" height={48} borderRadius={14} style={{ marginBottom: 16 }} />
          <SkeletonLoader
            width="100%"
            height={120}
            borderRadius={16}
            style={{ marginBottom: 16 }}
          />
          <SkeletonLoader
            width="100%"
            height={100}
            borderRadius={16}
            style={{ marginBottom: 16 }}
          />
          <SkeletonLoader width="100%" height={80} borderRadius={16} />
        </View>
      </SafeAreaView>
    );
  }

  if (!booking) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loading}>
          <Text style={{ color: colors.textSecondary }}>{t('listing.notFound')}</Text>
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
            <Text style={{ color: colors.primary, fontWeight: '600' }}>{t('listing.goBack')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isCarrier = user?.id === booking.carrierId;
  const isSender = user?.id === booking.senderId;
  const statusColor = STATUS_COLORS[booking.status] || colors.textSecondary;
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('booking.details')}</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Status */}
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
          <Animated.View
            entering={FadeInUp.delay(150).springify()}
            style={[styles.card, { backgroundColor: colors.card }]}
          >
            <Text style={[styles.cardTitle, { color: colors.text }]}>
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
        <Animated.View
          entering={FadeInUp.delay(200).springify()}
          style={[styles.card, { backgroundColor: colors.card }]}
        >
          <View style={styles.routeRow}>
            <Text style={[styles.city, { color: colors.text }]}>
              {booking.listing.departureCity}
            </Text>
            <Ionicons
              name="airplane"
              size={18}
              color={colors.primary}
              style={{ marginHorizontal: 10 }}
            />
            <Text style={[styles.city, { color: colors.text }]}>{booking.listing.arrivalCity}</Text>
          </View>
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>
            {new Date(booking.listing.departureDate).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
        </Animated.View>

        {/* Price Summary */}
        <Animated.View
          entering={FadeInUp.delay(250).springify()}
          style={[styles.card, { backgroundColor: colors.card }]}
        >
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
              {t('booking.weight')}
            </Text>
            <Text style={[styles.priceValue, { color: colors.text }]}>
              {Number(booking.totalWeight) || 0} kg
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.priceRow}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>{t('booking.total')}</Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>
              {Number(booking.totalPrice) || 0} {booking.currency || 'SAR'}
            </Text>
          </View>
        </Animated.View>

        {/* Items with Photos */}
        {booking.items && booking.items.length > 0 && (
          <Animated.View
            entering={FadeInUp.delay(300).springify()}
            style={[styles.card, { backgroundColor: colors.card }]}
          >
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              {t('booking.items')} ({booking.items.length})
            </Text>
            {booking.items.map((item, idx) => (
              <View
                key={item.id}
                style={[
                  styles.itemRow,
                  idx < booking.items.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                  {item.description && (
                    <Text style={[styles.itemDesc, { color: colors.textSecondary }]}>
                      {item.description}
                    </Text>
                  )}
                  <View style={styles.itemMeta}>
                    <Text style={[styles.itemMetaText, { color: colors.textSecondary }]}>
                      {Number(item.weight)} kg
                    </Text>
                    {item.value > 0 && (
                      <Text style={[styles.itemMetaText, { color: colors.textSecondary }]}>
                        {Number(item.value)} SAR
                      </Text>
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
        <Animated.View
          entering={FadeInUp.delay(350).springify()}
          style={[styles.card, { backgroundColor: colors.card }]}
        >
          <Text style={[styles.cardTitle, { color: colors.text }]}>
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
              <Text style={[styles.userName, { color: colors.text }]}>{otherUser.name}</Text>
              {otherUser.isVerified && (
                <VerificationBadge type="verified" size="small" animated={false} />
              )}
            </View>
            <TouchableOpacity
              onPress={() => router.push(`/chat/${booking.id}`)}
              style={[styles.chatBtn, { borderColor: colors.primary }]}
            >
              <Ionicons name="chatbubble-outline" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Existing Review */}
        {existingReview && (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{t('booking.review')}</Text>
            <View style={styles.reviewDisplay}>
              <StarRating rating={existingReview.rating} size={22} />
              {existingReview.comment && (
                <Text style={[styles.reviewComment, { color: colors.text }]}>
                  {existingReview.comment}
                </Text>
              )}
              <Text style={[styles.reviewAuthor, { color: colors.textSecondary }]}>
                {t('booking.reviewBy')} {existingReview.reviewer.name}
              </Text>
            </View>
          </View>
        )}

        {/* Review Form */}
        {canReview && !showReviewForm && (
          <TouchableOpacity
            onPress={() => setShowReviewForm(true)}
            style={[
              styles.reviewPrompt,
              { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' },
            ]}
          >
            <Ionicons name="star-outline" size={24} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.reviewPromptTitle, { color: colors.primary }]}>
                {t('booking.rateExperience')}
              </Text>
              <Text style={[styles.reviewPromptDesc, { color: colors.textSecondary }]}>
                {t('booking.shareExperience')}
              </Text>
            </View>
            <Ionicons
              name={isRTL ? 'chevron-back' : 'chevron-forward'}
              size={20}
              color={colors.primary}
            />
          </TouchableOpacity>
        )}

        {canReview && showReviewForm && (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              {t('booking.yourReview')}
            </Text>
            <View style={styles.reviewFormContent}>
              <StarRating rating={reviewRating} onRate={setReviewRating} size={36} />
              <TextInput
                style={[
                  styles.reviewInput,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                value={reviewComment}
                onChangeText={setReviewComment}
                placeholder={t('booking.addComment')}
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
                maxLength={500}
                textAlign={isRTL ? 'right' : 'left'}
                textAlignVertical="top"
              />
              <View style={styles.reviewActions}>
                <TouchableOpacity
                  onPress={() => setShowReviewForm(false)}
                  style={[styles.reviewCancelBtn, { borderColor: colors.border }]}
                >
                  <Text style={[styles.reviewCancelText, { color: colors.textSecondary }]}>
                    {t('common.cancel')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSubmitReview}
                  disabled={createReview.isPending || reviewRating === 0}
                  style={[
                    styles.reviewSubmitBtn,
                    { backgroundColor: colors.primary, opacity: reviewRating === 0 ? 0.5 : 1 },
                  ]}
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
        <View
          style={[
            styles.actionBar,
            { backgroundColor: colors.card, borderTopColor: colors.border },
          ]}
        >
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
            style={[styles.acceptBtn, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="card-outline" size={20} color="#FFF" style={{ marginEnd: 8 }} />
            <Text style={styles.acceptText}>{t('payment.title')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Carrier: Confirm Payment */}
      {isCarrier && booking.paymentStatus === 'proof_submitted' && (
        <View
          style={[
            styles.actionBar,
            { backgroundColor: colors.card, borderTopColor: colors.border },
          ]}
        >
          <TouchableOpacity
            onPress={handleConfirmPayment}
            disabled={confirmPayment.isPending}
            style={[
              styles.acceptBtn,
              { backgroundColor: '#10B981', opacity: confirmPayment.isPending ? 0.7 : 1 },
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
                <Text style={styles.acceptText}>{t('booking.confirmPayment')}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Carrier Status Progression */}
      {isCarrier && booking.status === 'accepted' && (
        <View
          style={[
            styles.actionBar,
            { backgroundColor: colors.card, borderTopColor: colors.border },
          ]}
        >
          <TouchableOpacity
            onPress={handleMarkPickedUp}
            disabled={markPickedUp.isPending}
            style={[
              styles.acceptBtn,
              { backgroundColor: '#8B5CF6', opacity: markPickedUp.isPending ? 0.7 : 1 },
            ]}
          >
            {markPickedUp.isPending ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                <Ionicons name="cube-outline" size={20} color="#FFF" style={{ marginEnd: 8 }} />
                <Text style={styles.acceptText}>{t('booking.markPickedUp')}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {isCarrier && booking.status === 'picked_up' && (
        <View
          style={[
            styles.actionBar,
            { backgroundColor: colors.card, borderTopColor: colors.border },
          ]}
        >
          <TouchableOpacity
            onPress={handleMarkInTransit}
            disabled={markInTransit.isPending}
            style={[
              styles.acceptBtn,
              { backgroundColor: '#6366F1', opacity: markInTransit.isPending ? 0.7 : 1 },
            ]}
          >
            {markInTransit.isPending ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                <Ionicons name="airplane-outline" size={20} color="#FFF" style={{ marginEnd: 8 }} />
                <Text style={styles.acceptText}>{t('booking.markInTransit')}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {isCarrier && booking.status === 'in_transit' && (
        <View
          style={[
            styles.actionBar,
            { backgroundColor: colors.card, borderTopColor: colors.border },
          ]}
        >
          <TouchableOpacity
            onPress={handleMarkDelivered}
            disabled={markDelivered.isPending}
            style={[
              styles.acceptBtn,
              { backgroundColor: '#10B981', opacity: markDelivered.isPending ? 0.7 : 1 },
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
                <Text style={styles.acceptText}>{t('booking.markDelivered')}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Action Buttons */}
      {booking.status === 'pending' && (
        <View
          style={[
            styles.actionBar,
            { backgroundColor: colors.card, borderTopColor: colors.border },
          ]}
        >
          {isCarrier && (
            <>
              <TouchableOpacity
                onPress={handleReject}
                style={[styles.rejectBtn, { borderColor: '#EF4444' }]}
              >
                <Text style={[styles.rejectText, { color: '#EF4444' }]}>{t('booking.reject')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAccept}
                style={[styles.acceptBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.acceptText}>{t('booking.accept')}</Text>
              </TouchableOpacity>
            </>
          )}
          {isSender && (
            <TouchableOpacity
              onPress={handleCancel}
              style={[styles.cancelBtn, { borderColor: '#EF4444' }]}
            >
              <Text style={[styles.cancelText, { color: '#EF4444' }]}>
                {t('booking.cancelBooking')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 } as ViewStyle,
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' } as ViewStyle,
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
  scrollContent: { padding: 16, paddingBottom: 100 } as ViewStyle,

  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    gap: 10,
    marginBottom: 16,
  } as ViewStyle,
  statusDot: { width: 10, height: 10, borderRadius: 5 } as ViewStyle,
  statusLabel: { fontSize: 16, fontWeight: '700' } as TextStyle,

  card: { borderRadius: 16, padding: 20, marginBottom: 16 } as ViewStyle,
  cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 } as TextStyle,
  routeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 } as ViewStyle,
  city: { fontSize: 18, fontWeight: '700' } as TextStyle,
  dateText: { fontSize: 14 } as TextStyle,

  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  } as ViewStyle,
  priceLabel: { fontSize: 14 } as TextStyle,
  priceValue: { fontSize: 14, fontWeight: '500' } as TextStyle,
  divider: { height: 1, marginVertical: 8 } as ViewStyle,
  totalLabel: { fontSize: 16, fontWeight: '700' } as TextStyle,
  totalValue: { fontSize: 20, fontWeight: '700' } as TextStyle,

  // Item display
  itemRow: { paddingVertical: 12 } as ViewStyle,
  itemInfo: { marginBottom: 8 } as ViewStyle,
  itemName: { fontSize: 15, fontWeight: '600' } as TextStyle,
  itemDesc: { fontSize: 13, marginTop: 2 } as TextStyle,
  itemMeta: { flexDirection: 'row', gap: 12, marginTop: 4 } as ViewStyle,
  itemMetaText: { fontSize: 12, fontWeight: '500' } as TextStyle,
  itemImageScroll: { marginTop: 4 } as ViewStyle,
  itemThumb: {
    width: 72,
    height: 72,
    borderRadius: 10,
    marginEnd: 8,
  } as ImageStyle,

  userRow: { flexDirection: 'row', alignItems: 'center', gap: 12 } as ViewStyle,
  userName: { fontSize: 16, fontWeight: '600' } as TextStyle,
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 } as ViewStyle,
  verifiedText: { fontSize: 12, fontWeight: '600' } as TextStyle,
  chatBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  // Review display
  reviewDisplay: { gap: 8 } as ViewStyle,
  reviewComment: { fontSize: 14, lineHeight: 21 } as TextStyle,
  reviewAuthor: { fontSize: 12 } as TextStyle,

  // Review prompt
  reviewPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    gap: 12,
    marginBottom: 16,
    borderWidth: 1,
  } as ViewStyle,
  reviewPromptTitle: { fontSize: 15, fontWeight: '600' } as TextStyle,
  reviewPromptDesc: { fontSize: 13, marginTop: 2 } as TextStyle,

  // Review form
  reviewFormContent: { gap: 16, alignItems: 'center' } as ViewStyle,
  reviewInput: {
    width: '100%',
    minHeight: 80,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
  } as TextStyle,
  reviewActions: { flexDirection: 'row', gap: 12, width: '100%' } as ViewStyle,
  reviewCancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  reviewCancelText: { fontSize: 15, fontWeight: '600' } as TextStyle,
  reviewSubmitBtn: {
    flex: 2,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  reviewSubmitText: { color: '#FFF', fontSize: 15, fontWeight: '700' } as TextStyle,

  actionBar: { flexDirection: 'row', padding: 16, gap: 12, borderTopWidth: 1 } as ViewStyle,
  rejectBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  rejectText: { fontSize: 16, fontWeight: '600' } as TextStyle,
  acceptBtn: {
    flex: 2,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  acceptText: { color: '#FFF', fontSize: 16, fontWeight: '700' } as TextStyle,
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  cancelText: { fontSize: 16, fontWeight: '600' } as TextStyle,
});
