'use client';

import { Listing } from '@/lib/types/listing';
import Link from 'next/link';

interface ListingCardProps {
  listing: Listing;
  viewMode?: 'grid' | 'list';
}

export function ListingCard({ listing, viewMode = 'grid' }: ListingCardProps) {
  const isOffer = listing.type === 'offer';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'اليوم';
    if (diffDays === 1) return 'غداً';
    if (diffDays < 7) return `بعد ${diffDays} أيام`;

    return date.toLocaleDateString('ar-SA', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffHours < 1) return 'الآن';
    if (diffHours < 24) return `منذ ${diffHours} س`;
    const diffDays = Math.floor(diffHours / 24);
    return `منذ ${diffDays} ي`;
  };

  if (viewMode === 'list') {
    return (
      <Link href={`/listings/${listing.id}`}>
        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer flex items-center gap-4">
          <div className={`w-1 h-20 rounded-full ${isOffer ? 'bg-primary-500' : 'bg-green-500'}`} />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h3 className="text-base font-semibold text-gray-900 truncate">{listing.titleAr}</h3>
              <div className="flex items-baseline gap-1 flex-shrink-0">
                <span className={`text-lg font-bold ${isOffer ? 'text-primary-600' : 'text-green-600'}`}>
                  {listing.pricing.small}
                </span>
                <span className="text-sm text-gray-500">ر.س</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
              <div className="flex items-center gap-2">
                <span className={isOffer ? 'text-primary-600' : 'text-green-600'}>📍</span>
                <span className="font-medium">{listing.from.code}</span>
                <span className="text-gray-400">←</span>
                <span className="font-medium">{listing.to.code}</span>
              </div>
              <div className="flex items-center gap-1">
                <span>📅</span>
                <span>{formatDate(listing.travelDate)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold">
                  {listing.user.nameAr.charAt(0)}
                </div>
                <span className="text-sm text-gray-600">{listing.user.nameAr}</span>
                {listing.user.isVerified && (
                  <span className="text-green-500">✓</span>
                )}
              </div>
              <span className="text-xs text-gray-400">{formatTimeAgo(listing.createdAt)}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/listings/${listing.id}`}>
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer">
        {/* Header with gradient */}
        <div className={`p-4 ${isOffer ? 'bg-gradient-to-r from-primary-500 to-primary-600' : 'bg-gradient-to-r from-green-500 to-green-600'} text-white`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
              <span>{isOffer ? '✈️' : '📦'}</span>
              <span className="text-sm font-medium">{isOffer ? 'عرض' : 'طلب'}</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <span>👁</span>
              <span>{listing.views}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-2xl font-bold mb-1">{listing.from.code}</div>
              <div className="text-sm text-white/80">{listing.from.cityAr}</div>
            </div>
            <div className="flex items-center gap-2 px-4">
              <div className="w-8 h-0.5 bg-white/40"></div>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                ✈️
              </div>
              <div className="w-8 h-0.5 bg-white/40"></div>
            </div>
            <div className="flex-1 text-left">
              <div className="text-2xl font-bold mb-1">{listing.to.code}</div>
              <div className="text-sm text-white/80">{listing.to.cityAr}</div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-3 line-clamp-2">
            {listing.titleAr}
          </h3>

          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1 bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm">
              <span>📅</span>
              <span>{formatDate(listing.travelDate)}</span>
            </div>
            {(listing.availableWeight || listing.neededWeight) && (
              <div className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
                <span>⚖️</span>
                <span>{listing.availableWeight || listing.neededWeight} كجم</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold">
                {listing.user.nameAr.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                  {listing.user.nameAr}
                  {listing.user.isVerified && (
                    <span className="text-green-500">✓</span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <span>⭐</span>
                  <span>{listing.user.rating}</span>
                  <span className="text-gray-300">•</span>
                  <span>{listing.user.completedDeals} صفقة</span>
                </div>
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 text-left">يبدأ من</div>
              <div className="flex items-baseline gap-1">
                <span className={`text-xl font-bold ${isOffer ? 'text-primary-600' : 'text-green-600'}`}>
                  {listing.pricing.small}
                </span>
                <span className="text-sm text-gray-500">ر.س</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
