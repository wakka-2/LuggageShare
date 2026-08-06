import { useState } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { useAuth } from './useAuth';
import { apiClient } from '@/lib/api';

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
  // On web, expo-auth-session throws if webClientId is falsy, so pass a placeholder.
  const safeConfig =
    Platform.OS === 'web' && !googleConfig.webClientId
      ? { ...googleConfig, webClientId: 'not-configured' }
      : googleConfig;
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
        const authResponse = await apiClient.post('/auth/google', {
          accessToken: result.authentication.accessToken,
        });

        // mobile apiClient already unwraps the { data } envelope once.
        await signIn(authResponse.data);
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
