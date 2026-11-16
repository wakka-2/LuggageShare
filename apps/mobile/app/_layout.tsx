import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppState, I18nManager, Platform, type AppStateStatus } from 'react-native';
import {
  ThemeProvider as NavigationThemeProvider,
  DarkTheme,
  DefaultTheme,
} from '@react-navigation/native';
import { QueryClient, QueryClientProvider, focusManager } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';

import { AuthProvider } from '@/providers/AuthProvider';
import { ThemeProvider, V2_COLORS } from '@/providers/ThemeProvider';
import { IS_DARK } from '@/lib/colorScheme';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { OfflineBanner } from '@/components/common/OfflineBanner';
import i18n, { syncRTL } from '../i18n';
import * as Sentry from '@/lib/sentry';

// Conditionally import WebShell only on web for tree-shaking
const WebShell = Platform.OS === 'web' ? require('@/components/web').WebShell : null;

// Initialize Sentry for crash reporting (web stub is a no-op)
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN || '',
  enabled: !__DEV__,
  tracesSampleRate: 0.2,
});

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Enable RTL for Arabic support
I18nManager.allowRTL(true);

// React Query only knows about browser focus. On native, treat "app came back to
// the foreground" as focus so stale bookings/messages refetch when the user
// returns to the app.
if (Platform.OS !== 'web') {
  focusManager.setEventListener((handleFocus) => {
    const sub = AppState.addEventListener('change', (state: AppStateStatus) =>
      handleFocus(state === 'active')
    );
    return () => sub.remove();
  });
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Short: booking status and chat change on the other user's device.
      staleTime: 1000 * 30,
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 2,
      networkMode: 'offlineFirst',
    },
    mutations: {
      networkMode: 'offlineFirst',
    },
  },
});

// Navigation container colors (screen backgrounds, transitions) follow the
// launch-time scheme so no white flashes appear between dark screens.
const navigationTheme = {
  ...(IS_DARK ? DarkTheme : DefaultTheme),
  colors: {
    ...(IS_DARK ? DarkTheme : DefaultTheme).colors,
    primary: V2_COLORS.primary,
    background: V2_COLORS.bg,
    card: V2_COLORS.surface,
    text: V2_COLORS.text,
    border: V2_COLORS.border,
    notification: V2_COLORS.secondary,
  },
};

export default function RootLayout() {
  useEffect(() => {
    // Root window color behind all screens (keyboard, transitions, overscroll).
    SystemUI.setBackgroundColorAsync(V2_COLORS.bg).catch(() => {});
  }, []);

  useEffect(() => {
    // Sync RTL direction with the detected language, then reveal UI.
    // Wrap in try-catch: forceRTL on first Android install can throw on
    // some devices/new-arch configs — splash must always hide regardless.
    try {
      syncRTL();
    } catch {
      // Non-fatal: layout direction is re-synced on next launch.
    }
    SplashScreen.hideAsync();
  }, []);

  const stackNavigator = (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: V2_COLORS.bg },
      }}
    >
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="listing/[id]" options={{ headerShown: false, presentation: 'card' }} />
      <Stack.Screen name="listing/create" options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="booking/[id]" options={{ headerShown: false, presentation: 'card' }} />
      <Stack.Screen name="booking/create" options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen
        name="chat/[bookingId]"
        options={{ headerShown: false, presentation: 'card' }}
      />
      <Stack.Screen name="notifications" options={{ headerShown: false, presentation: 'card' }} />
      <Stack.Screen name="profile/edit" options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="profile/wallet" options={{ headerShown: false, presentation: 'card' }} />
      <Stack.Screen name="profile/terms" options={{ headerShown: false, presentation: 'card' }} />
      <Stack.Screen
        name="profile/verification"
        options={{ headerShown: false, presentation: 'card' }}
      />
      <Stack.Screen
        name="profile/settings"
        options={{ headerShown: false, presentation: 'card' }}
      />
      <Stack.Screen name="profile/help" options={{ headerShown: false, presentation: 'card' }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <StatusBar style={IS_DARK ? 'light' : 'dark'} />
            <OfflineBanner />
            <NavigationThemeProvider value={navigationTheme}>
              {WebShell ? <WebShell>{stackNavigator}</WebShell> : stackNavigator}
            </NavigationThemeProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
