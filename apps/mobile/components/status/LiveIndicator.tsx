import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { V2_COLORS } from '@/providers/ThemeProvider';

interface LiveIndicatorProps {
  label?: string;
  color?: string;
  size?: 'small' | 'medium';
}

export function LiveIndicator({ label, color, size = 'small' }: LiveIndicatorProps) {
  const dotColor = color || V2_COLORS.accent1;
  const dotSize = size === 'small' ? 8 : 12;
  const pulseSize = size === 'small' ? 18 : 24;

  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.4);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.8, { duration: 1000, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 0 })
      ),
      -1,
      false
    );
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 1000, easing: Easing.out(Easing.ease) }),
        withTiming(0.4, { duration: 0 })
      ),
      -1,
      false
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <View style={[styles.dotWrapper, { width: pulseSize, height: pulseSize }]}>
        <Animated.View
          style={[
            styles.pulse,
            {
              width: pulseSize,
              height: pulseSize,
              borderRadius: pulseSize / 2,
              backgroundColor: dotColor,
            },
            pulseStyle,
          ]}
        />
        <View
          style={[
            styles.dot,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: dotColor,
            },
          ]}
        />
      </View>
      {label && <Text style={styles.label}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dotWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    position: 'absolute',
  },
  dot: {},
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: V2_COLORS.text,
  },
});
