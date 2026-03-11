import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import {
  V2_COLORS,
  RADIUS,
  BUBBLE_SHADOWS,
  TYPOGRAPHY,
  GRADIENTS,
} from '@/providers/ThemeProvider';
import { useFlight } from '@/hooks/useFlights';
import { useCreateOffer } from '@/hooks/useOffers';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { MetaChip } from '@/components/common';
import { SkeletonLoader } from '@/components/animations';

export default function MakeOfferScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';

  const { data: flight, isLoading } = useFlight(id ?? null);
  const createOffer = useCreateOffer(id ?? '');

  const [weight, setWeight] = useState('');
  const [price, setPrice] = useState('');
  const [note, setNote] = useState('');

  const remaining = flight ? Number(flight.remainingWeight) : 0;
  const pricePerKg = flight ? Number(flight.pricePerKg) : 0;

  // Auto-suggest price when weight changes
  const handleWeightChange = (v: string) => {
    setWeight(v);
    const w = parseFloat(v);
    if (!isNaN(w) && w > 0 && pricePerKg > 0) {
      setPrice(String(Math.round(w * pricePerKg)));
    }
  };

  const handleSubmit = async () => {
    const w = parseFloat(weight);
    const p = parseFloat(price);

    if (!weight || isNaN(w) || w <= 0) {
      Alert.alert(
        t('common.errorTitle'),
        t('offer.weightRequired', { defaultValue: 'Please enter the weight you want to ship' })
      );
      return;
    }
    if (w > remaining) {
      Alert.alert(
        t('common.errorTitle'),
        t('offer.weightExceeds', {
          defaultValue: `Cannot exceed remaining capacity (${remaining} kg)`,
        })
      );
      return;
    }
    if (!price || isNaN(p) || p < 0) {
      Alert.alert(
        t('common.errorTitle'),
        t('offer.priceRequired', { defaultValue: 'Please enter your offered price' })
      );
      return;
    }

    try {
      await createOffer.mutateAsync({
        offeredWeight: w,
        offeredPrice: p,
        currency: flight?.currency ?? 'SAR',
        note: note.trim() || undefined,
      });

      Alert.alert(
        t('offer.submitted', { defaultValue: 'Offer Submitted!' }),
        t('offer.submittedDescription', {
          defaultValue: 'The traveler will review your offer. You can negotiate via chat.',
        }),
        [{ text: t('common.ok'), onPress: () => router.back() }]
      );
    } catch (e: any) {
      const msg = e?.response?.data?.message || t('common.error');
      Alert.alert(t('common.errorTitle'), msg);
    }
  };

  const weightPresets = ['5', '10', '15', '20'].filter((p) => parseFloat(p) <= remaining);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader title={t('offer.makeOffer', { defaultValue: 'Make Offer' })} />
        <View style={styles.scrollContent}>
          <SkeletonLoader
            width="100%"
            height={100}
            borderRadius={RADIUS.card}
            style={{ marginBottom: 16 }}
          />
          <SkeletonLoader width="100%" height={200} borderRadius={RADIUS.card} />
        </View>
      </SafeAreaView>
    );
  }

  if (!flight) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader title={t('offer.makeOffer', { defaultValue: 'Make Offer' })} />
        <View style={styles.center}>
          <Text style={styles.errorText}>
            {t('flight.notFound', { defaultValue: 'Flight not found' })}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const departureDate = new Date(flight.departureDate);

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title={t('offer.makeOffer', { defaultValue: 'Make Offer' })} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Flight summary card */}
        <Animated.View entering={FadeInDown.duration(350)} style={styles.flightCard}>
          <View style={styles.routeRow}>
            <View style={styles.routePoint}>
              <View style={[styles.routeDot, { backgroundColor: V2_COLORS.accent1 }]} />
              <Text style={styles.cityName}>{flight.departureCity}</Text>
            </View>
            <View style={styles.routeLine}>
              <View style={styles.dashedLine} />
              <Ionicons name="airplane" size={18} color={V2_COLORS.primary} />
              <View style={styles.dashedLine} />
            </View>
            <View style={styles.routePoint}>
              <View style={[styles.routeDot, { backgroundColor: V2_COLORS.secondary }]} />
              <Text style={styles.cityName}>{flight.arrivalCity}</Text>
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
            <MetaChip
              icon="scale"
              label={`${remaining} kg ${t('flight.remaining', { defaultValue: 'remaining' })}`}
              color={V2_COLORS.accent1}
            />
            <MetaChip
              icon="pricetag"
              label={`${pricePerKg} ${flight.currency}/kg`}
              color={V2_COLORS.accent2}
            />
          </View>
        </Animated.View>

        {/* Offer form */}
        <Animated.View entering={FadeInDown.delay(80).duration(350)} style={styles.formCard}>
          <Text style={styles.formTitle}>
            {t('offer.yourOffer', { defaultValue: 'Your Offer' })}
          </Text>

          {/* Weight */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {t('offer.weight', { defaultValue: 'Weight (kg)' })} *
            </Text>
            <View style={styles.inputWithUnit}>
              <TextInput
                style={[styles.textInput, { flex: 1 }]}
                value={weight}
                onChangeText={handleWeightChange}
                placeholder={`max ${remaining}`}
                placeholderTextColor={V2_COLORS.textMuted}
                keyboardType="decimal-pad"
                textAlign={isRTL ? 'right' : 'left'}
              />
              <View style={styles.unitBadge}>
                <Text style={styles.unitText}>kg</Text>
              </View>
            </View>
            {weightPresets.length > 0 && (
              <View style={styles.presetRow}>
                {weightPresets.map((p) => (
                  <TouchableOpacity
                    key={p}
                    onPress={() => handleWeightChange(p)}
                    style={[styles.presetChip, weight === p && styles.presetChipActive]}
                  >
                    <Text
                      style={[styles.presetChipText, weight === p && styles.presetChipTextActive]}
                    >
                      {p} kg
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Price */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {t('offer.price', { defaultValue: 'Total Price' })} *
            </Text>
            <View style={styles.inputWithUnit}>
              <TextInput
                style={[styles.textInput, { flex: 1 }]}
                value={price}
                onChangeText={setPrice}
                placeholder="0"
                placeholderTextColor={V2_COLORS.textMuted}
                keyboardType="decimal-pad"
                textAlign={isRTL ? 'right' : 'left'}
              />
              <View style={styles.unitBadge}>
                <Text style={styles.unitText}>{flight.currency || 'SAR'}</Text>
              </View>
            </View>
            {weight &&
              price &&
              !isNaN(parseFloat(weight)) &&
              parseFloat(weight) > 0 &&
              !isNaN(parseFloat(price)) && (
                <Text style={styles.perKgHint}>
                  ≈ {(parseFloat(price) / parseFloat(weight)).toFixed(1)} {flight.currency}/kg
                </Text>
              )}
          </View>

          {/* Note */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {t('offer.note', { defaultValue: 'Message (optional)' })}
            </Text>
            <TextInput
              style={[styles.textInput, styles.noteInput]}
              value={note}
              onChangeText={setNote}
              placeholder={t('offer.notePlaceholder', {
                defaultValue: "Describe your items, e.g. 'Perfume set, original packaging'",
              })}
              placeholderTextColor={V2_COLORS.textMuted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              textAlign={isRTL ? 'right' : 'left'}
            />
          </View>
        </Animated.View>

        {/* Info note */}
        <Animated.View entering={FadeInDown.delay(160).duration(350)} style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={18} color={V2_COLORS.primary} />
          <Text style={styles.infoText}>
            {t('offer.infoNote', {
              defaultValue:
                'After submitting, you can negotiate details via chat before the traveler accepts.',
            })}
          </Text>
        </Animated.View>
      </ScrollView>

      <Animated.View entering={FadeInUp.duration(300)} style={styles.footer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.cancelBtn}>
          <Text style={styles.cancelBtnText}>{t('common.cancel')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={createOffer.isPending}
          style={styles.submitBtnWrap}
        >
          <LinearGradient
            colors={[...GRADIENTS.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.submitBtn, createOffer.isPending && { opacity: 0.6 }]}
          >
            <Text style={styles.submitBtnText}>
              {createOffer.isPending
                ? t('common.loading')
                : t('offer.submitOffer', { defaultValue: 'Submit Offer' })}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: V2_COLORS.bg } as ViewStyle,
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' } as ViewStyle,
  errorText: { ...TYPOGRAPHY.caption, color: V2_COLORS.textSoft } as TextStyle,
  scrollContent: { padding: 16, paddingBottom: 32 } as ViewStyle,

  flightCard: {
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
    marginBottom: 16,
  } as ViewStyle,
  routePoint: { alignItems: 'center', flex: 1 } as ViewStyle,
  routeDot: { width: 12, height: 12, borderRadius: 6, marginBottom: 6 } as ViewStyle,
  cityName: { ...TYPOGRAPHY.h2, color: V2_COLORS.text, textAlign: 'center' } as TextStyle,
  routeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 4,
  } as ViewStyle,
  dashedLine: {
    width: 16,
    height: 1.5,
    backgroundColor: V2_COLORS.textMuted,
    opacity: 0.3,
  } as ViewStyle,
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 } as ViewStyle,

  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    padding: 20,
    marginBottom: 16,
    ...BUBBLE_SHADOWS.md,
  } as ViewStyle,
  formTitle: { ...TYPOGRAPHY.h2, color: V2_COLORS.text, marginBottom: 20 } as TextStyle,
  inputGroup: { marginBottom: 20 } as ViewStyle,
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: V2_COLORS.text,
    marginBottom: 8,
  } as TextStyle,
  inputWithUnit: { flexDirection: 'row', gap: 10, alignItems: 'center' } as ViewStyle,
  textInput: {
    backgroundColor: V2_COLORS.bg,
    borderRadius: RADIUS.input,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: V2_COLORS.text,
    borderWidth: 1.5,
    borderColor: V2_COLORS.cardShadow,
  } as TextStyle,
  noteInput: { minHeight: 90, paddingTop: 14 } as TextStyle,
  unitBadge: {
    backgroundColor: V2_COLORS.primary + '15',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: RADIUS.input,
  } as ViewStyle,
  unitText: { fontSize: 14, fontWeight: '700', color: V2_COLORS.primary } as TextStyle,
  perKgHint: { fontSize: 12, color: V2_COLORS.textMuted, marginTop: 6 } as TextStyle,

  presetRow: { flexDirection: 'row', gap: 8, marginTop: 10 } as ViewStyle,
  presetChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADIUS.pill,
    backgroundColor: V2_COLORS.bg,
    borderWidth: 1.5,
    borderColor: V2_COLORS.cardShadow,
  } as ViewStyle,
  presetChipActive: {
    backgroundColor: V2_COLORS.primary,
    borderColor: V2_COLORS.primary,
  } as ViewStyle,
  presetChipText: { fontSize: 13, fontWeight: '600', color: V2_COLORS.textSoft } as TextStyle,
  presetChipTextActive: { color: '#FFFFFF' } as TextStyle,

  infoCard: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: V2_COLORS.primary + '0F',
    borderRadius: RADIUS.card,
    padding: 14,
    alignItems: 'flex-start',
    marginBottom: 16,
  } as ViewStyle,
  infoText: { flex: 1, fontSize: 13, lineHeight: 20, color: V2_COLORS.textSoft } as TextStyle,

  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#FFFFFF',
    ...BUBBLE_SHADOWS.lg,
  } as ViewStyle,
  cancelBtn: {
    paddingHorizontal: 20,
    height: 50,
    borderRadius: RADIUS.pill,
    borderWidth: 1.5,
    borderColor: V2_COLORS.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  cancelBtnText: { fontSize: 14, fontWeight: '600', color: V2_COLORS.textSoft } as TextStyle,
  submitBtnWrap: { flex: 1 } as ViewStyle,
  submitBtn: {
    height: 50,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' } as TextStyle,
});
