import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { tokenStorage } from '@/lib/storage';
import { apiClient } from '@/lib/api';

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  isNewUser: boolean;
  profileComplete: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (tokens: { accessToken: string; refreshToken: string; user: User }) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = 'auth_tokens';

// Dev auth bypass requires explicit opt-in via env var (never leaks to TestFlight/production)
const DEV_SKIP_AUTH = __DEV__ && process.env.EXPO_PUBLIC_DEV_SKIP_AUTH === 'true';

const DEMO_USER: User = {
  id: 'demo_user_id',
  email: 'demo@luggageshare.com',
  displayName: 'Demo User',
  avatarUrl: null,
  isNewUser: false,
  profileComplete: true,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(DEV_SKIP_AUTH ? DEMO_USER : null);
  const [isLoading, setIsLoading] = useState(!DEV_SKIP_AUTH);
  const segments = useSegments();
  const router = useRouter();

  // Check authentication on mount (skip in dev mode)
  useEffect(() => {
    if (!DEV_SKIP_AUTH) {
      checkAuth();
    }
  }, []);

  // Handle navigation based on auth state
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // Redirect to home if authenticated
      router.replace('/(tabs)');
    }
  }, [user, segments, isLoading]);

  async function checkAuth() {
    try {
      const tokensJson = await tokenStorage.getItem(TOKEN_KEY);
      if (tokensJson) {
        const tokens = JSON.parse(tokensJson);
        if (tokens.accessToken && tokens.user) {
          // Validate token by calling the API — rejects expired/invalid tokens
          try {
            const response = await apiClient.get('/users/me');
            setUser(response.data.user || tokens.user);
          } catch {
            // Token invalid/expired — clear and redirect to login
            await tokenStorage.deleteItem(TOKEN_KEY);
          }
        }
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function signIn(tokens: { accessToken: string; refreshToken: string; user: User }) {
    try {
      await tokenStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
      setUser(tokens.user);
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  async function signOut() {
    try {
      await tokenStorage.deleteItem(TOKEN_KEY);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  function updateUser(updates: Partial<User>) {
    if (user) {
      setUser({ ...user, ...updates });
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signOut,
        updateUser,
      }}
    >
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
