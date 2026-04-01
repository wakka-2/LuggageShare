import React, { useEffect } from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { V2_COLORS } from '@/providers/ThemeProvider';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

interface FloatingIcon {
  icon: keyof typeof Ionicons.glyphMap;
  size: number;
  color: string;
  x: number;
  y: number;
  delay: number;
  duration: number;
  drift: number;
  rotation: number;
}

const ICONS: FloatingIcon[] = [
  {
    icon: 'airplane',
    size: 18,
    color: V2_COLORS.primaryLight,
    x: SCREEN_W * 0.85,
    y: 180,
    delay: 0,
    duration: 6000,
    drift: 30,
    rotation: -15,
  },
  {
    icon: 'briefcase',
    size: 14,
    color: V2_COLORS.accent1 + '60',
    x: SCREEN_W * 0.1,
    y: 400,
    delay: 1500,
    duration: 7000,
    drift: 20,
    rotation: 10,
  },
  {
    icon: 'globe-outline',
    size: 16,
    color: V2_COLORS.accent3 + '50',
    x: SCREEN_W * 0.75,
    y: 550,
    delay: 3000,
    duration: 5500,
    drift: 25,
    rotation: -8,
  },
  {
    icon: 'navigate',
    size: 12,
    color: V2_COLORS.accent2 + '50',
    x: SCREEN_W * 0.2,
    y: 250,
    delay: 2000,
    duration: 8000,
    drift: 15,
    rotation: 20,
  },
  {
    icon: 'cube-outline',
    size: 15,
    color: V2_COLORS.primaryMid + '40',
    x: SCREEN_W * 0.6,
    y: 700,
    delay: 500,
    duration: 6500,
    drift: 22,
    rotation: -12,
  },
  {
    icon: 'trail-sign-outline',
    size: 13,
    color: V2_COLORS.secondary + '35',
    x: SCREEN_W * 0.45,
    y: 320,
    delay: 4000,
    duration: 7500,
    drift: 18,
    rotation: 15,
  },
];

function FloatingItem({ item }: { item: FloatingIcon }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      item.delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: item.duration / 2, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: item.duration / 2, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [0, -item.drift]) },
      { translateX: interpolate(progress.value, [0, 0.5, 1], [0, item.drift * 0.3, 0]) },
      { rotate: `${interpolate(progress.value, [0, 1], [0, item.rotation])}deg` },
    ],
    opacity: interpolate(progress.value, [0, 0.3, 0.7, 1], [0.3, 0.7, 0.7, 0.3]),
  }));

  return (
    <Animated.View style={[{ position: 'absolute', left: item.x, top: item.y }, animatedStyle]}>
      <Ionicons name={item.icon} size={item.size} color={item.color} />
    </Animated.View>
  );
}

interface FloatingIconsProps {
  variant?: 'full' | 'sparse';
}

export function FloatingIcons({ variant = 'full' }: FloatingIconsProps) {
  const icons = variant === 'sparse' ? ICONS.slice(0, 3) : ICONS;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {icons.map((item, i) => (
        <FloatingItem key={i} item={item} />
      ))}
    </View>
  );
}
