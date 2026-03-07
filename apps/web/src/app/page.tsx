'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Plane, SearchX } from 'lucide-react';
import { useListings } from '@/hooks/useListings';
import { MOCK_LISTINGS } from '@/lib/mockListings';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HowItWorks } from '@/components/home/HowItWorks';
import { PopularRoutes } from '@/components/home/PopularRoutes';
import FilterBar from '@/components/home/FilterBar';
import TripCard from '@/components/home/TripCard';
import TripCardSkeleton from '@/components/home/TripCardSkeleton';

export default function HomePage() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');

  const {
    data: apiListings,
    isLoading,
    isError,
  } = useListings({
    from: from || undefined,
    to: to || undefined,
    date: date || undefined,
    limit: 12,
  });

  const listings = useMemo(() => {
    if (apiListings && apiListings.length > 0) return apiListings;
    if (isError || (!isLoading && (!apiListings || apiListings.length === 0))) {
      return MOCK_LISTINGS;
    }
    return [];
  }, [apiListings, isLoading, isError]);

  const hasFilters = from || to || date;

  const handleClearFilters = () => {
    setFrom('');
    setTo('');
    setDate('');
  };

  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const handleRouteSelect = (fromCity: string, toCity: string) => {
    setFrom(fromCity);
    setTo(toCity);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col blob-background">
      <Header />

      <main className="flex-1">
        {/* Compact Hero */}
        <section className="pt-10 pb-4 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="relative">
              <div className="absolute -top-6 left-10 w-16 h-16 rounded-full bg-v2-mint/20 blur-xl" />
              <div className="absolute -top-4 right-16 w-12 h-12 rounded-full bg-v2-secondary/15 blur-xl" />
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-v2-text mb-2 relative">
              رحلات متاحة
            </h1>
            <p className="text-v2-text-soft mb-6 relative">تصفح الرحلات المتاحة أو ابحث عن وجهتك</p>
          </div>
        </section>

        {/* Filter Bar */}
        <section className="px-4">
          <div className="max-w-6xl mx-auto">
            <FilterBar
              from={from}
              to={to}
              date={date}
              onFromChange={setFrom}
              onToChange={setTo}
              onDateChange={setDate}
              onClear={handleClearFilters}
              onSwap={handleSwap}
              resultCount={hasFilters ? listings.length : undefined}
            />
          </div>
        </section>

        {/* Results Count */}
        <section className="px-4 mb-4">
          <div className="max-w-6xl mx-auto flex items-center gap-2">
            <Plane className="w-4 h-4 text-v2-primary -rotate-90 rtl:rotate-90" />
            <p className="text-sm text-v2-text-soft">
              {isLoading ? 'جاري البحث...' : `${listings.length} رحلة متاحة`}
            </p>
          </div>
        </section>

        {/* Trips Grid */}
        <section className="px-4 pb-8">
          <div className="max-w-6xl mx-auto">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <TripCardSkeleton key={i} />
                ))}
              </div>
            ) : listings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <TripCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-v2-primary/10 flex items-center justify-center mx-auto mb-4">
                  <SearchX className="w-8 h-8 text-v2-primary" />
                </div>
                <h3 className="text-lg font-bold text-v2-text mb-2">لا توجد رحلات</h3>
                <p className="text-v2-text-soft mb-4">لم نجد رحلات تطابق بحثك</p>
                {hasFilters && (
                  <button
                    onClick={handleClearFilters}
                    className="text-v2-primary font-semibold hover:underline"
                  >
                    مسح الفلاتر
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        {/* How It Works */}
        <HowItWorks />

        {/* Popular Routes (pill buttons) */}
        <PopularRoutes onRouteSelect={handleRouteSelect} />

        {/* CTA Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center v2-gradient-primary rounded-[28px] py-16 px-8 shadow-bubble-lg relative overflow-hidden">
            <div className="absolute top-4 left-8 w-24 h-24 rounded-full bg-white/10" />
            <div className="absolute bottom-6 right-12 w-16 h-16 rounded-full bg-white/10" />

            <h2 className="text-3xl font-bold text-white mb-4 relative">هل لديك رحلة قادمة؟</h2>
            <p className="text-white/80 mb-8 relative">
              سجل كناقل واكسب المال من مساحة أمتعتك الإضافية
            </p>
            <Link
              href="/carrier/register"
              className="inline-block bg-white text-v2-primary px-8 py-3 rounded-full font-semibold hover:shadow-bubble-md transition-all relative"
            >
              سجل كناقل
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
