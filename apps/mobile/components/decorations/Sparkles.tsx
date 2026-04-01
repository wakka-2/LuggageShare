import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { V2_COLORS } from '@/providers/ThemeProvider';

const AnimatedSvg = Animated.createAnimatedComponent(View);

interface SparkleProps {
  size?: number;
  color?: string;
  delay?: number;
  style?: ViewStyle;
}

function SparkleIcon({ size = 12, color = V2_COLORS.accent2 }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 0L14.59 8.41L23 12L14.59 15.59L12 24L9.41 15.59L1 12L9.41 8.41Z" fill={color} />
    </Svg>
  );
}

function SingleSparkle({ size = 12, color = V2_COLORS.accent2, delay = 0, style }: SparkleProps) {
  const anim = useSharedValue(0);

  useEffect(() => {
    anim.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 600, easing: Easing.in(Easing.quad) }),
          withTiming(0, { duration: 1200 }) // pause
        ),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(anim.value, [0, 0.5, 1], [0, 1, 0.6]),
    transform: [
      { scale: interpolate(anim.value, [0, 0.5, 1], [0.3, 1.2, 0.8]) },
      { rotate: `${interpolate(anim.value, [0, 1], [0, 45])}deg` },
    ],
  }));

  return (
    <Animated.View style={[{ position: 'absolute' }, animatedStyle, style]}>
      <SparkleIcon size={size} color={color} />
    </Animated.View>
  );
}

interface SparkleGroupProps {
  style?: ViewStyle;
  variant?: 'corner' | 'scattered' | 'accent';
}

export function SparkleGroup({ style, variant = 'corner' }: SparkleGroupProps) {
  if (variant === 'corner') {
    return (
      <View style={[{ width: 60, height: 60 }, style]} pointerEvents="none">
        <SingleSparkle size={10} color={V2_COLORS.accent2} delay={0} style={{ top: 0, right: 5 }} />
        <SingleSparkle
          size={7}
          color={V2_COLORS.primaryLight}
          delay={400}
          style={{ top: 18, right: 0 }}
        />
        <SingleSparkle
          size={5}
          color={V2_COLORS.accent1 + '80'}
          delay={800}
          style={{ top: 8, right: 22 }}
        />
      </View>
    );
  }

  if (variant === 'scattered') {
    return (
      <View style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
        <SingleSparkle
          size={8}
          color={V2_COLORS.accent2 + '70'}
          delay={0}
          style={{ top: '15%', left: '10%' }}
        />
        <SingleSparkle
          size={11}
          color={V2_COLORS.primaryLight + '60'}
          delay={600}
          style={{ top: '30%', right: '8%' }}
        />
        <SingleSparkle
          size={6}
          color={V2_COLORS.accent1 + '50'}
          delay={1200}
          style={{ top: '55%', left: '20%' }}
        />
        <SingleSparkle
          size={9}
          color={V2_COLORS.secondary + '40'}
          delay={1800}
          style={{ top: '70%', right: '15%' }}
        />
        <SingleSparkle
          size={7}
          color={V2_COLORS.accent3 + '50'}
          delay={2400}
          style={{ top: '85%', left: '60%' }}
        />
      </View>
    );
  }

  // accent — small inline sparkle pair
  return (
    <View style={[{ flexDirection: 'row', gap: 4 }, style]} pointerEvents="none">
      <SingleSparkle
        size={8}
        color={V2_COLORS.accent2}
        delay={0}
        style={{ position: 'relative' }}
      />
      <SingleSparkle
        size={5}
        color={V2_COLORS.primaryLight}
        delay={300}
        style={{ position: 'relative', marginTop: -3 }}
      />
    </View>
  );
}
