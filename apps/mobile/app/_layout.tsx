import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { I18nManager, Platform, useColorScheme } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';

import { AuthProvider } from '@/providers/AuthProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { OfflineBanner } from '@/components/common/OfflineBanner';
import i18n, { syncRTL } from '../i18n';

// Conditionally import WebShell only on web for tree-shaking
const WebShell = Platform.OS === 'web' ? require('@/components/web').WebShell : null;

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Enable RTL for Arabic support
I18nManager.allowRTL(true);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 2,
      networkMode: 'offlineFirst',
    },
    mutations: {
      networkMode: 'offlineFirst',
    },
  },
});

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Sync RTL direction with the detected language, then reveal UI
    syncRTL();
    SplashScreen.hideAsync();
  }, []);

  const stackNavigator = (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
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
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <OfflineBanner />
            {WebShell ? <WebShell>{stackNavigator}</WebShell> : stackNavigator}
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
