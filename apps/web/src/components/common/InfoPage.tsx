'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useLanguage } from '@/providers/LanguageProvider';

interface InfoPageProps {
  icon: LucideIcon;
  titleKey: string;
  children: React.ReactNode;
}

export default function InfoPage({ icon: Icon, titleKey, children }: InfoPageProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col blob-background">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-v2-text-soft hover:text-v2-text mb-6 transition-colors text-sm"
        >
          <ArrowRight className="w-4 h-4" />
          {t('wp.back')}
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-v2-primary/10 flex items-center justify-center flex-shrink-0">
            <Icon className="w-6 h-6 text-v2-primary" />
          </div>
          <h1 className="text-2xl font-extrabold text-v2-text">{t(titleKey)}</h1>
        </div>

        {/* Content */}
        <div className="bg-white rounded-[22px] shadow-bubble-sm p-6 md:p-8 prose-v2">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
