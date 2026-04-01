import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { V2_COLORS } from '@/providers/ThemeProvider';

interface GlowingOrbProps {
  size?: number;
  color?: string;
  delay?: number;
  style?: ViewStyle;
}

export function GlowingOrb({
  size = 60,
  color = V2_COLORS.primaryMid,
  delay = 0,
  style,
}: GlowingOrbProps) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.sin) }), -1, true)
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulse.value, [0, 1], [0.85, 1.15]) }],
    opacity: interpolate(pulse.value, [0, 1], [0.15, 0.35]),
  }));

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

interface OrbClusterProps {
  position?: 'top-right' | 'bottom-left' | 'center-right' | 'top-left';
  style?: ViewStyle;
}

export function OrbCluster({ position = 'top-right', style }: OrbClusterProps) {
  const positionStyles: Record<string, ViewStyle> = {
    'top-right': { position: 'absolute', top: -20, right: -15 },
    'bottom-left': { position: 'absolute', bottom: -10, left: -20 },
    'center-right': { position: 'absolute', top: '40%' as any, right: -25 },
    'top-left': { position: 'absolute', top: -15, left: -10 },
  };

  return (
    <View style={[positionStyles[position], style]} pointerEvents="none">
      <GlowingOrb size={50} color={V2_COLORS.primaryMid} delay={0} />
      <GlowingOrb
        size={30}
        color={V2_COLORS.accent1}
        delay={800}
        style={{ position: 'absolute', top: 35, left: 30 }}
      />
      <GlowingOrb
        size={20}
        color={V2_COLORS.accent2}
        delay={1600}
        style={{ position: 'absolute', top: 10, left: 45 }}
      />
    </View>
  );
}
