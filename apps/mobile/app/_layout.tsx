import { useEffect, useRef } from 'react';
import { Stack, usePathname, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppState, I18nManager, Platform, View, type AppStateStatus } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  ThemeProvider as NavigationThemeProvider,
  DarkTheme,
  DefaultTheme,
} from '@react-navigation/native';
import { QueryClient, QueryClientProvider, focusManager } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';

import { AuthProvider } from '@/providers/AuthProvider';
import { ThemeProvider, V2_COLORS, themed } from '@/providers/ThemeProvider';
import { isDarkScheme, useColorSchemeValue } from '@/lib/colorScheme';
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
// current scheme so no white flashes appear between dark screens.
const navigationTheme = themed(() => ({
  ...(isDarkScheme() ? DarkTheme : DefaultTheme),
  colors: {
    ...(isDarkScheme() ? DarkTheme : DefaultTheme).colors,
    primary: V2_COLORS.primary,
    background: V2_COLORS.bg,
    card: V2_COLORS.surface,
    text: V2_COLORS.text,
    border: V2_COLORS.border,
    notification: V2_COLORS.secondary,
  },
}));

export default function RootLayout() {
  const scheme = useColorSchemeValue();
  const { i18n: i18nInstance } = useTranslation();
  const isRTLLayout = i18nInstance.language === 'ar';
  // Re-render key: theme and language both switch live without a reload.
  const appearanceKey = `${scheme}-${isRTLLayout ? 'rtl' : 'ltr'}`;
  const router = useRouter();
  const pathname = usePathname();
  const pathRef = useRef(pathname);
  pathRef.current = pathname;
  const appliedKey = useRef(appearanceKey);

  useEffect(() => {
    // Root window color behind all screens (keyboard, transitions, overscroll).
    SystemUI.setBackgroundColorAsync(V2_COLORS.bg).catch(() => {});

    // Theme switch: the navigator below is keyed on the scheme, so every screen
    // re-renders with the new palette. That resets the stack, so reopen the
    // screen the user was on (with its tab underneath for the back button).
    if (appliedKey.current === appearanceKey) return;
    appliedKey.current = appearanceKey;
    const path = pathRef.current;
    requestAnimationFrame(() => {
      const TAB_PATHS = ['/', '/trips', '/messages', '/profile'];
      if (path === '/login' || TAB_PATHS.includes(path)) {
        router.replace(path as any);
        return;
      }
      router.replace(path.startsWith('/profile/') ? ('/profile' as any) : ('/' as any));
      router.push(path as any);
    });
  }, [appearanceKey, router]);

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
            <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
            <OfflineBanner />
            <NavigationThemeProvider value={navigationTheme}>
              <View
                key={appearanceKey}
                // Layout direction applied here so switching language flips RTL
                // immediately; I18nManager.forceRTL only takes effect on next launch.
                style={{ flex: 1, direction: isRTLLayout ? 'rtl' : 'ltr' }}
              >
                {WebShell ? <WebShell>{stackNavigator}</WebShell> : stackNavigator}
              </View>
            </NavigationThemeProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
