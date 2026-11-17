import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BUBBLE_SHADOWS, V2_COLORS, themed } from '@/providers/ThemeProvider';

type IoniconsName = keyof typeof Ionicons.glyphMap;

interface IconButtonProps {
  icon: IoniconsName;
  onPress?: () => void;
  size?: number;
  badge?: number;
  badgeColor?: string;
  accessibilityLabel?: string;
}

export function IconButton({
  icon,
  onPress,
  size = 44,
  badge,
  badgeColor = V2_COLORS.secondary,
  accessibilityLabel,
}: IconButtonProps) {
  const iconSize = Math.round(size * 0.5);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        BUBBLE_SHADOWS.sm,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Ionicons name={icon} size={iconSize} color={V2_COLORS.text} />
      {badge !== undefined && badge > 0 && (
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = themed(() =>
  StyleSheet.create({
    button: {
      backgroundColor: V2_COLORS.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pressed: {
      opacity: 0.8,
      transform: [{ scale: 0.95 }],
    },
    badge: {
      position: 'absolute',
      top: -2,
      end: -2,
      minWidth: 18,
      height: 18,
      paddingHorizontal: 4,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: V2_COLORS.surface,
    },
    badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  })
);
