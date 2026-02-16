'use client';

import { useState, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SearchFilters } from '@/components/listings/SearchFilters';
import { TypeTabs } from '@/components/listings/TypeTabs';
import { ViewToggle } from '@/components/listings/ViewToggle';
import { ListingCard } from '@/components/listings/ListingCard';
import { useListings } from '@/hooks/useListings';
import { ListingType, ViewMode } from '@/lib/types/listing';

type TabValue = ListingType | 'all';

export default function ListingsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeTab, setActiveTab] = useState<TabValue>('all');
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');
  const [searchDate, setSearchDate] = useState('');

  // Fetch listings from API (falls back to mock data via placeholderData in hook)
  const { data: listings = [] } = useListings();

  // Filter listings client-side
  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      // Filter by type
      if (activeTab !== 'all' && listing.type !== activeTab) {
        return false;
      }
      // Filter by from
      if (searchFrom && !listing.from.code.toLowerCase().includes(searchFrom.toLowerCase()) &&
          !listing.from.cityAr.includes(searchFrom)) {
        return false;
      }
      // Filter by to
      if (searchTo && !listing.to.code.toLowerCase().includes(searchTo.toLowerCase()) &&
          !listing.to.cityAr.includes(searchTo)) {
        return false;
      }
      // Filter by date
      if (searchDate) {
        const listingDate = listing.travelDate.split('T')[0];
        if (listingDate !== searchDate) {
          return false;
        }
      }
      return true;
    });
  }, [listings, activeTab, searchFrom, searchTo, searchDate]);

  // Calculate counts for tabs
  const tabCounts = useMemo(() => ({
    all: listings.length,
    offer: listings.filter(l => l.type === 'offer').length,
    request: listings.filter(l => l.type === 'request').length,
  }), [listings]);

  const handleSwap = () => {
    const temp = searchFrom;
    setSearchFrom(searchTo);
    setSearchTo(temp);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">تصفح الإعلانات</h1>
          <p className="text-gray-600">اعثر على أفضل العروض والطلبات المتاحة</p>
        </div>

        {/* Search Filters */}
        <SearchFilters
          from={searchFrom}
          to={searchTo}
          date={searchDate}
          onFromChange={setSearchFrom}
          onToChange={setSearchTo}
          onDateChange={setSearchDate}
          onSwap={handleSwap}
        />

        {/* Controls Row: Tabs + View Toggle */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex-1 max-w-md">
            <TypeTabs
              value={activeTab}
              onChange={setActiveTab}
              counts={tabCounts}
            />
          </div>
          <ViewToggle value={viewMode} onChange={setViewMode} />
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            الإعلانات المتاحة
          </h2>
          <div className="text-gray-600">
            <span className="font-medium">{filteredListings.length}</span>
            {' '}إعلان
            {(searchFrom || searchTo || searchDate) && (
              <span className="text-primary-600"> • مفلتر</span>
            )}
          </div>
        </div>

        {/* Listings Grid/List */}
        {filteredListings.length > 0 ? (
          <div className={`
            ${viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'flex flex-col gap-3'
            }
          `}>
            {filteredListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                viewMode={viewMode}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              لا توجد نتائج
            </h3>
            <p className="text-gray-600 mb-6">
              جرب تغيير معايير البحث أو تصفح جميع الإعلانات
            </p>
            <button
              onClick={() => {
                setSearchFrom('');
                setSearchTo('');
                setSearchDate('');
                setActiveTab('all');
              }}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              مسح الفلاتر
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
