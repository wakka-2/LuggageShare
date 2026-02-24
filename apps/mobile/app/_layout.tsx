import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { I18nManager, useColorScheme } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';

import { AuthProvider } from '@/providers/AuthProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import '../i18n';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Enable RTL for Arabic support
I18nManager.allowRTL(true);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Hide splash screen after app is ready
    SplashScreen.hideAsync();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
              }}
            >
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="listing/[id]"
                options={{ headerShown: false, presentation: 'card' }}
              />
              <Stack.Screen
                name="listing/create"
                options={{ headerShown: false, presentation: 'modal' }}
              />
              <Stack.Screen
                name="booking/[id]"
                options={{ headerShown: false, presentation: 'card' }}
              />
              <Stack.Screen
                name="booking/create"
                options={{ headerShown: false, presentation: 'modal' }}
              />
              <Stack.Screen
                name="chat/[bookingId]"
                options={{ headerShown: false, presentation: 'card' }}
              />
              <Stack.Screen
                name="notifications"
                options={{ headerShown: false, presentation: 'card' }}
              />
              <Stack.Screen
                name="profile/edit"
                options={{ headerShown: false, presentation: 'modal' }}
              />
              <Stack.Screen
                name="profile/wallet"
                options={{ headerShown: false, presentation: 'card' }}
              />
              <Stack.Screen
                name="profile/terms"
                options={{ headerShown: false, presentation: 'card' }}
              />
              <Stack.Screen
                name="profile/verification"
                options={{ headerShown: false, presentation: 'card' }}
              />
              <Stack.Screen
                name="profile/settings"
                options={{ headerShown: false, presentation: 'card' }}
              />
              <Stack.Screen
                name="profile/help"
                options={{ headerShown: false, presentation: 'card' }}
              />
              <Stack.Screen name="+not-found" />
            </Stack>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
