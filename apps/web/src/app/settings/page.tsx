'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Globe,
  Sun,
  Bell,
  Info,
  FileText,
  HelpCircle,
  Plane,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useLanguage } from '@/providers/LanguageProvider';

const APP_VERSION = '1.0.0';

export default function SettingsPage() {
  const { t, lang, toggleLang } = useLanguage();
  const isRTL = lang === 'ar';
  const [pushEnabled, setPushEnabled] = useState(true);

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col blob-background">
        <Header />

        <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
          {/* Back nav */}
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-sm text-v2-text-soft hover:text-v2-primary mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('profile.title')}
          </Link>

          <h1 className="text-2xl font-extrabold text-v2-text mb-6">{t('profile.settings')}</h1>

          <div className="space-y-4">
            {/* Language */}
            <div className="bg-white rounded-[22px] shadow-bubble-sm overflow-hidden">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-v2-text-muted px-5 pt-4 pb-1">
                {t('settings.language')}
              </p>
              <button
                onClick={toggleLang}
                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-v2-primary/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-v2-primary/10 flex items-center justify-center">
                    <Globe className="w-4 h-4 text-v2-primary" />
                  </div>
                  <span className="text-[15px] text-v2-text">{isRTL ? 'العربية' : 'English'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-v2-text-muted">
                  <span>{isRTL ? 'EN →' : '← AR'}</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            </div>

            {/* Appearance */}
            <div className="bg-white rounded-[22px] shadow-bubble-sm overflow-hidden">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-v2-text-muted px-5 pt-4 pb-1">
                {t('settings.appearance')}
              </p>
              <div className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-v2-amber/15 flex items-center justify-center">
                    <Sun className="w-4 h-4 text-v2-amber" />
                  </div>
                  <span className="text-[15px] text-v2-text">{t('settings.lightMode')}</span>
                </div>
                <span className="text-sm text-v2-text-muted">{t('settings.followsSystem')}</span>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-[22px] shadow-bubble-sm overflow-hidden">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-v2-text-muted px-5 pt-4 pb-1">
                {t('settings.notifications')}
              </p>
              <div className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-v2-accent1/15 flex items-center justify-center">
                    <Bell className="w-4 h-4 text-v2-accent1" />
                  </div>
                  <span className="text-[15px] text-v2-text">
                    {t('settings.pushNotifications')}
                  </span>
                </div>
                <button
                  role="switch"
                  aria-checked={pushEnabled}
                  onClick={() => setPushEnabled((v) => !v)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    pushEnabled ? 'bg-v2-primary' : 'bg-v2-text-muted/30'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      pushEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-[22px] shadow-bubble-sm overflow-hidden">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-v2-text-muted px-5 pt-4 pb-1">
                {t('settings.about')}
              </p>
              <div className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-v2-accent3/15 flex items-center justify-center">
                    <Info className="w-4 h-4 text-v2-accent3" />
                  </div>
                  <span className="text-[15px] text-v2-text">{t('settings.version')}</span>
                </div>
                <span className="text-sm text-v2-text-muted">{APP_VERSION}</span>
              </div>
              <Link
                href="/terms"
                className="flex items-center justify-between px-5 py-3.5 hover:bg-v2-primary/5 transition-colors border-t border-v2-primary/5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-v2-primary/10 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-v2-primary" />
                  </div>
                  <span className="text-[15px] text-v2-text">{t('profile.termsOfService')}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-v2-text-muted" />
              </Link>
              <Link
                href="/help"
                className="flex items-center justify-between px-5 py-3.5 hover:bg-v2-primary/5 transition-colors border-t border-v2-primary/5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-v2-accent2/15 flex items-center justify-center">
                    <HelpCircle className="w-4 h-4 text-v2-accent2" />
                  </div>
                  <span className="text-[15px] text-v2-text">{t('profile.help')}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-v2-text-muted" />
              </Link>
            </div>
          </div>

          {/* Footer branding */}
          <div className="flex flex-col items-center gap-2 mt-10 pb-4 text-v2-text-muted/50">
            <Plane className="w-6 h-6" />
            <p className="text-xs">LuggageShare v{APP_VERSION}</p>
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
