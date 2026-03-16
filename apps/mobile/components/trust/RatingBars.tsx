import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { V2_COLORS, RADIUS } from '@/providers/ThemeProvider';

interface RatingBarsProps {
  distribution: number[]; // [count5, count4, count3, count2, count1]
  average: number;
  total: number;
}

function RatingBar({
  star,
  count,
  total,
  index,
}: {
  star: number;
  count: number;
  total: number;
  index: number;
}) {
  const barWidth = useSharedValue(0);
  const percentage = total > 0 ? (count / total) * 100 : 0;

  useEffect(() => {
    barWidth.value = withDelay(index * 80, withTiming(percentage, { duration: 600 }));
  }, [percentage]);

  const animatedBarStyle = useAnimatedStyle(() => ({
    width: `${barWidth.value}%` as any,
  }));

  return (
    <Animated.View entering={FadeIn.delay(index * 60).duration(300)} style={styles.barRow}>
      <Text style={styles.starLabel}>{star}</Text>
      <Ionicons name="star" size={12} color={V2_COLORS.accent2} />
      <View style={styles.barTrack}>
        <Animated.View style={[styles.barFill, animatedBarStyle]} />
      </View>
      <Text style={styles.countLabel}>{count}</Text>
    </Animated.View>
  );
}

export function RatingBars({ distribution, average, total }: RatingBarsProps) {
  return (
    <View style={styles.container}>
      {/* Summary */}
      <Animated.View entering={FadeIn.duration(400)} style={styles.summary}>
        <Text style={styles.avgNumber}>{average.toFixed(1)}</Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons
              key={star}
              name={star <= Math.round(average) ? 'star' : 'star-outline'}
              size={16}
              color={V2_COLORS.accent2}
            />
          ))}
        </View>
        <Text style={styles.totalLabel}>{total} reviews</Text>
      </Animated.View>

      {/* Bars */}
      <View style={styles.bars}>
        {distribution.map((count, index) => (
          <RatingBar key={5 - index} star={5 - index} count={count} total={total} index={index} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 16,
  },
  summary: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },
  avgNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: V2_COLORS.text,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 12,
    marginTop: 4,
    color: V2_COLORS.textMuted,
  },
  bars: {
    flex: 1,
    gap: 4,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starLabel: {
    fontSize: 12,
    width: 12,
    textAlign: 'right',
    color: V2_COLORS.textSoft,
  },
  barTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: V2_COLORS.cardShadow,
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: V2_COLORS.accent2,
  },
  countLabel: {
    fontSize: 11,
    width: 24,
    textAlign: 'right',
    color: V2_COLORS.textMuted,
  },
});
