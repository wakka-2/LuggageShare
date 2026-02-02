import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  interpolateColor,
} from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';
import { ViewMode } from './types';

interface ViewToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  const { colors } = useTheme();
  const isGrid = value === 'grid';

  const indicatorPosition = useSharedValue(isGrid ? 0 : 1);

  const handleToggle = (mode: ViewMode) => {
    indicatorPosition.value = withSpring(mode === 'grid' ? 0 : 1, {
      damping: 15,
      stiffness: 150,
    });
    onChange(mode);
  };

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorPosition.value * 40 }],
  }));

  const gridIconStyle = useAnimatedStyle(() => ({
    opacity: interpolateColor(
      indicatorPosition.value,
      [0, 1],
      [1, 0.5]
    ) as number,
  }));

  const listIconStyle = useAnimatedStyle(() => ({
    opacity: interpolateColor(
      indicatorPosition.value,
      [0, 1],
      [0.5, 1]
    ) as number,
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderColor: colors.border }]}>
      {/* Animated Indicator */}
      <Animated.View
        style={[
          styles.indicator,
          { backgroundColor: colors.primary },
          indicatorStyle,
        ]}
      />

      {/* Grid Button */}
      <AnimatedTouchable
        style={[styles.button]}
        onPress={() => handleToggle('grid')}
        activeOpacity={0.7}
      >
        <Animated.View style={gridIconStyle}>
          <Ionicons
            name="grid-outline"
            size={18}
            color={isGrid ? '#FFFFFF' : colors.textSecondary}
          />
        </Animated.View>
      </AnimatedTouchable>

      {/* List Button */}
      <AnimatedTouchable
        style={[styles.button]}
        onPress={() => handleToggle('list')}
        activeOpacity={0.7}
      >
        <Animated.View style={listIconStyle}>
          <Ionicons
            name="list-outline"
            size={18}
            color={!isGrid ? '#FFFFFF' : colors.textSecondary}
          />
        </Animated.View>
      </AnimatedTouchable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    padding: 3,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: 3,
    left: 3,
    width: 36,
    height: 32,
    borderRadius: 7,
  },
  button: {
    width: 36,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
});
