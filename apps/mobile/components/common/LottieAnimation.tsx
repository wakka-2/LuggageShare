import { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Local animation assets - more reliable than remote URLs
const LOCAL_ANIMATIONS = {
  search: require('@/assets/animations/search-empty.json'),
  empty: require('@/assets/animations/search-empty.json'),
} as const;

// Fallback remote URLs for animations not yet local
const REMOTE_ANIMATIONS = {
  loading: 'https://assets5.lottiefiles.com/packages/lf20_p8bfn5to.json',
  success: 'https://assets5.lottiefiles.com/packages/lf20_jbrw3hcz.json',
  airplane: 'https://assets5.lottiefiles.com/packages/lf20_uu0x8lqv.json',
  location: 'https://assets5.lottiefiles.com/packages/lf20_swnrn2oy.json',
  package: 'https://assets5.lottiefiles.com/packages/lf20_96bovdur.json',
  chat: 'https://assets5.lottiefiles.com/packages/lf20_fqou8cqg.json',
} as const;

export const LOTTIE_ANIMATIONS = {
  ...LOCAL_ANIMATIONS,
  ...Object.fromEntries(Object.entries(REMOTE_ANIMATIONS).map(([key, url]) => [key, url])),
} as const;

export type AnimationType = keyof typeof LOCAL_ANIMATIONS | keyof typeof REMOTE_ANIMATIONS;

// Icon mapping for web fallback (avoids dotlottie-react canvas crash)
const WEB_ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  search: 'search-outline',
  empty: 'file-tray-outline',
  loading: 'hourglass-outline',
  success: 'checkmark-circle-outline',
  airplane: 'airplane-outline',
  location: 'location-outline',
  package: 'cube-outline',
  chat: 'chatbubbles-outline',
};

interface LottieAnimationProps {
  animation: AnimationType | string;
  size?: number;
  autoPlay?: boolean;
  loop?: boolean;
  speed?: number;
  style?: ViewStyle;
  onAnimationFinish?: () => void;
}

export function LottieAnimation({
  animation,
  size = 150,
  autoPlay = true,
  loop = true,
  speed = 1,
  style,
  onAnimationFinish,
}: LottieAnimationProps) {
  // On web, LottieView uses @lottiefiles/dotlottie-react which crashes with
  // "Failed to construct 'ImageData': The source width is zero or not a number"
  // when the canvas element hasn't rendered yet. Use a simple icon instead.
  if (Platform.OS === 'web') {
    const iconName = WEB_ICON_MAP[animation] || 'ellipse-outline';
    const iconSize = Math.round(size * 0.45);
    return (
      <View style={[styles.webFallback, { width: size, height: size }, style]}>
        <Ionicons name={iconName} size={iconSize} color="#94A3B8" />
      </View>
    );
  }

  // Native: use lottie-react-native
  // Lazy-require to avoid loading the library on web
  const LottieView = require('lottie-react-native').default;

  const getSource = () => {
    if (typeof animation === 'string') {
      if (animation in LOCAL_ANIMATIONS) {
        return LOCAL_ANIMATIONS[animation as keyof typeof LOCAL_ANIMATIONS];
      }
      if (animation in REMOTE_ANIMATIONS) {
        return { uri: REMOTE_ANIMATIONS[animation as keyof typeof REMOTE_ANIMATIONS] };
      }
      return { uri: animation };
    }
    return LOCAL_ANIMATIONS.search;
  };

  const source = getSource();

  return (
    <View style={[{ width: size, height: size }, style]}>
      <LottieView
        source={source}
        style={{ width: size, height: size }}
        autoPlay={autoPlay}
        loop={loop}
        speed={speed}
        onAnimationFinish={onAnimationFinish}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  webFallback: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
});
