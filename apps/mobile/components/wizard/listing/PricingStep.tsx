import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/providers/ThemeProvider';
import { QuestionTitle } from '../QuestionTitle';
import { AnimatedButton } from '@/components/animations/AnimatedButton';
import type { StepProps } from '../WizardContainer';

export function PricingStep({ data, updateData, goNext }: StepProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const price = data.price ?? 25;
  const canAdvance = price > 0;

  const adjustPrice = (delta: number) => {
    const next = Math.max(1, Math.min(999, price + delta));
    updateData({ price: next });
  };

  return (
    <View>
      <QuestionTitle
        emoji="💰"
        title={t('listing.wizard.pricing.title', { defaultValue: 'Set your price' })}
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
      </Animated.View>

      {/* +/- buttons */}
      <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.adjustRow}>
        <TouchableOpacity
          style={[styles.adjustBtn, { borderColor: colors.border }]}
          onPress={() => adjustPrice(-5)}
        >
          <Ionicons name="remove" size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={[styles.sliderTrack, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.sliderFill,
              { backgroundColor: colors.primary, width: `${Math.min(price / 999, 1) * 100}%` },
            ]}
          />
        </View>
        <TouchableOpacity
          style={[styles.adjustBtn, { borderColor: colors.border }]}
          onPress={() => adjustPrice(5)}
        >
          <Ionicons name="add" size={20} color={colors.text} />
        </TouchableOpacity>
      </Animated.View>

      {/* Next */}
      {canAdvance && (
        <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.nextContainer}>
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
  nextContainer: {
    marginTop: 8,
  },
});
