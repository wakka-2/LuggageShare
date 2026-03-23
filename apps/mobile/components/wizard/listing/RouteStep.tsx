import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { V2_COLORS, RADIUS, BUBBLE_SHADOWS } from '@/providers/ThemeProvider';
import { QuestionTitle } from '../QuestionTitle';
import { OptionChips, ChipOption } from '../OptionChips';
import { AnimatedButton } from '@/components/animations/AnimatedButton';
import type { StepProps } from '../WizardContainer';

const POPULAR_ROUTES: ChipOption[] = [
  { id: 'ruh-jed', label: 'Riyadh → Jeddah' },
  { id: 'ruh-dxb', label: 'RUH → DXB' },
  { id: 'jed-cai', label: 'Jeddah → Cairo' },
  { id: 'ruh-amm', label: 'RUH → AMM' },
];

const ROUTE_MAP: Record<string, { from: string; fromCode: string; to: string; toCode: string }> = {
  'ruh-jed': { from: 'Riyadh', fromCode: 'RUH', to: 'Jeddah', toCode: 'JED' },
  'ruh-dxb': { from: 'Riyadh', fromCode: 'RUH', to: 'Dubai', toCode: 'DXB' },
  'jed-cai': { from: 'Jeddah', fromCode: 'JED', to: 'Cairo', toCode: 'CAI' },
  'ruh-amm': { from: 'Riyadh', fromCode: 'RUH', to: 'Amman', toCode: 'AMM' },
};

export function RouteStep({ data, updateData, goNext }: StepProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const canAdvance = !!data.departureCity?.trim() && !!data.arrivalCity?.trim();

  const handlePopularRoute = (id: string) => {
    const route = ROUTE_MAP[id];
    if (route) {
      updateData({
        departureCity: route.from,
        departureCode: route.fromCode,
        arrivalCity: route.to,
        arrivalCode: route.toCode,
      });
    }
  };

  return (
    <View>
      <QuestionTitle
        emoji="✈️"
        title={t('listing.wizard.route.title', { defaultValue: 'Where are you traveling?' })}
      />

      {/* From */}
      <Animated.View entering={FadeInUp.delay(150).springify()} style={styles.inputGroup}>
        <View style={styles.inputLabel}>
          <View style={[styles.dot, { backgroundColor: V2_COLORS.accent1 }]} />
          <Animated.Text style={styles.label}>
            {t('listing.wizard.route.from', { defaultValue: 'From' })}
          </Animated.Text>
        </View>
        <TextInput
          style={styles.input}
          value={data.departureCity || ''}
          onChangeText={(v) => updateData({ departureCity: v })}
          placeholder={t('listing.wizard.route.searchCity', { defaultValue: 'Search city...' })}
          placeholderTextColor={V2_COLORS.textMuted}
          textAlign={isRTL ? 'right' : 'left'}
        />
        <TextInput
          style={styles.codeInput}
          value={data.departureCode || ''}
          onChangeText={(v) => updateData({ departureCode: v.toUpperCase() })}
          placeholder="RUH"
          placeholderTextColor={V2_COLORS.textMuted}
          maxLength={4}
          autoCapitalize="characters"
          textAlign="center"
        />
      </Animated.View>

      {/* To */}
      <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.inputGroup}>
        <View style={styles.inputLabel}>
          <View style={[styles.dot, { backgroundColor: V2_COLORS.secondary }]} />
          <Animated.Text style={styles.label}>
            {t('listing.wizard.route.to', { defaultValue: 'To' })}
          </Animated.Text>
        </View>
        <TextInput
          style={styles.input}
          value={data.arrivalCity || ''}
          onChangeText={(v) => updateData({ arrivalCity: v })}
          placeholder={t('listing.wizard.route.searchCity', { defaultValue: 'Search city...' })}
          placeholderTextColor={V2_COLORS.textMuted}
          textAlign={isRTL ? 'right' : 'left'}
        />
        <TextInput
          style={styles.codeInput}
          value={data.arrivalCode || ''}
          onChangeText={(v) => updateData({ arrivalCode: v.toUpperCase() })}
          placeholder="JED"
          placeholderTextColor={V2_COLORS.textMuted}
          maxLength={4}
          autoCapitalize="characters"
          textAlign="center"
        />
      </Animated.View>

      {/* Popular Routes */}
      <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.popular}>
        <Animated.Text style={styles.popularLabel}>
          {t('listing.wizard.route.popular', { defaultValue: 'Popular Routes:' })}
        </Animated.Text>
        <OptionChips options={POPULAR_ROUTES} selected={null} onSelect={handlePopularRoute} />
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
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
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
    marginBottom: 8,
    ...BUBBLE_SHADOWS.xs,
  },
  codeInput: {
    height: 40,
    width: 80,
    borderRadius: RADIUS.input,
    paddingHorizontal: 8,
    fontSize: 14,
    fontWeight: '700',
    backgroundColor: '#FFFFFF',
    color: V2_COLORS.text,
    letterSpacing: 1,
    ...BUBBLE_SHADOWS.xs,
  },
  popular: {
    marginTop: 8,
    marginBottom: 24,
  },
  popularLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: V2_COLORS.textSoft,
    marginBottom: 8,
  },
  nextContainer: {
    marginTop: 8,
  },
});
