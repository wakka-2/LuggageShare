'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import apiClient from '@/lib/api';

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  name?: string;
  avatarUrl: string | null;
  isNewUser: boolean;
  profileComplete: boolean;
  isVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (tokens: { accessToken: string; refreshToken: string; user: User }) => void;
  signOut: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = 'auth_tokens';

// Public routes that don't require auth
const PUBLIC_ROUTES = [
  '/',
  '/auth/login',
  '/auth/register',
  '/about',
  '/how-it-works',
  '/careers',
  '/help',
  '/safety',
  '/contact',
  '/terms',
  '/privacy',
  '/prohibited-items',
];

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname)) return true;
  // Listing detail pages are public
  if (pathname.startsWith('/listing/') && !pathname.includes('/create')) return true;
  // Public profiles
  if (pathname.startsWith('/profile/') && pathname.split('/').length === 3) return true;
  return false;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, []);

  // Redirect unauthenticated users from protected routes
  useEffect(() => {
    if (isLoading) return;

    if (!user && !isPublicRoute(pathname)) {
      router.replace('/auth/login');
    } else if (user && (pathname === '/auth/login' || pathname === '/auth/register')) {
      // Use requestAnimationFrame to ensure React state is fully painted
      // before triggering Next.js navigation (avoids race with batched updates)
      requestAnimationFrame(() => {
        router.replace('/');
      });
    }
  }, [user, pathname, isLoading, router]);

  async function checkAuth() {
    try {
      const tokensJson = localStorage.getItem(TOKEN_KEY);
      if (tokensJson) {
        const tokens = JSON.parse(tokensJson);
        if (tokens.accessToken) {
          try {
            const response = await apiClient.get('/users/me');
            const userData = response.data;
            setUser({
              id: userData.id,
              email: userData.email,
              displayName: userData.name || userData.displayName,
              name: userData.name,
              avatarUrl: userData.avatarUrl,
              isNewUser: false,
              profileComplete: true,
              isVerified: userData.isVerified,
            });
          } catch {
            localStorage.removeItem(TOKEN_KEY);
          }
        }
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function signIn(tokens: { accessToken: string; refreshToken: string; user: User }) {
    localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
    setUser(tokens.user);
  }

  function signOut() {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    router.replace('/');
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
