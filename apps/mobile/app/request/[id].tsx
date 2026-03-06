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
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';
import { useGoBack } from '@/hooks/useGoBack';
import { useRequest } from '@/hooks/useRequests';
import { useRequestOffers, useAcceptOffer, useRejectOffer } from '@/hooks/useOffers';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, ScreenHeader } from '@/components/common';
import { VerificationBadge } from '@/components/trust';
import { SkeletonLoader } from '@/components/animations';
import { showAlert } from '@/lib/alert';

export default function RequestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const goBack = useGoBack();
  const { user } = useAuth();
  const isRTL = i18n.language === 'ar';

  const { data: request, isLoading } = useRequest(id ?? null);
  const { data: offers } = useRequestOffers(id ?? null);
  const acceptOffer = useAcceptOffer();
  const rejectOffer = useRejectOffer();

  const isOwner = request?.posterId === user?.id;

  const handleMakeOffer = () => {
    router.push(`/request/${id}/offer` as any);
  };

  const handleAcceptOffer = async (offerId: string) => {
    try {
      await acceptOffer.mutateAsync(offerId);
      showAlert(t('requests.offerAccepted'), 'success');
    } catch (error: any) {
      showAlert(error?.response?.data?.message || t('common.error'), 'error');
    }
  };

  const handleRejectOffer = async (offerId: string) => {
    try {
      await rejectOffer.mutateAsync(offerId);
    } catch (error: any) {
      showAlert(error?.response?.data?.message || t('common.error'), 'error');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ScreenHeader title="" onBack={goBack} />
        <View style={styles.scrollContent}>
          <SkeletonLoader
            width="100%"
            height={140}
            borderRadius={16}
            style={{ marginBottom: 16 }}
          />
          <SkeletonLoader width="100%" height={100} borderRadius={16} />
        </View>
      </SafeAreaView>
    );
  }

  if (!request) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={{ color: colors.textSecondary }}>{t('requests.notFound')}</Text>
          <TouchableOpacity onPress={goBack}>
            <Text style={{ color: colors.primary, marginTop: 12 }}>{t('common.goBack')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const neededByDate = new Date(request.neededByDate);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title={t('requests.requestDetails')} onBack={goBack} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Route Card */}
        <Animated.View
          entering={FadeIn.duration(300)}
          style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={[styles.routeRow, isRTL && { flexDirection: 'row-reverse' }]}>
            <View style={styles.cityBlock}>
              <Text style={[styles.cityCode, { color: colors.primary }]}>
                {request.departureCode || '---'}
              </Text>
              <Text style={[styles.cityName, { color: colors.text }]}>{request.departureCity}</Text>
            </View>
            <View style={styles.routeArrow}>
              <Ionicons name="cube-outline" size={20} color={colors.primary} />
              <View style={[styles.routeLine, { backgroundColor: colors.border }]} />
              <Ionicons name="location" size={16} color={colors.primary} />
            </View>
            <View style={[styles.cityBlock, { alignItems: 'flex-end' }]}>
              <Text style={[styles.cityCode, { color: colors.primary }]}>
                {request.arrivalCode || '---'}
              </Text>
              <Text style={[styles.cityName, { color: colors.text }]}>{request.arrivalCity}</Text>
            </View>
          </View>

          <View style={[styles.infoRow, { borderTopColor: colors.border }]}>
            <View style={styles.infoItem}>
              <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                {neededByDate.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="scale-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                {request.weight} kg
              </Text>
            </View>
            {request.budget && (
              <View style={styles.infoItem}>
                <Ionicons name="cash-outline" size={16} color={colors.textSecondary} />
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  {request.budget} {request.currency}
                </Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Details */}
        <Animated.View
          entering={FadeInDown.delay(100)}
          style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          {request.description && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                {t('requests.description')}
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {request.description}
              </Text>
            </View>
          )}
          {request.itemTypes && request.itemTypes.length > 0 && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                {t('requests.itemTypes')}
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {request.itemTypes.join(', ')}
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Poster Info */}
        <Animated.View
          entering={FadeInDown.delay(200)}
          style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <TouchableOpacity style={[styles.posterRow, isRTL && { flexDirection: 'row-reverse' }]}>
            <Avatar source={request.poster.avatarUrl} name={request.poster.name} size="small" />
            <View style={[styles.posterInfo, isRTL && { alignItems: 'flex-end' }]}>
              <View
                style={{
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Text style={[styles.posterName, { color: colors.text }]}>
                  {request.poster.name}
                </Text>
                {request.poster.isVerified && (
                  <VerificationBadge type="verified" size="small" animated={false} />
                )}
              </View>
              {request.poster.city && (
                <Text style={[styles.posterCity, { color: colors.textSecondary }]}>
                  {request.poster.city}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Offers List (only visible to request owner) */}
        {isOwner && offers && offers.length > 0 && (
          <Animated.View entering={FadeInDown.delay(300)}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('requests.offers')} ({offers.length})
            </Text>
            {offers.map((offer) => (
              <View
                key={offer.id}
                style={[
                  styles.card,
                  { backgroundColor: colors.card, borderColor: colors.border, marginBottom: 8 },
                ]}
              >
                <View style={[styles.offerRow, isRTL && { flexDirection: 'row-reverse' }]}>
                  <Avatar
                    source={offer.user?.avatarUrl || null}
                    name={offer.user?.name || '?'}
                    size="small"
                  />
                  <View style={{ flex: 1, marginHorizontal: 12 }}>
                    <Text style={[styles.offerName, { color: colors.text }]}>
                      {offer.user?.name}
                    </Text>
                    <Text style={[styles.offerDetail, { color: colors.textSecondary }]}>
                      {offer.offeredPrice} {offer.currency}
                    </Text>
                    {offer.message && (
                      <Text
                        style={[styles.offerMessage, { color: colors.textSecondary }]}
                        numberOfLines={2}
                      >
                        {offer.message}
                      </Text>
                    )}
                  </View>
                  {offer.status === 'pending' && (
                    <View style={styles.offerActions}>
                      <TouchableOpacity
                        onPress={() => handleAcceptOffer(offer.id)}
                        style={[styles.offerBtn, { backgroundColor: colors.primary }]}
                      >
                        <Ionicons name="checkmark" size={18} color="#fff" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleRejectOffer(offer.id)}
                        style={[styles.offerBtn, { backgroundColor: colors.error || '#dc3545' }]}
                      >
                        <Ionicons name="close" size={18} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  )}
                  {offer.status !== 'pending' && (
                    <Text
                      style={[
                        styles.offerStatus,
                        {
                          color:
                            offer.status === 'accepted' ? colors.primary : colors.textSecondary,
                        },
                      ]}
                    >
                      {t(`offers.status.${offer.status}`)}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </Animated.View>
        )}
      </ScrollView>

      {/* Bottom CTA — only for non-owners */}
      {!isOwner && request.status === 'active' && (
        <View
          style={[
            styles.bottomBar,
            { backgroundColor: colors.card, borderTopColor: colors.border },
          ]}
        >
          <TouchableOpacity
            onPress={handleMakeOffer}
            style={[styles.ctaButton, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="hand-left-outline" size={20} color="#fff" />
            <Text style={styles.ctaText}>{t('requests.offerToCarry')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 } as ViewStyle,
  scroll: { flex: 1 } as ViewStyle,
  scrollContent: { padding: 16 } as ViewStyle,
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' } as ViewStyle,
  card: { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1 } as ViewStyle,
  routeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as ViewStyle,
  cityBlock: { alignItems: 'flex-start' } as ViewStyle,
  cityCode: { fontSize: 24, fontWeight: '700' } as TextStyle,
  cityName: { fontSize: 14, marginTop: 2 } as TextStyle,
  routeArrow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 12,
  } as ViewStyle,
  routeLine: { flex: 1, height: 1 } as ViewStyle,
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
  } as ViewStyle,
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 } as ViewStyle,
  infoText: { fontSize: 13 } as TextStyle,
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  } as ViewStyle,
  detailLabel: { fontSize: 14 } as TextStyle,
  detailValue: { fontSize: 14, fontWeight: '500', flex: 1, textAlign: 'right' } as TextStyle,
  posterRow: { flexDirection: 'row', alignItems: 'center', gap: 12 } as ViewStyle,
  posterInfo: { flex: 1 } as ViewStyle,
  posterName: { fontSize: 16, fontWeight: '600' } as TextStyle,
  posterCity: { fontSize: 13, marginTop: 2 } as TextStyle,
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8, marginTop: 4 } as TextStyle,
  offerRow: { flexDirection: 'row', alignItems: 'center' } as ViewStyle,
  offerName: { fontSize: 15, fontWeight: '600' } as TextStyle,
  offerDetail: { fontSize: 13, marginTop: 2 } as TextStyle,
  offerMessage: { fontSize: 12, marginTop: 4, fontStyle: 'italic' } as TextStyle,
  offerActions: { flexDirection: 'row', gap: 8 } as ViewStyle,
  offerBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  offerStatus: { fontSize: 13, fontWeight: '500' } as TextStyle,
  bottomBar: { padding: 16, borderTopWidth: 1 } as ViewStyle,
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  } as ViewStyle,
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '600' } as TextStyle,
});
