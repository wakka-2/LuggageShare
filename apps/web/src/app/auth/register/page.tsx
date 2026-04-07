'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserPlus, Chrome, Mail, Lock, User } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/providers/AuthProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import apiClient from '@/lib/api';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

function GoogleLoginButton({
  isLoading,
  onStart,
  onSuccess,
  onError,
}: {
  isLoading: boolean;
  onStart: () => void;
  onSuccess: (data: { accessToken: string; refreshToken: string; user: any }) => void;
  onError: (msg: string) => void;
}) {
  const { t } = useLanguage();
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useGoogleLogin } = require('@react-oauth/google');
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse: any) => {
      onStart();
      try {
        const res = await apiClient.post('/auth/google', {
          accessToken: tokenResponse.access_token,
        });
        onSuccess(res.data);
      } catch (err: any) {
        if (err?.response?.status === 429) {
          onError(t('auth.rateLimitError'));
        } else {
          onError(t('wp.loginError'));
        }
      }
    },
    onError: () => {
      onError(t('wp.loginError'));
    },
  });

  return (
    <button
      onClick={() => googleLogin()}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-3 bg-white border-2 border-v2-primary/20 hover:border-v2-primary/40 text-v2-text font-semibold py-3.5 rounded-full transition-all hover:shadow-bubble-sm disabled:opacity-50"
    >
      <Chrome className="w-5 h-5 text-v2-primary" />
      {isLoading ? t('common.loading') : t('auth.continueWithGoogle')}
    </button>
  );
}

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { signIn, isAuthenticated, isLoading: authLoading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  function handleAuthSuccess(data: any) {
    signIn({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: {
        id: data.user.id,
        email: data.user.email,
        displayName: data.user.name || data.user.displayName,
        avatarUrl: data.user.avatarUrl,
        isNewUser: data.user.isNewUser ?? false,
        profileComplete: data.user.profileComplete ?? true,
      },
    });
    router.replace('/');
  }

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError(t('auth.passwordMinLength'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('auth.passwordsDoNotMatch'));
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiClient.post('/auth/register', { email, name, password });
      handleAuthSuccess(res.data);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 429) {
        setError(t('auth.rateLimitError'));
      } else if (status === 409) {
        setError(t('auth.emailAlreadyRegistered'));
      } else {
        const msg = err?.response?.data?.message || err?.message || '';
        setError(msg || t('wp.loginError'));
      }
    } finally {
      setIsLoading(false);
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col blob-background">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="w-16 h-16 rounded-full bg-v2-primary/10 flex items-center justify-center animate-pulse">
            <UserPlus className="w-8 h-8 text-v2-primary" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col blob-background">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-v2-text-soft mb-4">{t('auth.alreadyLoggedIn')}</p>
            <Link href="/" className="text-v2-primary font-semibold hover:underline">
              {t('home.goHome') || 'Home'}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col blob-background">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-[22px] shadow-bubble-md p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-v2-primary/10 flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-8 h-8 text-v2-primary" />
              </div>
              <h1 className="text-2xl font-extrabold text-v2-text">{t('auth.createAccount')}</h1>
              <p className="text-v2-text-soft mt-2">{t('auth.tagline')}</p>
            </div>

            {error && (
              <div className="bg-v2-secondary/10 text-v2-secondary text-sm rounded-2xl px-4 py-3 mb-6 text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-v2-text-muted" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('auth.name')}
                  className="w-full pl-11 pr-4 py-3 rounded-full border-2 border-v2-primary/20 focus:border-v2-primary focus:outline-none bg-white text-v2-text placeholder:text-v2-text-muted transition-colors"
                  aria-label={t('auth.name')}
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-v2-text-muted" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.email')}
                  className="w-full pl-11 pr-4 py-3 rounded-full border-2 border-v2-primary/20 focus:border-v2-primary focus:outline-none bg-white text-v2-text placeholder:text-v2-text-muted transition-colors"
                  aria-label={t('auth.email')}
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-v2-text-muted" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.password')}
                  className="w-full pl-11 pr-4 py-3 rounded-full border-2 border-v2-primary/20 focus:border-v2-primary focus:outline-none bg-white text-v2-text placeholder:text-v2-text-muted transition-colors"
                  aria-label={t('auth.password')}
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-v2-text-muted" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('auth.confirmPassword')}
                  className="w-full pl-11 pr-4 py-3 rounded-full border-2 border-v2-primary/20 focus:border-v2-primary focus:outline-none bg-white text-v2-text placeholder:text-v2-text-muted transition-colors"
                  aria-label={t('auth.confirmPassword')}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-v2-primary hover:bg-v2-primary/90 text-white font-semibold py-3.5 rounded-full transition-all hover:shadow-bubble-sm active:scale-[0.97] disabled:opacity-50"
              >
                {isLoading ? t('common.loading') : t('auth.createAccount')}
              </button>
            </form>

            <p className="text-center text-sm text-v2-text-soft mt-4">
              {t('auth.hasAccount')}{' '}
              <Link href="/auth/login" className="text-v2-primary font-semibold hover:underline">
                {t('auth.signInLink')}
              </Link>
            </p>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-v2-primary/10" />
              <span className="text-xs text-v2-text-muted uppercase">
                {t('auth.orContinueWith')}
              </span>
              <div className="flex-1 h-px bg-v2-primary/10" />
            </div>

            {GOOGLE_CLIENT_ID ? (
              <GoogleLoginButton
                isLoading={isLoading}
                onStart={() => {
                  setIsLoading(true);
                  setError(null);
                }}
                onSuccess={(data) => {
                  handleAuthSuccess(data);
                  setIsLoading(false);
                }}
                onError={(msg) => {
                  setError(msg);
                  setIsLoading(false);
                }}
              />
            ) : (
              <div className="text-center text-sm text-v2-text-muted py-3 bg-v2-bg rounded-full">
                Google OAuth not configured
              </div>
            )}

            <p className="text-center text-xs text-v2-text-muted mt-6">
              {t('wp.agreeTerms')}{' '}
              <Link href="/terms" className="text-v2-primary hover:underline">
                {t('auth.termsOfService')}
              </Link>{' '}
              {t('auth.and')}{' '}
              <Link href="/privacy" className="text-v2-primary hover:underline">
                {t('auth.privacyPolicy')}
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
