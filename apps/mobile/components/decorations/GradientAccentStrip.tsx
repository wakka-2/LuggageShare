import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GRADIENTS, V2_COLORS, RADIUS } from '@/providers/ThemeProvider';

interface GradientAccentStripProps {
  gradient?: 'primary' | 'mint' | 'warm' | 'cool' | 'secondary';
  position?: 'left' | 'top' | 'bottom';
  style?: ViewStyle;
}

const GRADIENT_MAP: Record<string, readonly [string, string, ...string[]]> = {
  primary: GRADIENTS.primary,
  mint: GRADIENTS.mint,
  warm: GRADIENTS.warm,
  cool: GRADIENTS.cool,
  secondary: GRADIENTS.secondary,
};

export function GradientAccentStrip({
  gradient = 'primary',
  position = 'left',
  style,
}: GradientAccentStripProps) {
  const colors = GRADIENT_MAP[gradient];

  if (position === 'left') {
    return (
      <View style={[styles.leftStrip, style]}>
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.leftGradient}
        />
      </View>
    );
  }

  if (position === 'top') {
    return (
      <View style={[styles.topStrip, style]}>
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.topGradient}
        />
      </View>
    );
  }

  return (
    <View style={[styles.bottomStrip, style]}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.bottomGradient}
      />
    </View>
  );
}

interface DecoratedCardWrapperProps {
  children: React.ReactNode;
  gradient?: 'primary' | 'mint' | 'warm' | 'cool' | 'secondary';
  style?: ViewStyle;
}

export function DecoratedCardWrapper({
  children,
  gradient = 'primary',
  style,
}: DecoratedCardWrapperProps) {
  return (
    <View style={[styles.cardWrapper, style]}>
      <GradientAccentStrip gradient={gradient} position="left" />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  leftStrip: {
    position: 'absolute',
    left: 0,
    top: 12,
    bottom: 12,
    width: 4,
    borderRadius: 2,
    overflow: 'hidden',
    zIndex: 1,
  },
  leftGradient: {
    flex: 1,
  },
  topStrip: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
    zIndex: 1,
  },
  topGradient: {
    flex: 1,
  },
  bottomStrip: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
    zIndex: 1,
  },
  bottomGradient: {
    flex: 1,
  },
  cardWrapper: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: RADIUS.card,
  },
});
