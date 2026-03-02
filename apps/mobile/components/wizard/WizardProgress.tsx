import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/providers/ThemeProvider';
import { ANIM } from '@/lib/animations';

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
  color?: string;
}

export function WizardProgress({ currentStep, totalSteps, color }: WizardProgressProps) {
  const { colors } = useTheme();
  const fillColor = color ?? colors.primary;
  const progress = (currentStep + 1) / totalSteps;

  const animatedWidth = useAnimatedStyle(() => ({
    width: withTiming(`${progress * 100}%` as any, ANIM.timing.normal),
  }));

  return (
    <View style={styles.container}>
      <View style={[styles.track, { backgroundColor: colors.border }]}>
        <Animated.View style={[styles.fill, { backgroundColor: fillColor }, animatedWidth]} />
      </View>
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        {currentStep + 1}/{totalSteps}
      </Text>
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
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    minWidth: 28,
    textAlign: 'right',
  },
});
