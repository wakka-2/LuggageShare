'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useGoogleLogin } from '@react-oauth/google';
import { LogIn, Chrome } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/providers/AuthProvider';
import apiClient from '@/lib/api';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();
  const router = useRouter();

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await apiClient.post('/auth/google', {
          idToken: tokenResponse.access_token,
        });
        const data = res.data;
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
        router.push('/');
      } catch {
        setError('فشل تسجيل الدخول. حاول مرة أخرى.');
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      setError('فشل الاتصال بـ Google. حاول مرة أخرى.');
    },
  });

  async function handleDevLogin() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.post('/auth/dev-login');
      const data = res.data;
      signIn({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: {
          id: data.user.id,
          email: data.user.email,
          displayName: data.user.name || data.user.displayName,
          avatarUrl: data.user.avatarUrl,
          isNewUser: false,
          profileComplete: true,
        },
      });
      router.push('/');
    } catch {
      setError('Dev login غير متاح. تأكد من تفعيل DEV_LOGIN_ENABLED.');
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
              <h1 className="text-2xl font-extrabold text-v2-text">تسجيل الدخول</h1>
              <p className="text-v2-text-soft mt-2">سجل دخولك للوصول لحسابك</p>
            </div>

            {error && (
              <div className="bg-v2-secondary/10 text-v2-secondary text-sm rounded-2xl px-4 py-3 mb-6 text-center">
                {error}
              </div>
            )}

            <button
              onClick={() => googleLogin()}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-v2-primary/20 hover:border-v2-primary/40 text-v2-text font-semibold py-3.5 rounded-full transition-all hover:shadow-bubble-sm disabled:opacity-50"
            >
              <Chrome className="w-5 h-5 text-v2-primary" />
              {isLoading ? 'جاري التسجيل...' : 'تسجيل الدخول عبر Google'}
            </button>

            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={handleDevLogin}
                disabled={isLoading}
                className="w-full mt-3 flex items-center justify-center gap-2 bg-v2-bg text-v2-text-soft font-medium py-3 rounded-full transition-all hover:bg-v2-primary/10 disabled:opacity-50 text-sm"
              >
                Dev Login (تطوير فقط)
              </button>
            )}

            <p className="text-center text-xs text-v2-text-muted mt-6">
              بتسجيل الدخول، أنت توافق على{' '}
              <Link href="/terms" className="text-v2-primary hover:underline">
                شروط الخدمة
              </Link>{' '}
              و{' '}
              <Link href="/privacy" className="text-v2-primary hover:underline">
                سياسة الخصوصية
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
