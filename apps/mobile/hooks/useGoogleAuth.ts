import { useState } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { useAuth } from './useAuth';
import { apiClient } from '@/lib/api';
import { mapAuthResponseToSession, type ApiAuthResponse } from '@/lib/mappers';

WebBrowser.maybeCompleteAuthSession();

// Check if Google Auth is configured
const googleConfig = {
  androidClientId: Constants.expoConfig?.extra?.googleAndroidClientId,
  iosClientId: Constants.expoConfig?.extra?.googleIosClientId,
  webClientId: Constants.expoConfig?.extra?.googleWebClientId,
};

const isConfigured = Platform.select({
  web: !!googleConfig.webClientId,
  ios: !!googleConfig.iosClientId,
  android: !!googleConfig.androidClientId,
  default: false,
});

export function useGoogleAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();

  // Always call the hook (Rules of Hooks).
  // expo-auth-session throws during render if the current platform's client ID
  // is falsy (webClientId on web, iosClientId on iOS, androidClientId on Android),
  // which would crash the login screen. Pass a placeholder; isConfigured blocks
  // any real sign-in attempt and the login screen hides the Google button.
  const platformKey = Platform.select({
    ios: 'iosClientId',
    android: 'androidClientId',
    default: 'webClientId',
  }) as keyof typeof googleConfig;
  const safeConfig = googleConfig[platformKey]
    ? googleConfig
    : { ...googleConfig, [platformKey]: 'not-configured' };
  const [request, , promptAsync] = Google.useAuthRequest(safeConfig);

  async function signInWithGoogle() {
    if (!isConfigured) {
      console.warn('Google Auth not configured. Add client IDs to app.json extra config.');
      // Demo login only when explicitly opted in
      if (__DEV__ && process.env.EXPO_PUBLIC_DEV_SKIP_AUTH === 'true') {
        await signIn({
          accessToken: 'demo_access_token',
          refreshToken: 'demo_refresh_token',
          user: {
            id: 'demo_user_id',
            email: 'demo@example.com',
            displayName: 'Demo User',
            avatarUrl: null,
            isNewUser: true,
            profileComplete: false,
          },
        });
      }
      return;
    }

    try {
      setIsLoading(true);

      const result = await promptAsync();

      if (result.type === 'success' && result.authentication?.accessToken) {
        // Verify the Google OAuth2 access token with the backend.
        // Endpoint + contract match the API (POST /auth/google { accessToken })
        // and the web client; the API calls Google's userinfo endpoint to verify.
        const { data } = await apiClient.post<ApiAuthResponse>('/auth/google', {
          accessToken: result.authentication.accessToken,
        });

        // mobile apiClient already unwraps the { data } envelope once.
        await signIn(mapAuthResponseToSession(data));
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  return {
    signInWithGoogle,
    isLoading,
    isReady: isConfigured ? !!request : true,
    isConfigured,
  };
}
