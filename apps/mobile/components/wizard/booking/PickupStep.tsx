import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, RADIUS } from '@/providers/ThemeProvider';
import { QuestionTitle } from '../QuestionTitle';
import { AnimatedButton } from '@/components/animations/AnimatedButton';
import type { StepProps } from '../WizardContainer';

export function PickupStep({ data, updateData, goNext }: StepProps) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const isRTL = i18n.language === 'ar';

  const canAdvance = !!data.pickupLocation?.trim();

  return (
    <View>
      <QuestionTitle
        emoji="📍"
        title={t('booking.wizard.pickup.title', {
          defaultValue: 'Where should the carrier pick up?',
        })}
      />

      {/* Map placeholder */}
      <Animated.View
        entering={FadeInUp.delay(150).springify()}
        style={[
          styles.mapPlaceholder,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Ionicons name="map-outline" size={48} color={colors.textMuted} />
        <Text style={[styles.mapText, { color: colors.textMuted }]}>Map coming soon</Text>
      </Animated.View>

      {/* Meeting point description */}
      <Animated.View entering={FadeInUp.delay(250).springify()} style={styles.section}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {t('booking.wizard.pickup.describe', { defaultValue: 'Describe meeting point:' })}
        </Text>
        <TextInput
          style={[
            styles.textArea,
            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
          ]}
          value={data.pickupLocation || ''}
          onChangeText={(v) => updateData({ pickupLocation: v })}
          placeholder="King Khalid Airport, Terminal 1, Gate 3"
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          textAlign={isRTL ? 'right' : 'left'}
        />
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
  mapPlaceholder: {
    height: 160,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  mapText: {
    fontSize: 14,
    marginTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  textArea: {
    height: 80,
    borderRadius: RADIUS.input,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
  },
});
