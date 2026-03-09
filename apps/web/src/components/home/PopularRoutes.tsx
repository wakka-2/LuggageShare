'use client';

import { Plane } from 'lucide-react';
import { useLanguage } from '@/providers/LanguageProvider';

const POPULAR_ROUTES = [
  { id: '1', from: 'الرياض', fromEn: 'Riyadh', to: 'القاهرة', toEn: 'Cairo' },
  { id: '2', from: 'جدة', fromEn: 'Jeddah', to: 'دبي', toEn: 'Dubai' },
  { id: '3', from: 'الرياض', fromEn: 'Riyadh', to: 'عمان', toEn: 'Amman' },
  { id: '4', from: 'الدمام', fromEn: 'Dammam', to: 'البحرين', toEn: 'Bahrain' },
  { id: '5', from: 'الرياض', fromEn: 'Riyadh', to: 'إسطنبول', toEn: 'Istanbul' },
];

interface PopularRoutesProps {
  onRouteSelect?: (from: string, to: string) => void;
}

export function PopularRoutes({ onRouteSelect }: PopularRoutesProps) {
  const { t, lang } = useLanguage();

  return (
    <section className="py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-xl font-bold text-v2-text mb-4">{t('wp.popularRoutesTitle')}</h2>

        <div className="flex flex-wrap gap-3">
          {POPULAR_ROUTES.map((route) => (
            <button
              key={route.id}
              onClick={() => onRouteSelect?.(route.fromEn, route.toEn)}
              className="bg-white rounded-full px-4 py-2.5 shadow-bubble-xs hover:shadow-bubble-sm transition-all flex items-center gap-2 group"
            >
              <div className="w-2 h-2 rounded-full bg-v2-mint" />
              <span className="text-sm font-medium text-v2-text">
                {lang === 'ar' ? route.from : route.fromEn}
              </span>
              <Plane className="w-3.5 h-3.5 text-v2-primary/40 group-hover:text-v2-primary transition-colors -rotate-90 rtl:rotate-90" />
              <span className="text-sm font-medium text-v2-text">
                {lang === 'ar' ? route.to : route.toEn}
              </span>
              <div className="w-2 h-2 rounded-full bg-v2-secondary" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
