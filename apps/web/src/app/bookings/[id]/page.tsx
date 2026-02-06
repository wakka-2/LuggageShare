'use client';

import { use, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MOCK_BOOKINGS } from '@/lib/data/mockBookings';
import Link from 'next/link';
import type { BookingStatus } from '@/lib/types/booking';

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const booking = MOCK_BOOKINGS.find((b) => b.id === id);

  const [messageInput, setMessageInput] = useState('');

  if (!booking) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">الحجز غير موجود</h1>
            <Link href="/bookings" className="text-primary-600 hover:text-primary-700">
              العودة للحجوزات
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    console.log('Sending message:', messageInput);
    setMessageInput('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {/* Back Button */}
        <Link href="/bookings" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <span>←</span>
          <span>العودة للحجوزات</span>
        </Link>

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{booking.listingTitleAr}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>رقم الحجز: {booking.id}</span>
                <span>•</span>
                <span>{new Date(booking.createdAt).toLocaleDateString('ar-SA')}</span>
              </div>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
              {getStatusLabel(booking.status)}
            </span>
          </div>

          {/* Status Timeline */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              {['pending', 'confirmed', 'in_transit', 'delivered'].map((status, index) => {
                const isActive = ['pending', 'confirmed', 'in_transit', 'delivered'].indexOf(booking.status) >= index;
                const isCurrent = booking.status === status;

                return (
                  <div key={status} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          isActive ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-400'
                        } ${isCurrent ? 'ring-4 ring-primary-100' : ''}`}
                      >
                        {status === 'pending' ? '📝' : status === 'confirmed' ? '✓' : status === 'in_transit' ? '✈️' : '📦'}
                      </div>
                      <div className={`text-xs mt-2 ${isActive ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                        {status === 'pending'
                          ? 'قيد المراجعة'
                          : status === 'confirmed'
                          ? 'مؤكد'
                          : status === 'in_transit'
                          ? 'قيد التوصيل'
                          : 'تم التوصيل'}
                      </div>
                    </div>
                    {index < 3 && (
                      <div className={`flex-1 h-1 ${isActive ? 'bg-primary-600' : 'bg-gray-200'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column: Details */}
          <div className="space-y-6">
            {/* Route */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">المسار</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="text-center flex-1">
                    <div className="text-2xl font-bold text-gray-900 mb-1">{booking.from.code}</div>
                    <div className="text-sm text-gray-600">{booking.from.cityAr}</div>
                    <div className="text-xs text-gray-500">{booking.from.countryAr}</div>
                  </div>
                  <div className="px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-0.5 bg-gray-300"></div>
                      <div className="text-2xl">✈️</div>
                      <div className="w-12 h-0.5 bg-gray-300"></div>
                    </div>
                  </div>
                  <div className="text-center flex-1">
                    <div className="text-2xl font-bold text-gray-900 mb-1">{booking.to.code}</div>
                    <div className="text-sm text-gray-600">{booking.to.cityAr}</div>
                    <div className="text-xs text-gray-500">{booking.to.countryAr}</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                  <div className="text-sm text-gray-600">تاريخ السفر</div>
                  <div className="font-medium text-gray-900">
                    {new Date(booking.travelDate).toLocaleDateString('ar-SA', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Package Details */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">تفاصيل الطرد</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">نوع المحتوى:</span>
                  <span className="font-medium text-gray-900">{booking.item.categoryAr}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الوصف:</span>
                  <span className="font-medium text-gray-900">{booking.item.descriptionAr}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الحجم:</span>
                  <span className="font-medium text-gray-900">
                    {booking.packageSize === 'small' ? 'صغير' : booking.packageSize === 'medium' ? 'متوسط' : 'كبير'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الوزن:</span>
                  <span className="font-medium text-gray-900">{booking.item.weight} كجم</span>
                </div>
              </div>
            </div>

            {/* Handoff Details */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">تفاصيل التسليم</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">
                    {booking.handoff.type === 'home_pickup'
                      ? '🏠'
                      : booking.handoff.type === 'mall_meetup'
                      ? '🏬'
                      : booking.handoff.type === 'airport_dropoff'
                      ? '✈️'
                      : '📍'}
                  </span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 mb-1">
                      {booking.handoff.type === 'home_pickup'
                        ? 'استلام من المنزل'
                        : booking.handoff.type === 'mall_meetup'
                        ? 'لقاء في المول'
                        : booking.handoff.type === 'airport_dropoff'
                        ? 'تسليم في المطار'
                        : 'موقع مخصص'}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">{booking.handoff.locationAr}</div>
                    {booking.handoff.date && (
                      <div className="text-sm text-gray-600">
                        📅 {new Date(booking.handoff.date).toLocaleString('ar-SA')}
                      </div>
                    )}
                    {booking.handoff.notesAr && (
                      <div className="text-sm text-gray-600 mt-2 bg-gray-50 rounded p-2">{booking.handoff.notesAr}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Carrier Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">معلومات الناقل</h2>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold">
                  {booking.carrierNameAr.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="text-lg font-semibold text-gray-900">{booking.carrierNameAr}</div>
                  {booking.carrierContact && (
                    <div className="text-sm text-gray-600 mt-1">📞 {booking.carrierContact.phone}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">التفاصيل المالية</h2>
              <div className="bg-primary-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">المبلغ الإجمالي:</span>
                  <span className="text-2xl font-bold text-primary-600">
                    {booking.price} {booking.currency}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Messages */}
          <div className="bg-white rounded-xl shadow-sm p-6 h-fit sticky top-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">الرسائل</h2>
              <Link
                href={`/messages/conv${booking.id.slice(1)}`}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                فتح المحادثة الكاملة →
              </Link>
            </div>

            {/* Messages List */}
            <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
              {booking.messages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">💬</div>
                  <p>لا توجد رسائل بعد</p>
                </div>
              ) : (
                booking.messages.map((message) => {
                  const isFromCurrentUser = message.senderId === 'current_user';
                  return (
                    <div key={message.id} className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          isFromCurrentUser ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        {!isFromCurrentUser && (
                          <div className="text-xs font-medium mb-1 opacity-75">{message.senderNameAr}</div>
                        )}
                        <div className="text-sm">{message.contentAr || message.content}</div>
                        <div className={`text-xs mt-1 ${isFromCurrentUser ? 'text-primary-100' : 'text-gray-500'}`}>
                          {new Date(message.timestamp).toLocaleTimeString('ar-SA', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Message Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="اكتب رسالتك..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                onClick={handleSendMessage}
                disabled={!messageInput.trim()}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                إرسال
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
