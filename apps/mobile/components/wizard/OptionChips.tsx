import React, { useCallback } from 'react';
import { ScrollView, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme, RADIUS } from '@/providers/ThemeProvider';
import { ANIM } from '@/lib/animations';

export interface ChipOption {
  id: string;
  label: string;
}

interface OptionChipsProps {
  options: ChipOption[];
  selected: string | null;
  onSelect: (id: string) => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function OptionChips({ options, selected, onSelect }: OptionChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {options.map((option) => (
        <Chip
          key={option.id}
          option={option}
          isSelected={selected === option.id}
          onSelect={onSelect}
        />
      ))}
    </ScrollView>
  );
}

interface ChipProps {
  option: ChipOption;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const Chip = React.memo(function Chip({ option, isSelected, onSelect }: ChipProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.95, ANIM.spring.snappy);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, ANIM.spring.gentle);
  }, [scale]);

  return (
    <AnimatedTouchable
      onPress={() => onSelect(option.id)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      style={[
        styles.chip,
        {
          backgroundColor: isSelected ? colors.primary : 'transparent',
          borderColor: isSelected ? colors.primary : colors.border,
        },
        animatedStyle,
      ]}
    >
      <Text style={[styles.chipText, { color: isSelected ? '#FFFFFF' : colors.textSecondary }]}>
        {option.label}
      </Text>
    </AnimatedTouchable>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.badge,
    borderWidth: 1.5,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
