'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MOCK_USER_SETTINGS } from '@/lib/data/mockUser';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Bell, Lock, Globe, Moon, Trash2, LogOut, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState(MOCK_USER_SETTINGS);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleNotificationChange = (key: keyof typeof settings.notifications) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key],
      },
    }));
  };

  const handlePrivacyChange = (key: keyof typeof settings.privacy, value: any) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value,
      },
    }));
  };

  const handleLanguageChange = (lang: 'ar' | 'en') => {
    setSettings(prev => ({ ...prev, language: lang }));
    // In real app, this would trigger language change
    alert(`تم تغيير اللغة إلى ${lang === 'ar' ? 'العربية' : 'English'}`);
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    setSettings(prev => ({ ...prev, theme }));
    alert(`تم تغيير المظهر إلى ${theme === 'light' ? 'فاتح' : theme === 'dark' ? 'داكن' : 'نظام'}`);
  };

  const handleLogout = () => {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
      // In real app, clear auth token and redirect
      alert('تم تسجيل الخروج بنجاح');
      router.push('/');
    }
  };

  const handleDeleteAccount = () => {
    if (showDeleteConfirm) {
      // In real app, send delete request to API
      alert('تم حذف الحساب. نأسف لرؤيتك تغادر!');
      router.push('/');
    } else {
      setShowDeleteConfirm(true);
    }
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
            <h1 className="text-3xl font-bold text-gray-900">الإعدادات</h1>
          </div>

          <div className="space-y-6">
            {/* Language Settings */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">اللغة</h2>
              </div>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <span className="font-medium">العربية</span>
                  <input
                    type="radio"
                    name="language"
                    checked={settings.language === 'ar'}
                    onChange={() => handleLanguageChange('ar')}
                    className="w-5 h-5 text-primary-600 focus:ring-primary-500"
                  />
                </label>
                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <span className="font-medium">English</span>
                  <input
                    type="radio"
                    name="language"
                    checked={settings.language === 'en'}
                    onChange={() => handleLanguageChange('en')}
                    className="w-5 h-5 text-primary-600 focus:ring-primary-500"
                  />
                </label>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <Bell className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">الإشعارات</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">البريد الإلكتروني</div>
                    <div className="text-sm text-gray-500">استقبال الإشعارات عبر البريد</div>
                  </div>
                  <button
                    onClick={() => handleNotificationChange('email')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.notifications.email ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.notifications.email ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">الإشعارات الفورية</div>
                    <div className="text-sm text-gray-500">استقبال الإشعارات على الجهاز</div>
                  </div>
                  <button
                    onClick={() => handleNotificationChange('push')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.notifications.push ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.notifications.push ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">الرسائل النصية</div>
                    <div className="text-sm text-gray-500">استقبال الإشعارات عبر SMS</div>
                  </div>
                  <button
                    onClick={() => handleNotificationChange('sms')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.notifications.sms ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.notifications.sms ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <hr className="border-gray-200" />

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">تحديثات الحجوزات</div>
                    <div className="text-sm text-gray-500">إشعارات حالة الحجوزات</div>
                  </div>
                  <button
                    onClick={() => handleNotificationChange('bookingUpdates')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.notifications.bookingUpdates ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.notifications.bookingUpdates ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">الرسائل</div>
                    <div className="text-sm text-gray-500">إشعارات الرسائل الجديدة</div>
                  </div>
                  <button
                    onClick={() => handleNotificationChange('messages')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.notifications.messages ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.notifications.messages ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">العروض الترويجية</div>
                    <div className="text-sm text-gray-500">إشعارات العروض الخاصة</div>
                  </div>
                  <button
                    onClick={() => handleNotificationChange('promotions')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.notifications.promotions ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.notifications.promotions ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">الخصوصية</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">إظهار البريد الإلكتروني</div>
                    <div className="text-sm text-gray-500">إظهار بريدك للمستخدمين الآخرين</div>
                  </div>
                  <button
                    onClick={() => handlePrivacyChange('showEmail', !settings.privacy.showEmail)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.privacy.showEmail ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.privacy.showEmail ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">إظهار رقم الجوال</div>
                    <div className="text-sm text-gray-500">إظهار رقمك للمستخدمين الآخرين</div>
                  </div>
                  <button
                    onClick={() => handlePrivacyChange('showPhone', !settings.privacy.showPhone)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.privacy.showPhone ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.privacy.showPhone ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <label className="block font-medium text-gray-900 mb-2">
                    ظهور الملف الشخصي
                  </label>
                  <select
                    value={settings.privacy.profileVisibility}
                    onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="public">عام - يمكن للجميع رؤية ملفك</option>
                    <option value="private">خاص - لا يمكن رؤية ملفك إلا بالرابط المباشر</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Theme Settings */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <Moon className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">المظهر</h2>
              </div>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <span className="font-medium">فاتح</span>
                  <input
                    type="radio"
                    name="theme"
                    checked={settings.theme === 'light'}
                    onChange={() => handleThemeChange('light')}
                    className="w-5 h-5 text-primary-600 focus:ring-primary-500"
                  />
                </label>
                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <span className="font-medium">داكن</span>
                  <input
                    type="radio"
                    name="theme"
                    checked={settings.theme === 'dark'}
                    onChange={() => handleThemeChange('dark')}
                    className="w-5 h-5 text-primary-600 focus:ring-primary-500"
                  />
                </label>
                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <span className="font-medium">تلقائي (حسب النظام)</span>
                  <input
                    type="radio"
                    name="theme"
                    checked={settings.theme === 'system'}
                    onChange={() => handleThemeChange('system')}
                    className="w-5 h-5 text-primary-600 focus:ring-primary-500"
                  />
                </label>
              </div>
            </div>

            {/* Account Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">إجراءات الحساب</h2>
              <div className="space-y-3">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                >
                  <span className="flex items-center gap-3">
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">تسجيل الخروج</span>
                  </span>
                </button>

                <button
                  onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                  className="w-full flex items-center justify-between p-4 border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-red-600"
                >
                  <span className="flex items-center gap-3">
                    <Trash2 className="w-5 h-5" />
                    <span className="font-medium">حذف الحساب</span>
                  </span>
                </button>

                {showDeleteConfirm && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-3 mb-4">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-red-900 mb-1">تحذير</h3>
                        <p className="text-sm text-red-700">
                          سيتم حذف حسابك نهائياً ولن يمكنك استرجاعه. سيتم حذف جميع بياناتك وإعلاناتك.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleDeleteAccount}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                      >
                        نعم، احذف حسابي
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
