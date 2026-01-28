import { useState } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';

import { useAuth } from './useAuth';
import { apiClient } from '@/lib/api';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: Constants.expoConfig?.extra?.googleAndroidClientId,
    iosClientId: Constants.expoConfig?.extra?.googleIosClientId,
    webClientId: Constants.expoConfig?.extra?.googleWebClientId,
  });

  async function signInWithGoogle() {
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
    isReady: !!request,
  };
}
