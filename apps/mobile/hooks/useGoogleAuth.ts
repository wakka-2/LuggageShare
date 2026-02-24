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

  // Always call the hook (Rules of Hooks) — use isConfigured to skip the flow, not the hook
  const [request, , promptAsync] = Google.useAuthRequest(googleConfig);

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

      if (result.type === 'success' && result.authentication?.idToken) {
        // Send token to backend for verification
        const authResponse = await apiClient.post('/auth/social', {
          provider: 'google',
          idToken: result.authentication.idToken,
          accessToken: result.authentication.accessToken,
        });

        await signIn(authResponse.data.data);
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
