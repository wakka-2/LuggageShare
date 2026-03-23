import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { V2_COLORS } from '@/providers/ThemeProvider';
import { QuestionTitle } from '../QuestionTitle';
import { OptionChips, ChipOption } from '../OptionChips';
import { AnimatedButton } from '@/components/animations/AnimatedButton';
import type { StepProps } from '../WizardContainer';

const WEIGHT_OPTIONS: ChipOption[] = [
  { id: '2', label: '2 kg' },
  { id: '5', label: '5 kg' },
  { id: '10', label: '10 kg' },
  { id: '15', label: '15 kg' },
  { id: '20', label: '20 kg' },
  { id: '23', label: '23 kg' },
];

export function WeightStep({ data, updateData, goNext }: StepProps) {
  const { t } = useTranslation();

  const weight = data.availableWeight ? String(data.availableWeight) : null;
  const canAdvance = !!weight && parseFloat(weight) > 0;

  const handleSelect = (id: string) => {
    updateData({ availableWeight: parseFloat(id) });
  };

  const weightNum = parseFloat(weight || '0');
  const suitcaseSize = 40 + Math.min(weightNum, 23) * 2.5;

  return (
    <View>
      <QuestionTitle
        emoji="⚖️"
        title={t('listing.wizard.weight.title', { defaultValue: 'How much weight can you carry?' })}
      />

      {/* Suitcase visual */}
      <Animated.View entering={FadeIn.delay(150)} style={styles.suitcaseContainer}>
        <Text style={{ fontSize: suitcaseSize }}>🧳</Text>
        {canAdvance && (
          <Animated.Text entering={FadeIn.duration(200)} style={styles.weightDisplay}>
            {weightNum.toFixed(1)} kg
          </Animated.Text>
        )}
      </Animated.View>

      {/* Quick select */}
      <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.section}>
        <Text style={styles.sectionLabel}>
          {t('listing.wizard.weight.quickSelect', { defaultValue: 'Quick select:' })}
        </Text>
        <OptionChips options={WEIGHT_OPTIONS} selected={weight} onSelect={handleSelect} />
      </Animated.View>

      {/* Hint */}
      <Animated.View entering={FadeIn.delay(1000)} style={styles.hint}>
        <Text style={styles.hintText}>
          💡 {t('listing.wizard.weight.hint', { defaultValue: 'Average carry: 5-10kg' })}
        </Text>
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
  suitcaseContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  weightDisplay: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
    color: V2_COLORS.primary,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    color: V2_COLORS.textSoft,
  },
  hint: {
    marginBottom: 24,
  },
  hintText: {
    fontSize: 14,
    color: V2_COLORS.textMuted,
  },
  nextContainer: {
    marginTop: 8,
  },
});
