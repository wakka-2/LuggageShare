import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { useTheme, RADIUS } from '@/providers/ThemeProvider';
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
  const { colors } = useTheme();
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
                {
                  backgroundColor: isSelected ? colors.primary + '10' : colors.surface,
                  borderColor: isSelected ? colors.primary : colors.border,
                  transform: [{ translateY: isSelected ? -4 : 0 }],
                },
              ]}
            >
              <Text style={styles.sizeEmoji}>{opt.emoji}</Text>
              <Text
                style={[styles.sizeLabel, { color: isSelected ? colors.primary : colors.text }]}
              >
                {opt.label}
              </Text>
              <Text style={[styles.sizeRange, { color: colors.textSecondary }]}>{opt.range}</Text>
            </TouchableOpacity>
          );
        })}
      </Animated.View>

      {/* Exact Weight */}
      <Animated.View entering={FadeInUp.delay(250).springify()} style={styles.section}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {t('booking.wizard.weight.exact', { defaultValue: 'Exact weight' })} (kg)
        </Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
          ]}
          value={weight}
          onChangeText={(v) => updateData({ weight: v })}
          placeholder="0.0"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
          textAlign={isRTL ? 'right' : 'left'}
        />
      </Animated.View>

      {/* Declared Value */}
      <Animated.View entering={FadeInUp.delay(350).springify()} style={styles.section}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {t('booking.wizard.weight.value', { defaultValue: 'Declared value' })} (SAR)
        </Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
          ]}
          value={data.declaredValue || ''}
          onChangeText={(v) => updateData({ declaredValue: v })}
          placeholder="0"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
          textAlign={isRTL ? 'right' : 'left'}
        />
        <Text style={[styles.hint, { color: colors.textMuted }]}>
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
    borderRadius: RADIUS.button,
    borderWidth: 1.5,
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
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: RADIUS.input,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  hint: {
    fontSize: 12,
    marginTop: 4,
  },
});
