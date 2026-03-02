import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme, TYPOGRAPHY } from '@/providers/ThemeProvider';

interface QuestionTitleProps {
  emoji: string;
  title: string;
  subtitle?: string;
}

export function QuestionTitle({ emoji, title, subtitle }: QuestionTitleProps) {
  const { colors } = useTheme();

  return (
    <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  emoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  title: {
    ...TYPOGRAPHY.h2,
    marginBottom: 4,
  },
  subtitle: {
    ...TYPOGRAPHY.caption,
  },
});
