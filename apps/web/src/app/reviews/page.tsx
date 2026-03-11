'use client';

import Link from 'next/link';
import { Star, MessageSquare } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useUserReviews } from '@/hooks/useReviews';
import { useAuth } from '@/providers/AuthProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import StarRating from '@/components/common/StarRating';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

function ReviewsContent() {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const { data: reviews, isLoading } = useUserReviews(user?.id ?? null);

  const avgRating =
    reviews && reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  const ratingDist = [0, 0, 0, 0, 0];
  reviews?.forEach((r) => {
    const idx = Math.min(Math.max(Math.round(r.rating), 1), 5);
    ratingDist[5 - idx]++;
  });

  return (
    <div className="min-h-screen flex flex-col blob-background">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Star className="w-5 h-5 text-v2-amber fill-v2-amber" />
          <h1 className="text-xl font-bold text-v2-text">
            {lang === 'ar' ? 'تقييماتي' : 'My Reviews'}
          </h1>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-[22px] p-5 shadow-bubble-sm animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-v2-primary/10" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3.5 w-28 bg-v2-primary/10 rounded-full" />
                    <div className="h-3 w-20 bg-v2-primary/10 rounded-full" />
                  </div>
                </div>
                <div className="h-3 w-3/4 bg-v2-primary/10 rounded-full" />
              </div>
            ))}
          </div>
        ) : !reviews || reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-v2-amber/10 flex items-center justify-center mb-4">
              <Star className="w-10 h-10 text-v2-amber" />
            </div>
            <h2 className="text-lg font-bold text-v2-text mb-2">
              {lang === 'ar' ? 'لا توجد تقييمات بعد' : 'No reviews yet'}
            </h2>
            <p className="text-sm text-v2-text-secondary max-w-xs leading-relaxed">
              {lang === 'ar'
                ? 'أتمّ رحلات لتحصل على تقييمات من المستخدمين الآخرين.'
                : 'Complete bookings to receive reviews from other users.'}
            </p>
          </div>
        ) : (
          <>
            {/* Summary card */}
            <div className="bg-white rounded-[24px] shadow-bubble-md p-6 mb-6">
              <div className="flex items-center gap-8">
                {/* Avg number */}
                <div className="flex flex-col items-center">
                  <span className="text-5xl font-extrabold text-v2-text leading-none">
                    {avgRating.toFixed(1)}
                  </span>
                  <div className="mt-2">
                    <StarRating rating={avgRating} size="sm" />
                  </div>
                  <span className="text-xs text-v2-text-secondary mt-1.5">
                    {reviews.length} {lang === 'ar' ? 'تقييم' : 'reviews'}
                  </span>
                </div>

                {/* Distribution bars */}
                <div className="flex-1 space-y-1.5">
                  {ratingDist.map((count, idx) => {
                    const star = 5 - idx;
                    const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-xs text-v2-text-secondary w-2 text-right">
                          {star}
                        </span>
                        <Star className="w-3 h-3 text-v2-amber fill-v2-amber flex-shrink-0" />
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-v2-amber transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-v2-text-secondary w-4 text-right">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Reviews list */}
            <div className="space-y-3">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-[22px] shadow-bubble-sm p-5">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    {review.reviewer.avatarUrl ? (
                      <img
                        src={review.reviewer.avatarUrl}
                        alt={review.reviewer.name}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-v2-primary/10 flex items-center justify-center text-sm font-bold text-v2-primary flex-shrink-0">
                        {review.reviewer.name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-v2-text text-sm">
                          {review.reviewer.name}
                        </span>
                        <span className="text-xs text-v2-text-secondary shrink-0">
                          {new Date(review.createdAt).toLocaleDateString(
                            lang === 'ar' ? 'ar-SA' : 'en-US',
                            { month: 'short', day: 'numeric', year: 'numeric' }
                          )}
                        </span>
                      </div>

                      <div className="mt-1">
                        <StarRating rating={review.rating} size="sm" />
                      </div>

                      {review.comment && (
                        <p className="mt-2 text-sm text-v2-text leading-relaxed">
                          {review.comment}
                        </p>
                      )}

                      {/* Booking context */}
                      {review.booking && (
                        <div className="mt-3 flex items-center gap-1.5 text-xs text-v2-text-secondary">
                          <MessageSquare className="w-3 h-3" />
                          <Link
                            href={`/bookings/${review.booking.id}`}
                            className="hover:text-v2-primary transition-colors"
                          >
                            {lang === 'ar' ? 'عرض الحجز' : 'View booking'}
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function ReviewsPage() {
  return (
    <ProtectedRoute>
      <ReviewsContent />
    </ProtectedRoute>
  );
}
