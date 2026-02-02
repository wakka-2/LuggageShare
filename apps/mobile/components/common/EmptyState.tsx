import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';
import { Button } from './Button';
import { LottieAnimation, AnimationType } from './LottieAnimation';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  lottieAnimation?: AnimationType | string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
  animationSize?: number;
}

export function EmptyState({
  icon,
  lottieAnimation = 'search',
  title,
  description,
  actionLabel,
  onAction,
  style,
  animationSize = 180,
}: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      style={[styles.container, style]}
    >
      {/* Lottie Animation or Icon */}
      <Animated.View entering={FadeInUp.delay(100).duration(500).springify()}>
        {icon ? (
          <View style={[styles.iconContainer, { backgroundColor: colors.card }]}>
            <Ionicons name={icon} size={48} color={colors.textSecondary} />
          </View>
        ) : (
          <View style={styles.animationContainer}>
            <LottieAnimation
              animation={lottieAnimation}
              size={animationSize}
              loop={true}
              speed={0.8}
            />
          </View>
        )}
      </Animated.View>

      <Animated.Text
        entering={FadeInUp.delay(200).duration(400)}
        style={[styles.title, { color: colors.text }]}
      >
        {title}
      </Animated.Text>

      {description && (
        <Animated.Text
          entering={FadeInUp.delay(300).duration(400)}
          style={[styles.description, { color: colors.textSecondary }]}
        >
          {description}
        </Animated.Text>
      )}

      {actionLabel && onAction && (
        <Animated.View entering={FadeInUp.delay(400).duration(400)}>
          <Button
            title={actionLabel}
            onPress={onAction}
            variant="primary"
            size="medium"
            style={styles.button}
          />
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    minHeight: 300,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  animationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
  button: {
    marginTop: 24,
    minWidth: 180,
  },
});
