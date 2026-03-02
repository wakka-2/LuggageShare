import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, RADIUS } from '@/providers/ThemeProvider';
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
  const { colors } = useTheme();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 80).springify()}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Avatar
          name={review.reviewer.name}
          source={review.reviewer.avatarUrl}
          size="small"
          verified={review.reviewer.isVerified}
        />
        <View style={styles.headerInfo}>
          <Text style={[styles.name, { color: colors.text }]}>{review.reviewer.name}</Text>
          <Text style={[styles.date, { color: colors.textMuted }]}>
            {formatDate(review.createdAt)}
          </Text>
        </View>
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons
              key={star}
              name={star <= review.rating ? 'star' : 'star-outline'}
              size={14}
              color="#F59E0B"
            />
          ))}
        </View>
      </View>

      {/* Comment */}
      {review.comment && (
        <Text style={[styles.comment, { color: colors.text }]}>{review.comment}</Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.card,
    padding: 14,
    borderWidth: 1,
    marginBottom: 10,
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
  },
  date: {
    fontSize: 11,
    marginTop: 1,
  },
  stars: {
    flexDirection: 'row',
    gap: 1,
  },
  comment: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
  },
});
