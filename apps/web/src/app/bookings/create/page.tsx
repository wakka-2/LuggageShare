'use client';

import { use, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MOCK_LISTINGS } from '@/lib/data/mockListings';
import { ITEM_CATEGORIES } from '@/lib/types/listing';
import Link from 'next/link';
import type { PackageSize, HandoffType } from '@/lib/types/booking';

function CreateBookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listingId = searchParams.get('listing');

  const listing = MOCK_LISTINGS.find((l) => l.id === listingId);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    packageSize: 'small' as PackageSize,
    itemCategory: '',
    itemDescription: '',
    itemDescriptionAr: '',
    itemWeight: '',
    handoffType: '' as HandoffType | '',
    handoffLocation: '',
    handoffDate: '',
    handoffNotes: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
  });

  if (!listing) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">الإعلان غير موجود</h1>
            <Link href="/listings" className="text-primary-600 hover:text-primary-700">
              العودة للإعلانات
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const selectedCategory = ITEM_CATEGORIES.allowed.find((c) => c.key === formData.itemCategory);
  const selectedHandoff = listing.handoffOptions.find((h) => h.type === formData.handoffType);

  const price = listing.pricing[formData.packageSize];

  const handleSubmit = () => {
    // Generate booking ID
    const bookingId = 'b' + Math.random().toString(36).substr(2, 9);

    // In real app, would make API call here
    console.log('Creating booking:', { listingId, ...formData });

    // Redirect to confirmation
    router.push(`/bookings/confirmation?id=${bookingId}`);
  };

  const isStep1Valid = formData.packageSize && formData.itemCategory && formData.itemDescription && formData.itemWeight;
  const isStep2Valid = formData.handoffType;
  const isStep3Valid = formData.contactName && formData.contactPhone;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        {/* Back Button */}
        <Link
          href={`/listings/${listingId}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <span>←</span>
          <span>العودة للإعلان</span>
        </Link>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    s === step
                      ? 'bg-primary-600 text-white'
                      : s < step
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {s < step ? '✓' : s}
                </div>
                {s < 3 && <div className={`flex-1 h-1 mx-2 ${s < step ? 'bg-green-600' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
          <div className="flex items-center mt-2">
            <div className="flex-1 text-center text-sm font-medium text-gray-700">تفاصيل الطرد</div>
            <div className="flex-1 text-center text-sm font-medium text-gray-700">التسليم</div>
            <div className="flex-1 text-center text-sm font-medium text-gray-700">معلومات التواصل</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          {/* Listing Summary */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-2">{listing.titleAr}</h2>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>
                {listing.from.code} → {listing.to.code}
              </span>
              <span>•</span>
              <span>📅 {new Date(listing.travelDate).toLocaleDateString('ar-SA')}</span>
            </div>
          </div>

          {/* Step 1: Package Details */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900">تفاصيل الطرد</h3>

              {/* Package Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">حجم الطرد</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['small', 'medium', 'large'] as PackageSize[]).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setFormData({ ...formData, packageSize: size })}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        formData.packageSize === size
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">
                        {size === 'small' ? '📦' : size === 'medium' ? '📦📦' : '📦📦📦'}
                      </div>
                      <div className="font-medium text-gray-900">
                        {size === 'small' ? 'صغير' : size === 'medium' ? 'متوسط' : 'كبير'}
                      </div>
                      <div className="text-primary-600 font-bold mt-1">{listing.pricing[size]} ر.س</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Item Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">نوع المحتوى</label>
                <select
                  value={formData.itemCategory}
                  onChange={(e) => setFormData({ ...formData, itemCategory: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">اختر النوع</option>
                  {ITEM_CATEGORIES.allowed
                    .filter((cat) => listing.restrictions.allowed.includes(cat.key))
                    .map((cat) => (
                      <option key={cat.key} value={cat.key}>
                        {cat.labelAr}
                      </option>
                    ))}
                </select>
              </div>

              {/* Item Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">وصف المحتوى</label>
                <textarea
                  value={formData.itemDescription}
                  onChange={(e) => setFormData({ ...formData, itemDescription: e.target.value })}
                  rows={3}
                  placeholder="مثال: لابتوب ماك بوك برو وملحقاته"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Weight */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الوزن التقريبي (كجم)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.itemWeight}
                  onChange={(e) => setFormData({ ...formData, itemWeight: e.target.value })}
                  placeholder="مثال: 3.5"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!isStep1Valid}
                className="w-full bg-primary-600 text-white py-4 rounded-lg hover:bg-primary-700 transition-colors font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                التالي
              </button>
            </div>
          )}

          {/* Step 2: Handoff */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900">طريقة التسليم</h3>

              {/* Handoff Options */}
              <div className="space-y-3">
                {listing.handoffOptions.map((option) => (
                  <button
                    key={option.type}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, handoffType: option.type, handoffLocation: option.locationAr })
                    }
                    className={`w-full p-4 rounded-lg border-2 text-right transition-colors ${
                      formData.handoffType === option.type
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">
                        {option.type === 'home_pickup'
                          ? '🏠'
                          : option.type === 'mall_meetup'
                          ? '🏬'
                          : option.type === 'airport_dropoff'
                          ? '✈️'
                          : '📍'}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 mb-1">
                          {option.type === 'home_pickup'
                            ? 'استلام من المنزل'
                            : option.type === 'mall_meetup'
                            ? 'لقاء في المول'
                            : option.type === 'airport_dropoff'
                            ? 'تسليم في المطار'
                            : 'موقع مخصص'}
                        </div>
                        <div className="text-sm text-gray-600">{option.locationAr}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات إضافية (اختياري)</label>
                <textarea
                  value={formData.handoffNotes}
                  onChange={(e) => setFormData({ ...formData, handoffNotes: e.target.value })}
                  rows={2}
                  placeholder="مثال: سأكون عند المدخل الرئيسي"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 border border-gray-300 py-4 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  السابق
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!isStep2Valid}
                  className="flex-1 bg-primary-600 text-white py-4 rounded-lg hover:bg-primary-700 transition-colors font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  التالي
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Contact & Confirmation */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900">معلومات التواصل</h3>

              {/* Contact Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الكامل</label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  placeholder="مثال: محمد أحمد"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">رقم الجوال</label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  placeholder="مثال: +966501234567"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني (اختياري)</label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="example@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <h4 className="font-bold text-gray-900">ملخص الحجز</h4>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">المسار:</span>
                    <span className="font-medium text-gray-900">
                      {listing.from.code} → {listing.to.code}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">تاريخ السفر:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(listing.travelDate).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">حجم الطرد:</span>
                    <span className="font-medium text-gray-900">
                      {formData.packageSize === 'small'
                        ? 'صغير'
                        : formData.packageSize === 'medium'
                        ? 'متوسط'
                        : 'كبير'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">نوع المحتوى:</span>
                    <span className="font-medium text-gray-900">{selectedCategory?.labelAr}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">الوزن:</span>
                    <span className="font-medium text-gray-900">{formData.itemWeight} كجم</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">التسليم:</span>
                    <span className="font-medium text-gray-900">{selectedHandoff?.locationAr}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">الإجمالي:</span>
                    <span className="text-2xl font-bold text-primary-600">{price} ر.س</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 border border-gray-300 py-4 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  السابق
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!isStep3Valid}
                  className="flex-1 bg-green-600 text-white py-4 rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  تأكيد الحجز
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function CreateBookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <CreateBookingContent />
    </Suspense>
  );
}
