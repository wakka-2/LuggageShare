import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, RADIUS } from '@/providers/ThemeProvider';
import { QuestionTitle } from '../QuestionTitle';
import { AnimatedButton } from '@/components/animations/AnimatedButton';
import { ANIM, createStaggerDelay } from '@/lib/animations';
import type { StepProps } from '../WizardContainer';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const TRANSPORT_OPTIONS: { id: string; icon: keyof typeof Ionicons.glyphMap; emoji: string }[] = [
  { id: 'flight', icon: 'airplane-outline', emoji: '✈️' },
  { id: 'car', icon: 'car-outline', emoji: '🚗' },
  { id: 'bus', icon: 'bus-outline', emoji: '🚌' },
  { id: 'train', icon: 'train-outline', emoji: '🚆' },
];

function TransportOption({
  option,
  isSelected,
  onSelect,
  index,
}: {
  option: (typeof TRANSPORT_OPTIONS)[0];
  isSelected: boolean;
  onSelect: (id: string) => void;
  index: number;
}) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.95, ANIM.spring.snappy);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, ANIM.spring.bouncy);
  }, [scale]);

  return (
    <AnimatedTouchable
      entering={FadeInUp.delay(createStaggerDelay(index, 50)).springify()}
      onPress={() => onSelect(option.id)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      style={[
        styles.item,
        {
          backgroundColor: isSelected ? colors.primary + '10' : colors.surface,
          borderColor: isSelected ? colors.primary : colors.border,
        },
        animatedStyle,
      ]}
    >
      <Text style={styles.itemEmoji}>{option.emoji}</Text>
      <Text style={[styles.itemLabel, { color: isSelected ? colors.primary : colors.text }]}>
        {t(`tripWizard.transport.${option.id}`, {
          defaultValue: option.id.charAt(0).toUpperCase() + option.id.slice(1),
        })}
      </Text>
      {isSelected && (
        <View style={[styles.checkBadge, { backgroundColor: colors.primary }]}>
          <Ionicons name="checkmark" size={12} color="#FFFFFF" />
        </View>
      )}
    </AnimatedTouchable>
  );
}

export function TransportStep({ data, updateData, goNext }: StepProps) {
  const { t } = useTranslation();
  const canAdvance = !!data.transportType;

  return (
    <View>
      <QuestionTitle
        emoji="🚀"
        title={t('tripWizard.transport.title', { defaultValue: 'How are you traveling?' })}
      />

      <View style={styles.grid}>
        {TRANSPORT_OPTIONS.map((opt, i) => (
          <TransportOption
            key={opt.id}
            option={opt}
            isSelected={data.transportType === opt.id}
            onSelect={(id) => updateData({ transportType: id })}
            index={i}
          />
        ))}
      </View>

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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  item: {
    width: '47%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderRadius: RADIUS.button,
    borderWidth: 1.5,
    position: 'relative',
  },
  itemEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  itemLabel: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextContainer: {
    marginTop: 16,
  },
});
