import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { V2_COLORS, RADIUS, BUBBLE_SHADOWS } from '@/providers/ThemeProvider';
import { QuestionTitle } from '../QuestionTitle';
import { AnimatedButton } from '@/components/animations/AnimatedButton';
import { DatePickerInput } from '@/components/common/DatePickerInput';
import type { StepProps } from '../WizardContainer';

export function DateFlightStep({ data, updateData, goNext }: StepProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const canAdvance = !!data.departureDate;

  return (
    <View>
      <QuestionTitle
        emoji="📅"
        title={t('listing.wizard.date.title', { defaultValue: 'When are you traveling?' })}
      />

      {/* Date Picker */}
      <Animated.View entering={FadeInUp.delay(150).springify()} style={styles.section}>
        <DatePickerInput
          value={data.departureDate ? new Date(data.departureDate) : null}
          onChange={(date) => updateData({ departureDate: date?.toISOString() })}
          placeholder={t('listing.selectDate', { defaultValue: 'Select date' })}
          minimumDate={new Date()}
          textAlign={isRTL ? 'right' : 'left'}
        />
      </Animated.View>

      {/* Flight Number */}
      <Animated.View entering={FadeInUp.delay(250).springify()} style={styles.section}>
        <View style={styles.inputLabel}>
          <Ionicons name="airplane" size={18} color={V2_COLORS.primary} />
          <Animated.Text style={styles.label}>
            {t('listing.wizard.date.flight', { defaultValue: 'Flight number (optional)' })}
          </Animated.Text>
        </View>
        <TextInput
          style={styles.input}
          value={data.flightNumber || ''}
          onChangeText={(v) => updateData({ flightNumber: v })}
          placeholder="SV 123"
          placeholderTextColor={V2_COLORS.textMuted}
          autoCapitalize="characters"
          textAlign={isRTL ? 'right' : 'left'}
        />
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
  nextContainer: {
    marginTop: 8,
  },
});
