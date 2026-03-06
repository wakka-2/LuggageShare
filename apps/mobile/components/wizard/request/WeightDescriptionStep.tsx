import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, RADIUS } from '@/providers/ThemeProvider';
import { QuestionTitle } from '../QuestionTitle';
import { AnimatedButton } from '@/components/animations/AnimatedButton';
import type { StepProps } from '../WizardContainer';

export function WeightDescriptionStep({ data, updateData, goNext }: StepProps) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const isRTL = i18n.language === 'ar';

  const canAdvance = !!data.weight && parseFloat(data.weight) > 0;

  return (
    <View>
      <QuestionTitle
        emoji="📦"
        title={t('requestWizard.weightDesc.title', { defaultValue: 'What do you need to send?' })}
      />

      {/* Weight */}
      <Animated.View entering={FadeInUp.delay(150).springify()} style={styles.section}>
        <View style={styles.inputLabel}>
          <Ionicons name="scale-outline" size={18} color={colors.primary} />
          <Animated.Text style={[styles.label, { color: colors.textSecondary }]}>
            {t('requestWizard.weightDesc.weight', { defaultValue: 'Weight (kg)' })}
          </Animated.Text>
        </View>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
          ]}
          value={data.weight || ''}
          onChangeText={(v) => updateData({ weight: v })}
          placeholder="5"
          placeholderTextColor={colors.textMuted}
          keyboardType="decimal-pad"
          textAlign={isRTL ? 'right' : 'left'}
        />
      </Animated.View>

      {/* Description */}
      <Animated.View entering={FadeInUp.delay(250).springify()} style={styles.section}>
        <View style={styles.inputLabel}>
          <Ionicons name="document-text-outline" size={18} color={colors.primary} />
          <Animated.Text style={[styles.label, { color: colors.textSecondary }]}>
            {t('requestWizard.weightDesc.description', { defaultValue: 'Description (optional)' })}
          </Animated.Text>
        </View>
        <TextInput
          style={[
            styles.textArea,
            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
          ]}
          value={data.description || ''}
          onChangeText={(v) => updateData({ description: v })}
          placeholder={t('requestWizard.weightDesc.descPlaceholder', {
            defaultValue: 'Describe what you need to send...',
          })}
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          textAlign={isRTL ? 'right' : 'left'}
        />
      </Animated.View>

      {/* Item Types */}
      <Animated.View entering={FadeInUp.delay(350).springify()} style={styles.section}>
        <View style={styles.inputLabel}>
          <Ionicons name="list-outline" size={18} color={colors.primary} />
          <Animated.Text style={[styles.label, { color: colors.textSecondary }]}>
            {t('requestWizard.weightDesc.itemTypes', { defaultValue: 'Item types (optional)' })}
          </Animated.Text>
        </View>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
          ]}
          value={data.itemTypesText || ''}
          onChangeText={(v) => updateData({ itemTypesText: v })}
          placeholder={t('requestWizard.weightDesc.itemTypesPlaceholder', {
            defaultValue: 'e.g. Electronics, Documents',
          })}
          placeholderTextColor={colors.textMuted}
          textAlign={isRTL ? 'right' : 'left'}
        />
      </Animated.View>

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
  textArea: {
    minHeight: 80,
    borderRadius: RADIUS.input,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  nextContainer: {
    marginTop: 8,
  },
});
