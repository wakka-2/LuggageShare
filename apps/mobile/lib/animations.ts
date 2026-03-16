import { Easing, I18nManager } from 'react-native';

/**
 * Shared animation presets for LuggageShare.
 * All animated components reference these values for consistency.
 */
export const ANIM = {
  // Spring configs (react-native-reanimated withSpring)
  spring: {
    gentle: { damping: 20, stiffness: 150, mass: 1 },
    bouncy: { damping: 12, stiffness: 180, mass: 0.8 },
    snappy: { damping: 15, stiffness: 300, mass: 0.5 },
  },

  // Timing configs (react-native-reanimated withTiming)
  timing: {
    fast: { duration: 150, easing: Easing.ease },
    normal: { duration: 250, easing: Easing.inOut(Easing.ease) },
    slow: { duration: 400, easing: Easing.inOut(Easing.ease) },
  },

  // Standard animation values
  pressScale: 0.97,
  cardScale: 1.02,
  fadeIn: { from: 0, to: 1, duration: 200 },
  slideUp: { from: 50, to: 0, duration: 300 },
} as const;

/**
 * Calculate staggered delay for list items.
 * @param index - Item index in list
 * @param baseDelay - Base delay per item (ms)
 * @param maxDelay - Maximum total delay cap (ms)
 */
export function createStaggerDelay(index: number, baseDelay = 80, maxDelay = 600): number {
  return Math.min(index * baseDelay, maxDelay);
}

/**
 * Returns a direction multiplier for horizontal slide animations.
 * RTL layouts slide from the opposite direction.
 * @param isRTL - Whether the current layout is RTL
 */
export function rtlSlideMultiplier(isRTL?: boolean): number {
  const rtl = isRTL ?? I18nManager.isRTL;
  return rtl ? -1 : 1;
}
