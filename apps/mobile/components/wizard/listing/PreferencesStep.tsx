import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { V2_COLORS, RADIUS, BUBBLE_SHADOWS } from '@/providers/ThemeProvider';
import { QuestionTitle } from '../QuestionTitle';
import { OptionGrid, GridOption } from '../OptionGrid';
import { AnimatedButton } from '@/components/animations/AnimatedButton';
import type { StepProps } from '../WizardContainer';

const CATEGORY_OPTIONS: GridOption[] = [
  { id: 'documents', emoji: '📄', label: 'Documents' },
  { id: 'clothing', emoji: '👗', label: 'Clothing' },
  { id: 'electronics', emoji: '📱', label: 'Electronics' },
  { id: 'gifts', emoji: '🎁', label: 'Gifts' },
  { id: 'medicine', emoji: '💊', label: 'Medicine' },
  { id: 'food', emoji: '🍫', label: 'Food/Snacks' },
];

export function PreferencesStep({ data, updateData, goNext }: StepProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const selectedCategories: string[] = data.acceptedCategories || [];

  const handleToggle = (id: string) => {
    const next = selectedCategories.includes(id)
      ? selectedCategories.filter((c) => c !== id)
      : [...selectedCategories, id];
    updateData({ acceptedCategories: next });
  };

  return (
    <View>
      <QuestionTitle
        emoji="📦"
        title={t('listing.wizard.preferences.title', { defaultValue: 'What can you carry?' })}
        subtitle={t('listing.wizard.preferences.tapAll', { defaultValue: 'Tap all that apply:' })}
      />

      {/* Category Grid */}
      <Animated.View entering={FadeInUp.delay(150).springify()} style={styles.section}>
        <OptionGrid
          options={CATEGORY_OPTIONS}
          selected={selectedCategories}
          onToggle={handleToggle}
          columns={2}
        />
      </Animated.View>

      {/* Notes */}
      <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.section}>
        <Text style={styles.label}>
          {t('listing.notes', { defaultValue: 'Notes (optional):' })}
        </Text>
        <TextInput
          style={styles.notesInput}
          value={data.notes || ''}
          onChangeText={(v) => updateData({ notes: v })}
          placeholder={t('listing.placeholderNotes', { defaultValue: 'No liquids please...' })}
          placeholderTextColor={V2_COLORS.textMuted}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          textAlign={isRTL ? 'right' : 'left'}
        />
      </Animated.View>

      {/* Next + Skip */}
      <View style={styles.actions}>
        <AnimatedButton
          title={t('wizard.next', { defaultValue: 'Next' })}
          onPress={goNext}
          size="lg"
          fullWidth
        />
        <AnimatedButton
          title={t('wizard.skip', { defaultValue: 'Skip' })}
          onPress={goNext}
          variant="ghost"
          size="sm"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: V2_COLORS.textSoft,
  },
  notesInput: {
    height: 80,
    borderRadius: RADIUS.card,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 15,
    backgroundColor: '#FFFFFF',
    color: V2_COLORS.text,
    ...BUBBLE_SHADOWS.xs,
  },
  actions: {
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
});
