import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  ViewStyle,
  TextStyle,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import {
  V2_COLORS,
  RADIUS,
  BUBBLE_SHADOWS,
  TYPOGRAPHY,
  GRADIENTS,
} from '@/providers/ThemeProvider';
import { useCreateFlight } from '@/hooks/useFlights';
import { ScreenHeader } from '@/components/common/ScreenHeader';

const TOTAL_STEPS = 5;

interface FlightForm {
  departureCity: string;
  departureCode: string;
  arrivalCity: string;
  arrivalCode: string;
  departureDate: string;
  flightNumber: string;
  totalWeight: string;
  pricePerKg: string;
  currency: string;
  notes: string;
}

// Step 1: Route
function RouteStep({
  form,
  onChange,
}: {
  form: FlightForm;
  onChange: (k: keyof FlightForm, v: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <Animated.View entering={FadeInDown.duration(350)} style={styles.stepContent}>
      <Text style={styles.stepTitle}>
        {t('flight.create.routeTitle', { defaultValue: 'Where are you flying?' })}
      </Text>
      <Text style={styles.stepSubtitle}>
        {t('flight.create.routeSubtitle', {
          defaultValue: 'Enter your departure and arrival cities',
        })}
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          {t('flight.create.from', { defaultValue: 'Departure City' })} *
        </Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.textInput, { flex: 2 }]}
            value={form.departureCity}
            onChangeText={(v) => onChange('departureCity', v)}
            placeholder={t('flight.create.cityPlaceholder', { defaultValue: 'e.g. Riyadh' })}
            placeholderTextColor={V2_COLORS.textMuted}
          />
          <TextInput
            style={[styles.textInput, { flex: 1 }]}
            value={form.departureCode}
            onChangeText={(v) => onChange('departureCode', v.toUpperCase())}
            placeholder="RUH"
            placeholderTextColor={V2_COLORS.textMuted}
            maxLength={3}
            autoCapitalize="characters"
          />
        </View>
      </View>

      <View style={styles.routeArrow}>
        <View style={styles.routeArrowLine} />
        <Ionicons name="airplane" size={22} color={V2_COLORS.primary} />
        <View style={styles.routeArrowLine} />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          {t('flight.create.to', { defaultValue: 'Arrival City' })} *
        </Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.textInput, { flex: 2 }]}
            value={form.arrivalCity}
            onChangeText={(v) => onChange('arrivalCity', v)}
            placeholder={t('flight.create.cityPlaceholder', { defaultValue: 'e.g. London' })}
            placeholderTextColor={V2_COLORS.textMuted}
          />
          <TextInput
            style={[styles.textInput, { flex: 1 }]}
            value={form.arrivalCode}
            onChangeText={(v) => onChange('arrivalCode', v.toUpperCase())}
            placeholder="LHR"
            placeholderTextColor={V2_COLORS.textMuted}
            maxLength={3}
            autoCapitalize="characters"
          />
        </View>
      </View>
    </Animated.View>
  );
}

