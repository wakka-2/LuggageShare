import { View, TouchableOpacity, StyleSheet, I18nManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';

import { V2_COLORS, RADIUS, BUBBLE_SHADOWS } from '@/providers/ThemeProvider';
import { ViewMode } from './types';

interface ViewToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  const isGrid = value === 'grid';

  const indicatorPosition = useSharedValue(isGrid ? 0 : 1);

  const handleToggle = (mode: ViewMode) => {
    indicatorPosition.value = withSpring(mode === 'grid' ? 0 : 1, {
      damping: 15,
      stiffness: 150,
    });
    onChange(mode);
  };

  const rtlMultiplier = I18nManager.isRTL ? -1 : 1;
  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorPosition.value * 40 * rtlMultiplier }],
  }));

  return (
    <View style={styles.container}>
      {/* Animated Indicator */}
      <Animated.View style={[styles.indicator, indicatorStyle]} />

      {/* Grid Button */}
      <AnimatedTouchable
        style={styles.button}
        onPress={() => handleToggle('grid')}
        activeOpacity={0.7}
      >
        <Ionicons name="grid-outline" size={18} color={isGrid ? '#FFFFFF' : V2_COLORS.textMuted} />
      </AnimatedTouchable>

      {/* List Button */}
      <AnimatedTouchable
        style={styles.button}
        onPress={() => handleToggle('list')}
        activeOpacity={0.7}
      >
        <Ionicons name="list-outline" size={18} color={!isGrid ? '#FFFFFF' : V2_COLORS.textMuted} />
      </AnimatedTouchable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.pill,
    padding: 3,
    position: 'relative',
    ...BUBBLE_SHADOWS.xs,
  },
  indicator: {
    position: 'absolute',
    top: 3,
    start: 3,
    width: 36,
    height: 32,
    borderRadius: RADIUS.pill,
    backgroundColor: V2_COLORS.primary,
  },
  button: {
    width: 36,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
});
