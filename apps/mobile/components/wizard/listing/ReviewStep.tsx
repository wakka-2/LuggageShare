import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, RADIUS } from '@/providers/ThemeProvider';
import { QuestionTitle } from '../QuestionTitle';
import { AnimatedButton } from '@/components/animations/AnimatedButton';
import type { StepProps } from '../WizardContainer';

export function ReviewStep({ data, goNext }: StepProps) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const isRTL = i18n.language === 'ar';

  const price = data.price ?? 0;
  const weight = data.availableWeight ?? 0;
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
          icon="calendar"
          label={formatDate(data.departureDate)}
          colors={colors}
          delay={250}
        />
        {data.flightNumber && (
          <SummaryRow
            icon="airplane-outline"
            label={data.flightNumber}
            colors={colors}
            delay={300}
          />
        )}
        <SummaryRow icon="scale" label={`${weight} kg available`} colors={colors} delay={350} />
        <SummaryRow icon="cash" label={`SAR ${price}`} colors={colors} delay={400} />
        {categories.length > 0 && (
          <SummaryRow icon="cube" label={categories.join(', ')} colors={colors} delay={450} />
        )}
        {data.notes && (
          <SummaryRow icon="document-text" label={data.notes} colors={colors} delay={500} />
        )}
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
});
