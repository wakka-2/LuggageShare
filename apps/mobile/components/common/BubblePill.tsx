import { Pressable, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { RADIUS, V2_COLORS } from '@/providers/ThemeProvider';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type IoniconsName = keyof typeof Ionicons.glyphMap;

interface BubblePillProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
  icon?: IoniconsName;
  count?: number;
  color?: string;
}

export function BubblePill({
  label,
  active = false,
  onPress,
  icon,
  count,
  color = V2_COLORS.primary,
}: BubblePillProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 200 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        animatedStyle,
        styles.pill,
        active ? { backgroundColor: color, borderColor: color } : styles.inactive,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={14}
          color={active ? '#FFF' : V2_COLORS.textSoft}
          style={styles.icon}
        />
      )}
      <Text style={[styles.label, active ? styles.labelActive : styles.labelInactive]}>
        {label}
      </Text>
      {count !== undefined && count > 0 && (
        <View style={[styles.countBadge, { backgroundColor: active ? '#FFF' : color }]}>
          <Text style={[styles.countText, { color: active ? color : '#FFF' }]}>{count}</Text>
        </View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.pill,
    borderWidth: 1.5,
  },
  inactive: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(124,106,255,0.08)',
  },
  icon: {
    marginRight: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  labelActive: {
    color: '#FFFFFF',
  },
  labelInactive: {
    color: V2_COLORS.textSoft,
  },
  countBadge: {
    marginLeft: 6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  countText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
