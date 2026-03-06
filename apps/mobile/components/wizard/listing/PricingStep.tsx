import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { V2_COLORS, RADIUS, BUBBLE_SHADOWS } from '@/providers/ThemeProvider';
import { QuestionTitle } from '../QuestionTitle';
import { AnimatedButton } from '@/components/animations/AnimatedButton';
import type { StepProps } from '../WizardContainer';

export function PricingStep({ data, updateData, goNext }: StepProps) {
  const { t, i18n } = useTranslation();
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
        <Text style={styles.currency}>SAR</Text>
        <TextInput
          style={styles.priceInput}
          value={String(price)}
          onChangeText={(v) => {
            const num = parseInt(v, 10);
            if (!isNaN(num) && num >= 0) updateData({ price: num });
            else if (v === '') updateData({ price: 0 });
          }}
          keyboardType="numeric"
          textAlign="center"
        />
        <Text style={styles.perKg}>/ kg</Text>
      </Animated.View>

      {/* +/- buttons */}
      <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.adjustRow}>
        <TouchableOpacity style={styles.adjustBtn} onPress={() => adjustPrice(-1)}>
          <Ionicons name="remove" size={20} color={V2_COLORS.text} />
        </TouchableOpacity>
        <View style={styles.sliderTrack}>
          <View style={[styles.sliderFill, { width: `${Math.min(price, 50) * 2}%` }]} />
        </View>
        <TouchableOpacity style={styles.adjustBtn} onPress={() => adjustPrice(1)}>
          <Ionicons name="add" size={20} color={V2_COLORS.text} />
        </TouchableOpacity>
      </Animated.View>

      {/* Average range */}
      <Animated.View entering={FadeIn.delay(300)} style={styles.infoRow}>
        <Text style={styles.infoText}>
          📊{' '}
          {t('listing.wizard.pricing.average', {
            defaultValue: 'Average: SAR 12-20/kg',
            min: 12,
            max: 20,
          })}
        </Text>
      </Animated.View>

      {/* Estimated total */}
      <Animated.View entering={FadeIn.delay(400)} style={styles.estimateCard}>
        <Text style={styles.estimateLabel}>
          💡{' '}
          {t('listing.wizard.pricing.estimated', {
            defaultValue: `Estimated total: SAR ${estimatedTotal}`,
            total: estimatedTotal,
          })}
        </Text>
        <Text style={styles.estimateValue}>SAR {estimatedTotal.toFixed(0)}</Text>
        <Text style={styles.estimateNote}>(for {weight} kg)</Text>
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
    color: V2_COLORS.textSoft,
  },
  priceInput: {
    fontSize: 48,
    fontWeight: '700',
    minWidth: 80,
    textAlign: 'center',
    color: V2_COLORS.text,
  },
  perKg: {
    fontSize: 16,
    fontWeight: '500',
    color: V2_COLORS.textSoft,
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
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...BUBBLE_SHADOWS.xs,
  },
  sliderTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: V2_COLORS.cardShadow,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: V2_COLORS.primary,
  },
  infoRow: {
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: V2_COLORS.textSoft,
  },
  estimateCard: {
    borderRadius: RADIUS.card,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: V2_COLORS.primary + '08',
  },
  estimateLabel: {
    fontSize: 13,
    marginBottom: 4,
    color: V2_COLORS.textSoft,
  },
  estimateValue: {
    fontSize: 28,
    fontWeight: '700',
    color: V2_COLORS.primary,
  },
  estimateNote: {
    fontSize: 13,
    marginTop: 2,
    color: V2_COLORS.textMuted,
  },
  nextContainer: {
    marginTop: 8,
  },
});
