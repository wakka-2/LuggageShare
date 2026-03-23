import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { V2_COLORS, RADIUS, BUBBLE_SHADOWS } from '@/providers/ThemeProvider';
import { QuestionTitle } from '../QuestionTitle';
import { AnimatedButton } from '@/components/animations/AnimatedButton';
import type { StepProps } from '../WizardContainer';

const SIZE_OPTIONS = [
  { id: 'envelope', emoji: '📨', label: 'Envelope', range: '< 1kg', defaultWeight: 0.5 },
  { id: 'small', emoji: '📦', label: 'Small Box', range: '1-3kg', defaultWeight: 2 },
  { id: 'medium', emoji: '📦📦', label: 'Medium Box', range: '3-7kg', defaultWeight: 5 },
];

export function WeightValueStep({ data, updateData, goNext }: StepProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const weight = data.weight || '';
  const canAdvance = !!weight && parseFloat(weight) > 0;

  const handleSizeSelect = (option: (typeof SIZE_OPTIONS)[0]) => {
    updateData({
      sizeCategory: option.id,
      weight: String(option.defaultWeight),
    });
  };

  return (
    <View>
      <QuestionTitle
        emoji="⚖️"
        title={t('booking.wizard.weight.title', { defaultValue: 'How heavy is your item?' })}
      />

      {/* Visual Size Picker */}
      <Animated.View entering={FadeInUp.delay(150).springify()} style={styles.sizeRow}>
        {SIZE_OPTIONS.map((opt) => {
          const isSelected = data.sizeCategory === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              onPress={() => handleSizeSelect(opt)}
              style={[
                styles.sizeCard,
                isSelected && styles.sizeCardSelected,
                !isSelected && BUBBLE_SHADOWS.sm,
                { transform: [{ translateY: isSelected ? -4 : 0 }] },
              ]}
            >
              <Text style={styles.sizeEmoji}>{opt.emoji}</Text>
              <Text
                style={[
                  styles.sizeLabel,
                  { color: isSelected ? V2_COLORS.primary : V2_COLORS.text },
                ]}
              >
                {opt.label}
              </Text>
              <Text style={styles.sizeRange}>{opt.range}</Text>
            </TouchableOpacity>
          );
        })}
      </Animated.View>

      {/* Exact Weight */}
      <Animated.View entering={FadeInUp.delay(250).springify()} style={styles.section}>
        <Text style={styles.label}>
          {t('booking.wizard.weight.exact', { defaultValue: 'Exact weight' })} (kg)
        </Text>
        <TextInput
          style={styles.input}
          value={weight}
          onChangeText={(v) => updateData({ weight: v })}
          placeholder="0.0"
          placeholderTextColor={V2_COLORS.textMuted}
          keyboardType="numeric"
          textAlign={isRTL ? 'right' : 'left'}
        />
      </Animated.View>

      {/* Declared Value */}
      <Animated.View entering={FadeInUp.delay(350).springify()} style={styles.section}>
        <Text style={styles.label}>
          {t('booking.wizard.weight.value', { defaultValue: 'Declared value' })} (SAR)
        </Text>
        <TextInput
          style={styles.input}
          value={data.declaredValue || ''}
          onChangeText={(v) => updateData({ declaredValue: v })}
          placeholder="0"
          placeholderTextColor={V2_COLORS.textMuted}
          keyboardType="numeric"
          textAlign={isRTL ? 'right' : 'left'}
        />
        <Text style={styles.hint}>
          {t('booking.wizard.weight.insurance', { defaultValue: '(for insurance purposes)' })}
        </Text>
      </Animated.View>

      {/* Next */}
      {canAdvance && (
        <Animated.View entering={FadeInUp.delay(100).springify()}>
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
  sizeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  sizeCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: RADIUS.card,
    backgroundColor: '#FFFFFF',
  },
  sizeCardSelected: {
    backgroundColor: V2_COLORS.primary + '08',
    borderWidth: 1.5,
    borderColor: V2_COLORS.primary,
  },
  sizeEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  sizeLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  sizeRange: {
    fontSize: 11,
    marginTop: 2,
    color: V2_COLORS.textSoft,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: V2_COLORS.textSoft,
  },
  input: {
    height: 48,
    borderRadius: RADIUS.input,
    paddingHorizontal: 20,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: V2_COLORS.text,
    ...BUBBLE_SHADOWS.xs,
  },
  hint: {
    fontSize: 12,
    marginTop: 4,
    color: V2_COLORS.textMuted,
  },
});
