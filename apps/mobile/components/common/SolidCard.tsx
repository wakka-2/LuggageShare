import { ReactNode } from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme, RADIUS } from '@/providers/ThemeProvider';

interface SolidCardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Accent color for the 3px bottom border (Duolingo 3D effect) */
  accentColor?: string;
  /** Background tint color (default: white/card color) */
  tint?: string;
  noPadding?: boolean;
  /** Border radius override */
  radius?: number;
}

/**
 * Solid card with Duolingo-style 3D bottom border.
 * Replaces GlassCard for V2 design — no blur, no transparency.
 * Just solid colors, visible borders, and a chunky bottom accent.
 */
export function SolidCard({
  children,
  style,
  accentColor,
  tint,
  noPadding,
  radius = RADIUS.card,
}: SolidCardProps) {
  const { colors } = useTheme();

  const bgColor = tint || colors.card;
  const borderColor = accentColor
    ? accentColor + '30' // 30 = ~19% opacity for side/top borders
    : colors.border;
  const bottomColor = accentColor || colors.primaryDark;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: bgColor,
          borderColor,
          borderBottomColor: bottomColor,
          borderRadius: radius,
        },
        !noPadding && styles.padding,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderBottomWidth: 3,
    overflow: 'hidden',
  },
  padding: {
    padding: 16,
  },
});
