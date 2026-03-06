import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { V2_COLORS, RADIUS, BUBBLE_SHADOWS } from '@/providers/ThemeProvider';
import { Avatar } from '@/components/common';

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    reviewer: {
      name: string;
      avatarUrl?: string | null;
      isVerified?: boolean;
    };
  };
  index?: number;
}

export function ReviewCard({ review, index = 0 }: ReviewCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Animated.View entering={FadeInUp.delay(index * 80).springify()} style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Avatar
          name={review.reviewer.name}
          source={review.reviewer.avatarUrl}
          size="small"
          verified={review.reviewer.isVerified}
        />
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{review.reviewer.name}</Text>
          <Text style={styles.date}>{formatDate(review.createdAt)}</Text>
        </View>
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons
              key={star}
              name={star <= review.rating ? 'star' : 'star-outline'}
              size={14}
              color={V2_COLORS.accent2}
            />
          ))}
        </View>
      </View>

      {/* Comment */}
      {review.comment && <Text style={styles.comment}>{review.comment}</Text>}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    padding: 14,
    marginBottom: 10,
    ...BUBBLE_SHADOWS.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: V2_COLORS.text,
  },
  date: {
    fontSize: 11,
    marginTop: 1,
    color: V2_COLORS.textMuted,
  },
  stars: {
    flexDirection: 'row',
    gap: 1,
  },
  comment: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
    color: V2_COLORS.text,
  },
});
