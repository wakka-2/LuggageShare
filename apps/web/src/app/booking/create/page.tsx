'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import {
  Package,
  ArrowRight,
  Plane,
  Calendar,
  Weight,
  DollarSign,
  FileText,
  Send,
  Loader2,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ImageUpload from '@/components/common/ImageUpload';
import { useCreateBooking } from '@/hooks/useBookings';
import { useListing } from '@/hooks/useListings';
import Link from 'next/link';

interface BookingForm {
  weight: number;
  itemName: string;
  itemDescription: string;
  notes: string;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-SA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function ListingSummarySkeleton() {
  return (
    <div className="bg-white rounded-[22px] p-6 shadow-bubble-md animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="text-center space-y-2">
          <div className="h-8 w-14 bg-v2-primary/10 rounded mx-auto" />
          <div className="h-4 w-20 bg-v2-primary/10 rounded mx-auto" />
        </div>
        <div className="flex-1 mx-6 h-1 bg-v2-primary/10 rounded" />
        <div className="text-center space-y-2">
          <div className="h-8 w-14 bg-v2-primary/10 rounded mx-auto" />
          <div className="h-4 w-20 bg-v2-primary/10 rounded mx-auto" />
        </div>
      </div>
      <div className="border-t border-v2-primary/10 pt-4 flex gap-3">
        <div className="h-8 w-32 bg-v2-primary/10 rounded-full" />
        <div className="h-8 w-24 bg-v2-primary/10 rounded-full" />
        <div className="h-8 w-28 bg-v2-primary/10 rounded-full" />
      </div>
    </div>
  );
}

export default function CreateBookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listingId = searchParams.get('listingId');

  const { data: listing, isLoading: listingLoading } = useListing(listingId);
  const createBooking = useCreateBooking();

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BookingForm>({
    defaultValues: {
      weight: 1,
      itemName: '',
      itemDescription: '',
      notes: '',
    },
  });

  const watchedWeight = watch('weight');

  const totalPrice = useMemo(() => {
    if (!listing || !watchedWeight) return 0;
    const w = Number(watchedWeight) || 0;
    return Math.round(w * listing.price * 100) / 100;
  }, [listing, watchedWeight]);

  const fromCode = listing
    ? listing.departureCode || listing.departureCity.slice(0, 3).toUpperCase()
    : '';
  const toCode = listing
    ? listing.arrivalCode || listing.arrivalCity.slice(0, 3).toUpperCase()
    : '';

  const onSubmit = async (data: BookingForm) => {
    if (!listingId) return;
    setSubmitError(null);

    try {
      const result = await createBooking.mutateAsync({
        listingId,
        totalWeight: Number(data.weight),
        items: [
          {
            name: data.itemName,
            description: data.itemDescription || undefined,
            weight: Number(data.weight),
            value: 0,
            imageUrls: photoUrl ? [photoUrl] : undefined,
          },
        ],
      });

      const bookingId = result?.data?.id || result?.id || result;
      if (bookingId) {
        router.push(`/booking/${bookingId}`);
      } else {
        router.push('/trips');
      }
    } catch {
      setSubmitError('حدث خطأ أثناء إنشاء الحجز. حاول مرة أخرى.');
    }
  };

  // No listing ID provided
  if (!listingId) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex flex-col blob-background">
          <Header />
          <main className="flex-1 flex items-center justify-center px-4">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-v2-primary/10 flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-v2-primary" />
              </div>
              <h2 className="text-lg font-bold text-v2-text mb-2">لم يتم تحديد رحلة</h2>
              <p className="text-v2-text-soft mb-6">يرجى اختيار رحلة من القائمة أولا</p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 v2-gradient-primary text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
              >
                تصفح الرحلات
              </Link>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col blob-background">
        <Header />

        <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
          {/* Back */}
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-v2-text-soft hover:text-v2-text mb-6 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            العودة
          </button>

          <h1 className="text-2xl font-extrabold text-v2-text mb-2">إنشاء حجز</h1>
          <p className="text-v2-text-soft mb-6">أرسل أغراضك مع هذه الرحلة</p>

