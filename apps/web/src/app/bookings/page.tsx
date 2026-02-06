'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MOCK_BOOKINGS } from '@/lib/data/mockBookings';
import Link from 'next/link';
import type { BookingStatus } from '@/lib/types/booking';

type FilterTab = 'all' | 'active' | 'past';

export default function BookingsPage() {
  const [filter, setFilter] = useState<FilterTab>('all');

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'in_transit':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'disputed':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: BookingStatus) => {
    switch (status) {
      case 'pending':
        return 'قيد المراجعة';
      case 'confirmed':
        return 'مؤكد';
      case 'in_transit':
        return 'قيد التوصيل';
      case 'delivered':
        return 'تم التوصيل';
      case 'cancelled':
        return 'ملغي';
      case 'disputed':
        return 'متنازع عليه';
      default:
        return status;
    }
  };

  const filteredBookings = MOCK_BOOKINGS.filter((booking) => {
    if (filter === 'all') return true;
    if (filter === 'active') {
      return ['pending', 'confirmed', 'in_transit'].includes(booking.status);
    }
    if (filter === 'past') {
      return ['delivered', 'cancelled', 'disputed'].includes(booking.status);
    }
    return true;
  });

  const activeCount = MOCK_BOOKINGS.filter((b) =>
    ['pending', 'confirmed', 'in_transit'].includes(b.status)
  ).length;
  const pastCount = MOCK_BOOKINGS.filter((b) =>
    ['delivered', 'cancelled', 'disputed'].includes(b.status)
  ).length;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">حجوزاتي</h1>
          <p className="text-gray-600">تتبع وإدارة جميع حجوزاتك</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 py-4 px-6 font-medium transition-colors ${
                filter === 'all'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              الكل ({MOCK_BOOKINGS.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`flex-1 py-4 px-6 font-medium transition-colors ${
                filter === 'active'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              النشطة ({activeCount})
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`flex-1 py-4 px-6 font-medium transition-colors ${
                filter === 'past'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              السابقة ({pastCount})
            </button>
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد حجوزات</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'active'
                ? 'ليس لديك حجوزات نشطة حالياً'
                : filter === 'past'
                ? 'ليس لديك حجوزات سابقة'
                : 'ابدأ بإنشاء حجزك الأول'}
            </p>
            <Link
              href="/listings"
              className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold"
            >
              تصفح الإعلانات
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <Link
                key={booking.id}
                href={`/bookings/${booking.id}`}
                className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{booking.listingTitleAr}</h3>
                        {booking.unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {booking.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>رقم الحجز: {booking.id}</span>
                        <span>•</span>
                        <span>{new Date(booking.createdAt).toLocaleDateString('ar-SA')}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                      {getStatusLabel(booking.status)}
                    </span>
                  </div>

                  {/* Route */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="text-center flex-1">
                        <div className="text-xl font-bold text-gray-900">{booking.from.code}</div>
                        <div className="text-sm text-gray-600">{booking.from.cityAr}</div>
                      </div>
                      <div className="px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-0.5 bg-gray-300"></div>
                          <div className="text-xl">✈️</div>
                          <div className="w-8 h-0.5 bg-gray-300"></div>
                        </div>
                      </div>
                      <div className="text-center flex-1">
                        <div className="text-xl font-bold text-gray-900">{booking.to.code}</div>
                        <div className="text-sm text-gray-600">{booking.to.cityAr}</div>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600 mb-1">الناقل</div>
                      <div className="font-medium text-gray-900">{booking.carrierNameAr}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 mb-1">الحجم</div>
                      <div className="font-medium text-gray-900">
                        {booking.packageSize === 'small'
                          ? 'صغير'
                          : booking.packageSize === 'medium'
                          ? 'متوسط'
                          : 'كبير'}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600 mb-1">نوع المحتوى</div>
                      <div className="font-medium text-gray-900">{booking.item.categoryAr}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 mb-1">السعر</div>
                      <div className="font-bold text-primary-600">
                        {booking.price} {booking.currency}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
