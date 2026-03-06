import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { V2_COLORS, RADIUS } from '@/providers/ThemeProvider';

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
  verified: { icon: 'shield-checkmark', defaultLabel: 'Verified', color: V2_COLORS.accent3 },
  id_verified: { icon: 'id-card', defaultLabel: 'ID Verified', color: V2_COLORS.primary },
  phone_verified: { icon: 'call', defaultLabel: 'Phone Verified', color: V2_COLORS.accent1 },
  top_carrier: { icon: 'star', defaultLabel: 'Top Carrier', color: V2_COLORS.accent2 },
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
      {badges.map((type) => (
        <VerificationBadge key={type} type={type} size={size} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.pill,
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
