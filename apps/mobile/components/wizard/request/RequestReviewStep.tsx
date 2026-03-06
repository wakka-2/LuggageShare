import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/providers/ThemeProvider';
import { QuestionTitle } from '../QuestionTitle';
import { AnimatedButton } from '@/components/animations/AnimatedButton';
import type { StepProps } from '../WizardContainer';

export function RequestReviewStep({ data, goNext }: StepProps) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const isRTL = i18n.language === 'ar';

  const neededByDate = data.neededByDate ? new Date(data.neededByDate) : null;

  const rows: { icon: string; label: string; value: string }[] = [
    {
      icon: 'airplane-outline',
      label: t('requestWizard.review.from', { defaultValue: 'From' }),
      value: `${data.departureCity || '—'}${data.departureCode ? ` (${data.departureCode})` : ''}`,
    },
    {
      icon: 'location-outline',
      label: t('requestWizard.review.to', { defaultValue: 'To' }),
      value: `${data.arrivalCity || '—'}${data.arrivalCode ? ` (${data.arrivalCode})` : ''}`,
    },
    {
      icon: 'calendar-outline',
      label: t('requestWizard.review.neededBy', { defaultValue: 'Needed by' }),
      value: neededByDate
        ? neededByDate.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          })
        : '—',
    },
    {
      icon: 'scale-outline',
      label: t('requestWizard.review.weight', { defaultValue: 'Weight' }),
      value: `${data.weight || '—'} kg`,
    },
  ];

  if (data.budget) {
    rows.push({
      icon: 'cash-outline',
      label: t('requestWizard.review.budget', { defaultValue: 'Budget' }),
      value: `${data.budget} ${data.currency || 'SAR'}`,
    });
  }

  if (data.description) {
    rows.push({
      icon: 'document-text-outline',
      label: t('requestWizard.review.description', { defaultValue: 'Description' }),
      value: data.description,
    });
  }

  return (
    <View>
      <QuestionTitle
        emoji="✅"
        title={t('requestWizard.review.title', { defaultValue: 'Review your request' })}
      />

      <Animated.View
        entering={FadeInUp.delay(150).springify()}
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        {rows.map((row, i) => (
          <View
            key={i}
            style={[
              styles.row,
              i < rows.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 },
            ]}
          >
            <View style={styles.rowLeft}>
              <Ionicons name={row.icon as any} size={18} color={colors.primary} />
              <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>{row.label}</Text>
            </View>
            <Text style={[styles.rowValue, { color: colors.text }]} numberOfLines={2}>
              {row.value}
            </Text>
          </View>
        ))}
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.nextContainer}>
        <AnimatedButton
          title={t('requestWizard.review.submit', { defaultValue: 'Post Request' })}
          onPress={goNext}
          size="lg"
          fullWidth
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowLabel: {
    fontSize: 14,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '600',
    maxWidth: '50%',
    textAlign: 'right',
  },
  nextContainer: {
    marginTop: 8,
  },
});
