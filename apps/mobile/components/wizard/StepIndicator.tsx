import React, { useEffect } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, SPACING } from '@/providers/ThemeProvider';

type StepStatus = 'completed' | 'current' | 'error' | 'upcoming';

export interface StepIndicatorProps {
  totalSteps: number;
  currentStep: number;
  stepIcons: string[];
  stepErrors: (string | null)[];
  onStepPress: (index: number) => void;
  maxVisited: number;
}

const CIRCLE = 34;
const CIRCLE_ACTIVE = 38;
const ICON = 15;
const ICON_ACTIVE = 17;
const LINE_H = 2.5;

function getStatus(
  index: number,
  currentStep: number,
  maxVisited: number,
  errors: (string | null)[]
): StepStatus {
  if (index === currentStep) return 'current';
  if (index <= maxVisited) return errors[index] ? 'error' : 'completed';
  return 'upcoming';
}

/* ── Pulse ring behind the active circle ── */
function PulseRing({ color }: { color: string }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.45, { duration: 1400, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 0 })
      ),
      -1
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 1400, easing: Easing.out(Easing.ease) }),
        withTiming(0.5, { duration: 0 })
      ),
      -1
    );
  }, [scale, opacity]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: CIRCLE_ACTIVE,
          height: CIRCLE_ACTIVE,
          borderRadius: CIRCLE_ACTIVE / 2,
          borderWidth: 2,
          borderColor: color,
        },
        style,
      ]}
    />
  );
}

/* ── Error badge pulse ── */
function ErrorPulse({ color }: { color: string }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1
    );
  }, [scale]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: CIRCLE + 6,
          height: CIRCLE + 6,
          borderRadius: (CIRCLE + 6) / 2,
          backgroundColor: color + '18',
        },
        style,
      ]}
    />
  );
}

/* ── Individual step circle ── */
function StepCircle({
  index,
  status,
  icon,
  onPress,
  colors,
}: {
  index: number;
  status: StepStatus;
  icon: string;
  onPress: () => void;
  colors: any;
}) {
  const isActive = status === 'current';
  const size = isActive ? CIRCLE_ACTIVE : CIRCLE;
  const canPress = status !== 'upcoming';

  const circleStyle = (() => {
    switch (status) {
      case 'completed':
        return { backgroundColor: colors.primary, borderWidth: 0 } as const;
      case 'error':
        return { backgroundColor: colors.error, borderWidth: 0 } as const;
      case 'current':
        return {
          backgroundColor: colors.primary + '12',
          borderWidth: 2.5,
          borderColor: colors.primary,
        } as const;
      case 'upcoming':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: colors.textMuted + '50',
        } as const;
    }
  })();

  const iconColor = (() => {
    switch (status) {
      case 'completed':
      case 'error':
        return '#fff';
      case 'current':
        return colors.primary;
      case 'upcoming':
        return colors.textMuted;
    }
  })();

  const iconName = (() => {
    if (status === 'completed') return 'checkmark';
    if (status === 'error') return 'alert';
    return icon;
  })();

  return (
    <Pressable
      onPress={canPress ? onPress : undefined}
      style={({ pressed }) => [
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          ...circleStyle,
          opacity: pressed && canPress ? 0.7 : 1,
          transform: [{ scale: pressed && canPress ? 0.9 : 1 }],
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Step ${index + 1}`}
      accessibilityState={{ selected: isActive }}
    >
      {isActive && <PulseRing color={colors.primary} />}
      {status === 'error' && <ErrorPulse color={colors.error} />}
      <Ionicons name={iconName as any} size={isActive ? ICON_ACTIVE : ICON} color={iconColor} />
    </Pressable>
  );
}

/* ── Main component ── */
export function StepIndicator({
  totalSteps,
  currentStep,
  stepIcons,
  stepErrors,
  onStepPress,
  maxVisited,
}: StepIndicatorProps) {
  const { colors } = useTheme();

  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
      {Array.from({ length: totalSteps }, (_, i) => {
        const status = getStatus(i, currentStep, maxVisited, stepErrors);
        const prevCompleted = i > 0 && i <= maxVisited && i <= currentStep;

        return (
          <React.Fragment key={i}>
            {i > 0 && (
              <View
                style={[
                  styles.connector,
                  {
                    backgroundColor: prevCompleted
                      ? stepErrors[i - 1]
                        ? colors.error + '40'
                        : colors.primary
                      : colors.textMuted + '25',
                  },
                ]}
              />
            )}
            <StepCircle
              index={i}
              status={status}
              icon={stepIcons[i] || 'ellipse'}
              onPress={() => onStepPress(i)}
              colors={colors}
            />
          </React.Fragment>
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING[5],
    paddingVertical: SPACING[3],
  },
  connector: {
    flex: 1,
    height: LINE_H,
    borderRadius: LINE_H / 2,
    marginHorizontal: 2,
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    ...({ cursor: 'pointer' } as any),
  },
});
