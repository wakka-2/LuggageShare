import { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, ViewStyle } from 'react-native';
import LottieView from 'lottie-react-native';

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
  ...Object.fromEntries(
    Object.entries(REMOTE_ANIMATIONS).map(([key, url]) => [key, url])
  ),
} as const;

export type AnimationType = keyof typeof LOCAL_ANIMATIONS | keyof typeof REMOTE_ANIMATIONS;

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
  const animationRef = useRef<LottieView>(null);

  // Get the animation source - prioritize local assets
  const getSource = () => {
    if (typeof animation === 'string') {
      // Check for local animation first
      if (animation in LOCAL_ANIMATIONS) {
        return LOCAL_ANIMATIONS[animation as keyof typeof LOCAL_ANIMATIONS];
      }
      // Check for remote animation
      if (animation in REMOTE_ANIMATIONS) {
        return { uri: REMOTE_ANIMATIONS[animation as keyof typeof REMOTE_ANIMATIONS] };
      }
      // Custom URL
      return { uri: animation };
    }
    return LOCAL_ANIMATIONS.search; // Default fallback
  };

  const source = getSource();

  useEffect(() => {
    if (autoPlay && animationRef.current) {
      animationRef.current.play();
    }
  }, [autoPlay]);

  // Web fallback - Lottie doesn't work well on web in some cases
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.webFallback, { width: size, height: size }, style]}>
        <LottieView
          ref={animationRef}
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

  return (
    <View style={[{ width: size, height: size }, style]}>
      <LottieView
        ref={animationRef}
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
