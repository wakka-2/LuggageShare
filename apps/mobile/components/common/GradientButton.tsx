import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { RADIUS, SHADOWS, SPACING } from '@/providers/ThemeProvider';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
  colors?: string[];
}

const SIZE_CONFIG = {
  small: {
    paddingVertical: SPACING[2], // 8
    paddingHorizontal: SPACING[4], // 16
    fontSize: 14,
    lineHeight: 21,
    indicatorSize: 'small' as const,
    minHeight: 36,
  },
  medium: {
    paddingVertical: SPACING[3], // 12
    paddingHorizontal: SPACING[5], // 20
    fontSize: 16,
    lineHeight: 24,
    indicatorSize: 'small' as const,
    minHeight: 44,
  },
  large: {
    paddingVertical: SPACING[4], // 16
    paddingHorizontal: SPACING[6], // 24
    fontSize: 18,
    lineHeight: 25,
    indicatorSize: 'small' as const,
    minHeight: 52,
  },
} as const;

const DISABLED_BG = '#9CA3AF';

export function GradientButton({
  title,
  onPress,
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  style,
  fullWidth = false,
  colors,
}: GradientButtonProps) {
  const { colors: themeColors } = useTheme();
  const scale = useSharedValue(1);

  const gradientColors = colors ?? [themeColors.primary, themeColors.primaryDark];
  const sizeConfig = SIZE_CONFIG[size];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (disabled || loading) return;
    scale.value = withSpring(0.97, { damping: 20, stiffness: 300 });
  };

  const handlePressOut = () => {
    if (disabled || loading) return;
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  const containerStyle: ViewStyle[] = [
    styles.container,
    fullWidth && styles.fullWidth,
    !disabled && (SHADOWS.glow as ViewStyle),
    style,
  ].filter(Boolean) as ViewStyle[];

  const content = (
    <View style={[styles.content, { minHeight: sizeConfig.minHeight }]}>
      {loading ? (
        <ActivityIndicator size={sizeConfig.indicatorSize} color="#FFFFFF" />
      ) : (
        <>
          {icon && <View style={styles.icon}>{icon}</View>}
          <Text
            style={[
              styles.text,
              {
                fontSize: sizeConfig.fontSize,
                lineHeight: sizeConfig.lineHeight,
              },
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </View>
  );

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.9}
      style={[animatedStyle, ...containerStyle]}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
    >
      {disabled ? (
        <View
          style={[
            styles.disabledBackground,
            {
              paddingVertical: sizeConfig.paddingVertical,
              paddingHorizontal: sizeConfig.paddingHorizontal,
            },
          ]}
        >
          {content}
        </View>
      ) : (
        <LinearGradient
          colors={gradientColors as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.gradient,
            {
              paddingVertical: sizeConfig.paddingVertical,
              paddingHorizontal: sizeConfig.paddingHorizontal,
            },
          ]}
        >
          {content}
        </LinearGradient>
      )}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.button,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  gradient: {
    borderRadius: RADIUS.button,
  },
  disabledBackground: {
    backgroundColor: DISABLED_BG,
    borderRadius: RADIUS.button,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: SPACING[2], // 8
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
