'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MOCK_USER } from '@/lib/data/mockUser';
import Link from 'next/link';
import { Edit2, MapPin, Calendar, Star, Shield, MessageSquare, Award, Globe } from 'lucide-react';

export default function ProfilePage() {
  const user = MOCK_USER;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-3xl font-bold">
                  {user.nameAr.charAt(0)}
                </div>

                {/* User Info */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900">{user.nameAr}</h1>
                    {user.isVerified && (
                      <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1 text-sm">
                        <Shield className="w-4 h-4" />
                        <span>موثق</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{user.city}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>عضو منذ {formatDate(user.memberSince)}</span>
                    </div>
                  </div>

                  {/* Languages */}
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <div className="flex gap-2">
                      {user.languages.map((lang) => (
                        <span
                          key={lang}
                          className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              <Link
                href="/profile/edit"
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                <span>تعديل الملف</span>
              </Link>
            </div>

            {/* Bio */}
            {user.bio && (
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-700 mb-2">نبذة عني</h2>
                <p className="text-gray-700 leading-relaxed">{user.bio}</p>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-primary-50 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Star className="w-5 h-5 text-primary-600 fill-primary-600" />
                  <span className="text-2xl font-bold text-primary-600">{user.rating}</span>
                </div>
                <div className="text-sm text-gray-600">{user.totalReviews} تقييم</div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Award className="w-5 h-5 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">{user.completedTrips}</span>
                </div>
                <div className="text-sm text-gray-600">رحلة مكتملة</div>
              </div>

              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <span className="text-2xl font-bold text-blue-600">{user.activeListings}</span>
                </div>
                <div className="text-sm text-gray-600">إعلان نشط</div>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Shield className="w-5 h-5 text-purple-600" />
                  <span className="text-2xl font-bold text-purple-600">100%</span>
                </div>
                <div className="text-sm text-gray-600">معدل الاستجابة</div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Link
              href="/profile/listings"
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">إعلاناتي</h3>
                <span className="text-2xl">📋</span>
              </div>
              <p className="text-sm text-gray-600">إدارة إعلاناتك النشطة والسابقة</p>
            </Link>

            <Link
              href="/bookings"
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">حجوزاتي</h3>
                <span className="text-2xl">📦</span>
              </div>
              <p className="text-sm text-gray-600">عرض جميع حجوزاتك ومعاملاتك</p>
            </Link>

            <Link
              href="/profile/settings"
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">الإعدادات</h3>
                <span className="text-2xl">⚙️</span>
              </div>
              <p className="text-sm text-gray-600">تخصيص تفضيلات حسابك</p>
            </Link>
          </div>

          {/* Reviews Section (Placeholder) */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">التقييمات</h2>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="font-semibold">{user.rating}</span>
                <span className="text-gray-500">({user.totalReviews} تقييم)</span>
              </div>
            </div>

            {/* Sample Reviews */}
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="pb-4 border-b border-gray-200 last:border-0">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-semibold">
                      م
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900">محمد علي</span>
                        <span className="text-sm text-gray-500">منذ أسبوعين</span>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className="w-4 h-4 text-yellow-400 fill-yellow-400"
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-700">
                        تجربة ممتازة! شخص موثوق وملتزم بالمواعيد. استلمت أغراضي بحالة ممتازة.
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-4 py-2 text-primary-600 hover:text-primary-700 font-medium">
              عرض جميع التقييمات ({user.totalReviews})
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
