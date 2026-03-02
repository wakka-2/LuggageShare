import { ViewStyle } from 'react-native';
import type { ThemeColors } from '@/providers/ThemeProvider';

export const SIDEBAR_WIDTH = 240;
export const SIDEBAR_COLLAPSED_WIDTH = 72;
export const TOPBAR_HEIGHT = 64;

/** Below this width the web app falls back to mobile-style bottom tabs. */
export const WEB_DESKTOP_BREAKPOINT = 768;

export function glassBackground(colors: ThemeColors, isDark: boolean): ViewStyle {
  return {
    backgroundColor: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.7)',
    ...({ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' } as any),
  };
}

export function glassBorder(isDark: boolean): ViewStyle {
  return {
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.18)',
  };
}

export const webTransition = (property = 'all', duration = '0.3s', easing = 'ease') =>
  ({ transition: `${property} ${duration} ${easing}` }) as any;
