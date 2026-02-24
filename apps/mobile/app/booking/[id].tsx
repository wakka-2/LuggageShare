import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';
import {
  useBooking,
  useAcceptBooking,
  useRejectBooking,
  useCancelBooking,
} from '@/hooks/useBookings';
import { useBookingReview, useCreateReview } from '@/hooks/useReviews';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/common';
import { StarRating } from '@/components/common/StarRating';

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

  const { data: booking, isLoading } = useBooking(id ?? null);
  const { data: existingReview } = useBookingReview(id ?? null);
  const acceptBooking = useAcceptBooking();
  const rejectBooking = useRejectBooking();
  const cancelBooking = useCancelBooking();
  const createReview = useCreateReview();

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);

  if (isLoading || !booking) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
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
    Alert.alert(t('booking.acceptBooking'), t('booking.acceptBookingConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('booking.accept'), onPress: () => acceptBooking.mutate(booking.id) },
    ]);
  };

  const handleReject = () => {
    Alert.alert(t('booking.rejectBooking'), t('booking.rejectBookingConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('booking.reject'),
        style: 'destructive',
        onPress: () => rejectBooking.mutate(booking.id),
      },
    ]);
  };

  const handleCancel = () => {
    Alert.alert(t('booking.cancelBooking'), t('booking.cancelBookingConfirm'), [
      { text: t('booking.no'), style: 'cancel' },
      {
        text: t('booking.yesCancel'),
        style: 'destructive',
        onPress: () => cancelBooking.mutate(booking.id),
      },
    ]);
  };

  const handleSubmitReview = async () => {
    if (reviewRating === 0) {
      Alert.alert(t('common.errorTitle'), t('booking.selectRating'));
      return;
    }
    try {
      await createReview.mutateAsync({
        bookingId: booking.id,
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
      });
      setShowReviewForm(false);
      Alert.alert(t('booking.thankYou'), t('booking.reviewSubmitted'));
    } catch {
      Alert.alert(t('common.errorTitle'), t('booking.failedReview'));
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
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusLabel, { color: statusColor }]}>
            {statusKey ? t(statusKey) : booking.status}
          </Text>
        </Animated.View>

        {/* Route */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
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
        </View>

        {/* Price Summary */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
              {t('booking.weight')}
            </Text>
            <Text style={[styles.priceValue, { color: colors.text }]}>
              {Number(booking.totalWeight)} kg
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.priceRow}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>{t('booking.total')}</Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>
              {Number(booking.totalPrice)} {booking.currency}
            </Text>
          </View>
        </View>

        {/* Other User */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
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
                <View style={styles.verifiedRow}>
                  <Ionicons name="shield-checkmark" size={14} color={colors.primary} />
                  <Text style={[styles.verifiedText, { color: colors.primary }]}>
                    {t('common.verified')}
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              onPress={() => router.push(`/chat/${booking.id}`)}
              style={[styles.chatBtn, { borderColor: colors.primary }]}
            >
              <Ionicons name="chatbubble-outline" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

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
                  carrierIban: (booking.carrier as any).iban || '',
                  carrierBankName: (booking.carrier as any).bankName || '',
                },
              })
            }
            style={[styles.acceptBtn, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="card-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.acceptText}>{t('payment.title')}</Text>
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
