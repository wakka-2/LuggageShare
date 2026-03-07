'use client';

import { useState, useMemo } from 'react';
import { Plane, Package, SearchX } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useBookings, getMockBookings } from '@/hooks/useBookings';
import type { ApiBooking } from '@/hooks/useBookings';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import BookingCard from '@/components/bookings/BookingCard';

type TabKey = 'all' | 'active' | 'completed' | 'cancelled';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'الكل' },
  { key: 'active', label: 'نشطة' },
  { key: 'completed', label: 'مكتملة' },
  { key: 'cancelled', label: 'ملغاة' },
];

const ACTIVE_STATUSES = ['pending', 'accepted', 'picked_up', 'in_transit'];
const COMPLETED_STATUSES = ['delivered'];
const CANCELLED_STATUSES = ['cancelled', 'rejected'];

function filterBookings(bookings: ApiBooking[], tab: TabKey): ApiBooking[] {
  switch (tab) {
    case 'active':
      return bookings.filter((b) => ACTIVE_STATUSES.includes(b.status));
    case 'completed':
      return bookings.filter((b) => COMPLETED_STATUSES.includes(b.status));
    case 'cancelled':
      return bookings.filter((b) => CANCELLED_STATUSES.includes(b.status));
    default:
      return bookings;
  }
}

function BookingCardSkeleton() {
  return (
    <div className="bg-white rounded-[22px] p-5 shadow-bubble-sm animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-6 w-24 bg-v2-primary/10 rounded-full" />
        <div className="h-4 w-16 bg-v2-primary/5 rounded-full" />
      </div>
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 w-12 bg-v2-primary/10 rounded" />
        <div className="flex-1 mx-4 h-0.5 bg-v2-primary/10 rounded" />
        <div className="h-6 w-12 bg-v2-primary/10 rounded" />
      </div>
      <div className="border-t border-v2-primary/10 pt-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-v2-primary/10" />
        <div className="h-4 w-24 bg-v2-primary/10 rounded-full" />
      </div>
    </div>
  );
}

export default function TripsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const { user } = useAuth();
  const { data: apiBookings, isLoading, isError } = useBookings();

  const bookings = useMemo(() => {
    if (apiBookings && apiBookings.length > 0) return apiBookings;
    if (isError || (!isLoading && (!apiBookings || apiBookings.length === 0))) {
      return getMockBookings(user?.id ?? 'demo-user');
    }
    return [];
  }, [apiBookings, isLoading, isError, user?.id]);

  const filteredBookings = useMemo(
    () => filterBookings(bookings, activeTab),
    [bookings, activeTab]
  );

  function getUserRole(booking: ApiBooking): 'carrier' | 'sender' {
    if (booking.carrier?.id === user?.id) return 'carrier';
    return 'sender';
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col blob-background">
        <Header />

        <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
          {/* Page title */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-full v2-gradient-primary flex items-center justify-center shadow-bubble-xs">
              <Plane className="w-5 h-5 text-white -rotate-90 rtl:rotate-90" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-v2-text">رحلاتي</h1>
              <p className="text-sm text-v2-text-soft">تتبع حجوزاتك ورحلاتك</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.key
                    ? 'v2-gradient-primary text-white shadow-bubble-xs'
                    : 'bg-white text-v2-text-soft hover:text-v2-text shadow-bubble-xs hover:shadow-bubble-sm'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <BookingCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredBookings.length > 0 ? (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} userRole={getUserRole(booking)} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-v2-primary/10 flex items-center justify-center mx-auto mb-4">
                {activeTab === 'all' ? (
                  <Package className="w-8 h-8 text-v2-primary" />
                ) : (
                  <SearchX className="w-8 h-8 text-v2-primary" />
                )}
              </div>
              <h3 className="text-lg font-bold text-v2-text mb-2">
                {activeTab === 'all'
                  ? 'لا توجد حجوزات'
                  : activeTab === 'active'
                    ? 'لا توجد حجوزات نشطة'
                    : activeTab === 'completed'
                      ? 'لا توجد حجوزات مكتملة'
                      : 'لا توجد حجوزات ملغاة'}
              </h3>
              <p className="text-v2-text-soft">
                {activeTab === 'all'
                  ? 'ابدأ بالبحث عن رحلة أو أضف رحلتك لكسب المال'
                  : 'لا توجد نتائج في هذه الفئة'}
              </p>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
