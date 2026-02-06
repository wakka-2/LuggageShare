'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MOCK_USER_LISTINGS } from '@/lib/data/mockUser';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Edit2, Eye, MessageSquare, MoreVertical, Trash2, ToggleLeft, ToggleRight, Plus } from 'lucide-react';

type FilterType = 'all' | 'active' | 'inactive' | 'completed' | 'cancelled';

export default function MyListingsPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [showMenu, setShowMenu] = useState<string | null>(null);

  const filteredListings = MOCK_USER_LISTINGS.filter(listing => {
    if (filter === 'all') return true;
    return listing.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'inactive': return 'bg-gray-100 text-gray-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'inactive': return 'غير نشط';
      case 'completed': return 'مكتمل';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleEdit = (id: string) => {
    alert(`تعديل الإعلان ${id}`);
    setShowMenu(null);
  };

  const handleToggleStatus = (id: string) => {
    alert(`تغيير حالة الإعلان ${id}`);
    setShowMenu(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الإعلان؟')) {
      alert(`تم حذف الإعلان ${id}`);
      setShowMenu(null);
    }
  };

  const getFilterCount = (filterType: FilterType) => {
    if (filterType === 'all') return MOCK_USER_LISTINGS.length;
    return MOCK_USER_LISTINGS.filter(l => l.status === filterType).length;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة إلى الملف الشخصي</span>
            </Link>
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">إعلاناتي</h1>
              <Link
                href="/create-listing"
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>إنشاء إعلان</span>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-gray-900">{getFilterCount('all')}</div>
              <div className="text-sm text-gray-600">إجمالي الإعلانات</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-green-600">{getFilterCount('active')}</div>
              <div className="text-sm text-gray-600">نشط</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-gray-600">{getFilterCount('inactive')}</div>
              <div className="text-sm text-gray-600">غير نشط</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-blue-600">{getFilterCount('completed')}</div>
              <div className="text-sm text-gray-600">مكتمل</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-red-600">{getFilterCount('cancelled')}</div>
              <div className="text-sm text-gray-600">ملغي</div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex items-center gap-2 overflow-x-auto">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  filter === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                الكل ({getFilterCount('all')})
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  filter === 'active'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                نشط ({getFilterCount('active')})
              </button>
              <button
                onClick={() => setFilter('inactive')}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  filter === 'inactive'
                    ? 'bg-gray-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                غير نشط ({getFilterCount('inactive')})
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  filter === 'completed'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                مكتمل ({getFilterCount('completed')})
              </button>
              <button
                onClick={() => setFilter('cancelled')}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  filter === 'cancelled'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ملغي ({getFilterCount('cancelled')})
              </button>
            </div>
          </div>

          {/* Listings */}
          {filteredListings.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                لا توجد إعلانات {filter !== 'all' && `(${getStatusText(filter)})`}
              </h3>
              <p className="text-gray-600 mb-6">
                {filter === 'all'
                  ? 'لم تقم بإنشاء أي إعلانات بعد'
                  : `لا توجد إعلانات ${getStatusText(filter)}`}
              </p>
              <Link
                href="/create-listing"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>إنشاء إعلان جديد</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredListings.map((listing) => (
                <div
                  key={listing.id}
                  className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Title and Status */}
                      <div className="flex items-start gap-3 mb-3">
                        <span className="text-2xl flex-shrink-0">
                          {listing.type === 'offer' ? '✈️' : '📦'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {listing.titleAr}
                          </h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(listing.status)}`}>
                              {getStatusText(listing.status)}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              listing.type === 'offer'
                                ? 'bg-primary-100 text-primary-700'
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {listing.type === 'offer' ? 'عرض' : 'طلب'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Route and Date */}
                      <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{listing.route.from}</span>
                          <span className="text-gray-400">←</span>
                          <span className="font-medium text-gray-900">{listing.route.to}</span>
                        </div>
                        <span className="text-gray-400">•</span>
                        <span>{formatDate(listing.travelDate)}</span>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Eye className="w-4 h-4" />
                          <span>{listing.views} مشاهدة</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MessageSquare className="w-4 h-4" />
                          <span>{listing.bookings} حجز</span>
                        </div>
                        <div className="flex items-center gap-2 text-primary-600 font-semibold">
                          <span>{listing.price} ر.س</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="relative">
                      <button
                        onClick={() => setShowMenu(showMenu === listing.id ? null : listing.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                      </button>

                      {showMenu === listing.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setShowMenu(null)}
                          />
                          <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                            <button
                              onClick={() => handleEdit(listing.id)}
                              className="w-full px-4 py-2 text-right hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                            >
                              <Edit2 className="w-4 h-4" />
                              <span>تعديل</span>
                            </button>
                            <button
                              onClick={() => handleToggleStatus(listing.id)}
                              className="w-full px-4 py-2 text-right hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                            >
                              {listing.status === 'active' ? (
                                <>
                                  <ToggleLeft className="w-4 h-4" />
                                  <span>إلغاء التفعيل</span>
                                </>
                              ) : (
                                <>
                                  <ToggleRight className="w-4 h-4" />
                                  <span>تفعيل</span>
                                </>
                              )}
                            </button>
                            <hr className="my-2 border-gray-200" />
                            <button
                              onClick={() => handleDelete(listing.id)}
                              className="w-full px-4 py-2 text-right hover:bg-red-50 flex items-center gap-3 text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>حذف</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
