import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { V2_COLORS, RADIUS, BUBBLE_SHADOWS } from '@/providers/ThemeProvider';
import { QuestionTitle } from '../QuestionTitle';
import { AnimatedButton } from '@/components/animations/AnimatedButton';
import type { StepProps } from '../WizardContainer';

export function ReviewStep({ data, goNext, goBack }: StepProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const price = data.price ?? 0;
  const weight = data.availableWeight ?? 0;
  const estimatedTotal = price * weight;
  const categories = (data.acceptedCategories || []) as string[];

  const formatDate = (iso: string) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <View>
      <QuestionTitle
        emoji="✨"
        title={t('listing.wizard.review.title', { defaultValue: 'Review your listing' })}
      />

      {/* Summary Card */}
      <Animated.View entering={FadeInUp.delay(150).springify()} style={styles.summaryCard}>
        <SummaryRow
          icon="airplane"
          label={`${data.departureCity || '—'} → ${data.arrivalCity || '—'}`}
          delay={200}
        />
        <SummaryRow icon="calendar" label={formatDate(data.departureDate)} delay={250} />
        {data.flightNumber && (
          <SummaryRow icon="airplane-outline" label={data.flightNumber} delay={300} />
        )}
        <SummaryRow icon="scale" label={`${weight} kg available`} delay={350} />
        <SummaryRow icon="cash" label={`SAR ${price}/kg`} delay={400} />
        {categories.length > 0 && (
          <SummaryRow icon="cube" label={categories.join(', ')} delay={450} />
        )}
        {data.notes && <SummaryRow icon="document-text" label={data.notes} delay={500} />}
      </Animated.View>

      {/* Estimated Earnings */}
      <Animated.View entering={FadeInUp.delay(400).springify()} style={styles.earningsCard}>
        <Text style={styles.earningsLabel}>
          {t('listing.wizard.review.earnings', { defaultValue: 'Estimated earnings:' })}
        </Text>
        <Text style={styles.earningsValue}>SAR {estimatedTotal.toFixed(2)}</Text>
        <Text style={styles.earningsNote}>
          {t('listing.wizard.review.ifBooked', { defaultValue: '(if fully booked)' })}
        </Text>
      </Animated.View>

      {/* Publish */}
      <Animated.View entering={FadeInUp.delay(500).springify()}>
        <AnimatedButton
          title={`✈️  ${t('wizard.publish', { defaultValue: 'Publish Listing' })}`}
          onPress={goNext}
          size="lg"
          fullWidth
        />
      </Animated.View>
    </View>
  );
}

function SummaryRow({ icon, label, delay }: { icon: string; label: string; delay: number }) {
  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(300)} style={styles.row}>
      <View style={styles.rowIconCircle}>
        <Ionicons name={icon as any} size={16} color={V2_COLORS.primary} />
      </View>
      <Text style={styles.rowText} numberOfLines={2}>
        {label}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    borderRadius: RADIUS.card,
    padding: 20,
    marginBottom: 20,
    gap: 14,
    backgroundColor: '#FFFFFF',
    ...BUBBLE_SHADOWS.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: V2_COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    fontSize: 15,
    flex: 1,
    color: V2_COLORS.text,
  },
  earningsCard: {
    borderRadius: RADIUS.card,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: V2_COLORS.primary + '08',
  },
  earningsLabel: {
    fontSize: 14,
    marginBottom: 4,
    color: V2_COLORS.textSoft,
  },
  earningsValue: {
    fontSize: 32,
    fontWeight: '700',
    color: V2_COLORS.primary,
  },
  earningsNote: {
    fontSize: 13,
    marginTop: 4,
    color: V2_COLORS.textMuted,
  },
});
