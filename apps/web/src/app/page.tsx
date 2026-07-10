'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Plane,
  SearchX,
  SlidersHorizontal,
  DollarSign,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useListings } from '@/hooks/useListings';
import { MOCK_LISTINGS } from '@/lib/mockListings';
import { useLanguage } from '@/providers/LanguageProvider';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HowItWorks } from '@/components/home/HowItWorks';
import { PopularRoutes } from '@/components/home/PopularRoutes';
import FilterBar from '@/components/home/FilterBar';
import type { Flexibility } from '@/lib/dates';
import TripCard from '@/components/home/TripCard';
import TripCardSkeleton from '@/components/home/TripCardSkeleton';
import { BottomSheet } from '@/components/common/BottomSheet';

const PAGE_SIZE = 6;

export default function HomePage() {
  const { t } = useLanguage();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [flex, setFlex] = useState<Flexibility>(0);
  const [page, setPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const {
    data: apiResult,
    isLoading,
    isError,
  } = useListings({
    from: from || undefined,
    to: to || undefined,
    date: date || undefined,
    flex: date ? flex : undefined,
    page,
    limit: PAGE_SIZE,
  });

  const hasFilters = from || to || date;

  const listings = useMemo(() => {
    if (apiResult && apiResult.data.length > 0) return apiResult.data;
    if (hasFilters) return apiResult?.data ?? [];
    if (isError || (!isLoading && (!apiResult || apiResult.data.length === 0))) {
      return MOCK_LISTINGS;
    }
    return [];
  }, [apiResult, isLoading, isError, hasFilters]);

  const totalPages = apiResult?.meta?.totalPages ?? 1;
  const total = apiResult?.meta?.total ?? listings.length;
  const isMock = !apiResult || (apiResult.data.length === 0 && !hasFilters);

  const handleClearFilters = () => {
    setFrom('');
    setTo('');
    setDate('');
    setFlex(0);
    setPage(1);
  };

  const handleDateChange = (dateISO: string, f: Flexibility) => {
    setDate(dateISO);
    setFlex(f);
    setPage(1);
  };

  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
    setPage(1);
  };

  const handleRouteSelect = (fromCity: string, toCity: string) => {
    setFrom(fromCity);
    setTo(toCity);
    setPage(1);
    setIsFilterOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (setter: (v: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };

  return (
    <div className="min-h-screen flex flex-col blob-background">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="pt-10 pb-4 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="relative">
              <div className="absolute -top-6 left-10 w-16 h-16 rounded-full bg-v2-mint/20 blur-xl" />
              <div className="absolute -top-4 right-16 w-12 h-12 rounded-full bg-v2-secondary/15 blur-xl" />
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-v2-text mb-2 relative">
              {t('wp.earnMoney')}
            </h1>
            <p className="text-v2-text-soft mb-6 relative">{t('wp.earnMoneyDesc')}</p>
          </div>
        </section>

        {/* Earn Money Banner */}
        <section className="px-4 mb-6">
          <div className="max-w-6xl mx-auto">
            <div className="bg-gradient-to-l from-v2-mint/20 to-v2-primary/10 rounded-[22px] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-bubble-xs">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-v2-mint/20 flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-6 h-6 text-v2-mint" />
                </div>
                <div>
                  <p className="font-bold text-v2-text">{t('wp.earnMoney')}</p>
                  <p className="text-sm text-v2-text-soft">{t('wp.earnMoneyDesc')}</p>
                </div>
              </div>
              <Link
                href="/listing/create"
                className="bg-v2-mint text-white px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap hover:shadow-bubble-sm transition-all"
              >
                {t('wp.addYourTrip')}
              </Link>
            </div>
          </div>
        </section>

        {/* Results Count + Filter Toggle */}
        <section className="px-4 mb-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Plane className="w-4 h-4 text-v2-primary -rotate-90 rtl:rotate-90" />
              <p className="text-sm text-v2-text-soft">
                {isLoading ? t('common.loading') : `${total} ${t('home.trips')}`}
              </p>
            </div>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white shadow-bubble-xs text-sm text-v2-text-soft hover:text-v2-text hover:shadow-bubble-sm transition-all"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {t('home.searchButton')}
              {hasFilters && <span className="w-2 h-2 rounded-full bg-v2-secondary" />}
            </button>
          </div>
        </section>

        {/* Desktop: collapsible filter bar */}
        <section className="hidden md:block px-4">
          <div className="max-w-6xl mx-auto">
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isFilterOpen ? 'max-h-[200px] opacity-100 mb-4' : 'max-h-0 opacity-0'
              }`}
            >
              <FilterBar
                from={from}
                to={to}
                date={date}
                flex={flex}
                onFromChange={handleFilterChange(setFrom)}
                onToChange={handleFilterChange(setTo)}
                onDateChange={handleDateChange}
                onClear={handleClearFilters}
                onSwap={handleSwap}
                resultCount={hasFilters ? total : undefined}
              />
            </div>
          </div>
        </section>

        {/* Mobile: filter bottom sheet */}
        <BottomSheet
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          title={t('home.searchButton')}
        >
          <FilterBar
            from={from}
            to={to}
            date={date}
            flex={flex}
            onFromChange={handleFilterChange(setFrom)}
            onToChange={handleFilterChange(setTo)}
            onDateChange={handleDateChange}
            onClear={handleClearFilters}
            onSwap={handleSwap}
            resultCount={hasFilters ? total : undefined}
          />
        </BottomSheet>

        {/* Trips Grid */}
        <section className="px-4 pb-4">
          <div className="max-w-6xl mx-auto">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(PAGE_SIZE)].map((_, i) => (
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
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-v2-primary/10 flex items-center justify-center mx-auto mb-4">
                  <SearchX className="w-8 h-8 text-v2-primary" />
                </div>
                <h3 className="text-lg font-bold text-v2-text mb-2">{t('home.noListings')}</h3>
                <p className="text-v2-text-soft mb-4">{t('home.noListingsDescription')}</p>
                {hasFilters && (
                  <button
                    onClick={handleClearFilters}
                    className="text-v2-primary font-semibold hover:underline"
                  >
                    {t('home.clearFilters')}
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Pagination */}
        {!isLoading && !isMock && totalPages > 1 && (
          <section className="px-4 pb-8">
            <div className="max-w-6xl mx-auto flex items-center justify-center gap-2">
              <button
                onClick={() => {
                  setPage((p) => Math.max(1, p - 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={page <= 1}
                className="flex items-center gap-1 px-4 py-2.5 rounded-full bg-white shadow-bubble-xs text-sm font-medium text-v2-text-soft hover:text-v2-text hover:shadow-bubble-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-bubble-xs"
              >
                <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
                {t('home.prev')}
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setPage(p);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-10 h-10 rounded-full text-sm font-semibold transition-all ${
                      p === page
                        ? 'bg-v2-primary text-white shadow-bubble-sm'
                        : 'bg-white text-v2-text-soft hover:text-v2-text shadow-bubble-xs hover:shadow-bubble-sm'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  setPage((p) => Math.min(totalPages, p + 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={page >= totalPages}
                className="flex items-center gap-1 px-4 py-2.5 rounded-full bg-white shadow-bubble-xs text-sm font-medium text-v2-text-soft hover:text-v2-text hover:shadow-bubble-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-bubble-xs"
              >
                {t('home.next')}
                <ChevronRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>
          </section>
        )}

        {/* How It Works */}
        <HowItWorks />

        {/* Popular Routes (pill buttons) */}
        <PopularRoutes onRouteSelect={handleRouteSelect} />

        {/* CTA Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center v2-gradient-primary rounded-[28px] py-16 px-8 shadow-bubble-lg relative overflow-hidden">
            <div className="absolute top-4 left-8 w-24 h-24 rounded-full bg-white/10" />
            <div className="absolute bottom-6 right-12 w-16 h-16 rounded-full bg-white/10" />

            <h2 className="text-3xl font-bold text-white mb-4 relative">{t('wp.ctaTitle')}</h2>
            <p className="text-white/80 mb-8 relative">{t('wp.ctaDesc')}</p>
            <Link
              href="/listing/create"
              className="inline-block bg-white text-v2-primary px-8 py-3 rounded-full font-semibold hover:shadow-bubble-md transition-all relative"
            >
              {t('wp.ctaButton')}
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
