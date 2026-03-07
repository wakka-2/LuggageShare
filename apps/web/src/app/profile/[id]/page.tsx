'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';
import { usePublicProfile } from '@/hooks/useProfile';
import { useUserReviews } from '@/hooks/useReviews';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
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

function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="bg-white rounded-[22px] p-6 shadow-bubble-sm">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-v2-primary/10" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-32 bg-v2-primary/10 rounded-full" />
            <div className="h-3 w-20 bg-v2-primary/5 rounded-full" />
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-[22px] p-4 shadow-bubble-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-full bg-v2-primary/10" />
              <div className="h-4 w-24 bg-v2-primary/10 rounded-full" />
            </div>
            <div className="h-3 w-full bg-v2-primary/5 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PublicProfilePage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : null;

  const { data: profile, isLoading } = usePublicProfile(id);
  const { data: reviews, isLoading: reviewsLoading } = useUserReviews(id);

  const profileUser = profile
    ? {
        name: profile.name,
        avatarUrl: profile.avatarUrl,
        isVerified: profile.isVerified,
      }
    : null;

  const stats = profile?.stats ?? undefined;

  return (
    <div className="min-h-screen flex flex-col blob-background">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-v2-text-soft hover:text-v2-text mb-6 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          العودة
        </Link>

        {isLoading ? (
          <ProfileSkeleton />
        ) : !profileUser ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-v2-primary/10 flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-v2-primary" />
            </div>
            <h2 className="text-lg font-bold text-v2-text mb-2">المستخدم غير موجود</h2>
            <p className="text-v2-text-soft mb-4">لم نتمكن من العثور على هذا المستخدم</p>
            <Link href="/" className="text-v2-primary font-semibold hover:underline">
              العودة للرئيسية
            </Link>
          </div>
        ) : (
          <>
            {/* Profile Header (no edit button) */}
            <ProfileHeader user={profileUser} stats={stats} showEdit={false} />

            {/* Reviews */}
            <div>
              <h2 className="text-lg font-extrabold text-v2-text mb-4">التقييمات</h2>

              {reviewsLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
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
                  <p className="text-sm text-v2-text-soft">لا توجد تقييمات بعد</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
