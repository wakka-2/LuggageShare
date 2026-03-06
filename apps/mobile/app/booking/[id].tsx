import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';
import { useGoBack } from '@/hooks/useGoBack';
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
import { SolidCard, Avatar, ScreenHeader, GradientButton } from '@/components/common';
import { StarRating } from '@/components/common/StarRating';
import { StatusTimeline, LiveIndicator } from '@/components/status';
import { VerificationBadge } from '@/components/trust';
import { SkeletonLoader } from '@/components/animations';
import {
  ThemeColors,
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
  SPACING,
  SECTION_TINTS,
} from '@/providers/ThemeProvider';

// ─── Status color map ────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  pending: '#F59E0B',
  accepted: '#3B82F6',
  picked_up: '#8B5CF6',
  in_transit: '#6366F1',
  delivered: '#10B981',
  rejected: '#EF4444',
  cancelled: '#6B7280',
};

const STATUS_TINTS: Record<string, string> = {
  pending: SECTION_TINTS.amber,
  accepted: SECTION_TINTS.blue,
  picked_up: SECTION_TINTS.purple,
  in_transit: SECTION_TINTS.purple,
  delivered: SECTION_TINTS.green,
  rejected: SECTION_TINTS.pink,
  cancelled: SECTION_TINTS.neutral,
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

// ─── Component ───────────────────────────────────────────
export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const goBack = useGoBack();
  const { user } = useAuth();
  const isRTL = i18n.language === 'ar';

  // ── Data fetching ──────────────────────────────────────
  const { data: apiBooking, isLoading } = useBooking(id ?? null);
  const { data: existingReview } = useBookingReview(id ?? null);

  const mockMatch =
    !apiBooking && id && user?.id ? getMockBookings(user.id).find((b) => b.id === id) : undefined;
  const booking = apiBooking ?? mockMatch;

  // ── Mutations ──────────────────────────────────────────
  const acceptBooking = useAcceptBooking();
  const rejectBooking = useRejectBooking();
  const cancelBooking = useCancelBooking();
  const confirmPayment = useConfirmPayment();
  const markPickedUp = useMarkPickedUp();
  const markInTransit = useMarkInTransit();
  const markDelivered = useMarkDelivered();
  const createReview = useCreateReview();

  // ── Local state ────────────────────────────────────────
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);

  // ── Loading skeleton ───────────────────────────────────
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
        <View style={[styles.skeletonHeader, { borderBottomColor: colors.border }]}>
          <View style={styles.skeletonHeaderBtn} />
          <SkeletonLoader width={120} height={18} borderRadius={RADIUS.badge} />
          <View style={styles.skeletonHeaderBtn} />
        </View>
        <View style={styles.scrollContent}>
          <SkeletonLoader
            width="100%"
            height={48}
            borderRadius={RADIUS.button}
            style={{ marginBottom: SPACING[4] }}
          />
          <SkeletonLoader
            width="100%"
            height={120}
            borderRadius={RADIUS.card}
            style={{ marginBottom: SPACING[4] }}
          />
          <SkeletonLoader
            width="100%"
            height={100}
            borderRadius={RADIUS.card}
            style={{ marginBottom: SPACING[4] }}
          />
          <SkeletonLoader width="100%" height={80} borderRadius={RADIUS.card} />
        </View>
      </SafeAreaView>
    );
  }

  // ── Not found ──────────────────────────────────────────
  if (!booking) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
        <View style={styles.emptyState}>
          <View style={[styles.emptyIcon, { backgroundColor: SECTION_TINTS.neutral }]}>
            <Ionicons name="document-outline" size={32} color={colors.textMuted} />
          </View>
          <Text style={[TYPOGRAPHY.body, { color: colors.textSecondary, marginTop: SPACING[3] }]}>
            {t('listing.notFound')}
          </Text>
          <TouchableOpacity
            onPress={goBack}
            style={[styles.goBackBtn, { backgroundColor: SECTION_TINTS.purple }]}
            accessibilityRole="button"
            accessibilityLabel={t('listing.goBack')}
          >
            <Text style={[TYPOGRAPHY.body, { color: colors.primary, fontWeight: '600' }]}>
              {t('listing.goBack')}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Derived data ───────────────────────────────────────
  const isCarrier = user?.id === booking.carrierId;
  const isSender = user?.id === booking.senderId;
  const statusColor = STATUS_COLORS[booking.status] || colors.textSecondary;
  const statusTint = STATUS_TINTS[booking.status] || SECTION_TINTS.neutral;
  const statusKey = BOOKING_STATUS_KEYS[booking.status];
  const otherUser = isCarrier ? booking.sender : booking.carrier;
  const canReview = booking.status === 'delivered' && !existingReview;

  // ── Handlers ───────────────────────────────────────────
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

  // ── Determine which bottom bar to show ─────────────────
  const showPendingActions = booking.status === 'pending';
  const showPaymentBtn = booking.status === 'accepted' && isSender;
  const showConfirmPaymentBtn = isCarrier && booking.paymentStatus === 'proof_submitted';
  const showPickedUpBtn = isCarrier && booking.status === 'accepted';
  const showInTransitBtn = isCarrier && booking.status === 'picked_up';
  const showDeliveredBtn = isCarrier && booking.status === 'in_transit';
  const hasBottomBar =
    showPendingActions ||
    showPaymentBtn ||
    showConfirmPaymentBtn ||
    showPickedUpBtn ||
    showInTransitBtn ||
    showDeliveredBtn;

  // ── Render ─────────────────────────────────────────────
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
      <ScreenHeader title={t('booking.details')} onBack={goBack} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          hasBottomBar && { paddingBottom: SPACING[9] + SPACING[8] },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Status Badge (V2 — colored tint card) ──────────── */}
        <Animated.View entering={FadeInDown.duration(400).springify()}>
          <SolidCard tint={statusTint} accentColor={statusColor} style={styles.statusCard}>
            <View style={styles.statusContent}>
              {booking.status === 'in_transit' ? (
                <LiveIndicator
                  color={statusColor}
                  label={statusKey ? t(statusKey) : booking.status}
                  size="medium"
                />
              ) : (
                <View style={styles.statusRow}>
                  <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                  <Text style={[TYPOGRAPHY.h3, { color: statusColor }]}>
                    {statusKey ? t(statusKey) : booking.status}
                  </Text>
                </View>
              )}
            </View>
          </SolidCard>
        </Animated.View>

        {/* ── Status Timeline ─────────────────────────────── */}
        {!['rejected', 'cancelled'].includes(booking.status) && (
          <Animated.View entering={FadeInDown.delay(80).duration(400).springify()}>
            <SolidCard style={styles.card}>
              <View style={styles.cardTitleRow}>
                <View style={[styles.cardTitleIcon, { backgroundColor: SECTION_TINTS.blue }]}>
                  <Ionicons name="git-branch-outline" size={14} color="#3B82F6" />
                </View>
                <Text
                  style={[TYPOGRAPHY.caption, styles.cardTitle, { color: colors.textSecondary }]}
                >
                  {t('booking.progress', { defaultValue: 'Progress' })}
                </Text>
              </View>
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
            </SolidCard>
          </Animated.View>
        )}

        {/* ── Route Card (V2 — blue tint) ─────────────────── */}
        <Animated.View entering={FadeInDown.delay(160).duration(400).springify()}>
          <SolidCard tint={SECTION_TINTS.blue} accentColor="#3B82F6" style={styles.card}>
            <View style={styles.cardTitleRow}>
              <View style={[styles.cardTitleIcon, { backgroundColor: '#DBEAFE' }]}>
                <Ionicons name="navigate-outline" size={14} color="#3B82F6" />
              </View>
              <Text style={[TYPOGRAPHY.caption, styles.cardTitle, { color: colors.textSecondary }]}>
                {t('booking.route', { defaultValue: 'Route' })}
              </Text>
            </View>
            <View style={styles.routeRow}>
              <View style={styles.routeCity}>
                <View style={[styles.routeDot, { backgroundColor: colors.primary }]} />
                <Text style={[TYPOGRAPHY.h3, { color: colors.text }]}>
                  {booking.listing.departureCity}
                </Text>
              </View>
              <View style={styles.routeLine}>
                <View style={[styles.routeDash, { backgroundColor: '#3B82F6' + '40' }]} />
                <View style={[styles.routeAirplane, { backgroundColor: '#DBEAFE' }]}>
                  <Ionicons name="airplane" size={16} color="#3B82F6" />
                </View>
                <View style={[styles.routeDash, { backgroundColor: '#3B82F6' + '40' }]} />
              </View>
              <View style={[styles.routeCity, { alignItems: 'flex-end' }]}>
                <View style={[styles.routeDot, { backgroundColor: colors.success }]} />
                <Text style={[TYPOGRAPHY.h3, { color: colors.text }]}>
                  {booking.listing.arrivalCity}
                </Text>
              </View>
            </View>
            <View style={[styles.dateChip, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="calendar-outline" size={12} color="#3B82F6" />
              <Text style={[TYPOGRAPHY.small, { color: '#3B82F6' }]}>
                {new Date(booking.listing.departureDate).toLocaleDateString(
                  isRTL ? 'ar-SA' : 'en-US',
                  { day: 'numeric', month: 'long', year: 'numeric' }
                )}
              </Text>
            </View>
          </SolidCard>
        </Animated.View>

        {/* ── Price Summary (V2 — green tint) ────────────────── */}
        <Animated.View entering={FadeInDown.delay(240).duration(400).springify()}>
          <SolidCard tint={SECTION_TINTS.green} accentColor="#00C48C" style={styles.card}>
            <View style={styles.cardTitleRow}>
              <View style={[styles.cardTitleIcon, { backgroundColor: '#D1FAE5' }]}>
                <Ionicons name="wallet-outline" size={14} color="#00C48C" />
              </View>
              <Text style={[TYPOGRAPHY.caption, styles.cardTitle, { color: colors.textSecondary }]}>
                {t('booking.priceSummary', { defaultValue: 'Price Summary' })}
              </Text>
            </View>
            <View style={styles.priceRow}>
              <View style={styles.priceLabel}>
                <View style={[styles.priceIcon, { backgroundColor: SECTION_TINTS.purple }]}>
                  <Ionicons name="scale-outline" size={12} color={colors.primary} />
                </View>
                <Text style={[TYPOGRAPHY.caption, { color: colors.textSecondary }]}>
                  {t('booking.weight')}
                </Text>
              </View>
              <Text style={[TYPOGRAPHY.body, { color: colors.text, fontWeight: '600' }]}>
                {Number(booking.totalWeight) || 0} kg
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: '#00C48C' + '20' }]} />
            <View style={styles.priceRow}>
              <Text style={[TYPOGRAPHY.h3, { color: colors.text }]}>{t('booking.total')}</Text>
              <Text style={[TYPOGRAPHY.h2, { color: '#00C48C' }]}>
                {Number(booking.totalPrice) || 0} {booking.currency || 'SAR'}
              </Text>
            </View>
          </SolidCard>
        </Animated.View>

        {/* ── Items with Photos ────────────────────────────── */}
        {booking.items && booking.items.length > 0 && (
          <Animated.View entering={FadeInDown.delay(320).duration(400).springify()}>
            <SolidCard style={styles.card}>
              <View style={styles.cardTitleRow}>
                <View style={[styles.cardTitleIcon, { backgroundColor: SECTION_TINTS.amber }]}>
                  <Ionicons name="cube-outline" size={14} color="#F59E0B" />
                </View>
                <Text
                  style={[TYPOGRAPHY.caption, styles.cardTitle, { color: colors.textSecondary }]}
                >
                  {t('booking.items')} ({booking.items.length})
                </Text>
              </View>
              {booking.items.map((item: any, idx: number) => (
                <View
                  key={item.id}
                  style={[
                    styles.itemRow,
                    idx < booking.items.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: colors.borderSubtle,
                    },
                  ]}
                >
                  <View style={styles.itemInfo}>
                    <Text style={[TYPOGRAPHY.body, { color: colors.text, fontWeight: '600' }]}>
                      {item.name}
                    </Text>
                    {item.description && (
                      <Text
                        style={[
                          TYPOGRAPHY.caption,
                          { color: colors.textSecondary, marginTop: SPACING[1] },
                        ]}
                      >
                        {item.description}
                      </Text>
                    )}
                    <View style={styles.itemMeta}>
                      <View
                        style={[styles.itemMetaChip, { backgroundColor: SECTION_TINTS.purple }]}
                      >
                        <Ionicons name="scale-outline" size={11} color={colors.primary} />
                        <Text style={[TYPOGRAPHY.small, { color: colors.primary }]}>
                          {Number(item.weight)} kg
                        </Text>
                      </View>
                      {item.value > 0 && (
                        <View
                          style={[styles.itemMetaChip, { backgroundColor: SECTION_TINTS.green }]}
                        >
                          <Ionicons name="pricetag-outline" size={11} color="#00C48C" />
                          <Text style={[TYPOGRAPHY.small, { color: '#00C48C' }]}>
                            {Number(item.value)} SAR
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                  {item.imageUrls && item.imageUrls.length > 0 && (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.itemImageScroll}
                    >
                      {item.imageUrls.map((url: string, imgIdx: number) => (
                        <Image key={imgIdx} source={{ uri: url }} style={styles.itemThumb} />
                      ))}
                    </ScrollView>
                  )}
                </View>
              ))}
            </SolidCard>
          </Animated.View>
        )}

        {/* ── Other User (V2 — with colored chat button) ──── */}
        <Animated.View entering={FadeIn.delay(400).duration(300)}>
          <SolidCard style={styles.card}>
            <View style={styles.cardTitleRow}>
              <View style={[styles.cardTitleIcon, { backgroundColor: SECTION_TINTS.purple }]}>
                <Ionicons name="person-outline" size={14} color={colors.primary} />
              </View>
              <Text style={[TYPOGRAPHY.caption, styles.cardTitle, { color: colors.textSecondary }]}>
                {isCarrier ? t('booking.sender') : t('booking.carrier')}
              </Text>
            </View>
            <View style={styles.userRow}>
              <Avatar
                name={otherUser.name}
                avatarUrl={otherUser.avatarUrl}
                size={44}
                isVerified={otherUser.isVerified}
              />
              <View style={{ flex: 1 }}>
                <Text style={[TYPOGRAPHY.body, { color: colors.text, fontWeight: '600' }]}>
                  {otherUser.name}
                </Text>
                {otherUser.isVerified && (
                  <VerificationBadge type="verified" size="small" animated={false} />
                )}
              </View>
              <TouchableOpacity
                onPress={() => router.push(`/chat/${booking.id}`)}
                style={[
                  styles.chatBtn,
                  {
                    borderColor: colors.primary + '30',
                    borderBottomColor: colors.primary,
                    backgroundColor: SECTION_TINTS.purple,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel={t('booking.openChat', { defaultValue: 'Open chat' })}
              >
                <Ionicons name="chatbubble-outline" size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </SolidCard>
        </Animated.View>

        {/* ── Existing Review ─────────────────────────────── */}
        {existingReview && (
          <Animated.View entering={FadeIn.delay(480).duration(300)}>
            <SolidCard tint={SECTION_TINTS.amber} accentColor="#F59E0B" style={styles.card}>
              <View style={styles.cardTitleRow}>
                <View style={[styles.cardTitleIcon, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="star" size={14} color="#F59E0B" />
                </View>
                <Text
                  style={[TYPOGRAPHY.caption, styles.cardTitle, { color: colors.textSecondary }]}
                >
                  {t('booking.review')}
                </Text>
              </View>
              <View style={styles.reviewDisplay}>
                <StarRating rating={existingReview.rating} size={22} />
                {existingReview.comment && (
                  <Text
                    style={[
                      TYPOGRAPHY.caption,
                      { color: colors.text, lineHeight: 21, marginTop: SPACING[2] },
                    ]}
                  >
                    {existingReview.comment}
                  </Text>
                )}
                <Text
                  style={[TYPOGRAPHY.small, { color: colors.textTertiary, marginTop: SPACING[2] }]}
                >
                  {t('booking.reviewBy')} {existingReview.reviewer.name}
                </Text>
              </View>
            </SolidCard>
          </Animated.View>
        )}

        {/* ── Review Prompt (tap to expand) ────────────────── */}
        {canReview && !showReviewForm && (
          <Animated.View entering={FadeIn.delay(480).duration(300)}>
            <TouchableOpacity
              onPress={() => setShowReviewForm(true)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={t('booking.rateExperience')}
            >
              <SolidCard
                tint={SECTION_TINTS.purple}
                accentColor={colors.primary}
                style={styles.reviewPromptCard}
              >
                <View style={styles.reviewPromptRow}>
                  <View
                    style={[styles.reviewPromptIcon, { backgroundColor: colors.primary + '15' }]}
                  >
                    <Ionicons name="star-outline" size={22} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[TYPOGRAPHY.body, { color: colors.primary, fontWeight: '600' }]}>
                      {t('booking.rateExperience')}
                    </Text>
                    <Text
                      style={[
                        TYPOGRAPHY.caption,
                        { color: colors.textSecondary, marginTop: SPACING[1] },
                      ]}
                    >
                      {t('booking.shareExperience')}
                    </Text>
                  </View>
                  <Ionicons
                    name={isRTL ? 'chevron-back' : 'chevron-forward'}
                    size={20}
                    color={colors.primary}
                  />
                </View>
              </SolidCard>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* ── Review Form ─────────────────────────────────── */}
        {canReview && showReviewForm && (
          <Animated.View entering={FadeInDown.duration(400).springify()}>
            <SolidCard style={styles.card}>
              <View style={styles.cardTitleRow}>
                <View style={[styles.cardTitleIcon, { backgroundColor: SECTION_TINTS.amber }]}>
                  <Ionicons name="create-outline" size={14} color="#F59E0B" />
                </View>
                <Text
                  style={[TYPOGRAPHY.caption, styles.cardTitle, { color: colors.textSecondary }]}
                >
                  {t('booking.yourReview')}
                </Text>
              </View>
              <View style={styles.reviewFormContent}>
                <StarRating rating={reviewRating} onRate={setReviewRating} size={36} />
                <TextInput
                  style={[
                    styles.reviewInput,
                    {
                      backgroundColor: SECTION_TINTS.neutral,
                      color: colors.text,
                      borderColor: colors.borderSubtle,
                      ...TYPOGRAPHY.caption,
                    },
                  ]}
                  value={reviewComment}
                  onChangeText={setReviewComment}
                  placeholder={t('booking.addComment')}
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={3}
                  maxLength={500}
                  textAlign={isRTL ? 'right' : 'left'}
                  textAlignVertical="top"
                  accessibilityLabel={t('booking.addComment')}
                />
                <View style={styles.reviewActions}>
                  <TouchableOpacity
                    onPress={() => setShowReviewForm(false)}
                    style={[
                      styles.reviewCancelBtn,
                      {
                        borderColor: colors.border,
                        borderBottomColor: colors.textMuted,
                      },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={t('common.cancel')}
                  >
                    <Text
                      style={[TYPOGRAPHY.body, { color: colors.textSecondary, fontWeight: '600' }]}
                    >
                      {t('common.cancel')}
                    </Text>
                  </TouchableOpacity>
                  <GradientButton
                    title={t('booking.submit')}
                    onPress={handleSubmitReview}
                    disabled={reviewRating === 0}
                    loading={createReview.isPending}
                    size="medium"
                    style={{ flex: 2 }}
                  />
                </View>
              </View>
            </SolidCard>
          </Animated.View>
        )}
      </ScrollView>

      {/* ── Bottom Action Bars (V2 — solid white, no blur) ── */}

      {/* Payment Button for Sender */}
      {showPaymentBtn && (
        <View
          style={[
            styles.actionBarWrapper,
            { backgroundColor: '#FFFFFF', borderTopColor: colors.border },
            SHADOWS.m as ViewStyle,
          ]}
        >
          <View style={styles.actionBarContent}>
            <GradientButton
              title={t('payment.title')}
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
              icon={<Ionicons name="card-outline" size={20} color="#FFF" />}
              size="large"
              fullWidth
            />
          </View>
        </View>
      )}

      {/* Carrier: Confirm Payment */}
      {showConfirmPaymentBtn && (
        <View
          style={[
            styles.actionBarWrapper,
            { backgroundColor: '#FFFFFF', borderTopColor: colors.border },
            SHADOWS.m as ViewStyle,
          ]}
        >
          <View style={styles.actionBarContent}>
            <GradientButton
              title={t('booking.confirmPayment')}
              onPress={handleConfirmPayment}
              loading={confirmPayment.isPending}
              disabled={confirmPayment.isPending}
              icon={<Ionicons name="checkmark-done-outline" size={20} color="#FFF" />}
              colors={['#10B981', '#059669']}
              size="large"
              fullWidth
            />
          </View>
        </View>
      )}

      {/* Carrier: Mark Picked Up */}
      {showPickedUpBtn && !showConfirmPaymentBtn && (
        <View
          style={[
            styles.actionBarWrapper,
            { backgroundColor: '#FFFFFF', borderTopColor: colors.border },
            SHADOWS.m as ViewStyle,
          ]}
        >
          <View style={styles.actionBarContent}>
            <GradientButton
              title={t('booking.markPickedUp')}
              onPress={handleMarkPickedUp}
              loading={markPickedUp.isPending}
              disabled={markPickedUp.isPending}
              icon={<Ionicons name="cube-outline" size={20} color="#FFF" />}
              colors={['#8B5CF6', '#7C3AED']}
              size="large"
              fullWidth
            />
          </View>
        </View>
      )}

      {/* Carrier: Mark In Transit */}
      {showInTransitBtn && (
        <View
          style={[
            styles.actionBarWrapper,
            { backgroundColor: '#FFFFFF', borderTopColor: colors.border },
            SHADOWS.m as ViewStyle,
          ]}
        >
          <View style={styles.actionBarContent}>
            <GradientButton
              title={t('booking.markInTransit')}
              onPress={handleMarkInTransit}
              loading={markInTransit.isPending}
              disabled={markInTransit.isPending}
              icon={<Ionicons name="airplane-outline" size={20} color="#FFF" />}
              colors={['#6366F1', '#4F46E5']}
              size="large"
              fullWidth
            />
          </View>
        </View>
      )}

      {/* Carrier: Mark Delivered */}
      {showDeliveredBtn && (
        <View
          style={[
            styles.actionBarWrapper,
            { backgroundColor: '#FFFFFF', borderTopColor: colors.border },
            SHADOWS.m as ViewStyle,
          ]}
        >
          <View style={styles.actionBarContent}>
            <GradientButton
              title={t('booking.markDelivered')}
              onPress={handleMarkDelivered}
              loading={markDelivered.isPending}
              disabled={markDelivered.isPending}
              icon={<Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />}
              colors={['#10B981', '#059669']}
              size="large"
              fullWidth
            />
          </View>
        </View>
      )}

      {/* Pending: Accept/Reject (carrier) or Cancel (sender) */}
      {showPendingActions && (
        <View
          style={[
            styles.actionBarWrapper,
            { backgroundColor: '#FFFFFF', borderTopColor: colors.border },
            SHADOWS.m as ViewStyle,
          ]}
        >
          <View style={styles.actionBarContent}>
            {isCarrier && (
              <>
                <TouchableOpacity
                  onPress={handleReject}
                  style={[
                    styles.rejectBtn,
                    {
                      borderColor: colors.error + '30',
                      borderBottomColor: colors.error,
                      backgroundColor: SECTION_TINTS.pink,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={t('booking.reject')}
                >
                  <Text style={[TYPOGRAPHY.body, { color: colors.error, fontWeight: '600' }]}>
                    {t('booking.reject')}
                  </Text>
                </TouchableOpacity>
                <GradientButton
                  title={t('booking.accept')}
                  onPress={handleAccept}
                  size="large"
                  style={{ flex: 2 }}
                />
              </>
            )}
            {isSender && (
              <TouchableOpacity
                onPress={handleCancel}
                style={[
                  styles.cancelBtn,
                  {
                    borderColor: colors.error + '30',
                    borderBottomColor: colors.error,
                    backgroundColor: SECTION_TINTS.pink,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel={t('booking.cancelBooking')}
              >
                <Ionicons
                  name="close-circle-outline"
                  size={20}
                  color={colors.error}
                  style={{ marginEnd: SPACING[2] }}
                />
                <Text style={[TYPOGRAPHY.body, { color: colors.error, fontWeight: '600' }]}>
                  {t('booking.cancelBooking')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

// ─── Styles (V2 — solid, colorful) ──────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
  } as ViewStyle,

  // Loading / Empty
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING[6],
  } as ViewStyle,

  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  goBackBtn: {
    marginTop: SPACING[4],
    paddingHorizontal: SPACING[5],
    paddingVertical: SPACING[3],
    borderRadius: RADIUS.pill,
  } as ViewStyle,

  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[3],
    borderBottomWidth: 1,
  } as ViewStyle,

  skeletonHeaderBtn: {
    width: 40,
    alignItems: 'center',
  } as ViewStyle,

  scrollContent: {
    padding: SPACING[4],
    paddingBottom: SPACING[9],
  } as ViewStyle,

  // Cards
  card: {
    marginBottom: SPACING[4],
  } as ViewStyle,

  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
    marginBottom: SPACING[3],
  } as ViewStyle,

  cardTitleIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  cardTitle: {
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  } as TextStyle,

  // Status card
  statusCard: {
    marginBottom: SPACING[4],
  } as ViewStyle,

  statusContent: {
    paddingStart: SPACING[1],
  } as ViewStyle,

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3],
  } as ViewStyle,

  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  } as ViewStyle,

  // Route
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING[3],
  } as ViewStyle,

  routeCity: {
    flex: 1,
    gap: SPACING[1],
  } as ViewStyle,

  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  } as ViewStyle,

  routeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[1],
    paddingHorizontal: SPACING[2],
  } as ViewStyle,

  routeDash: {
    height: 2,
    width: SPACING[5],
    borderRadius: 1,
  } as ViewStyle,

  routeAirplane: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  dateChip: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: SPACING[1],
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[1],
    borderRadius: RADIUS.pill,
  } as ViewStyle,

  // Price
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING[1],
  } as ViewStyle,

  priceLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
  } as ViewStyle,

  priceIcon: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  divider: {
    height: 1,
    marginVertical: SPACING[3],
  } as ViewStyle,

  // Items
  itemRow: {
    paddingVertical: SPACING[3],
  } as ViewStyle,

  itemInfo: {
    marginBottom: SPACING[2],
  } as ViewStyle,

  itemMeta: {
    flexDirection: 'row',
    gap: SPACING[2],
    marginTop: SPACING[2],
  } as ViewStyle,

  itemMetaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[1],
    paddingHorizontal: SPACING[2],
    paddingVertical: 2,
    borderRadius: RADIUS.pill,
  } as ViewStyle,

  itemImageScroll: {
    marginTop: SPACING[2],
  } as ViewStyle,

  itemThumb: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.button,
    marginEnd: SPACING[2],
  } as ImageStyle,

  // User
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3],
  } as ViewStyle,

  chatBtn: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderBottomWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  // Review display
  reviewDisplay: {
    gap: SPACING[1],
  } as ViewStyle,

  // Review prompt
  reviewPromptCard: {
    marginBottom: SPACING[4],
  } as ViewStyle,

  reviewPromptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3],
  } as ViewStyle,

  reviewPromptIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.button,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  // Review form
  reviewFormContent: {
    gap: SPACING[4],
    alignItems: 'center',
  } as ViewStyle,

  reviewInput: {
    width: '100%',
    minHeight: 80,
    borderRadius: RADIUS.input,
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[3],
    borderWidth: 1,
  } as TextStyle,

  reviewActions: {
    flexDirection: 'row',
    gap: SPACING[3],
    width: '100%',
  } as ViewStyle,

  reviewCancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderBottomWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  // Bottom action bar (V2 — solid white)
  actionBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
  } as ViewStyle,

  actionBarContent: {
    flexDirection: 'row',
    padding: SPACING[4],
    gap: SPACING[3],
  } as ViewStyle,

  rejectBtn: {
    flex: 1,
    height: 52,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderBottomWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  cancelBtn: {
    flex: 1,
    height: 52,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderBottomWidth: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
});
