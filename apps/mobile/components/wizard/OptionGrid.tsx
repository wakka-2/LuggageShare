import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, RADIUS } from '@/providers/ThemeProvider';
import { ANIM, createStaggerDelay } from '@/lib/animations';

export interface GridOption {
  id: string;
  emoji: string;
  label: string;
}

interface OptionGridProps {
  options: GridOption[];
  selected: string[];
  onToggle: (id: string) => void;
  columns?: 2 | 3;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function OptionGrid({ options, selected, onToggle, columns = 2 }: OptionGridProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.grid, { gap: 12 }]}>
      {options.map((option, index) => (
        <OptionGridItem
          key={option.id}
          option={option}
          isSelected={selected.includes(option.id)}
          onToggle={onToggle}
          index={index}
          columns={columns}
          colors={colors}
        />
      ))}
    </View>
  );
}

interface OptionGridItemProps {
  option: GridOption;
  isSelected: boolean;
  onToggle: (id: string) => void;
  index: number;
  columns: number;
  colors: any;
}

const OptionGridItem = React.memo(function OptionGridItem({
  option,
  isSelected,
  onToggle,
  index,
  columns,
  colors,
}: OptionGridItemProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.95, ANIM.spring.snappy);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, ANIM.spring.bouncy);
  }, [scale]);

  const widthPercent = columns === 2 ? '48%' : '31%';

  return (
    <AnimatedTouchable
      entering={FadeInUp.delay(createStaggerDelay(index, 50)).springify()}
      onPress={() => onToggle(option.id)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      style={[
        styles.item,
        {
          width: widthPercent as any,
          backgroundColor: isSelected ? colors.primary + '10' : colors.surface,
          borderColor: isSelected ? colors.primary : colors.border,
        },
        animatedStyle,
      ]}
    >
      <Text style={styles.itemEmoji}>{option.emoji}</Text>
      <Text
        style={[styles.itemLabel, { color: isSelected ? colors.primary : colors.text }]}
        numberOfLines={1}
      >
        {option.label}
      </Text>
      {isSelected && (
        <View style={[styles.checkBadge, { backgroundColor: colors.primary }]}>
          <Ionicons name="checkmark" size={12} color="#FFFFFF" />
        </View>
      )}
    </AnimatedTouchable>
  );
});

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderRadius: RADIUS.button,
    borderWidth: 1.5,
    position: 'relative',
  },
  itemEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  itemLabel: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
