import { ReactNode } from 'react';
import { View, StyleSheet, Platform, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme, RADIUS, BLUR } from '@/providers/ThemeProvider';

interface GlassCardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: 'light' | 'medium' | 'strong';
  noPadding?: boolean;
}

/**
 * Glass-morphism card component.
 * - Web: CSS backdrop-filter blur
 * - Native: expo-blur BlurView
 */
export function GlassCard({ children, style, intensity = 'medium', noPadding }: GlassCardProps) {
  const { colors, isDark } = useTheme();

  const blurAmount =
    intensity === 'light' ? BLUR.light : intensity === 'strong' ? BLUR.card : BLUR.card;

  // Web: use CSS backdrop-filter
  if (Platform.OS === 'web') {
    return (
      <View
        style={[
          styles.card,
          !noPadding && styles.padding,
          {
            backgroundColor: colors.glassBg,
            borderColor: colors.glassBorder,
            // @ts-ignore — web-only CSS properties
            backdropFilter: `blur(${blurAmount}px)`,
            // @ts-ignore — web-only CSS properties
            WebkitBackdropFilter: `blur(${blurAmount}px)`,
          },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  // Native: use expo-blur
  const { BlurView } = require('expo-blur');
  const tint = isDark ? 'dark' : 'light';
  const nativeIntensity = intensity === 'light' ? BLUR.light : BLUR.card;

  return (
    <View style={[styles.card, { borderColor: colors.glassBorder, overflow: 'hidden' }, style]}>
      <BlurView intensity={nativeIntensity} tint={tint} style={StyleSheet.absoluteFill} />
      <View style={[styles.overlay, { backgroundColor: colors.glassBg }]} />
      <View style={!noPadding ? styles.padding : undefined}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.card,
    borderWidth: 1,
    overflow: 'hidden',
  },
  padding: {
    padding: 16,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
