import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, RADIUS } from '@/providers/ThemeProvider';
import { QuestionTitle } from '../QuestionTitle';
import { AnimatedButton } from '@/components/animations/AnimatedButton';
import { DatePickerInput } from '@/components/common/DatePickerInput';
import type { StepProps } from '../WizardContainer';

export function TripDateStep({ data, updateData, goNext }: StepProps) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const isRTL = i18n.language === 'ar';

  const isFlight = data.transportType === 'flight';
  const canAdvance = !!data.departureDate;

  return (
    <View>
      <QuestionTitle
        emoji="📅"
        title={t('tripWizard.date.title', { defaultValue: 'When do you depart?' })}
      />

      {/* Date Picker */}
      <Animated.View entering={FadeInUp.delay(150).springify()} style={styles.section}>
        <DatePickerInput
          value={data.departureDate ? new Date(data.departureDate) : null}
          onChange={(date) => updateData({ departureDate: date?.toISOString() })}
          placeholder={t('tripWizard.date.selectDate', { defaultValue: 'Select departure date' })}
          minimumDate={new Date()}
          textColor={colors.text}
          backgroundColor={colors.surface}
          borderColor={colors.border}
          placeholderColor={colors.textMuted}
          textAlign={isRTL ? 'right' : 'left'}
        />
      </Animated.View>

      {/* Flight Number — only shown for flights */}
      {isFlight && (
        <Animated.View entering={FadeInUp.delay(250).springify()} style={styles.section}>
          <View style={styles.inputLabel}>
            <Ionicons name="airplane" size={18} color={colors.primary} />
            <Animated.Text style={[styles.label, { color: colors.textSecondary }]}>
              {t('tripWizard.date.flightNumber', { defaultValue: 'Flight number (optional)' })}
            </Animated.Text>
          </View>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
            ]}
            value={data.flightNumber || ''}
            onChangeText={(v) => updateData({ flightNumber: v })}
            placeholder="SV 123"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="characters"
            textAlign={isRTL ? 'right' : 'left'}
          />
        </Animated.View>
      )}

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
