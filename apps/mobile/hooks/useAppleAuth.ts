import { useState } from 'react';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';

import { useAuth } from './useAuth';
import { apiClient } from '@/lib/api';
import { mapAuthResponseToSession, type ApiAuthResponse } from '@/lib/mappers';

export function useAppleAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();

  const isAvailable = Platform.OS === 'ios';

  async function signInWithApple() {
    if (!isAvailable) {
      if (__DEV__) {
        console.warn('Apple Sign In is only available on iOS. Using demo mode.');
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
      throw new Error('Apple Sign In is only available on iOS');
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

      if (credential.identityToken && credential.authorizationCode) {
        // Contract: POST /auth/apple (AppleAuthDto). fullName is only sent by
        // Apple on the first sign-in, so forward it when present.
        const { data } = await apiClient.post<ApiAuthResponse>('/auth/apple', {
          identityToken: credential.identityToken,
          authorizationCode: credential.authorizationCode,
          ...(credential.fullName?.givenName
            ? {
                fullName: {
                  givenName: credential.fullName.givenName,
                  familyName: credential.fullName.familyName ?? undefined,
                },
              }
            : {}),
        });

        // apiClient already unwraps the { data } envelope once.
        await signIn(mapAuthResponseToSession(data));
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
