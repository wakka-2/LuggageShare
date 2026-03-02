import React, { useEffect } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/providers/ThemeProvider';

interface SkeletonLoaderProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function SkeletonLoader({ width, height, borderRadius = 8, style }: SkeletonLoaderProps) {
  const { colors, isDark } = useTheme();
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [shimmer]);

  const baseColor = isDark ? '#334155' : '#E5E7EB';
  const highlightColor = isDark ? '#475569' : '#F3F4F6';

  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolate(shimmer.value, [0, 0.5, 1], [0, 1, 0]);
    // Interpolate between base and highlight colors via opacity
    return {
      opacity: interpolate(shimmer.value, [0, 0.5, 1], [1, 0.6, 1]),
    };
  });

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: baseColor,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

/**
 * Pre-built skeleton for a card layout (title + 2 lines + price).
 */
export function SkeletonCard() {
  return (
    <Animated.View style={skeletonStyles.card}>
      <SkeletonLoader width="100%" height={120} borderRadius={16} />
      <Animated.View style={skeletonStyles.body}>
        <SkeletonLoader width="70%" height={18} borderRadius={4} />
        <SkeletonLoader width="90%" height={14} borderRadius={4} style={{ marginTop: 8 }} />
        <SkeletonLoader width="40%" height={14} borderRadius={4} style={{ marginTop: 8 }} />
        <Animated.View style={skeletonStyles.footer}>
          <SkeletonLoader width={32} height={32} borderRadius={16} />
          <SkeletonLoader width={80} height={14} borderRadius={4} />
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const skeletonStyles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  body: {
    padding: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
  },
});
