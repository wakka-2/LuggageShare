'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('id');

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-16">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">✓</span>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">تم إنشاء الحجز بنجاح!</h1>
          <p className="text-gray-600 mb-8">تم إرسال طلب الحجز للناقل وسيتم إشعارك عند تأكيده</p>

          {/* Booking ID */}
          <div className="bg-gray-50 rounded-lg p-4 mb-8">
            <div className="text-sm text-gray-600 mb-1">رقم الحجز</div>
            <div className="text-2xl font-bold text-gray-900 font-mono">{bookingId}</div>
          </div>

          {/* What's Next */}
          <div className="bg-primary-50 rounded-lg p-6 mb-8 text-right">
            <h3 className="font-bold text-gray-900 mb-4">الخطوات التالية:</h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-0.5">1.</span>
                <span>سيستلم الناقل طلبك ويقوم بمراجعته</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-0.5">2.</span>
                <span>سيتم إشعارك عبر الرسائل عند تأكيد الحجز</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-0.5">3.</span>
                <span>يمكنك التواصل مع الناقل من خلال صفحة الحجز</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-0.5">4.</span>
                <span>قم بتسليم الطرد في الموعد والمكان المتفق عليه</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/bookings/${bookingId}`}
              className="flex-1 bg-primary-600 text-white py-4 rounded-lg hover:bg-primary-700 transition-colors font-semibold"
            >
              عرض تفاصيل الحجز
            </Link>
            <Link
              href="/bookings"
              className="flex-1 border border-gray-300 py-4 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
            >
              حجوزاتي
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function BookingConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