// Step 2: Date & Flight Number
function DateStep({
  form,
  onChange,
}: {
  form: FlightForm;
  onChange: (k: keyof FlightForm, v: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <Animated.View entering={FadeInDown.duration(350)} style={styles.stepContent}>
      <Text style={styles.stepTitle}>
        {t('flight.create.dateTitle', { defaultValue: 'When are you flying?' })}
      </Text>
      <Text style={styles.stepSubtitle}>
        {t('flight.create.dateSubtitle', { defaultValue: 'Set your departure date' })}
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          {t('flight.create.date', { defaultValue: 'Departure Date' })} *
        </Text>
        <TextInput
          style={styles.textInput}
          value={form.departureDate}
          onChangeText={(v) => onChange('departureDate', v)}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={V2_COLORS.textMuted}
          keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
        />
        <Text style={styles.inputHint}>
          {t('flight.create.dateHint', { defaultValue: 'Must be at least 24 hours from now' })}
        </Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          {t('flight.create.flightNumber', { defaultValue: 'Flight Number (optional)' })}
        </Text>
        <TextInput
          style={styles.textInput}
          value={form.flightNumber}
          onChangeText={(v) => onChange('flightNumber', v.toUpperCase())}
          placeholder="SV123"
          placeholderTextColor={V2_COLORS.textMuted}
          autoCapitalize="characters"
        />
      </View>
    </Animated.View>
  );
}

// Step 3: Weight
function WeightStep({
  form,
  onChange,
}: {
  form: FlightForm;
  onChange: (k: keyof FlightForm, v: string) => void;
}) {
  const { t } = useTranslation();
  const presets = ['5', '10', '15', '20', '23'];

  return (
    <Animated.View entering={FadeInDown.duration(350)} style={styles.stepContent}>
      <Text style={styles.stepTitle}>
        {t('flight.create.weightTitle', { defaultValue: 'How much space?' })}
      </Text>
      <Text style={styles.stepSubtitle}>
        {t('flight.create.weightSubtitle', {
          defaultValue: 'Enter the available luggage weight in kg',
        })}
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          {t('flight.create.totalWeight', { defaultValue: 'Available Weight (kg)' })} *
        </Text>
        <View style={styles.weightInputRow}>
          <TextInput
            style={[styles.textInput, styles.weightInput]}
            value={form.totalWeight}
            onChangeText={(v) => onChange('totalWeight', v)}
            placeholder="10"
            placeholderTextColor={V2_COLORS.textMuted}
            keyboardType="decimal-pad"
          />
          <View style={styles.weightUnit}>
            <Text style={styles.weightUnitText}>kg</Text>
          </View>
        </View>
      </View>

      <View style={styles.presetRow}>
        {presets.map((p) => (
          <TouchableOpacity
            key={p}
            onPress={() => onChange('totalWeight', p)}
            style={[styles.presetChip, form.totalWeight === p && styles.presetChipActive]}
          >
            <Text
              style={[styles.presetChipText, form.totalWeight === p && styles.presetChipTextActive]}
            >
              {p} kg
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );
}

// Step 4: Pricing
function PricingStep({
  form,
  onChange,
}: {
  form: FlightForm;
  onChange: (k: keyof FlightForm, v: string) => void;
}) {
  const { t } = useTranslation();
  const currencies = ['SAR', 'USD', 'EUR', 'AED'];

  return (
    <Animated.View entering={FadeInDown.duration(350)} style={styles.stepContent}>
      <Text style={styles.stepTitle}>
        {t('flight.create.pricingTitle', { defaultValue: 'Set your price' })}
      </Text>
      <Text style={styles.stepSubtitle}>
        {t('flight.create.pricingSubtitle', { defaultValue: 'How much per kg?' })}
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          {t('flight.create.pricePerKg', { defaultValue: 'Price per kg' })} *
        </Text>
        <View style={styles.weightInputRow}>
          <TextInput
            style={[styles.textInput, styles.weightInput]}
            value={form.pricePerKg}
            onChangeText={(v) => onChange('pricePerKg', v)}
            placeholder="25"
            placeholderTextColor={V2_COLORS.textMuted}
            keyboardType="decimal-pad"
          />
          <View style={styles.weightUnit}>
            <Text style={styles.weightUnitText}>{form.currency}/kg</Text>
          </View>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          {t('flight.create.currency', { defaultValue: 'Currency' })}
        </Text>
        <View style={styles.presetRow}>
          {currencies.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => onChange('currency', c)}
              style={[styles.presetChip, form.currency === c && styles.presetChipActive]}
            >
              <Text
                style={[styles.presetChipText, form.currency === c && styles.presetChipTextActive]}
              >
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

// Step 5: Notes & Review
function ReviewStep({
  form,
  onChange,
}: {
  form: FlightForm;
  onChange: (k: keyof FlightForm, v: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <Animated.View entering={FadeInDown.duration(350)} style={styles.stepContent}>
      <Text style={styles.stepTitle}>
        {t('flight.create.reviewTitle', { defaultValue: 'Review & Confirm' })}
      </Text>
      <Text style={styles.stepSubtitle}>
        {t('flight.create.reviewSubtitle', {
          defaultValue: 'Add any notes and confirm your flight posting',
        })}
      </Text>

      <View style={styles.reviewCard}>
        <View style={styles.reviewRow}>
          <Ionicons name="airplane" size={18} color={V2_COLORS.primary} />
          <Text style={styles.reviewText}>
            {form.departureCity} {form.departureCode ? `(${form.departureCode})` : ''} →{' '}
            {form.arrivalCity} {form.arrivalCode ? `(${form.arrivalCode})` : ''}
          </Text>
        </View>
        <View style={styles.reviewRow}>
          <Ionicons name="calendar" size={18} color={V2_COLORS.accent3} />
          <Text style={styles.reviewText}>{form.departureDate}</Text>
        </View>
        {form.flightNumber ? (
          <View style={styles.reviewRow}>
            <Ionicons name="barcode" size={18} color={V2_COLORS.textSoft} />
            <Text style={styles.reviewText}>{form.flightNumber}</Text>
          </View>
        ) : null}
        <View style={styles.reviewRow}>
          <Ionicons name="scale" size={18} color={V2_COLORS.accent1} />
          <Text style={styles.reviewText}>{form.totalWeight} kg</Text>
        </View>
        <View style={styles.reviewRow}>
          <Ionicons name="pricetag" size={18} color={V2_COLORS.accent2} />
          <Text style={styles.reviewText}>
            {form.pricePerKg} {form.currency}/kg
          </Text>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          {t('flight.create.notes', { defaultValue: 'Notes (optional)' })}
        </Text>
        <TextInput
          style={[styles.textInput, styles.notesInput]}
          value={form.notes}
          onChangeText={(v) => onChange('notes', v)}
          placeholder={t('flight.create.notesPlaceholder', {
            defaultValue: 'Any restrictions, item types you accept, etc.',
          })}
          placeholderTextColor={V2_COLORS.textMuted}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>
    </Animated.View>
  );
}

export default function CreateFlightScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const createFlight = useCreateFlight();

  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState<FlightForm>({
    departureCity: '',
    departureCode: '',
    arrivalCity: '',
    arrivalCode: '',
    departureDate: '',
    flightNumber: '',
    totalWeight: '10',
    pricePerKg: '25',
    currency: 'SAR',
    notes: '',
  });

  const onChange = (k: keyof FlightForm, v: string) => setForm((prev) => ({ ...prev, [k]: v }));

  const validateStep = (): boolean => {
    if (step === 1) {
      if (!form.departureCity.trim() || !form.arrivalCity.trim()) {
        Alert.alert(
          t('common.errorTitle'),
          t('flight.create.routeRequired', {
            defaultValue: 'Departure and arrival cities are required',
          })
        );
        return false;
      }
    }
    if (step === 2) {
      if (!form.departureDate.trim()) {
        Alert.alert(
          t('common.errorTitle'),
          t('flight.create.dateRequired', { defaultValue: 'Departure date is required' })
        );
        return false;
      }
      const date = new Date(form.departureDate);
      if (isNaN(date.getTime())) {
        Alert.alert(
          t('common.errorTitle'),
          t('flight.create.dateInvalid', { defaultValue: 'Please enter a valid date (YYYY-MM-DD)' })
        );
        return false;
      }
    }
    if (step === 3) {
      const w = parseFloat(form.totalWeight);
      if (!form.totalWeight || isNaN(w) || w <= 0) {
        Alert.alert(
          t('common.errorTitle'),
          t('flight.create.weightRequired', { defaultValue: 'Please enter a valid weight' })
        );
        return false;
      }
    }
    if (step === 4) {
      const p = parseFloat(form.pricePerKg);
      if (!form.pricePerKg || isNaN(p) || p < 0) {
        Alert.alert(
          t('common.errorTitle'),
          t('flight.create.priceRequired', { defaultValue: 'Please enter a valid price' })
        );
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    try {
      await createFlight.mutateAsync({
        departureCity: form.departureCity.trim(),
        departureCode: form.departureCode.trim() || undefined,
        arrivalCity: form.arrivalCity.trim(),
        arrivalCode: form.arrivalCode.trim() || undefined,
        departureDate: new Date(form.departureDate).toISOString(),
        flightNumber: form.flightNumber.trim() || undefined,
        totalWeight: parseFloat(form.totalWeight),
        pricePerKg: parseFloat(form.pricePerKg),
        currency: form.currency,
        notes: form.notes.trim() || undefined,
      });
      setSuccess(true);
    } catch (e: any) {
      const msg = e?.response?.data?.message || t('common.error');
      Alert.alert(t('common.errorTitle'), msg);
    }
  };

  if (success) {
    return (
      <SafeAreaView style={styles.container}>
        <Animated.View entering={ZoomIn.duration(400)} style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={80} color={V2_COLORS.secondary} />
          </View>
          <Text style={styles.successTitle}>
            {t('flight.create.successTitle', { defaultValue: 'Flight Posted!' })}
          </Text>
          <Text style={styles.successSubtitle}>
            {t('flight.create.successSubtitle', {
              defaultValue: 'Your flight is now live and accepting offers.',
            })}
          </Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)')} style={styles.successBtn}>
            <LinearGradient colors={[...GRADIENTS.primary]} style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>
                {t('flight.create.goHome', { defaultValue: 'Go to Home' })}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/trips')}
            style={styles.successSecondaryBtn}
          >
            <Text style={styles.successSecondaryBtnText}>
              {t('flight.create.viewMyFlights', { defaultValue: 'View My Flights' })}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    );
  }

  const stepComponents = [
    <RouteStep key="route" form={form} onChange={onChange} />,
    <DateStep key="date" form={form} onChange={onChange} />,
    <WeightStep key="weight" form={form} onChange={onChange} />,
    <PricingStep key="pricing" form={form} onChange={onChange} />,
    <ReviewStep key="review" form={form} onChange={onChange} />,
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title={t('flight.create.title', { defaultValue: 'Post a Flight' })} />

      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(step / TOTAL_STEPS) * 100}%` as any }]} />
      </View>
      <View style={styles.stepIndicator}>
        <Text style={styles.stepIndicatorText}>
          {t('flight.create.step', { defaultValue: 'Step' })} {step} / {TOTAL_STEPS}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {stepComponents[step - 1]}
      </ScrollView>

      <Animated.View entering={FadeInUp.duration(300)} style={styles.footer}>
        {step > 1 && (
          <TouchableOpacity onPress={() => setStep((s) => s - 1)} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color={V2_COLORS.primary} />
            <Text style={styles.backBtnText}>{t('common.cancel', { defaultValue: 'Back' })}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={handleNext}
          disabled={createFlight.isPending}
          style={styles.nextBtnWrap}
        >
          <LinearGradient
            colors={[...GRADIENTS.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.primaryBtn, createFlight.isPending && { opacity: 0.6 }]}
          >
            <Text style={styles.primaryBtnText}>
              {step === TOTAL_STEPS
                ? createFlight.isPending
                  ? t('common.loading')
                  : t('flight.create.post', { defaultValue: 'Post Flight' })
                : t('flight.create.next', { defaultValue: 'Next' })}
            </Text>
            {step < TOTAL_STEPS && <Ionicons name="arrow-forward" size={18} color="#FFF" />}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: V2_COLORS.bg } as ViewStyle,
  scrollContent: { padding: 20, paddingBottom: 32 } as ViewStyle,

  progressBar: {
    height: 3,
    backgroundColor: V2_COLORS.cardShadow,
    marginHorizontal: 0,
  } as ViewStyle,
  progressFill: {
    height: '100%',
    backgroundColor: V2_COLORS.primary,
    borderRadius: 2,
  } as ViewStyle,
  stepIndicator: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 } as ViewStyle,
  stepIndicatorText: { fontSize: 12, color: V2_COLORS.textMuted, fontWeight: '600' } as TextStyle,

  stepContent: { gap: 8 } as ViewStyle,
  stepTitle: { ...TYPOGRAPHY.h1, color: V2_COLORS.text, marginBottom: 4 } as TextStyle,
  stepSubtitle: { ...TYPOGRAPHY.body, color: V2_COLORS.textSoft, marginBottom: 20 } as TextStyle,

  inputGroup: { marginBottom: 20 } as ViewStyle,
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: V2_COLORS.text,
    marginBottom: 8,
  } as TextStyle,
  inputHint: { fontSize: 12, color: V2_COLORS.textMuted, marginTop: 6 } as TextStyle,
  inputRow: { flexDirection: 'row', gap: 10 } as ViewStyle,
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.input,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: V2_COLORS.text,
    ...BUBBLE_SHADOWS.sm,
  } as TextStyle,
  notesInput: { minHeight: 90, paddingTop: 14 } as TextStyle,

  routeArrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 8,
  } as ViewStyle,
  routeArrowLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: V2_COLORS.textMuted,
    opacity: 0.3,
  } as ViewStyle,

  weightInputRow: { flexDirection: 'row', gap: 10, alignItems: 'center' } as ViewStyle,
  weightInput: { flex: 1 } as TextStyle,
  weightUnit: {
    backgroundColor: V2_COLORS.primary + '15',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: RADIUS.input,
  } as ViewStyle,
  weightUnitText: { fontSize: 14, fontWeight: '700', color: V2_COLORS.primary } as TextStyle,

  presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 } as ViewStyle,
  presetChip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: RADIUS.pill,
    backgroundColor: '#FFFFFF',
    ...BUBBLE_SHADOWS.xs,
  } as ViewStyle,
  presetChipActive: { backgroundColor: V2_COLORS.primary } as ViewStyle,
  presetChipText: { fontSize: 13, fontWeight: '600', color: V2_COLORS.textSoft } as TextStyle,
  presetChipTextActive: { color: '#FFFFFF' } as TextStyle,

  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    padding: 18,
    gap: 12,
    marginBottom: 20,
    ...BUBBLE_SHADOWS.md,
  } as ViewStyle,
  reviewRow: { flexDirection: 'row', alignItems: 'center', gap: 10 } as ViewStyle,
  reviewText: { fontSize: 15, color: V2_COLORS.text, flex: 1 } as TextStyle,

  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#FFFFFF',
    ...BUBBLE_SHADOWS.lg,
  } as ViewStyle,
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 16,
    height: 50,
    borderRadius: RADIUS.pill,
    borderWidth: 1.5,
    borderColor: V2_COLORS.primary,
  } as ViewStyle,
  backBtnText: { fontSize: 14, fontWeight: '600', color: V2_COLORS.primary } as TextStyle,
  nextBtnWrap: { flex: 1 } as ViewStyle,
  primaryBtn: {
    height: 50,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  } as ViewStyle,
  primaryBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' } as TextStyle,

  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  } as ViewStyle,
  successIcon: { marginBottom: 8 } as ViewStyle,
  successTitle: { ...TYPOGRAPHY.h1, color: V2_COLORS.text, textAlign: 'center' } as TextStyle,
  successSubtitle: {
    ...TYPOGRAPHY.body,
    color: V2_COLORS.textSoft,
    textAlign: 'center',
    lineHeight: 24,
  } as TextStyle,
  successBtn: { width: '100%', marginTop: 16 } as ViewStyle,
  successSecondaryBtn: { paddingVertical: 12 } as ViewStyle,
  successSecondaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: V2_COLORS.primary,
  } as TextStyle,
});
