import { createContext, useContext, ReactNode } from 'react';
import { Platform } from 'react-native';
import { IS_DARK } from '@/lib/colorScheme';

export interface ThemeColors {
  primary: string;
  primaryDark: string;
  primaryMid: string;
  primaryLight: string;
  secondary: string;
  background: string;
  bg: string;
  surface: string;
  surfaceSolid: string;
  card: string;
  white: string;
  text: string;
  textSecondary: string;
  textSoft: string;
  textTertiary: string;
  textMuted: string;
  border: string;
  borderSubtle: string;
  success: string;
  error: string;
  warning: string;
  info: string;
  accent1: string;
  accent2: string;
  accent3: string;
  blob1: string;
  blob2: string;
  blob3: string;
  blob4: string;
  cardShadow: string;
  // V1 compat (deprecated — use V2 tokens)
  glassBg: string;
  glassBorder: string;
  glassHighlight: string;
  tabBarBg: string;
}

export interface Theme {
  dark: boolean;
  colors: ThemeColors;
}

// ─── V2 Bubbly Organic — Light ──────────────────────────────

const lightColors: ThemeColors = {
  primary: '#7C6AFF',
  primaryDark: '#5A52D5',
  primaryMid: '#9D8FFF',
  primaryLight: '#B4ABFF',
  secondary: '#FF6B9D',
  background: '#F8F5FF',
  bg: '#F8F5FF',
  surface: '#FFFFFF',
  surfaceSolid: '#FFFFFF',
  card: '#FFFFFF',
  white: '#FFFFFF',
  text: '#2D2B55',
  textSecondary: '#6E6B8A',
  textSoft: '#6E6B8A',
  textTertiary: '#A8A5C0',
  textMuted: '#A8A5C0',
  border: 'rgba(124,106,255,0.10)',
  borderSubtle: 'rgba(124,106,255,0.05)',
  success: '#56D8B1',
  error: '#FF6B9D',
  warning: '#FFBE5C',
  info: '#5CB8FF',
  accent1: '#56D8B1',
  accent2: '#FFBE5C',
  accent3: '#5CB8FF',
  blob1: '#EDE7FF',
  blob2: '#FFE5ED',
  blob3: '#E0F7EE',
  blob4: '#FFF3D6',
  cardShadow: 'rgba(124,106,255,0.12)',
  // V1 compat (deprecated)
  glassBg: 'rgba(255,255,255,0.92)',
  glassBorder: 'rgba(124,106,255,0.12)',
  glassHighlight: 'rgba(255,255,255,0.95)',
  tabBarBg: '#FFFFFF',
};

const darkColors: ThemeColors = {
  primary: '#8B83FF',
  primaryDark: '#6C63FF',
  primaryMid: '#A89EFF',
  primaryLight: '#B0AAFF',
  secondary: '#FF8BB5',
  background: '#120F22',
  bg: '#120F22',
  surface: '#1E1B33',
  surfaceSolid: '#1E1B33',
  card: '#1E1B33',
  // 'white' is used for text/icons on primary buttons — it must stay white.
  white: '#FFFFFF',
  text: '#F0EEFF',
  textSecondary: '#B9B5D6',
  textSoft: '#B9B5D6',
  textTertiary: '#8E8AAD',
  textMuted: '#8E8AAD',
  border: 'rgba(139,131,255,0.12)',
  borderSubtle: 'rgba(139,131,255,0.06)',
  success: '#34EAAA',
  error: '#FF8A9C',
  warning: '#FFD073',
  info: '#56D0E8',
  accent1: '#34EAAA',
  accent2: '#FFD073',
  accent3: '#56D0E8',
  blob1: '#241E45',
  blob2: '#2E1A2B',
  blob3: '#142A27',
  blob4: '#2C2416',
  cardShadow: 'rgba(0,0,0,0.35)',
  // V1 compat (deprecated)
  glassBg: 'rgba(13,13,26,0.75)',
  glassBorder: 'rgba(139,131,255,0.15)',
  glassHighlight: 'rgba(255,255,255,0.05)',
  tabBarBg: '#1E1B33',
};

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Frozen at launch so live-themed (useTheme) and module-level (V2_COLORS)
  // styles always agree. See lib/colorScheme.ts.
  const isDark = IS_DARK;

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
  card: 22,
  button: 50,
  input: 50,
  badge: 50,
  pill: 50,
  heroCard: 28,
  avatar: 9999,
} as const;

// ─── V2 Bubble Shadows (purple-tinted) ──────────────────

export const BUBBLE_SHADOWS = {
  xs: Platform.select({
    ios: {
      shadowColor: 'rgba(124,106,255,0.12)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 8,
    },
    android: { elevation: 2 },
    default: {},
  }),
  sm: Platform.select({
    ios: {
      shadowColor: 'rgba(124,106,255,0.12)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 12,
    },
    android: { elevation: 3 },
    default: {},
  }),
  md: Platform.select({
    ios: {
      shadowColor: 'rgba(124,106,255,0.12)',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
    },
    android: { elevation: 4 },
    default: {},
  }),
  lg: Platform.select({
    ios: {
      shadowColor: 'rgba(124,106,255,0.12)',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 1,
      shadowRadius: 20,
    },
    android: { elevation: 4 },
    default: {},
  }),
  glow: Platform.select({
    ios: {
      shadowColor: '#7C6AFF',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
    },
    android: { elevation: 8 },
    default: {},
  }),
} as const;

