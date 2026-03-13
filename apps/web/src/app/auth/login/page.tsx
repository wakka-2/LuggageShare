'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LogIn, Chrome } from 'lucide-react';
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
          idToken: tokenResponse.access_token,
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
  const { signIn } = useAuth();
  const { t } = useLanguage();

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
    // Redirect is handled by AuthProvider's useEffect when user state changes
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
                  className="w-full flex items-center justify-center gap-2 bg-v2-bg text-v2-text-soft font-medium py-3 rounded-full transition-all hover:bg-v2-primary/10 disabled:opacity-50 text-sm"
                >
                  {t('wp.devLogin')} (Dev User)
                </button>
                <button
                  onClick={() => handleDevLogin(1)}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-v2-bg text-v2-text-soft font-medium py-3 rounded-full transition-all hover:bg-v2-mint/20 disabled:opacity-50 text-sm"
                >
                  {t('wp.devLogin')} (Dev User 2)
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
