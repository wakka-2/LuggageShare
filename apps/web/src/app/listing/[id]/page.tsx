'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Plane,
  Calendar,
  Weight,
  DollarSign,
  BadgeCheck,
  FileText,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';
import { useListing } from '@/hooks/useListings';
import { MOCK_LISTINGS } from '@/lib/mockListings';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-SA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="bg-white rounded-[22px] p-6 shadow-bubble-sm">
        <div className="flex items-center justify-between">
          <div className="h-10 w-16 bg-v2-primary/10 rounded" />
          <div className="flex-1 mx-8 h-1 bg-v2-primary/10 rounded" />
          <div className="h-10 w-16 bg-v2-primary/10 rounded" />
        </div>
        <div className="mt-4 pt-4 border-t border-v2-primary/10 flex gap-3">
          <div className="h-8 w-32 bg-v2-primary/10 rounded-full" />
          <div className="h-8 w-24 bg-v2-primary/10 rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-[22px] p-5 shadow-bubble-sm h-32" />
        <div className="bg-white rounded-[22px] p-5 shadow-bubble-sm h-32" />
      </div>
      <div className="bg-white rounded-[22px] p-5 shadow-bubble-sm h-24" />
    </div>
  );
}

export default function ListingDetailPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : null;

  const { data: apiListing, isLoading, isError } = useListing(id);

  const listing = useMemo(() => {
    if (apiListing) return apiListing;
    if (isError || (!isLoading && !apiListing)) {
      return MOCK_LISTINGS.find((l) => l.id === id) ?? null;
    }
    return null;
  }, [apiListing, isLoading, isError, id]);

  const handleActionClick = () => {
    alert('حمل تطبيق حصتي للحجز والمراسلة');
  };

  const fromCode = listing
    ? listing.departureCode || listing.departureCity.slice(0, 3).toUpperCase()
    : '';
  const toCode = listing
    ? listing.arrivalCode || listing.arrivalCity.slice(0, 3).toUpperCase()
    : '';

  return (
    <div className="min-h-screen flex flex-col blob-background">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 pb-28">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-v2-text-soft hover:text-v2-text mb-6 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          العودة للرحلات
        </Link>

        {isLoading ? (
          <DetailSkeleton />
        ) : !listing ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-v2-primary/10 flex items-center justify-center mx-auto mb-4">
              <Plane className="w-8 h-8 text-v2-primary" />
            </div>
            <h2 className="text-lg font-bold text-v2-text mb-2">الرحلة غير موجودة</h2>
            <p className="text-v2-text-soft mb-4">لم نتمكن من العثور على هذه الرحلة</p>
            <Link href="/" className="text-v2-primary font-semibold hover:underline">
              العودة للرئيسية
            </Link>
          </div>
        ) : (
          <>
            {/* Route Card */}
            <div className="bg-white rounded-[22px] p-6 shadow-bubble-md mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-center">
                  <p className="text-3xl font-extrabold text-v2-text">{fromCode}</p>
                  <p className="text-sm text-v2-text-soft mt-1">{listing.departureCity}</p>
                </div>

                <div className="flex-1 flex items-center justify-center px-6">
                  <div className="w-4 h-4 rounded-full bg-v2-mint flex-shrink-0" />
                  <div className="flex-1 border-t-2 border-dashed border-v2-primary/20 mx-2" />
                  <Plane className="w-6 h-6 text-v2-primary -rotate-90 rtl:rotate-90 flex-shrink-0" />
                  <div className="flex-1 border-t-2 border-dashed border-v2-primary/20 mx-2" />
                  <div className="w-4 h-4 rounded-full bg-v2-secondary flex-shrink-0" />
                </div>

                <div className="text-center">
                  <p className="text-3xl font-extrabold text-v2-text">{toCode}</p>
                  <p className="text-sm text-v2-text-soft mt-1">{listing.arrivalCity}</p>
                </div>
              </div>

              <div className="border-t border-v2-primary/10 mt-4 pt-4 flex flex-wrap gap-2">
                <span className="bg-v2-bg px-3 py-1.5 rounded-full text-sm text-v2-text-soft flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(listing.departureDate)}
                </span>
                {listing.flightNumber && (
                  <span className="bg-v2-bg px-3 py-1.5 rounded-full text-sm text-v2-text-soft">
                    {listing.flightNumber}
                  </span>
                )}
              </div>
            </div>

            {/* Stats: Weight + Price */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-[22px] p-5 shadow-bubble-sm text-center">
                <div className="w-11 h-11 rounded-full bg-v2-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Weight className="w-5 h-5 text-v2-primary" />
                </div>
                <p className="text-2xl font-extrabold text-v2-text">{listing.availableWeight} kg</p>
                <p className="text-sm text-v2-text-soft">المساحة المتاحة</p>
              </div>
              <div className="bg-white rounded-[22px] p-5 shadow-bubble-sm text-center">
                <div className="w-11 h-11 rounded-full bg-v2-amber/15 flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="w-5 h-5 text-v2-amber" />
                </div>
                <p className="text-2xl font-extrabold text-v2-text">
                  {listing.price} {listing.currency}
                </p>
                <p className="text-sm text-v2-text-soft">السعر لكل كيلو</p>
              </div>
            </div>

            {/* Notes */}
            {listing.notes && (
              <div className="bg-v2-amber/10 rounded-[22px] p-5 mb-6">
                <h3 className="font-semibold text-v2-text flex items-center gap-1.5 mb-2">
                  <FileText className="w-4 h-4 text-v2-amber" />
                  ملاحظات
                </h3>
                <p className="text-v2-text-soft">{listing.notes}</p>
              </div>
            )}

            {/* Carrier Info */}
            <div className="bg-white rounded-[22px] p-5 shadow-bubble-sm mb-8">
              <h3 className="font-semibold text-v2-text mb-4">الناقل</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-v2-primary/10 flex items-center justify-center text-lg font-bold text-v2-primary">
                  {getInitial(listing.carrier.name)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-v2-text">{listing.carrier.name}</p>
                    {listing.carrier.isVerified && (
                      <BadgeCheck className="w-4 h-4 text-v2-primary" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Sticky Action Bar */}
      {listing && !isLoading && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-v2-primary/10 p-4 z-40">
          <div className="max-w-3xl mx-auto flex gap-3">
            <button
              onClick={handleActionClick}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-full border-2 border-v2-primary text-v2-primary font-semibold hover:bg-v2-primary/5 transition-all"
            >
              <MessageSquare className="w-5 h-5" />
              مراسلة
            </button>
            <button
              onClick={handleActionClick}
              className="flex-1 v2-gradient-primary text-white py-3 rounded-full font-semibold text-center hover:opacity-90 transition-opacity"
            >
              احجز الآن
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
