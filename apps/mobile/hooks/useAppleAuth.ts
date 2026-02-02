import { useState } from 'react';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';

import { useAuth } from './useAuth';
import { apiClient } from '@/lib/api';

export function useAppleAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();

  const isAvailable = Platform.OS === 'ios';

  async function signInWithApple() {
    if (!isAvailable) {
      console.warn('Apple Sign In is only available on iOS. Using demo mode.');
      // For demo purposes on web/Android, simulate a successful login
      await signIn({
        accessToken: 'demo_apple_access_token',
        refreshToken: 'demo_apple_refresh_token',
        user: {
          id: 'demo_apple_user_id',
          email: 'demo.apple@example.com',
          displayName: 'Demo Apple User',
          avatarUrl: null,
          isNewUser: true,
          profileComplete: false,
        },
      });
      return;
    }

    try {
      setIsLoading(true);

      // Generate a random nonce for security
      const nonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        Math.random().toString(36).substring(2, 15)
      );

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce,
      });

      if (credential.identityToken) {
        // Send token to backend for verification
        const authResponse = await apiClient.post('/auth/social', {
          provider: 'apple',
          idToken: credential.identityToken,
          nonce,
          user: {
            email: credential.email,
            fullName: credential.fullName,
          },
        });

        await signIn(authResponse.data.data);
      }
    } catch (error: any) {
      if (error.code === 'ERR_CANCELED') {
        // User cancelled - not an error
        console.log('Apple sign in cancelled');
        return;
      }
      console.error('Apple sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  return {
    signInWithApple,
    isLoading,
    isAvailable,
  };
}
