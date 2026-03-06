import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, RADIUS } from '@/providers/ThemeProvider';
import { QuestionTitle } from '../QuestionTitle';
import { AnimatedButton } from '@/components/animations/AnimatedButton';
import type { StepProps } from '../WizardContainer';

export function TripPricingStep({ data, updateData, goNext }: StepProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const suggestedPrice = data.suggestedPrice ?? 15;
  const weight = data.availableWeight ?? 5;
  const estimatedTotal = suggestedPrice * weight;

  const adjustPrice = (delta: number) => {
    const next = Math.max(0, Math.min(200, suggestedPrice + delta));
    updateData({ suggestedPrice: next });
  };

  return (
    <View>
      <QuestionTitle
        emoji="💰"
        title={t('tripWizard.pricing.title', { defaultValue: 'Set a suggested price' })}
        subtitle={t('tripWizard.pricing.subtitle', {
          defaultValue: 'Senders can negotiate — this is just a starting point.',
        })}
      />

      {/* Big price display */}
      <Animated.View entering={FadeInUp.delay(150).springify()} style={styles.priceDisplay}>
        <Text style={[styles.currency, { color: colors.textSecondary }]}>SAR</Text>
        <TextInput
          style={[styles.priceInput, { color: colors.text }]}
          value={String(suggestedPrice)}
          onChangeText={(v) => {
            const num = parseInt(v, 10);
            if (!isNaN(num) && num >= 0) updateData({ suggestedPrice: num });
            else if (v === '') updateData({ suggestedPrice: 0 });
          }}
          keyboardType="numeric"
          textAlign="center"
        />
        <Text style={[styles.perKg, { color: colors.textSecondary }]}>/ kg</Text>
      </Animated.View>

      {/* +/- buttons */}
      <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.adjustRow}>
        <TouchableOpacity
          style={[styles.adjustBtn, { borderColor: colors.border }]}
          onPress={() => adjustPrice(-1)}
        >
          <Ionicons name="remove" size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={[styles.sliderTrack, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.sliderFill,
              { backgroundColor: colors.primary, width: `${Math.min(suggestedPrice, 50) * 2}%` },
            ]}
          />
        </View>
        <TouchableOpacity
          style={[styles.adjustBtn, { borderColor: colors.border }]}
          onPress={() => adjustPrice(1)}
        >
          <Ionicons name="add" size={20} color={colors.text} />
        </TouchableOpacity>
      </Animated.View>

      {/* Average hint */}
      <Animated.View entering={FadeIn.delay(300)} style={styles.infoRow}>
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          📊 {t('tripWizard.pricing.average', { defaultValue: 'Average: SAR 12-20/kg' })}
        </Text>
      </Animated.View>

      {/* Estimated earnings */}
      {suggestedPrice > 0 && (
        <Animated.View
          entering={FadeIn.delay(400)}
          style={[styles.estimateCard, { backgroundColor: colors.surface }]}
        >
          <Text style={[styles.estimateLabel, { color: colors.textSecondary }]}>
            💡 {t('tripWizard.pricing.estimated', { defaultValue: 'Potential earnings' })}
          </Text>
          <Text style={[styles.estimateValue, { color: colors.primary }]}>
            SAR {estimatedTotal.toFixed(0)}
          </Text>
          <Text style={[styles.estimateNote, { color: colors.textMuted }]}>
            ({t('tripWizard.pricing.ifFullyBooked', { defaultValue: `if all ${weight} kg booked` })}
            )
          </Text>
        </Animated.View>
      )}

      {/* Next + Skip */}
      <View style={styles.actions}>
        <AnimatedButton
          title={t('wizard.next', { defaultValue: 'Next' })}
          onPress={goNext}
          size="lg"
          fullWidth
        />
        <AnimatedButton
          title={t('wizard.skip', { defaultValue: 'Skip' })}
          onPress={goNext}
          variant="ghost"
          size="sm"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  priceDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 8,
  },
  currency: {
    fontSize: 18,
    fontWeight: '500',
  },
  priceInput: {
    fontSize: 48,
    fontWeight: '700',
    minWidth: 80,
    textAlign: 'center',
  },
  perKg: {
    fontSize: 16,
    fontWeight: '500',
  },
  adjustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  adjustBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    borderRadius: 2,
  },
  infoRow: {
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
  },
  estimateCard: {
    borderRadius: RADIUS.card,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  estimateLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  estimateValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  estimateNote: {
    fontSize: 13,
    marginTop: 2,
  },
  actions: {
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
});