          {/* Listing Summary Card */}
          {listingLoading ? (
            <div className="mb-6">
              <ListingSummarySkeleton />
            </div>
          ) : listing ? (
            <div className="bg-white rounded-[22px] p-6 shadow-bubble-md mb-6">
              {/* Route */}
              <div className="flex items-center justify-between mb-2">
                <div className="text-center">
                  <p className="text-2xl font-extrabold text-v2-text">{fromCode}</p>
                  <p className="text-sm text-v2-text-soft mt-1">{listing.departureCity}</p>
                </div>

                <div className="flex-1 flex items-center justify-center px-4">
                  <div className="w-3 h-3 rounded-full bg-v2-mint flex-shrink-0" />
                  <div className="flex-1 border-t-2 border-dashed border-v2-primary/20 mx-2" />
                  <Plane className="w-5 h-5 text-v2-primary -rotate-90 rtl:rotate-90 flex-shrink-0" />
                  <div className="flex-1 border-t-2 border-dashed border-v2-primary/20 mx-2" />
                  <div className="w-3 h-3 rounded-full bg-v2-secondary flex-shrink-0" />
                </div>

                <div className="text-center">
                  <p className="text-2xl font-extrabold text-v2-text">{toCode}</p>
                  <p className="text-sm text-v2-text-soft mt-1">{listing.arrivalCity}</p>
                </div>
              </div>

              {/* Listing details pills */}
              <div className="border-t border-v2-primary/10 mt-4 pt-4 flex flex-wrap gap-2">
                <span className="bg-v2-bg px-3 py-1.5 rounded-full text-sm text-v2-text-soft flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(listing.departureDate)}
                </span>
                <span className="bg-v2-bg px-3 py-1.5 rounded-full text-sm text-v2-text-soft flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" />
                  {listing.price} ر.س/كجم
                </span>
                <span className="bg-v2-bg px-3 py-1.5 rounded-full text-sm text-v2-text-soft flex items-center gap-1.5">
                  <Weight className="w-3.5 h-3.5" />
                  {listing.availableWeight} كجم متاح
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-v2-secondary/10 rounded-[22px] p-4 text-center mb-6">
              <p className="text-sm text-v2-secondary font-medium">
                لم نتمكن من تحميل تفاصيل الرحلة
              </p>
            </div>
          )}

          {/* Booking Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Section 1: Item Details */}
            <div className="bg-white rounded-[22px] p-6 shadow-bubble-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-full bg-v2-primary/10 flex items-center justify-center">
                  <Package className="w-4 h-4 text-v2-primary" />
                </div>
                <h2 className="font-bold text-v2-text">تفاصيل الشحنة</h2>
              </div>

              <div className="space-y-4">
                {/* Item Name */}
                <div>
                  <label
                    htmlFor="itemName"
                    className="block text-sm font-semibold text-v2-text mb-1.5"
                  >
                    اسم الشحنة
                  </label>
                  <input
                    id="itemName"
                    type="text"
                    className="w-full px-4 py-3 rounded-full bg-v2-bg border-0 text-v2-text placeholder:text-v2-text-muted focus:ring-2 focus:ring-v2-primary focus:outline-none transition-all"
                    placeholder="مثال: جهاز آيفون، ملابس، وثائق"
                    {...register('itemName', { required: 'اسم الشحنة مطلوب' })}
                  />
                  {errors.itemName && (
                    <p className="text-xs text-v2-secondary mt-1 mr-2">{errors.itemName.message}</p>
                  )}
                </div>

