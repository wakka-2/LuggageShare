import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { V2_COLORS, RADIUS, BUBBLE_SHADOWS, GRADIENTS } from '@/providers/ThemeProvider';
import { BackgroundBlobs } from '@/components/common/BackgroundBlobs';
import { showAlert } from '@/lib/alert';
import { useCreateDispute, type DisputeReason } from '@/hooks/useDisputes';
import { useBookingDispute } from '@/hooks/useDisputes';

const DISPUTE_REASONS: { key: DisputeReason; icon: string }[] = [
  { key: 'damaged_item', icon: 'warning-outline' },
  { key: 'missing_item', icon: 'search-outline' },
  { key: 'wrong_item', icon: 'swap-horizontal-outline' },
  { key: 'late_delivery', icon: 'time-outline' },
  { key: 'no_delivery', icon: 'close-circle-outline' },
  { key: 'other', icon: 'ellipsis-horizontal-circle-outline' },
];

const DISPUTE_STATUS_COLORS: Record<string, string> = {
  open: '#FFBE5C',
  under_review: '#5CB8FF',
  resolved: '#56D8B1',
  closed: '#A8A5C0',
};

export default function DisputeScreen() {
  const { bookingId, from, to } = useLocalSearchParams<{
    bookingId: string;
    from?: string;
    to?: string;
  }>();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';

  const { data: existingDispute, isLoading: checkingDispute } = useBookingDispute(
    bookingId ?? null
  );
  const createDispute = useCreateDispute();

  const [selectedReason, setSelectedReason] = useState<DisputeReason | null>(null);
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) {
      showAlert(t('common.errorTitle'), t('dispute.selectReason'));
      return;
    }
    if (!bookingId) return;

    try {
      await createDispute.mutateAsync({
        bookingId,
        reason: selectedReason,
        description: description.trim() || undefined,
      });
      setSubmitted(true);
    } catch {
      showAlert(t('common.errorTitle'), t('dispute.submitError'));
    }
  };

  if (checkingDispute) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={V2_COLORS.primary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  // Already filed — show status view
  if (existingDispute && !submitted) {
    const statusColor = DISPUTE_STATUS_COLORS[existingDispute.status] ?? V2_COLORS.textSecondary;
    return (
      <SafeAreaView style={styles.container}>
        <BackgroundBlobs />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons
              name={isRTL ? 'arrow-forward' : 'arrow-back'}
              size={22}
              color={V2_COLORS.textPrimary}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('dispute.title')}</Text>
          <View style={{ width: 38 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInUp.delay(100)} style={styles.statusCard}>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '22' }]}>
              <Ionicons name="shield-checkmark-outline" size={32} color={statusColor} />
            </View>
            <Text style={styles.statusTitle}>{t('dispute.alreadyFiled')}</Text>
            <Text style={styles.statusSubtitle}>{t('dispute.alreadyFiledDesc')}</Text>

            <View style={[styles.statusPill, { backgroundColor: statusColor + '22' }]}>
              <Text style={[styles.statusPillText, { color: statusColor }]}>
                {t(`dispute.status.${existingDispute.status}`)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('dispute.reason')}</Text>
              <Text style={styles.detailValue}>
                {t(`dispute.reasons.${existingDispute.reason}`)}
              </Text>
            </View>

            {existingDispute.description && (
              <View style={[styles.detailRow, { flexDirection: 'column', gap: 4 }]}>
                <Text style={styles.detailLabel}>{t('dispute.description')}</Text>
                <Text style={[styles.detailValue, { textAlign: isRTL ? 'right' : 'left' }]}>
                  {existingDispute.description}
                </Text>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Submission success
  if (submitted) {
    return (
      <SafeAreaView style={styles.container}>
        <BackgroundBlobs />
        <View style={styles.successContainer}>
          <Animated.View entering={FadeInUp.delay(100)} style={styles.successContent}>
            <LinearGradient colors={GRADIENTS.primary} style={styles.successIcon}>
              <Ionicons name="shield-checkmark" size={48} color="#fff" />
            </LinearGradient>
            <Text style={styles.successTitle}>{t('dispute.successTitle')}</Text>
            <Text style={styles.successSubtitle}>{t('dispute.successDesc')}</Text>
            <TouchableOpacity style={styles.successBtn} onPress={() => router.back()}>
              <Text style={styles.successBtnText}>{t('common.goBack')}</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <BackgroundBlobs />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons
            name={isRTL ? 'arrow-forward' : 'arrow-back'}
            size={22}
            color={V2_COLORS.textPrimary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('dispute.title')}</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Route info */}
        {(from || to) && (
          <Animated.View entering={FadeInDown.delay(50)} style={styles.routeCard}>
            <Ionicons name="airplane-outline" size={16} color={V2_COLORS.primary} />
            <Text style={styles.routeText}>
              {from} → {to}
            </Text>
          </Animated.View>
        )}

        {/* Info banner */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.infoBanner}>
          <Ionicons name="information-circle-outline" size={20} color={V2_COLORS.primary} />
          <Text style={styles.infoText}>{t('dispute.infoText')}</Text>
        </Animated.View>

        {/* Reason selection */}
        <Animated.View entering={FadeInDown.delay(150)}>
          <Text style={styles.sectionLabel}>{t('dispute.selectReasonLabel')}</Text>
          <View style={styles.reasonGrid}>
            {DISPUTE_REASONS.map((item, idx) => {
              const isSelected = selectedReason === item.key;
              return (
                <Animated.View key={item.key} entering={FadeInDown.delay(180 + idx * 40)}>
                  <TouchableOpacity
                    style={[styles.reasonCard, isSelected && styles.reasonCardSelected]}
                    onPress={() => setSelectedReason(item.key)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={item.icon as keyof typeof Ionicons.glyphMap}
                      size={24}
                      color={isSelected ? V2_COLORS.primary : V2_COLORS.textSecondary}
                    />
                    <Text
                      style={[styles.reasonText, isSelected && styles.reasonTextSelected]}
                      numberOfLines={2}
                    >
                      {t(`dispute.reasons.${item.key}`)}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        </Animated.View>

        {/* Description */}
        <Animated.View entering={FadeInDown.delay(350)}>
          <Text style={styles.sectionLabel}>{t('dispute.descriptionLabel')}</Text>
          <TextInput
            style={[styles.textArea, isRTL && styles.textAreaRTL]}
            placeholder={t('dispute.descriptionPlaceholder')}
            placeholderTextColor={V2_COLORS.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
            maxLength={1000}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{description.length}/1000</Text>
        </Animated.View>

        {/* Submit */}
        <Animated.View entering={FadeInDown.delay(400)} style={{ marginTop: 8, marginBottom: 32 }}>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={createDispute.isPending || !selectedReason}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={
                !selectedReason
                  ? [V2_COLORS.textSecondary, V2_COLORS.textSecondary]
                  : GRADIENTS.primary
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitBtn}
            >
              {createDispute.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="shield-outline" size={18} color="#fff" />
                  <Text style={styles.submitBtnText}>{t('dispute.submit')}</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: V2_COLORS.background,
  } as ViewStyle,
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  } as ViewStyle,
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: V2_COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...BUBBLE_SHADOWS.sm,
  } as ViewStyle,
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: V2_COLORS.textPrimary,
  } as TextStyle,
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  routeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: V2_COLORS.surface,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    marginBottom: 16,
    ...BUBBLE_SHADOWS.sm,
  } as ViewStyle,
  routeText: {
    fontSize: 13,
    fontWeight: '600',
    color: V2_COLORS.textPrimary,
  } as TextStyle,
  infoBanner: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: V2_COLORS.primary + '15',
    borderRadius: RADIUS.card,
    padding: 14,
    marginBottom: 24,
  } as ViewStyle,
  infoText: {
    flex: 1,
    fontSize: 13,
    color: V2_COLORS.primary,
    lineHeight: 18,
  } as TextStyle,
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: V2_COLORS.textPrimary,
    marginBottom: 12,
  } as TextStyle,
  reasonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  } as ViewStyle,
  reasonCard: {
    width: 100,
    backgroundColor: V2_COLORS.surface,
    borderRadius: RADIUS.card,
    padding: 12,
    alignItems: 'center',
    gap: 6,
    borderWidth: 2,
    borderColor: 'transparent',
    ...BUBBLE_SHADOWS.sm,
  } as ViewStyle,
  reasonCardSelected: {
    borderColor: V2_COLORS.primary,
    backgroundColor: V2_COLORS.primary + '10',
  } as ViewStyle,
  reasonText: {
    fontSize: 11,
    color: V2_COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  } as TextStyle,
  reasonTextSelected: {
    color: V2_COLORS.primary,
    fontWeight: '700',
  } as TextStyle,
  textArea: {
    backgroundColor: V2_COLORS.surface,
    borderRadius: RADIUS.card,
    padding: 14,
    fontSize: 14,
    color: V2_COLORS.textPrimary,
    minHeight: 120,
    borderWidth: 1.5,
    borderColor: V2_COLORS.border,
    ...BUBBLE_SHADOWS.sm,
  } as TextStyle,
  textAreaRTL: {
    textAlign: 'right',
  } as TextStyle,
  charCount: {
    fontSize: 11,
    color: V2_COLORS.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  } as TextStyle,
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: RADIUS.pill,
    paddingVertical: 16,
    ...BUBBLE_SHADOWS.md,
  } as ViewStyle,
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  } as TextStyle,
  // Status view
  statusCard: {
    backgroundColor: V2_COLORS.surface,
    borderRadius: RADIUS.card,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    ...BUBBLE_SHADOWS.md,
  } as ViewStyle,
  statusBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  } as ViewStyle,
  statusTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: V2_COLORS.textPrimary,
    textAlign: 'center',
  } as TextStyle,
  statusSubtitle: {
    fontSize: 13,
    color: V2_COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  } as TextStyle,
  statusPill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    marginTop: 4,
  } as ViewStyle,
  statusPillText: {
    fontSize: 13,
    fontWeight: '700',
  } as TextStyle,
  detailRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: V2_COLORS.border,
  } as ViewStyle,
  detailLabel: {
    fontSize: 13,
    color: V2_COLORS.textSecondary,
    fontWeight: '500',
  } as TextStyle,
  detailValue: {
    fontSize: 13,
    color: V2_COLORS.textPrimary,
    fontWeight: '600',
    maxWidth: '60%',
    textAlign: 'right',
  } as TextStyle,
  // Success state
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  } as ViewStyle,
  successContent: {
    alignItems: 'center',
    gap: 16,
  } as ViewStyle,
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    ...BUBBLE_SHADOWS.md,
  } as ViewStyle,
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: V2_COLORS.textPrimary,
    textAlign: 'center',
  } as TextStyle,
  successSubtitle: {
    fontSize: 14,
    color: V2_COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  } as TextStyle,
  successBtn: {
    marginTop: 8,
    backgroundColor: V2_COLORS.surface,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 32,
    paddingVertical: 14,
    ...BUBBLE_SHADOWS.sm,
  } as ViewStyle,
  successBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: V2_COLORS.primary,
  } as TextStyle,
});
