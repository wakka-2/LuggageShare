import { createContext, useContext, ReactNode } from 'react';
import { useColorScheme, Platform } from 'react-native';

export interface ThemeColors {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  background: string;
  surface: string;
  surfaceSolid: string;
  card: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  textMuted: string;
  border: string;
  borderSubtle: string;
  success: string;
  error: string;
  warning: string;
  info: string;
  // Glass-specific tokens
  glassBg: string;
  glassBorder: string;
  glassHighlight: string;
  tabBarBg: string;
}

export interface Theme {
  dark: boolean;
  colors: ThemeColors;
}

// ─── Vibrant Purple — Gradient Palette ──────────────────────

const lightColors: ThemeColors = {
  primary: '#6C63FF',
  primaryDark: '#5A52D5',
  primaryLight: '#A5A0FF',
  secondary: '#FF6B9D',
  background: '#FAFAFF',
  surface: '#FFFFFF',
  surfaceSolid: '#FFFFFF',
  card: '#FFFFFF',
  text: '#1A1A2E',
  textSecondary: '#4A4A68',
  textTertiary: '#7B7B9E',
  textMuted: '#A8A8C8',
  border: 'rgba(108,99,255,0.10)',
  borderSubtle: 'rgba(108,99,255,0.05)',
  success: '#00C48C',
  error: '#FF647C',
  warning: '#FFB946',
  info: '#00B4D8',
  // Glass
  glassBg: 'rgba(255,255,255,0.92)',
  glassBorder: 'rgba(108,99,255,0.12)',
  glassHighlight: 'rgba(255,255,255,0.95)',
  tabBarBg: 'rgba(250,250,255,0.88)',
};

const darkColors: ThemeColors = {
  primary: '#8B83FF',
  primaryDark: '#6C63FF',
  primaryLight: '#B0AAFF',
  secondary: '#FF8BB5',
  background: '#0D0D1A',
  surface: 'rgba(25,25,50,0.80)',
  surfaceSolid: '#1A1A2E',
  card: 'rgba(25,25,50,0.60)',
  text: '#F0F0FF',
  textSecondary: '#B0B0D0',
  textTertiary: '#7B7B9E',
  textMuted: '#4A4A68',
  border: 'rgba(139,131,255,0.12)',
  borderSubtle: 'rgba(139,131,255,0.06)',
  success: '#34EAAA',
  error: '#FF8A9C',
  warning: '#FFD073',
  info: '#56D0E8',
  // Glass
  glassBg: 'rgba(13,13,26,0.75)',
  glassBorder: 'rgba(139,131,255,0.15)',
  glassHighlight: 'rgba(255,255,255,0.05)',
  tabBarBg: 'rgba(13,13,26,0.88)',
};

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const theme: Theme = {
    dark: isDark,
    colors: isDark ? darkColors : lightColors,
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colors: theme.colors,
        isDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// ─── Design Tokens ───────────────────────────────────────

export const SPACING = [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64] as const;

export const RADIUS = {
  card: 20,
  button: 14,
  input: 14,
  badge: 24,
  pill: 999,
  avatar: 9999,
} as const;

export const BLUR = {
  card: Platform.OS === 'web' ? 20 : 40,
  tabBar: Platform.OS === 'web' ? 30 : 60,
  modal: Platform.OS === 'web' ? 10 : 25,
  light: Platform.OS === 'web' ? 8 : 15,
} as const;

export const SHADOWS = {
  s: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 3,
    },
    android: { elevation: 1 },
    default: {},
  }),
  m: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
    },
    android: { elevation: 3 },
    default: {},
  }),
  l: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 24,
    },
    android: { elevation: 6 },
    default: {},
  }),
  xl: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.1,
      shadowRadius: 25,
    },
    android: { elevation: 10 },
    default: {},
  }),
  glow: Platform.select({
    ios: {
      shadowColor: '#6C63FF',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
    },
    android: { elevation: 8 },
    default: {},
  }),
} as const;

export const GRADIENTS = {
  primary: ['#6C63FF', '#4158D0'] as const,
  hero: ['#6C63FF', '#4158D0', '#2196F3'] as const,
  secondary: ['#FF6B9D', '#FF8E53'] as const,
  success: ['#00C48C', '#00E4A0'] as const,
  warm: ['#FFB946', '#FF6B9D'] as const,
  cool: ['#00B4D8', '#6C63FF'] as const,
  card: ['#FAFAFF', '#F0F0FF'] as const,
} as const;

// ─── V2 Section Tints (soft pastel backgrounds) ─────────────
export const SECTION_TINTS = {
  purple: '#F5F3FF',
  blue: '#EFF6FF',
  green: '#ECFDF5',
  amber: '#FFFBEB',
  pink: '#FFF1F2',
  neutral: '#F8FAFC',
} as const;

export const TYPOGRAPHY = {
  h1: { fontSize: 32, fontWeight: '700' as const, lineHeight: 40 },
  h2: { fontSize: 24, fontWeight: '600' as const, lineHeight: 32 },
  h3: { fontSize: 18, fontWeight: '600' as const, lineHeight: 25 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  caption: { fontSize: 14, fontWeight: '400' as const, lineHeight: 21 },
  small: { fontSize: 12, fontWeight: '500' as const, lineHeight: 17 },
  micro: { fontSize: 10, fontWeight: '600' as const, lineHeight: 14 },
} as const;
