import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, RADIUS } from '@/providers/ThemeProvider';
import { QuestionTitle } from '../QuestionTitle';
import { AnimatedButton } from '@/components/animations/AnimatedButton';
import type { StepProps } from '../WizardContainer';

export function BudgetStep({ data, updateData, goNext }: StepProps) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const isRTL = i18n.language === 'ar';

  return (
    <View>
      <QuestionTitle
        emoji="💰"
        title={t('requestWizard.budget.title', { defaultValue: 'What is your budget?' })}
      />

      <Animated.View entering={FadeInUp.delay(150).springify()} style={styles.section}>
        <View style={styles.inputLabel}>
          <Ionicons name="cash-outline" size={18} color={colors.primary} />
          <Animated.Text style={[styles.label, { color: colors.textSecondary }]}>
            {t('requestWizard.budget.amount', { defaultValue: 'Budget (SAR) — optional' })}
          </Animated.Text>
        </View>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
          ]}
          value={data.budget || ''}
          onChangeText={(v) => updateData({ budget: v })}
          placeholder="50"
          placeholderTextColor={colors.textMuted}
          keyboardType="decimal-pad"
          textAlign={isRTL ? 'right' : 'left'}
        />
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(250).springify()} style={styles.section}>
        <View style={styles.inputLabel}>
          <Ionicons name="globe-outline" size={18} color={colors.primary} />
          <Animated.Text style={[styles.label, { color: colors.textSecondary }]}>
            {t('requestWizard.budget.currency', { defaultValue: 'Currency' })}
          </Animated.Text>
        </View>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
          ]}
          value={data.currency || 'SAR'}
          onChangeText={(v) => updateData({ currency: v.toUpperCase() })}
          placeholder="SAR"
          placeholderTextColor={colors.textMuted}
          maxLength={3}
          autoCapitalize="characters"
          textAlign={isRTL ? 'right' : 'left'}
        />
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(100).springify()} style={styles.nextContainer}>
        <AnimatedButton
          title={t('wizard.next', { defaultValue: 'Next' })}
          onPress={goNext}
          size="lg"
          fullWidth
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    height: 48,
    borderRadius: RADIUS.input,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  nextContainer: {
    marginTop: 8,
  },
});
