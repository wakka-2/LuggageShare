import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { V2_COLORS, RADIUS, BUBBLE_SHADOWS } from '@/providers/ThemeProvider';
import { QuestionTitle } from '../QuestionTitle';
import { OptionChips, ChipOption } from '../OptionChips';
import { AnimatedButton } from '@/components/animations/AnimatedButton';
import type { StepProps } from '../WizardContainer';

const CATEGORIES: ChipOption[] = [
  { id: 'electronics', label: '📱 Electronics' },
  { id: 'clothing', label: '👗 Clothing' },
  { id: 'documents', label: '📄 Documents' },
  { id: 'gifts', label: '🎁 Gifts' },
  { id: 'medicine', label: '💊 Medicine' },
  { id: 'other', label: 'Other' },
];

export function ItemDetailsStep({ data, updateData, goNext }: StepProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const canAdvance = !!data.itemName?.trim();

  return (
    <View>
      <QuestionTitle
        emoji="📦"
        title={t('booking.wizard.item.title', { defaultValue: 'What are you sending?' })}
      />

      {/* Item Name */}
      <Animated.View entering={FadeInUp.delay(150).springify()} style={styles.section}>
        <TextInput
          style={styles.input}
          value={data.itemName || ''}
          onChangeText={(v) => updateData({ itemName: v })}
          placeholder={t('booking.wizard.item.name', { defaultValue: 'Item name' })}
          placeholderTextColor={V2_COLORS.textMuted}
          textAlign={isRTL ? 'right' : 'left'}
        />
      </Animated.View>

      {/* Category */}
      <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.section}>
        <OptionChips
          options={CATEGORIES}
          selected={data.category || null}
          onSelect={(id) => updateData({ category: id })}
        />
      </Animated.View>

      {/* Description */}
      <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.section}>
        <TextInput
          style={styles.textArea}
          value={data.description || ''}
          onChangeText={(v) => updateData({ description: v })}
          placeholder={t('booking.wizard.item.description', {
            defaultValue: 'Description (optional)',
          })}
          placeholderTextColor={V2_COLORS.textMuted}
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
  section: {
    marginBottom: 20,
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
  textArea: {
    height: 80,
    borderRadius: RADIUS.card,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 15,
    backgroundColor: '#FFFFFF',
    color: V2_COLORS.text,
    ...BUBBLE_SHADOWS.xs,
  },
});
