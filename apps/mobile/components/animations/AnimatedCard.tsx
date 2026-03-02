import React, { useCallback } from 'react';
import { StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useTheme, RADIUS, SHADOWS } from '@/providers/ThemeProvider';
import { ANIM, createStaggerDelay } from '@/lib/animations';

interface AnimatedCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  delay?: number;
  index?: number;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function AnimatedCard({ children, onPress, style, delay, index = 0 }: AnimatedCardProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const elevation = useSharedValue(0);

  const entryDelay = delay ?? createStaggerDelay(index, 100);

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const shadowStyle = useAnimatedStyle(() => ({
    shadowOpacity: interpolate(elevation.value, [0, 1], [0.07, 0.15], Extrapolation.CLAMP),
    shadowRadius: interpolate(elevation.value, [0, 1], [6, 16], Extrapolation.CLAMP),
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.98, ANIM.spring.snappy);
    elevation.value = withTiming(1, ANIM.timing.fast);
  }, [scale, elevation]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, ANIM.spring.gentle);
    elevation.value = withTiming(0, { duration: 200 });
  }, [scale, elevation]);

  return (
    <AnimatedTouchable
      entering={FadeInUp.delay(entryDelay).duration(400).springify()}
      onPress={onPress}
      onPressIn={onPress ? handlePressIn : undefined}
      onPressOut={onPress ? handlePressOut : undefined}
      activeOpacity={1}
      disabled={!onPress}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
        },
        SHADOWS.m,
        pressStyle,
        shadowStyle,
        style,
      ]}
    >
      {children}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.card,
    overflow: 'hidden',
  },
});
