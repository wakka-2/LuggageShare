import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, RADIUS } from '@/providers/ThemeProvider';

type BadgeType = 'verified' | 'id_verified' | 'phone_verified' | 'top_carrier';

interface VerificationBadgeProps {
  type: BadgeType;
  label?: string;
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
}

const BADGE_CONFIG: Record<
  BadgeType,
  { icon: keyof typeof Ionicons.glyphMap; defaultLabel: string; color: string }
> = {
  verified: { icon: 'shield-checkmark', defaultLabel: 'Verified', color: '#3B82F6' },
  id_verified: { icon: 'id-card', defaultLabel: 'ID Verified', color: '#8B5CF6' },
  phone_verified: { icon: 'call', defaultLabel: 'Phone Verified', color: '#10B981' },
  top_carrier: { icon: 'star', defaultLabel: 'Top Carrier', color: '#F59E0B' },
};

const SIZE_MAP = {
  small: { icon: 14, text: 11, padding: 4, gap: 3 },
  medium: { icon: 16, text: 13, padding: 6, gap: 4 },
  large: { icon: 20, text: 15, padding: 8, gap: 6 },
};

export function VerificationBadge({
  type,
  label,
  size = 'small',
  animated = true,
}: VerificationBadgeProps) {
  const config = BADGE_CONFIG[type];
  const sizeConfig = SIZE_MAP[size];

  const content = (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.color + '15',
          paddingHorizontal: sizeConfig.padding + 4,
          paddingVertical: sizeConfig.padding,
          gap: sizeConfig.gap,
        },
      ]}
    >
      <Ionicons name={config.icon} size={sizeConfig.icon} color={config.color} />
      <Text style={[styles.label, { color: config.color, fontSize: sizeConfig.text }]}>
        {label || config.defaultLabel}
      </Text>
    </View>
  );

  if (animated) {
    return <Animated.View entering={ZoomIn.delay(200).springify()}>{content}</Animated.View>;
  }

  return content;
}

interface BadgeRowProps {
  badges: BadgeType[];
  size?: 'small' | 'medium' | 'large';
}

export function BadgeRow({ badges, size = 'small' }: BadgeRowProps) {
  return (
    <View style={styles.row}>
      {badges.map((type, index) => (
        <VerificationBadge key={type} type={type} size={size} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.badge,
  },
  label: {
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
});
