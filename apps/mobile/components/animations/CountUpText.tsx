import React, { useEffect } from 'react';
import { Text, TextStyle } from 'react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  useDerivedValue,
} from 'react-native-reanimated';
import { ANIM } from '@/lib/animations';

interface CountUpTextProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  style?: TextStyle;
  decimals?: number;
}

const AnimatedText = Animated.createAnimatedComponent(Text);

export function CountUpText({
  value,
  duration = 400,
  prefix = '',
  suffix = '',
  style,
  decimals = 0,
}: CountUpTextProps) {
  const animatedValue = useSharedValue(0);

  useEffect(() => {
    animatedValue.value = withTiming(value, { duration });
  }, [value, duration, animatedValue]);

  const displayText = useDerivedValue(() => {
    const num = animatedValue.value.toFixed(decimals);
    return `${prefix}${num}${suffix}`;
  });

  // Since ReText requires react-native-redash, use a simpler approach:
  // animated props on Text don't work for text content, so we use
  // a polling approach with useAnimatedProps
  const animatedProps = useAnimatedProps(() => {
    return {
      text: displayText.value,
    } as any;
  });

  return (
    <AnimatedText style={style} animatedProps={animatedProps}>
      {`${prefix}${value.toFixed(decimals)}${suffix}`}
    </AnimatedText>
  );
}
