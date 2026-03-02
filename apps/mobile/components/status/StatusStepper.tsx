import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, RADIUS } from '@/providers/ThemeProvider';
import { useTranslation } from 'react-i18next';

export interface StatusStep {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  completedAt?: string | null;
}

interface StatusStepperProps {
  steps: StatusStep[];
  currentStepKey: string;
}

const BOOKING_STEPS: StatusStep[] = [
  { key: 'pending', label: 'Pending', icon: 'time-outline' },
  { key: 'accepted', label: 'Accepted', icon: 'checkmark-circle-outline' },
  { key: 'picked_up', label: 'Picked Up', icon: 'hand-left-outline' },
  { key: 'in_transit', label: 'In Transit', icon: 'airplane-outline' },
  { key: 'delivered', label: 'Delivered', icon: 'checkmark-done-outline' },
];

export function getDefaultBookingSteps(): StatusStep[] {
  return BOOKING_STEPS;
}

function StepDot({
  isCompleted,
  isCurrent,
  index,
}: {
  isCompleted: boolean;
  isCurrent: boolean;
  index: number;
}) {
  const { colors } = useTheme();

  const fillColor = isCompleted ? colors.success : isCurrent ? colors.primary : colors.border;

  return (
    <Animated.View
      entering={FadeIn.delay(index * 100).duration(300)}
      style={[
        styles.dot,
        {
          backgroundColor: fillColor,
          borderColor: isCurrent ? colors.primary : 'transparent',
          borderWidth: isCurrent ? 2 : 0,
        },
      ]}
    >
      {isCompleted && <Ionicons name="checkmark" size={14} color="#FFF" />}
    </Animated.View>
  );
}

export function StatusStepper({ steps, currentStepKey }: StatusStepperProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const currentIndex = steps.findIndex((s) => s.key === currentStepKey);

  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isLast = index === steps.length - 1;

        return (
          <View key={step.key} style={styles.stepRow}>
            <View style={styles.dotColumn}>
              <StepDot isCompleted={isCompleted} isCurrent={isCurrent} index={index} />
              {!isLast && (
                <View
                  style={[
                    styles.connector,
                    {
                      backgroundColor: isCompleted ? colors.success : colors.border,
                    },
                  ]}
                />
              )}
            </View>
            <Animated.View
              entering={FadeIn.delay(index * 100 + 50).duration(300)}
              style={styles.labelContainer}
            >
              <Ionicons
                name={step.icon}
                size={16}
                color={isCompleted ? colors.success : isCurrent ? colors.primary : colors.textMuted}
              />
              <Text
                style={[
                  styles.label,
                  {
                    color: isCompleted
                      ? colors.success
                      : isCurrent
                        ? colors.text
                        : colors.textMuted,
                    fontWeight: isCurrent ? '600' : '400',
                  },
                ]}
              >
                {step.label}
              </Text>
              {step.completedAt && (
                <Text style={[styles.date, { color: colors.textMuted }]}>
                  {new Date(step.completedAt).toLocaleDateString()}
                </Text>
              )}
            </Animated.View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dotColumn: {
    alignItems: 'center',
    width: 32,
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connector: {
    width: 2,
    height: 28,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 24,
    flex: 1,
  },
  label: {
    fontSize: 14,
    flex: 1,
  },
  date: {
    fontSize: 11,
  },
});
