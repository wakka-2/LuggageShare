import { createContext, useContext, ReactNode } from 'react';
import { useColorScheme } from 'react-native';

export interface ThemeColors {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  success: string;
  error: string;
  warning: string;
  info: string;
}

export interface Theme {
  dark: boolean;
  colors: ThemeColors;
}

const lightColors: ThemeColors = {
  primary: '#2E5A8F',
  primaryDark: '#1E3A5F',
  primaryLight: '#4A7AB8',
  secondary: '#E8B923',
  background: '#FFFFFF',
  card: '#F8FAFC',
  text: '#0F172A',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  border: '#E2E8F0',
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
};

const darkColors: ThemeColors = {
  primary: '#4A7AB8',
  primaryDark: '#2E5A8F',
  primaryLight: '#7FA8D3',
  secondary: '#F5D456',
  background: '#0F172A',
  card: '#1E293B',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textTertiary: '#64748B',
  border: '#334155',
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
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
