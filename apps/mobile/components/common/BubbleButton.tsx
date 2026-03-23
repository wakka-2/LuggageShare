import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { RADIUS, GRADIENTS, V2_COLORS } from '@/providers/ThemeProvider';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type IoniconsName = keyof typeof Ionicons.glyphMap;

interface BubbleButtonProps {
  label: string;
  onPress?: () => void;
  icon?: IoniconsName;
  variant?: 'filled' | 'outline' | 'gradient';
  color?: string;
  textColor?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
}

const SIZE_CONFIG = {
  sm: { paddingH: 14, paddingV: 10, fontSize: 13, iconSize: 16 },
  md: { paddingH: 20, paddingV: 14, fontSize: 14, iconSize: 18 },
  lg: { paddingH: 28, paddingV: 18, fontSize: 16, iconSize: 20 },
} as const;

export function BubbleButton({
  label,
  onPress,
  icon,
  variant = 'filled',
  color = V2_COLORS.primary,
  textColor = '#FFF',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
}: BubbleButtonProps) {
  const scale = useSharedValue(1);
  const config = SIZE_CONFIG[size];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: scale.value < 1 ? 0.9 : 1,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 200 });
  };

  const resolvedTextColor = variant === 'outline' ? color : textColor;
  const isDisabled = disabled || loading;

  const innerContent = (
    <>
      {loading ? (
        <ActivityIndicator size="small" color={resolvedTextColor} />
      ) : (
        <>
          {icon && (
            <Ionicons
              name={icon}
              size={config.iconSize}
              color={resolvedTextColor}
              style={{ marginRight: 8 }}
            />
          )}
          <Text style={[styles.label, { fontSize: config.fontSize, color: resolvedTextColor }]}>
            {label}
          </Text>
        </>
      )}
    </>
  );

  if (variant === 'gradient') {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={[animatedStyle, isDisabled && styles.disabled, fullWidth && styles.fullWidth]}
      >
        <LinearGradient
          colors={[...GRADIENTS.primaryHorizontal]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.base,
            {
              paddingHorizontal: config.paddingH,
              paddingVertical: config.paddingV,
            },
            fullWidth && styles.fullWidth,
          ]}
        >
          {innerContent}
        </LinearGradient>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[
        animatedStyle,
        styles.base,
        {
          paddingHorizontal: config.paddingH,
          paddingVertical: config.paddingV,
        },
        variant === 'filled' && { backgroundColor: color },
        variant === 'outline' && {
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: color,
        },
        isDisabled && styles.disabled,
        fullWidth && styles.fullWidth,
      ]}
    >
      {innerContent}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.button,
  },
  label: {
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
});
