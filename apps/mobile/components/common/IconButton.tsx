import { Pressable, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BUBBLE_SHADOWS, V2_COLORS } from '@/providers/ThemeProvider';

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
        <View style={[styles.badge, { backgroundColor: badgeColor }]} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
});
