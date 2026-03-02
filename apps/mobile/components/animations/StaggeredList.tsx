import React from 'react';
import { View, StyleSheet, FlatList, FlatListProps } from 'react-native';
import Animated, { FadeInUp, FadeInDown, Layout } from 'react-native-reanimated';
import { ANIM, createStaggerDelay } from '@/lib/animations';

interface StaggeredItemProps {
  index: number;
  children: React.ReactNode;
  direction?: 'up' | 'down';
  baseDelay?: number;
}

export function StaggeredItem({
  index,
  children,
  direction = 'up',
  baseDelay = 60,
}: StaggeredItemProps) {
  const delay = createStaggerDelay(index, baseDelay);
  const entering =
    direction === 'up'
      ? FadeInUp.delay(delay).duration(400).springify()
      : FadeInDown.delay(delay).duration(400).springify();

  return (
    <Animated.View entering={entering} layout={Layout.springify()}>
      {children}
    </Animated.View>
  );
}

interface StaggeredListProps<T> extends Omit<FlatListProps<T>, 'renderItem'> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactElement;
  direction?: 'up' | 'down';
  baseDelay?: number;
  keyExtractor: (item: T, index: number) => string;
}

export function StaggeredList<T>({
  data,
  renderItem,
  direction = 'up',
  baseDelay = 60,
  keyExtractor,
  ...flatListProps
}: StaggeredListProps<T>) {
  return (
    <FlatList
      data={data}
      keyExtractor={keyExtractor}
      renderItem={({ item, index }) => (
        <StaggeredItem index={index} direction={direction} baseDelay={baseDelay}>
          {renderItem(item, index)}
        </StaggeredItem>
      )}
      showsVerticalScrollIndicator={false}
      {...flatListProps}
    />
  );
}
