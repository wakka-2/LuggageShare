'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogIn, Chrome, Mail, Lock } from 'lucide-react';
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
  // Lazy-import: only runs when GoogleLoginButton renders (i.e. when GOOGLE_CLIENT_ID is set)
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

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    // Redirect immediately — don't rely on AuthProvider useEffect timing
    router.replace('/');
  }

  async function handleEmailLogin(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      handleAuthSuccess(res.data);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 429) {
        setError(t('auth.rateLimitError'));
      } else if (status === 401) {
        setError(t('auth.invalidCredentials'));
      } else {
        const msg = err?.response?.data?.message || err?.message || '';
        setError(msg || t('wp.loginError'));
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDevLogin(userIndex = 0, retryCount = 0) {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.post(`/auth/dev-login?user=${userIndex}`);
      handleAuthSuccess(res.data);
    } catch (err: any) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || err?.message || '';

      if (status === 429) {
        if (retryCount < 2) {
          const waitSec = (retryCount + 1) * 2;
          setError(t('auth.rateLimitRetrying'));
          await new Promise((r) => setTimeout(r, waitSec * 1000));
          return handleDevLogin(userIndex, retryCount + 1);
        }
        setError(t('auth.rateLimitError'));
      } else if (msg.includes('not available') || status === 403) {
        setError('Dev login غير متاح. تأكد من تفعيل DEV_LOGIN_ENABLED.');
      } else {
        setError(`Login failed: ${msg || 'Could not connect to API'}`);
      }
    } finally {
      setIsLoading(false);
    }
  }

  // While checking stored tokens, show nothing to avoid flash
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col blob-background">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="w-16 h-16 rounded-full bg-v2-primary/10 flex items-center justify-center animate-pulse">
            <LogIn className="w-8 h-8 text-v2-primary" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Already authenticated — redirect is handled by AuthProvider, but show a clear message
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col blob-background">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-v2-text-soft mb-4">
              {t('auth.alreadyLoggedIn') || 'أنت مسجّل الدخول بالفعل…'}
            </p>
            <Link href="/" className="text-v2-primary font-semibold hover:underline">
              {t('home.goHome') || 'الصفحة الرئيسية'}
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
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-[22px] shadow-bubble-md p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-v2-primary/10 flex items-center justify-center mx-auto mb-4">
                <LogIn className="w-8 h-8 text-v2-primary" />
              </div>
              <h1 className="text-2xl font-extrabold text-v2-text">{t('wp.loginTitle')}</h1>
              <p className="text-v2-text-soft mt-2">{t('wp.loginSubtitle')}</p>
            </div>

            {error && (
              <div className="bg-v2-secondary/10 text-v2-secondary text-sm rounded-2xl px-4 py-3 mb-6 text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleEmailLogin} className="space-y-4">
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.password')}
                  className="w-full pl-11 pr-4 py-3 rounded-full border-2 border-v2-primary/20 focus:border-v2-primary focus:outline-none bg-white text-v2-text placeholder:text-v2-text-muted transition-colors"
                  aria-label={t('auth.password')}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-v2-primary hover:bg-v2-primary/90 text-white font-semibold py-3.5 rounded-full transition-all hover:shadow-bubble-sm active:scale-[0.97] disabled:opacity-50"
              >
                {isLoading ? t('common.loading') : t('auth.signIn')}
              </button>
            </form>

            <p className="text-center text-sm text-v2-text-soft mt-4">
              {t('auth.noAccount')}{' '}
              <Link href="/auth/register" className="text-v2-primary font-semibold hover:underline">
                {t('auth.createOne')}
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
                Google OAuth غير مُهيأ
              </div>
            )}

            {process.env.NODE_ENV === 'development' && (
              <div className="mt-3 space-y-2">
                <button
                  onClick={() => handleDevLogin(0)}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-v2-bg text-v2-text-soft font-medium py-3 rounded-full transition-all hover:bg-v2-primary/10 active:scale-[0.97] disabled:opacity-50 text-sm"
                >
                  {isLoading ? t('common.loading') : `${t('wp.devLogin')} (Dev User)`}
                </button>
                <button
                  onClick={() => handleDevLogin(1)}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-v2-bg text-v2-text-soft font-medium py-3 rounded-full transition-all hover:bg-v2-mint/20 active:scale-[0.97] disabled:opacity-50 text-sm"
                >
                  {isLoading ? t('common.loading') : `${t('wp.devLogin')} (Dev User 2)`}
                </button>
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
