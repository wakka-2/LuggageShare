'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MOCK_USER } from '@/lib/data/mockUser';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Upload, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function EditProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nameAr: MOCK_USER.nameAr,
    nameEn: MOCK_USER.nameEn,
    email: MOCK_USER.email,
    phone: MOCK_USER.phone,
    bio: MOCK_USER.bio || '',
    city: MOCK_USER.city || '',
    languages: MOCK_USER.languages,
    bankDetails: {
      accountName: MOCK_USER.bankDetails?.accountName || '',
      iban: MOCK_USER.bankDetails?.iban || '',
      bankName: MOCK_USER.bankDetails?.bankName || '',
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name.startsWith('bank.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        bankDetails: {
          ...prev.bankDetails,
          [field]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nameAr.trim()) {
      newErrors.nameAr = 'الاسم بالعربية مطلوب';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'رقم الجوال مطلوب';
    } else if (!/^\+?[0-9]{10,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'رقم الجوال غير صحيح';
    }

    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'النبذة لا يمكن أن تتجاوز 500 حرف';
    }

    // Validate IBAN if provided
    if (formData.bankDetails.iban && !/^SA[0-9]{22}$/.test(formData.bankDetails.iban)) {
      newErrors['bank.iban'] = 'رقم الآيبان غير صحيح (يجب أن يبدأ بـ SA ويتكون من 24 رقم)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      alert('تم حفظ التغييرات بنجاح!');
      router.push('/profile');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة إلى الملف الشخصي</span>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">تعديل الملف الشخصي</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Photo */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">الصورة الشخصية</h2>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-3xl font-bold">
                  {formData.nameAr.charAt(0)}
                </div>
                <div>
                  <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>تحميل صورة</span>
                  </button>
                  <p className="text-sm text-gray-500 mt-2">PNG أو JPG (حد أقصى 2MB)</p>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">المعلومات الشخصية</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="nameAr" className="block text-sm font-medium text-gray-700 mb-1">
                    الاسم (بالعربية) *
                  </label>
                  <input
                    type="text"
                    id="nameAr"
                    name="nameAr"
                    value={formData.nameAr}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.nameAr ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.nameAr && (
                    <p className="text-sm text-red-500 mt-1">{errors.nameAr}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="nameEn" className="block text-sm font-medium text-gray-700 mb-1">
                    الاسم (بالإنجليزية)
                  </label>
                  <input
                    type="text"
                    id="nameEn"
                    name="nameEn"
                    value={formData.nameEn}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    البريد الإلكتروني *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    رقم الجوال *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    dir="ltr"
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    المدينة
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                    نبذة عنك
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none ${
                      errors.bio ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="أخبر الآخرين عنك وعن خبرتك في نقل الأمتعة..."
                  />
                  <div className="flex items-center justify-between mt-1">
                    {errors.bio && (
                      <p className="text-sm text-red-500">{errors.bio}</p>
                    )}
                    <p className="text-sm text-gray-500 mr-auto">
                      {formData.bio.length} / 500
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">معلومات البنك</h2>
              <p className="text-sm text-gray-600 mb-4">
                مطلوب لاستلام المدفوعات من خدمات النقل
              </p>
              <div className="space-y-4">
                <div>
                  <label htmlFor="bank.accountName" className="block text-sm font-medium text-gray-700 mb-1">
                    اسم صاحب الحساب
                  </label>
                  <input
                    type="text"
                    id="bank.accountName"
                    name="bank.accountName"
                    value={formData.bankDetails.accountName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="bank.iban" className="block text-sm font-medium text-gray-700 mb-1">
                    رقم الآيبان (IBAN)
                  </label>
                  <input
                    type="text"
                    id="bank.iban"
                    name="bank.iban"
                    value={formData.bankDetails.iban}
                    onChange={handleChange}
                    placeholder="SA0000000000000000000000"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors['bank.iban'] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    dir="ltr"
                  />
                  {errors['bank.iban'] && (
                    <p className="text-sm text-red-500 mt-1">{errors['bank.iban']}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="bank.bankName" className="block text-sm font-medium text-gray-700 mb-1">
                    اسم البنك
                  </label>
                  <select
                    id="bank.bankName"
                    name="bank.bankName"
                    value={formData.bankDetails.bankName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">اختر البنك</option>
                    <option value="الراجحي">الراجحي</option>
                    <option value="الأهلي">الأهلي</option>
                    <option value="الفرنسي">الفرنسي</option>
                    <option value="الرياض">الرياض</option>
                    <option value="البلاد">البلاد</option>
                    <option value="الإنماء">الإنماء</option>
                    <option value="سامبا">سامبا</option>
                    <option value="الجزيرة">الجزيرة</option>
                    <option value="الاستثمار">الاستثمار</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-between gap-4">
              <Link
                href="/profile"
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{isLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}</span>
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
