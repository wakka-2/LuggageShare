import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { V2_COLORS, RADIUS } from '@/providers/ThemeProvider';

interface TimelineEvent {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  date?: string | null;
  description?: string;
}

interface StatusTimelineProps {
  events: TimelineEvent[];
  currentKey: string;
}

function PulsingDot({ color, delay }: { color: string; delay: number }) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withDelay(
      delay,
      withRepeat(
        withSequence(withTiming(1.4, { duration: 800 }), withTiming(1, { duration: 800 })),
        -1,
        true
      )
    );
  }, [delay, pulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.dot,
        styles.activeDot,
        { backgroundColor: color, borderColor: color + '30' },
        animatedStyle,
      ]}
    />
  );
}

export function StatusTimeline({ events, currentKey }: StatusTimelineProps) {
  const currentIndex = events.findIndex((e) => e.key === currentKey);

  return (
    <View style={styles.container}>
      {events.map((event, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isFuture = index > currentIndex;
        const isLast = index === events.length - 1;

        const dotColor = isCompleted
          ? V2_COLORS.accent1
          : isCurrent
            ? V2_COLORS.primary
            : V2_COLORS.cardShadow;

        const textColor = isFuture ? V2_COLORS.textMuted : V2_COLORS.text;
        const iconColor = isCompleted
          ? V2_COLORS.accent1
          : isCurrent
            ? V2_COLORS.primary
            : V2_COLORS.textMuted;

        return (
          <Animated.View
            key={event.key}
            entering={FadeInUp.delay(index * 80).duration(300)}
            style={[styles.eventRow, isFuture && { opacity: 0.5 }]}
          >
            {/* Left column: dot + connector */}
            <View style={styles.leftColumn}>
              {isCurrent ? (
                <PulsingDot color={dotColor} delay={index * 100} />
              ) : (
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: dotColor },
                    isCompleted && styles.completedDot,
                  ]}
                >
                  {isCompleted && <Ionicons name="checkmark" size={12} color="#FFF" />}
                </View>
              )}
              {!isLast && (
                <View
                  style={[
                    styles.connector,
                    {
                      backgroundColor: isCompleted ? V2_COLORS.accent1 : V2_COLORS.cardShadow,
                    },
                  ]}
                />
              )}
            </View>

            {/* Right column: content */}
            <View style={styles.content}>
              <View style={styles.eventHeader}>
                <Ionicons name={event.icon} size={16} color={iconColor} />
                <Text
                  style={[
                    styles.eventLabel,
                    { color: textColor, fontWeight: isCurrent ? '700' : '500' },
                  ]}
                >
                  {event.label}
                </Text>
              </View>
              {event.date && (
                <Text style={styles.eventDate}>
                  {new Date(event.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              )}
              {event.description && <Text style={styles.eventDesc}>{event.description}</Text>}
            </View>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  eventRow: {
    flexDirection: 'row',
    minHeight: 52,
  },
  leftColumn: {
    alignItems: 'center',
    width: 32,
  },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDot: {
    borderWidth: 3,
  },
  completedDot: {},
  connector: {
    width: 2,
    flex: 1,
    minHeight: 24,
    borderRadius: 1,
  },
  content: {
    flex: 1,
    paddingStart: 12,
    paddingBottom: 20,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventLabel: {
    fontSize: 14,
  },
  eventDate: {
    fontSize: 11,
    marginTop: 3,
    marginStart: 24,
    color: V2_COLORS.textMuted,
  },
  eventDesc: {
    fontSize: 12,
    marginTop: 2,
    marginStart: 24,
    color: V2_COLORS.textSoft,
  },
});
