import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, RADIUS } from '@/providers/ThemeProvider';
import { QuestionTitle } from '../QuestionTitle';
import { AnimatedButton } from '@/components/animations/AnimatedButton';
import type { StepProps } from '../WizardContainer';

export function PricingStep({ data, updateData, goNext }: StepProps) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const isRTL = i18n.language === 'ar';

  const price = data.price ?? 15;
  const weight = data.availableWeight ?? 5;
  const estimatedTotal = price * weight;
  const canAdvance = price > 0;

  const adjustPrice = (delta: number) => {
    const next = Math.max(1, Math.min(100, price + delta));
    updateData({ price: next });
  };

  return (
    <View>
      <QuestionTitle
        emoji="💰"
        title={t('listing.wizard.pricing.title', { defaultValue: 'Set your price per kilogram' })}
      />

      {/* Big price display */}
      <Animated.View entering={FadeInUp.delay(150).springify()} style={styles.priceDisplay}>
        <Text style={[styles.currency, { color: colors.textSecondary }]}>SAR</Text>
        <TextInput
          style={[styles.priceInput, { color: colors.text }]}
          value={String(price)}
          onChangeText={(v) => {
            const num = parseInt(v, 10);
            if (!isNaN(num) && num >= 0) updateData({ price: num });
            else if (v === '') updateData({ price: 0 });
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
              { backgroundColor: colors.primary, width: `${Math.min(price, 50) * 2}%` },
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

      {/* Average range */}
      <Animated.View entering={FadeIn.delay(300)} style={styles.infoRow}>
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          📊{' '}
          {t('listing.wizard.pricing.average', {
            defaultValue: 'Average: SAR 12-20/kg',
            min: 12,
            max: 20,
          })}
        </Text>
      </Animated.View>

      {/* Estimated total */}
      <Animated.View
        entering={FadeIn.delay(400)}
        style={[styles.estimateCard, { backgroundColor: colors.surface }]}
      >
        <Text style={[styles.estimateLabel, { color: colors.textSecondary }]}>
          💡{' '}
          {t('listing.wizard.pricing.estimated', {
            defaultValue: `Estimated total: SAR ${estimatedTotal}`,
            total: estimatedTotal,
          })}
        </Text>
        <Text style={[styles.estimateValue, { color: colors.primary }]}>
          SAR {estimatedTotal.toFixed(0)}
        </Text>
        <Text style={[styles.estimateNote, { color: colors.textMuted }]}>(for {weight} kg)</Text>
      </Animated.View>

      {/* Next */}
      {canAdvance && (
        <Animated.View entering={FadeInUp.delay(100).springify()} style={styles.nextContainer}>
          <AnimatedButton
            title={t('wizard.next', { defaultValue: 'Next' })}
            onPress={goNext}
            size="lg"
            fullWidth
          />
        </Animated.View>
      )}
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
  nextContainer: {
    marginTop: 8,
  },
});
