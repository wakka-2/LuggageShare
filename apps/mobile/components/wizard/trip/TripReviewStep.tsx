import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, RADIUS } from '@/providers/ThemeProvider';
import { QuestionTitle } from '../QuestionTitle';
import { AnimatedButton } from '@/components/animations/AnimatedButton';
import type { StepProps } from '../WizardContainer';

const TRANSPORT_EMOJI: Record<string, string> = {
  flight: '✈️',
  car: '🚗',
  bus: '🚌',
  train: '🚆',
};

export function TripReviewStep({ data, goNext }: StepProps) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const isRTL = i18n.language === 'ar';

  const suggestedPrice = data.suggestedPrice ?? 0;
  const weight = parseFloat(data.availableWeight) || 0;
  const estimatedTotal = suggestedPrice * weight;
  const categories = (data.acceptedCategories || []) as string[];

  const formatDate = (iso: string) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const transportLabel = data.transportType
    ? t(`tripWizard.transport.${data.transportType}`, {
        defaultValue: data.transportType.charAt(0).toUpperCase() + data.transportType.slice(1),
      })
    : '—';

  return (
    <View>
      <QuestionTitle
        emoji="✨"
        title={t('tripWizard.review.title', { defaultValue: 'Review your trip' })}
      />

      {/* Summary Card */}
      <Animated.View
        entering={FadeInUp.delay(150).springify()}
        style={[
          styles.summaryCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <SummaryRow
          icon="airplane"
          label={`${data.departureCity || '—'} → ${data.arrivalCity || '—'}`}
          colors={colors}
          delay={200}
        />
        <SummaryRow
          icon="swap-horizontal"
          label={`${TRANSPORT_EMOJI[data.transportType] || ''} ${transportLabel}`}
          colors={colors}
          delay={250}
        />
        <SummaryRow
          icon="calendar"
          label={formatDate(data.departureDate)}
          colors={colors}
          delay={300}
        />
        {data.flightNumber && (
          <SummaryRow
            icon="airplane-outline"
            label={data.flightNumber}
            colors={colors}
            delay={350}
          />
        )}
        <SummaryRow
          icon="scale"
          label={`${weight} kg ${t('tripWizard.review.available', { defaultValue: 'available' })}`}
          colors={colors}
          delay={400}
        />
        {suggestedPrice > 0 && (
          <SummaryRow
            icon="cash"
            label={`SAR ${suggestedPrice}/kg ${t('tripWizard.review.suggested', { defaultValue: '(suggested)' })}`}
            colors={colors}
            delay={450}
          />
        )}
        {categories.length > 0 && (
          <SummaryRow icon="cube" label={categories.join(', ')} colors={colors} delay={500} />
        )}
        {data.notes && (
          <SummaryRow icon="document-text" label={data.notes} colors={colors} delay={550} />
        )}
      </Animated.View>

      {/* Estimated Earnings */}
      {suggestedPrice > 0 && (
        <Animated.View
          entering={FadeInUp.delay(500).springify()}
          style={[styles.earningsCard, { backgroundColor: colors.primary + '08' }]}
        >
          <Text style={[styles.earningsLabel, { color: colors.textSecondary }]}>
            {t('tripWizard.review.earnings', { defaultValue: 'Potential earnings:' })}
          </Text>
          <Text style={[styles.earningsValue, { color: colors.primary }]}>
            SAR {estimatedTotal.toFixed(2)}
          </Text>
          <Text style={[styles.earningsNote, { color: colors.textMuted }]}>
            {t('tripWizard.review.ifBooked', { defaultValue: '(if fully booked)' })}
          </Text>
        </Animated.View>
      )}

      {/* Post Trip */}
      <Animated.View entering={FadeInUp.delay(600).springify()}>
        <AnimatedButton
          title={`${TRANSPORT_EMOJI[data.transportType] || '✈️'}  ${t('tripWizard.review.postTrip', { defaultValue: 'Post Trip' })}`}
          onPress={goNext}
          size="lg"
          fullWidth
        />
      </Animated.View>
    </View>
  );
}

function SummaryRow({
  icon,
  label,
  colors,
  delay,
}: {
  icon: string;
  label: string;
  colors: any;
  delay: number;
}) {
  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(300)} style={styles.row}>
      <Ionicons name={icon as any} size={18} color={colors.primary} />
      <Text style={[styles.rowText, { color: colors.text }]} numberOfLines={2}>
        {label}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    borderRadius: RADIUS.card,
    padding: 20,
    borderWidth: 1,
    marginBottom: 20,
    gap: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowText: {
    fontSize: 15,
    flex: 1,
  },
  earningsCard: {
    borderRadius: RADIUS.card,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  earningsLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  earningsValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  earningsNote: {
    fontSize: 13,
    marginTop: 4,
  },
});
