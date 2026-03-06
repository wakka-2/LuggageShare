import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { V2_COLORS, RADIUS } from '@/providers/ThemeProvider';
import { ANIM } from '@/lib/animations';

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
  color?: string;
}

export function WizardProgress({ currentStep, totalSteps, color }: WizardProgressProps) {
  const fillColor = color ?? V2_COLORS.primary;
  const progress = (currentStep + 1) / totalSteps;

  const animatedWidth = useAnimatedStyle(() => ({
    width: withTiming(`${progress * 100}%` as any, ANIM.timing.normal),
  }));

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { backgroundColor: fillColor }, animatedWidth]} />
      </View>
      <View style={styles.badge}>
        <Text style={styles.label}>
          {currentStep + 1}/{totalSteps}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  track: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: V2_COLORS.cardShadow,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  badge: {
    backgroundColor: V2_COLORS.cardShadow,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: V2_COLORS.textSoft,
  },
});