// ─── V2 Typography Scale ────────────────────────────────

export const TYPOGRAPHY = {
  hero: { fontSize: 28, fontWeight: '800' as const, lineHeight: 36, letterSpacing: -0.5 },
  h1: { fontSize: 24, fontWeight: '800' as const, lineHeight: 32, letterSpacing: -0.5 },
  h2: { fontSize: 18, fontWeight: '700' as const, lineHeight: 25, letterSpacing: -0.3 },
  h3: { fontSize: 16, fontWeight: '700' as const, lineHeight: 22 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyBold: { fontSize: 16, fontWeight: '700' as const, lineHeight: 24 },
  caption: { fontSize: 14, fontWeight: '500' as const, lineHeight: 21 },
  captionBold: { fontSize: 14, fontWeight: '700' as const, lineHeight: 21 },
  small: { fontSize: 13, fontWeight: '600' as const, lineHeight: 18 },
  micro: { fontSize: 11, fontWeight: '600' as const, lineHeight: 16, letterSpacing: 0.5 },
  label: { fontSize: 12, fontWeight: '600' as const, lineHeight: 17 },
} as const;

// ─── V2 Gradients ───────────────────────────────────────

export const GRADIENTS = {
  primary: ['#7C6AFF', '#9D8FFF', '#B4ABFF'] as const,
  primaryHorizontal: ['#7C6AFF', '#9D8FFF'] as const,
  hero: ['#7C6AFF', '#9D8FFF', '#B4ABFF'] as const,
  secondary: ['#FF6B9D', '#FF8E53'] as const,
  warm: ['#FFBE5C', '#FF6B9D'] as const,
  mint: ['#56D8B1', '#5CB8FF'] as const,
  success: ['#56D8B1', '#34EAAA'] as const,
  cool: ['#5CB8FF', '#7C6AFF'] as const,
} as const;

// ─── V2 Accent Colors (direct access) ──────────────────

export interface V2Palette {
  bg: string;
  /** Cards, inputs, sheets — replaces hard-coded #FFFFFF backgrounds. */
  surface: string;
  /** Subtle secondary surface (chips, skeletons, inset rows). */
  surfaceAlt: string;
  border: string;
  primary: string;
  primaryMid: string;
  primaryLight: string;
  secondary: string;
  accent1: string;
  accent2: string;
  accent3: string;
  /** Text/icons on primary/gradient fills. */
  onPrimary: string;
  text: string;
  textSoft: string;
  textMuted: string;
  blob1: string;
  blob2: string;
  blob3: string;
  blob4: string;
  cardShadow: string;
}

const V2_LIGHT: V2Palette = {
  bg: '#F8F5FF',
  surface: '#FFFFFF',
  surfaceAlt: '#F3F0FA',
  border: 'rgba(124,106,255,0.12)',
  primary: '#7C6AFF',
  primaryMid: '#9D8FFF',
  primaryLight: '#B4ABFF',
  secondary: '#FF6B9D',
  accent1: '#56D8B1',
  accent2: '#FFBE5C',
  accent3: '#5CB8FF',
  onPrimary: '#FFFFFF',
  text: '#2D2B55',
  textSoft: '#6E6B8A',
  textMuted: '#A8A5C0',
  blob1: '#EDE7FF',
  blob2: '#FFE5ED',
  blob3: '#E0F7EE',
  blob4: '#FFF3D6',
  cardShadow: 'rgba(124,106,255,0.12)',
};

const V2_DARK: V2Palette = {
  bg: '#120F22',
  surface: '#1E1B33',
  surfaceAlt: '#272342',
  border: 'rgba(157,143,255,0.18)',
  primary: '#8B7DFF',
  primaryMid: '#A397FF',
  primaryLight: '#5B4FC4',
  secondary: '#FF7FAA',
  accent1: '#4FD1A8',
  accent2: '#FFC56E',
  accent3: '#6BC0FF',
  onPrimary: '#FFFFFF',
  text: '#F0EEFF',
  textSoft: '#B9B5D6',
  textMuted: '#8E8AAD',
  blob1: '#241E45',
  blob2: '#2E1A2B',
  blob3: '#142A27',
  blob4: '#2C2416',
  cardShadow: 'rgba(0,0,0,0.35)',
};

/** Active V2 palette for this launch (see lib/colorScheme.ts). */
export const V2_COLORS: V2Palette = IS_DARK ? V2_DARK : V2_LIGHT;

// ─── V1 Deprecated Exports (backward compat) ───────────

/** @deprecated Use BUBBLE_SHADOWS instead */
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

/** @deprecated Use bg/blob colors from ThemeColors instead */
export const SECTION_TINTS = {
  purple: '#F5F3FF',
  blue: '#EFF6FF',
  green: '#ECFDF5',
  amber: '#FFFBEB',
  pink: '#FFF1F2',
  neutral: '#F8FAFC',
} as const;

/** @deprecated Use solid backgrounds with BUBBLE_SHADOWS instead */
export const BLUR = {
  card: Platform.OS === 'web' ? 20 : 40,
  tabBar: Platform.OS === 'web' ? 30 : 60,
  modal: Platform.OS === 'web' ? 10 : 25,
  light: Platform.OS === 'web' ? 8 : 15,
} as const;
