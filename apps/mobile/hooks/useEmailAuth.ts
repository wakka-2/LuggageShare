import { useState } from 'react';

import { useAuth } from './useAuth';
import { apiClient } from '@/lib/api';
import { mapAuthResponseToSession, type ApiAuthResponse } from '@/lib/mappers';

/** Email/password sign-in against POST /auth/login and POST /auth/register. */
export function useEmailAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();

  async function run(path: '/auth/login' | '/auth/register', body: Record<string, string>) {
    setIsLoading(true);
    try {
      const { data } = await apiClient.post<ApiAuthResponse>(path, body);
      await signIn(mapAuthResponseToSession(data));
    } finally {
      setIsLoading(false);
    }
  }

  return {
    isLoading,
    signInWithEmail: (email: string, password: string) =>
      run('/auth/login', { email: email.trim(), password }),
    registerWithEmail: (name: string, email: string, password: string) =>
      run('/auth/register', { name: name.trim(), email: email.trim(), password }),
  };
}
