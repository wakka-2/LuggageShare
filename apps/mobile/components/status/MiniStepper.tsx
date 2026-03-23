import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { V2_COLORS } from '@/providers/ThemeProvider';

const STEPS = ['pending', 'accepted', 'picked_up', 'in_transit', 'delivered'] as const;

interface MiniStepperProps {
  currentStatus: string;
}

/**
 * Compact horizontal dot stepper for booking cards.
 * Shows 5 dots connected by lines — completed=mint, active=primary, future=muted.
 */
export function MiniStepper({ currentStatus }: MiniStepperProps) {
  const currentIndex = STEPS.indexOf(currentStatus as (typeof STEPS)[number]);

  // Don't render for terminal states
  if (currentStatus === 'rejected' || currentStatus === 'cancelled' || currentIndex === -1) {
    return null;
  }

  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
      {STEPS.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isLast = index === STEPS.length - 1;
        const fillColor = isCompleted
          ? V2_COLORS.accent1
          : isCurrent
            ? V2_COLORS.primary
            : V2_COLORS.cardShadow;

        return (
          <View key={step} style={styles.stepItem}>
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: fillColor,
                  width: isCurrent ? 10 : 8,
                  height: isCurrent ? 10 : 8,
                  borderRadius: isCurrent ? 5 : 4,
                },
              ]}
            >
              {isCompleted && <Ionicons name="checkmark" size={6} color="#FFF" />}
            </View>
            {!isLast && (
              <View
                style={[
                  styles.line,
                  { backgroundColor: isCompleted ? V2_COLORS.accent1 : V2_COLORS.cardShadow },
                ]}
              />
            )}
          </View>
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: {
    flex: 1,
    height: 2,
    marginHorizontal: 2,
    borderRadius: 1,
  },
});
