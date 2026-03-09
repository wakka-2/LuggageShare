'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Pencil, Wallet, Bell, HelpCircle, LogOut, Star, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import { useProfile } from '@/hooks/useProfile';
import { useUserReviews } from '@/hooks/useReviews';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ProfileHeader from '@/components/profile/ProfileHeader';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i <= rating ? 'text-v2-amber fill-v2-amber' : 'text-v2-primary/20'
          }`}
        />
      ))}
    </div>
  );
}

function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const { data: profile } = useProfile();
  const { data: reviews, isLoading: reviewsLoading } = useUserReviews(user?.id ?? null);

  const menuItems = useMemo(
    () => [
      {
        href: '/profile/edit',
        icon: Pencil,
        label: t('profile.editProfile'),
        description: t('wp.profileEditDesc'),
      },
      {
        href: '/wallet',
        icon: Wallet,
        label: t('profile.wallet'),
        description: t('wp.walletDesc'),
      },
      {
        href: '/notifications',
        icon: Bell,
        label: t('profile.notifications'),
        description: t('wp.notificationsDesc'),
      },
      {
        href: '/help',
        icon: HelpCircle,
        label: t('wp.helpShort'),
        description: t('wp.helpDesc'),
      },
    ],
    [t]
  );

  const profileUser = useMemo(() => {
    if (profile) {
      return {
        name: profile.name,
        avatarUrl: profile.avatarUrl,
        isVerified: profile.isVerified,
      };
    }
    if (user) {
      return {
        name: user.displayName || user.name,
        avatarUrl: user.avatarUrl,
        isVerified: user.isVerified,
      };
    }
    return { name: undefined, avatarUrl: null, isVerified: false };
  }, [profile, user]);

  const stats = profile?.stats ?? undefined;

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col blob-background">
        <Header />

        <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
          {/* Profile Header */}
          <div className="mb-6">
            <ProfileHeader user={profileUser} stats={stats} showEdit={true} />
          </div>

          {/* Menu Cards */}
          <div className="space-y-3 mb-8">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-4 bg-white rounded-[22px] p-4 shadow-bubble-sm hover:shadow-bubble-md transition-all group"
              >
                <div className="w-11 h-11 rounded-full bg-v2-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-v2-primary/15 transition-colors">
                  <item.icon className="w-5 h-5 text-v2-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-v2-text">{item.label}</p>
                  <p className="text-xs text-v2-text-soft">{item.description}</p>
                </div>
                <ChevronLeft className="w-4 h-4 text-v2-text-muted flex-shrink-0" />
              </Link>
            ))}
          </div>

          {/* Reviews Section */}
          <div className="mb-8">
            <h2 className="text-lg font-extrabold text-v2-text mb-4">{t('wp.reviews')}</h2>

            {reviewsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-[22px] p-4 shadow-bubble-sm animate-pulse"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-full bg-v2-primary/10" />
                      <div className="h-4 w-24 bg-v2-primary/10 rounded-full" />
                    </div>
                    <div className="h-3 w-full bg-v2-primary/5 rounded-full" />
                  </div>
                ))}
              </div>
            ) : reviews && reviews.length > 0 ? (
              <div className="space-y-3">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-[22px] p-4 shadow-bubble-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {review.reviewer.avatarUrl ? (
                          <img
                            src={review.reviewer.avatarUrl}
                            alt={review.reviewer.name}
                            className="w-9 h-9 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-v2-primary/10 flex items-center justify-center text-sm font-bold text-v2-primary">
                            {getInitial(review.reviewer.name)}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-v2-text">
                            {review.reviewer.name}
                          </p>
                          {review.booking && (
                            <p className="text-[10px] text-v2-text-muted">
                              {review.booking.listing.departureCity} &rarr;{' '}
                              {review.booking.listing.arrivalCity}
                            </p>
                          )}
                        </div>
                      </div>
                      <StarRating rating={review.rating} />
                    </div>
                    {review.comment && (
                      <p className="text-sm text-v2-text-soft">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[22px] p-6 shadow-bubble-sm text-center">
                <div className="w-12 h-12 rounded-full bg-v2-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Star className="w-6 h-6 text-v2-primary" />
                </div>
                <p className="text-sm text-v2-text-soft">{t('wp.noReviews')}</p>
              </div>
            )}
          </div>

          {/* Sign Out */}
          <button
            onClick={signOut}
            className="w-full flex items-center justify-center gap-2 bg-white rounded-[22px] p-4 shadow-bubble-sm text-v2-secondary font-semibold hover:bg-v2-secondary/5 transition-all"
          >
            <LogOut className="w-5 h-5" />
            {t('profile.signOut')}
          </button>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
