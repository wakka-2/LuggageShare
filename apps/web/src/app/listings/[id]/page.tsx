'use client';

import { use } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MOCK_LISTINGS } from '@/lib/data/mockListings';
import Link from 'next/link';

export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const listing = MOCK_LISTINGS.find(l => l.id === id);

  if (!listing) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">الإعلان غير موجود</h1>
            <Link href="/listings" className="text-primary-600 hover:text-primary-700">
              العودة للإعلانات
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isOffer = listing.type === 'offer';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {/* Back Button */}
        <Link
          href="/listings"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <span>←</span>
          <span>العودة للإعلانات</span>
        </Link>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className={`p-6 ${isOffer ? 'bg-gradient-to-r from-primary-500 to-primary-600' : 'bg-gradient-to-r from-green-500 to-green-600'} text-white`}>
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                {isOffer ? '✈️ عرض' : '📦 طلب'}
              </span>
              <span className="text-white/80">•</span>
              <span className="text-white/80">👁 {listing.views} مشاهدة</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">{listing.titleAr}</h1>
            {listing.descriptionAr && (
              <p className="text-white/90">{listing.descriptionAr}</p>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Route Info */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <div className="text-3xl font-bold text-gray-900 mb-1">{listing.from.code}</div>
                  <div className="text-gray-600">{listing.from.cityAr}</div>
                  <div className="text-sm text-gray-500">{listing.from.countryAr}</div>
                </div>
                <div className="px-8">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-0.5 bg-gray-300"></div>
                    <div className="text-2xl">✈️</div>
                    <div className="w-16 h-0.5 bg-gray-300"></div>
                  </div>
                </div>
                <div className="text-center flex-1">
                  <div className="text-3xl font-bold text-gray-900 mb-1">{listing.to.code}</div>
                  <div className="text-gray-600">{listing.to.cityAr}</div>
                  <div className="text-sm text-gray-500">{listing.to.countryAr}</div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-center gap-2 text-gray-700">
                  <span>📅</span>
                  <span className="font-medium">{formatDate(listing.travelDate)}</span>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Pricing */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">الأسعار</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">حجم صغير</span>
                    <span className="font-bold text-gray-900">{listing.pricing.small} ر.س</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">حجم متوسط</span>
                    <span className="font-bold text-gray-900">{listing.pricing.medium} ر.س</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">حجم كبير</span>
                    <span className="font-bold text-gray-900">{listing.pricing.large} ر.س</span>
                  </div>
                  {listing.pricing.negotiable && (
                    <div className="pt-3 border-t border-gray-200">
                      <span className="inline-flex items-center gap-2 text-sm text-yellow-700 bg-yellow-50 px-3 py-1 rounded-full">
                        💬 السعر قابل للتفاوض
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Weight */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">التفاصيل</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⚖️</span>
                    <div>
                      <div className="text-sm text-gray-600">الوزن المتاح</div>
                      <div className="font-bold text-gray-900">
                        {listing.availableWeight || listing.neededWeight} كجم
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">عن الناشر</h3>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold">
                  {listing.user.nameAr.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-semibold text-gray-900">{listing.user.nameAr}</span>
                    {listing.user.isVerified && (
                      <span className="text-green-500 text-xl">✓</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <span>⭐</span>
                      <span className="font-medium">{listing.user.rating}</span>
                    </span>
                    <span>•</span>
                    <span>{listing.user.completedDeals} صفقة مكتملة</span>
                    <span>•</span>
                    <span>عضو منذ {new Date(listing.user.memberSince).getFullYear()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="flex gap-4">
              <Link
                href={`/bookings/create?listing=${listing.id}`}
                className="flex-1 bg-primary-600 text-white py-4 rounded-lg hover:bg-primary-700 transition-colors font-semibold text-lg text-center"
              >
                احجز الآن
              </Link>
              <button className="px-6 py-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                ❤️
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
