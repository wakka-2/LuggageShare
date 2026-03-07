'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import {
  Plane,
  Calendar,
  Weight,
  DollarSign,
  FileText,
  ArrowRight,
  Loader2,
  MapPin,
} from 'lucide-react';
import { useCreateListing } from '@/hooks/useListings';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

interface CreateListingForm {
  departureCity: string;
  arrivalCity: string;
  departureDate: string;
  flightNumber: string;
  availableWeight: number;
  price: number;
  notes: string;
}

export default function CreateListingPage() {
  const router = useRouter();
  const createListing = useCreateListing();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateListingForm>({
    defaultValues: {
      departureCity: '',
      arrivalCity: '',
      departureDate: '',
      flightNumber: '',
      availableWeight: 5,
      price: 50,
      notes: '',
    },
  });

  const onSubmit = async (data: CreateListingForm) => {
    setSubmitError(null);
    try {
      await createListing.mutateAsync({
        departureCity: data.departureCity,
        arrivalCity: data.arrivalCity,
        departureDate: new Date(data.departureDate).toISOString(),
        flightNumber: data.flightNumber || undefined,
        availableWeight: Number(data.availableWeight),
        price: Number(data.price),
        currency: 'SAR',
        notes: data.notes || undefined,
      });
      router.push('/');
    } catch {
      setSubmitError('حدث خطأ أثناء إنشاء الرحلة. حاول مرة أخرى.');
    }
  };

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

          <h1 className="text-2xl font-extrabold text-v2-text mb-2">أضف رحلتك</h1>
          <p className="text-v2-text-soft mb-6">شارك مساحة أمتعتك الفارغة واكسب دخلا إضافيا</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Section 1: Route */}
            <div className="bg-white rounded-[22px] p-6 shadow-bubble-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-full bg-v2-primary/10 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-v2-primary" />
                </div>
                <h2 className="font-bold text-v2-text">المسار</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="departureCity"
                    className="block text-sm font-semibold text-v2-text mb-1.5"
                  >
                    مدينة المغادرة
                  </label>
                  <input
                    id="departureCity"
                    type="text"
                    className="w-full px-4 py-3 rounded-full bg-v2-bg border-0 text-v2-text placeholder:text-v2-text-muted focus:ring-2 focus:ring-v2-primary focus:outline-none transition-all"
                    placeholder="مثال: الرياض"
                    {...register('departureCity', { required: 'مدينة المغادرة مطلوبة' })}
                  />
                  {errors.departureCity && (
                    <p className="text-xs text-v2-secondary mt-1 mr-2">
                      {errors.departureCity.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="arrivalCity"
                    className="block text-sm font-semibold text-v2-text mb-1.5"
                  >
                    مدينة الوصول
                  </label>
                  <input
                    id="arrivalCity"
                    type="text"
                    className="w-full px-4 py-3 rounded-full bg-v2-bg border-0 text-v2-text placeholder:text-v2-text-muted focus:ring-2 focus:ring-v2-primary focus:outline-none transition-all"
                    placeholder="مثال: دبي"
                    {...register('arrivalCity', { required: 'مدينة الوصول مطلوبة' })}
                  />
                  {errors.arrivalCity && (
                    <p className="text-xs text-v2-secondary mt-1 mr-2">
                      {errors.arrivalCity.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Date */}
            <div className="bg-white rounded-[22px] p-6 shadow-bubble-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-full bg-v2-primary/10 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-v2-primary" />
                </div>
                <h2 className="font-bold text-v2-text">التاريخ</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="departureDate"
                    className="block text-sm font-semibold text-v2-text mb-1.5"
                  >
                    تاريخ المغادرة
                  </label>
                  <input
                    id="departureDate"
                    type="date"
                    className="w-full px-4 py-3 rounded-full bg-v2-bg border-0 text-v2-text placeholder:text-v2-text-muted focus:ring-2 focus:ring-v2-primary focus:outline-none transition-all"
                    {...register('departureDate', { required: 'تاريخ المغادرة مطلوب' })}
                  />
                  {errors.departureDate && (
                    <p className="text-xs text-v2-secondary mt-1 mr-2">
                      {errors.departureDate.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="flightNumber"
                    className="block text-sm font-semibold text-v2-text mb-1.5"
                  >
                    رقم الرحلة
                    <span className="text-v2-text-muted font-normal mr-1">(اختياري)</span>
                  </label>
                  <input
                    id="flightNumber"
                    type="text"
                    className="w-full px-4 py-3 rounded-full bg-v2-bg border-0 text-v2-text placeholder:text-v2-text-muted focus:ring-2 focus:ring-v2-primary focus:outline-none transition-all"
                    placeholder="مثال: SV123"
                    {...register('flightNumber')}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Capacity */}
            <div className="bg-white rounded-[22px] p-6 shadow-bubble-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-full bg-v2-primary/10 flex items-center justify-center">
                  <Weight className="w-4 h-4 text-v2-primary" />
                </div>
                <h2 className="font-bold text-v2-text">السعة</h2>
              </div>

              <div>
                <label
                  htmlFor="availableWeight"
                  className="block text-sm font-semibold text-v2-text mb-1.5"
                >
                  الوزن المتاح (كجم)
                </label>
                <input
                  id="availableWeight"
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="30"
                  className="w-full px-4 py-3 rounded-full bg-v2-bg border-0 text-v2-text placeholder:text-v2-text-muted focus:ring-2 focus:ring-v2-primary focus:outline-none transition-all"
                  placeholder="5"
                  {...register('availableWeight', {
                    required: 'الوزن المتاح مطلوب',
                    min: { value: 0.1, message: 'الحد الأدنى 0.1 كجم' },
                    max: { value: 30, message: 'الحد الأقصى 30 كجم' },
                    valueAsNumber: true,
                  })}
                />
                {errors.availableWeight && (
                  <p className="text-xs text-v2-secondary mt-1 mr-2">
                    {errors.availableWeight.message}
                  </p>
                )}
                <p className="text-xs text-v2-text-muted mt-1.5 mr-2">
                  الحد الأدنى 0.1 كجم - الحد الأقصى 30 كجم
                </p>
              </div>
            </div>

            {/* Section 4: Pricing */}
            <div className="bg-white rounded-[22px] p-6 shadow-bubble-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-full bg-v2-amber/15 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-v2-amber" />
                </div>
                <h2 className="font-bold text-v2-text">التسعير</h2>
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-semibold text-v2-text mb-1.5">
                  السعر لكل كيلو (ريال)
                </label>
                <div className="relative">
                  <input
                    id="price"
                    type="number"
                    min="1"
                    className="w-full px-4 py-3 rounded-full bg-v2-bg border-0 text-v2-text placeholder:text-v2-text-muted focus:ring-2 focus:ring-v2-primary focus:outline-none transition-all"
                    placeholder="50"
                    {...register('price', {
                      required: 'السعر مطلوب',
                      min: { value: 1, message: 'الحد الأدنى 1 ريال' },
                      valueAsNumber: true,
                    })}
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-v2-text-muted">
                    SAR
                  </span>
                </div>
                {errors.price && (
                  <p className="text-xs text-v2-secondary mt-1 mr-2">{errors.price.message}</p>
                )}
              </div>
            </div>

            {/* Section 5: Notes */}
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
                  placeholder="أي ملاحظات إضافية عن الرحلة أو نوع الشحنات المفضلة..."
                  {...register('notes')}
                />
              </div>
            </div>

            {/* Error */}
            {submitError && (
              <div className="bg-v2-secondary/10 rounded-[22px] p-4 text-center">
                <p className="text-sm text-v2-secondary font-medium">{submitError}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={createListing.isPending}
              className="w-full v2-gradient-primary text-white py-3.5 rounded-full font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-bubble-sm"
            >
              {createListing.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري الإنشاء...
                </>
              ) : (
                <>
                  <Plane className="w-5 h-5" />
                  نشر الرحلة
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
