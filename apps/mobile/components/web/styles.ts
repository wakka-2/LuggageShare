import { ViewStyle } from 'react-native';
import { V2_COLORS, RADIUS, BUBBLE_SHADOWS } from '@/providers/ThemeProvider';

export const SIDEBAR_WIDTH = 240;
export const SIDEBAR_COLLAPSED_WIDTH = 72;
export const TOPBAR_HEIGHT = 64;

/** Below this width the web app falls back to mobile-style bottom tabs. */
export const WEB_DESKTOP_BREAKPOINT = 768;

export function bubbleBackground(): ViewStyle {
  return {
    backgroundColor: '#FFFFFF',
    ...BUBBLE_SHADOWS.sm,
  };
}

export function bubbleBorder(): ViewStyle {
  return {
    borderWidth: 0,
  };
}

export const webTransition = (property = 'all', duration = '0.3s', easing = 'ease') =>
  ({ transition: `${property} ${duration} ${easing}` }) as any;