                {/* Item Description */}
                <div>
                  <label
                    htmlFor="itemDescription"
                    className="block text-sm font-semibold text-v2-text mb-1.5"
                  >
                    وصف الشحنة
                  </label>
                  <textarea
                    id="itemDescription"
                    rows={3}
                    className="w-full px-4 py-3 rounded-[16px] bg-v2-bg border-0 text-v2-text placeholder:text-v2-text-muted focus:ring-2 focus:ring-v2-primary focus:outline-none transition-all resize-none"
                    placeholder="صف محتويات الشحنة بالتفصيل..."
                    {...register('itemDescription', { required: 'وصف الشحنة مطلوب' })}
                  />
                  {errors.itemDescription && (
                    <p className="text-xs text-v2-secondary mt-1 mr-2">
                      {errors.itemDescription.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Weight */}
            <div className="bg-white rounded-[22px] p-6 shadow-bubble-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-full bg-v2-primary/10 flex items-center justify-center">
                  <Weight className="w-4 h-4 text-v2-primary" />
                </div>
                <h2 className="font-bold text-v2-text">الوزن</h2>
              </div>

              <div>
                <label htmlFor="weight" className="block text-sm font-semibold text-v2-text mb-1.5">
                  وزن الشحنة (كجم)
                </label>
                <input
                  id="weight"
                  type="number"
                  step="0.1"
                  min="0.5"
                  max={listing?.availableWeight || 30}
                  className="w-full px-4 py-3 rounded-full bg-v2-bg border-0 text-v2-text placeholder:text-v2-text-muted focus:ring-2 focus:ring-v2-primary focus:outline-none transition-all"
                  placeholder="1"
                  {...register('weight', {
                    required: 'الوزن مطلوب',
                    min: { value: 0.5, message: 'الحد الأدنى 0.5 كجم' },
                    max: {
                      value: listing?.availableWeight || 30,
                      message: `الحد الأقصى ${listing?.availableWeight || 30} كجم`,
                    },
                    valueAsNumber: true,
                  })}
                />
                {errors.weight && (
                  <p className="text-xs text-v2-secondary mt-1 mr-2">{errors.weight.message}</p>
                )}
                <p className="text-xs text-v2-text-muted mt-1.5 mr-2">
                  الحد الأدنى 0.5 كجم — الحد الأقصى {listing?.availableWeight || 30} كجم
                </p>
              </div>
            </div>

            {/* Section 3: Notes */}
            <div className="bg-white rounded-[22px] p-6 shadow-bubble-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-full bg-v2-primary/10 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-v2-primary" />
                </div>
                <h2 className="font-bold text-v2-text">ملاحظات</h2>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-semibold text-v2-text mb-1.5">
                  ملاحظات إضافية
                  <span className="text-v2-text-muted font-normal mr-1">(اختياري)</span>
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  className="w-full px-4 py-3 rounded-[16px] bg-v2-bg border-0 text-v2-text placeholder:text-v2-text-muted focus:ring-2 focus:ring-v2-primary focus:outline-none transition-all resize-none"
                  placeholder="أي تعليمات خاصة بالتوصيل أو التعامل مع الشحنة..."
                  {...register('notes')}
                />
              </div>
            </div>

            {/* Section 4: Photo */}
            <div className="bg-white rounded-[22px] p-6 shadow-bubble-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-full bg-v2-primary/10 flex items-center justify-center">
                  <Package className="w-4 h-4 text-v2-primary" />
                </div>
                <h2 className="font-bold text-v2-text">صورة الشحنة</h2>
                <span className="text-sm text-v2-text-muted">(اختياري)</span>
              </div>

              <ImageUpload
                onUpload={(url) => setPhotoUrl(url)}
                folder="bookings"
                label="أضف صورة للشحنة"
              />
            </div>

            {/* Price Summary */}
            {listing && (
              <div className="bg-white rounded-[22px] p-6 shadow-bubble-md">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-9 h-9 rounded-full bg-v2-amber/15 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-v2-amber" />
                  </div>
                  <h2 className="font-bold text-v2-text">ملخص التكلفة</h2>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-v2-text-soft">السعر لكل كيلو</span>
                    <span className="text-v2-text font-medium">{listing.price} ر.س</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-v2-text-soft">الوزن</span>
                    <span className="text-v2-text font-medium">
                      {Number(watchedWeight) || 0} كجم
                    </span>
                  </div>
                  <div className="border-t border-v2-primary/10 pt-3 flex items-center justify-between">
                    <span className="font-bold text-v2-text">الإجمالي</span>
                    <span className="text-xl font-extrabold text-v2-primary">{totalPrice} ر.س</span>
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {submitError && (
              <div className="bg-v2-secondary/10 rounded-[22px] p-4 text-center">
                <p className="text-sm text-v2-secondary font-medium">{submitError}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={createBooking.isPending || listingLoading}
              className="w-full v2-gradient-primary text-white py-3.5 rounded-full font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-bubble-sm"
            >
              {createBooking.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري إنشاء الحجز...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  إرسال طلب الحجز
                </>
              )}
            </button>
          </form>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
