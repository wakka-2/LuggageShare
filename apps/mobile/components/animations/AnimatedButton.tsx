import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { V2_COLORS, RADIUS } from '@/providers/ThemeProvider';
import { ANIM } from '@/lib/animations';

interface AnimatedButtonProps {
  onPress: () => void;
  children?: React.ReactNode;
  title?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function AnimatedButton({
  onPress,
  children,
  title,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
}: AnimatedButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(ANIM.pressScale, ANIM.spring.snappy);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, ANIM.spring.gentle);
  }, [scale]);

  const bg = disabled
    ? V2_COLORS.cardShadow
    : variant === 'primary'
      ? V2_COLORS.primary
      : variant === 'secondary'
        ? '#FFFFFF'
        : 'transparent';

  const textColor = disabled
    ? V2_COLORS.textMuted
    : variant === 'primary'
      ? '#FFFFFF'
      : variant === 'secondary'
        ? V2_COLORS.text
        : V2_COLORS.primary;

  const borderColor = variant === 'outline' && !disabled ? V2_COLORS.primary : 'transparent';

  const padding =
    size === 'sm'
      ? { paddingVertical: 8, paddingHorizontal: 16 }
      : size === 'lg'
        ? { paddingVertical: 16, paddingHorizontal: 24 }
        : { paddingVertical: 12, paddingHorizontal: 20 };

  const fontSize = size === 'sm' ? 14 : size === 'lg' ? 18 : 16;

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={1}
      style={[
        styles.button,
        { backgroundColor: bg, borderColor },
        padding,
        fullWidth && styles.fullWidth,
        animatedStyle,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : children ? (
        children
      ) : (
        <Text style={[styles.text, { color: textColor, fontSize }, textStyle]}>{title}</Text>
      )}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.button,
    borderWidth: 1,
    gap: 8,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontWeight: '600',
  },
});
