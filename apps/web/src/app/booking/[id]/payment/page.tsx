'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Upload, CreditCard, ArrowRight, CheckCircle } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ImageUpload from '@/components/common/ImageUpload';
import { useBooking, useSubmitPaymentProof } from '@/hooks/useBookings';

function PaymentSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="bg-white rounded-[22px] p-6 shadow-bubble-sm">
        <div className="h-6 w-40 bg-v2-primary/10 rounded-full mb-4" />
        <div className="h-4 w-full bg-v2-primary/10 rounded-full mb-2" />
        <div className="h-4 w-3/4 bg-v2-primary/10 rounded-full" />
      </div>
      <div className="bg-white rounded-[22px] p-6 shadow-bubble-sm">
        <div className="h-6 w-32 bg-v2-primary/10 rounded-full mb-4" />
        <div className="aspect-video bg-v2-primary/5 rounded-[22px]" />
      </div>
    </div>
  );
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'بانتظار القبول',
  accepted: 'مقبول',
  rejected: 'مرفوض',
  picked_up: 'تم الاستلام',
  in_transit: 'قيد التوصيل',
  delivered: 'تم التوصيل',
  cancelled: 'ملغي',
};

function PaymentPageContent() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === 'string' ? params.id : '';

  const { data: booking, isLoading } = useBooking(id || null);
  const submitProof = useSubmitPaymentProof();

  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    if (!uploadedUrl || !id) return;

    submitProof.mutate(
      { bookingId: id, proofImageUrl: uploadedUrl },
      {
        onSuccess: () => {
          setSubmitted(true);
        },
      }
    );
  }

  const departureCode =
    booking?.listing.departureCode ||
    booking?.listing.departureCity.slice(0, 3).toUpperCase() ||
    '';
  const arrivalCode =
    booking?.listing.arrivalCode || booking?.listing.arrivalCity.slice(0, 3).toUpperCase() || '';

  return (
    <div className="min-h-screen flex flex-col blob-background" dir="rtl">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        {/* Back link */}
        <Link
          href={`/booking/${id}`}
          className="inline-flex items-center gap-1.5 text-v2-text-soft hover:text-v2-text mb-6 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          العودة للحجز
        </Link>

        {/* Page title */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-v2-primary/10 flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-v2-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-v2-text">إثبات الدفع</h1>
            <p className="text-sm text-v2-text-soft">ارفع صورة إيصال التحويل البنكي</p>
          </div>
        </div>

        {isLoading ? (
          <PaymentSkeleton />
        ) : !booking ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-v2-primary/10 flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-v2-primary" />
            </div>
            <h2 className="text-lg font-bold text-v2-text mb-2">الحجز غير موجود</h2>
            <p className="text-v2-text-soft mb-4">لم نتمكن من العثور على هذا الحجز</p>
            <Link href="/" className="text-v2-primary font-semibold hover:underline">
              العودة للرئيسية
            </Link>
          </div>
        ) : submitted ? (
          /* Success state */
          <div className="bg-white rounded-[22px] p-8 shadow-bubble-md text-center">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-v2-text mb-2">تم إرسال إثبات الدفع</h2>
            <p className="text-v2-text-soft mb-6">سيتم مراجعة الإثبات وتأكيد الدفع قريبا</p>
            <Link
              href={`/booking/${id}`}
              className="inline-flex items-center justify-center gap-2 v2-gradient-primary text-white px-8 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
            >
              العودة لتفاصيل الحجز
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Booking summary card */}
            <div className="bg-white rounded-[22px] p-6 shadow-bubble-sm">
              <h2 className="font-semibold text-v2-text mb-4">ملخص الحجز</h2>

              {/* Route */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-lg font-bold text-v2-text">{departureCode}</span>
                <div className="flex-1 border-t-2 border-dashed border-v2-primary/20" />
                <span className="text-lg font-bold text-v2-text">{arrivalCode}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-v2-text-soft">
                  {booking.listing.departureCity} ← {booking.listing.arrivalCity}
                </span>
              </div>

              <div className="border-t border-v2-primary/10 mt-4 pt-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-v2-text-soft">المبلغ الإجمالي</p>
                  <p className="text-2xl font-extrabold text-v2-text">
                    {booking.totalPrice}{' '}
                    <span className="text-base font-normal text-v2-text-soft">ر.س</span>
                  </p>
                </div>
                <span className="bg-v2-bg px-3 py-1.5 rounded-full text-sm text-v2-text-soft">
                  {STATUS_LABELS[booking.status] || booking.status}
                </span>
              </div>
            </div>

            {/* Upload section */}
            <div className="bg-white rounded-[22px] p-6 shadow-bubble-sm">
              <h2 className="font-semibold text-v2-text mb-1">صورة إثبات الدفع</h2>
              <p className="text-sm text-v2-text-soft mb-4">
                ارفع صورة واضحة لإيصال التحويل البنكي
              </p>

              <ImageUpload
                onUpload={(url) => setUploadedUrl(url)}
                folder="payment-proofs"
                label="رفع إيصال الدفع"
              />
            </div>

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={!uploadedUrl || submitProof.isPending}
              className="w-full v2-gradient-primary text-white py-4 rounded-full font-semibold text-center hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitProof.isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  إرسال إثبات الدفع
                </>
              )}
            </button>

            {/* Error message */}
            {submitProof.isError && (
              <div className="bg-red-50 rounded-[22px] p-4 text-center">
                <p className="text-sm text-red-600">حدث خطأ أثناء إرسال الإثبات. حاول مرة أخرى.</p>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function PaymentProofPage() {
  return (
    <ProtectedRoute>
      <PaymentPageContent />
    </ProtectedRoute>
  );
}
