import { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Platform,
  type KeyboardTypeOptions,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  interpolateColor,
} from 'react-native-reanimated';

import { useTheme, RADIUS, BLUR, SPACING, TYPOGRAPHY } from '@/providers/ThemeProvider';

interface GlassInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  multiline?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  editable?: boolean;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  maxLength?: number;
  onFocus?: () => void;
  onBlur?: () => void;
}

const FOCUS_DURATION = 200;
const SHAKE_STEP = 40;

export function GlassInput({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  leftIcon,
  rightIcon,
  multiline = false,
  secureTextEntry = false,
  keyboardType,
  autoCapitalize = 'none',
  editable = true,
  style,
  inputStyle,
  maxLength,
  onFocus: onFocusProp,
  onBlur: onBlurProp,
}: GlassInputProps) {
  const { colors, isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  // Animation shared values
  const focusProgress = useSharedValue(0);
  const translateX = useSharedValue(0);

  // Track previous error to detect new errors
  const prevErrorRef = useRef<string | undefined>(undefined);

  // Focus border animation
  useEffect(() => {
    focusProgress.value = withTiming(isFocused ? 1 : 0, { duration: FOCUS_DURATION });
  }, [isFocused, focusProgress]);

  // Shake animation when error appears
  useEffect(() => {
    if (error && !prevErrorRef.current) {
      translateX.value = withSequence(
        withTiming(-8, { duration: SHAKE_STEP }),
        withTiming(8, { duration: SHAKE_STEP }),
        withTiming(-8, { duration: SHAKE_STEP }),
        withTiming(8, { duration: SHAKE_STEP }),
        withTiming(-4, { duration: SHAKE_STEP }),
        withTiming(4, { duration: SHAKE_STEP }),
        withTiming(0, { duration: SHAKE_STEP })
      );
    }
    prevErrorRef.current = error;
  }, [error, translateX]);

  // Animated border style based on focus and error
  const animatedContainerStyle = useAnimatedStyle(() => {
    if (error) {
      return { borderColor: colors.error, transform: [{ translateX: translateX.value }] };
    }

    const borderColor = interpolateColor(
      focusProgress.value,
      [0, 1],
      [colors.glassBorder, colors.primary]
    );

    return { borderColor, transform: [{ translateX: translateX.value }] };
  });

  const handleFocus = () => {
    setIsFocused(true);
    onFocusProp?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlurProp?.();
  };

  const renderContent = () => (
    <>
      {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
      <TextInput
        style={[
          styles.input,
          { color: colors.text },
          multiline && styles.inputMultiline,
          inputStyle,
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        editable={editable}
        multiline={multiline}
        maxLength={maxLength}
        onFocus={handleFocus}
        onBlur={handleBlur}
        accessibilityLabel={label || placeholder}
        accessibilityHint={error || undefined}
        accessibilityState={{ disabled: !editable }}
      />
      {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
    </>
  );

  const innerGlowStyle =
    !isDark && isFocused
      ? {
          // @ts-ignore web-only
          boxShadow: `inset 0 1px 2px ${colors.glassHighlight}`,
        }
      : undefined;

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, { color: isFocused ? colors.primary : colors.textSecondary }]}>
          {label}
        </Text>
      )}

      {Platform.OS === 'web' ? (
        <Animated.View
          style={[
            styles.inputContainer,
            {
              backgroundColor: colors.glassBg,
              // @ts-ignore web-only CSS
              backdropFilter: `blur(${BLUR.light}px)`,
              // @ts-ignore web-only CSS
              WebkitBackdropFilter: `blur(${BLUR.light}px)`,
            },
            multiline && styles.inputContainerMultiline,
            innerGlowStyle,
            animatedContainerStyle,
          ]}
        >
          {renderContent()}
        </Animated.View>
      ) : (
        <Animated.View
          style={[
            styles.inputContainer,
            styles.nativeContainer,
            multiline && styles.inputContainerMultiline,
            animatedContainerStyle,
          ]}
        >
          {/* Native blur layer */}
          <NativeBlurBackground isDark={isDark} />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.glassBg }]} />
          <View style={styles.nativeContent}>{renderContent()}</View>
        </Animated.View>
      )}

      {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}
    </View>
  );
}

/**
 * Separated native blur into its own component so the require('expo-blur')
 * call is isolated from the web bundle and only evaluated on native.
 */
function NativeBlurBackground({ isDark }: { isDark: boolean }) {
  const { BlurView } = require('expo-blur');
  return (
    <BlurView
      intensity={BLUR.light}
      tint={isDark ? 'dark' : 'light'}
      style={StyleSheet.absoluteFill}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING[4], // 16
  },
  label: {
    ...TYPOGRAPHY.caption,
    fontWeight: '500',
    marginBottom: SPACING[2], // 8
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: RADIUS.input,
    paddingHorizontal: SPACING[3], // 12
  },
  inputContainerMultiline: {
    minHeight: 100,
    alignItems: 'flex-start',
  },
  nativeContainer: {
    overflow: 'hidden',
  },
  nativeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[3], // 12
    flex: 1,
  },
  input: {
    flex: 1,
    ...TYPOGRAPHY.body,
    paddingVertical: SPACING[3], // 12
  },
  inputMultiline: {
    textAlignVertical: 'top',
    paddingTop: SPACING[3], // 12
  },
  iconLeft: {
    marginEnd: SPACING[2], // 8
  },
  iconRight: {
    marginStart: SPACING[2], // 8
  },
  error: {
    ...TYPOGRAPHY.small,
    marginTop: SPACING[1], // 4
  },
});
