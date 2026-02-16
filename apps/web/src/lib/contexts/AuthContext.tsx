'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { loginWithGoogle, loginWithApple, type AuthResponse } from '../api/auth';
import { getMe, type UserView } from '../api/users';

interface AuthState {
  user: UserView | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  signInWithGoogle: (idToken: string) => Promise<void>;
  signInWithApple: (identityToken: string, fullName?: { givenName?: string; familyName?: string }) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function storeTokens(data: AuthResponse) {
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
}

function clearTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setState({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    getMe()
      .then((user) => {
        setState({ user, isAuthenticated: true, isLoading: false });
      })
      .catch(() => {
        clearTokens();
        setState({ user: null, isAuthenticated: false, isLoading: false });
      });
  }, []);

  // Listen for forced logout from interceptor
  useEffect(() => {
    const handler = () => {
      setState({ user: null, isAuthenticated: false, isLoading: false });
    };
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, []);

  const handleAuthResponse = useCallback(async (data: AuthResponse) => {
    storeTokens(data);
    const user = await getMe();
    setState({ user, isAuthenticated: true, isLoading: false });
  }, []);

  const signInWithGoogle = useCallback(async (idToken: string) => {
    setState((s) => ({ ...s, isLoading: true }));
    try {
      const data = await loginWithGoogle(idToken);
      await handleAuthResponse(data);
    } catch (error) {
      setState((s) => ({ ...s, isLoading: false }));
      throw error;
    }
  }, [handleAuthResponse]);

  const signInWithApple = useCallback(async (
    identityToken: string,
    fullName?: { givenName?: string; familyName?: string }
  ) => {
    setState((s) => ({ ...s, isLoading: true }));
    try {
      const data = await loginWithApple(identityToken, fullName);
      await handleAuthResponse(data);
    } catch (error) {
      setState((s) => ({ ...s, isLoading: false }));
      throw error;
    }
  }, [handleAuthResponse]);

  const signOut = useCallback(() => {
    clearTokens();
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, signInWithGoogle, signInWithApple, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
