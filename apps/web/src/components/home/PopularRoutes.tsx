'use client';

import Link from 'next/link';
import { Plane, ChevronLeft } from 'lucide-react';

const POPULAR_ROUTES = [
  {
    id: '1',
    from: 'الرياض',
    fromEn: 'Riyadh',
    to: 'القاهرة',
    toEn: 'Cairo',
    price: 150,
    carriers: 12,
  },
  {
    id: '2',
    from: 'جدة',
    fromEn: 'Jeddah',
    to: 'دبي',
    toEn: 'Dubai',
    price: 100,
    carriers: 8,
  },
  {
    id: '3',
    from: 'الرياض',
    fromEn: 'Riyadh',
    to: 'عمان',
    toEn: 'Amman',
    price: 120,
    carriers: 5,
  },
  {
    id: '4',
    from: 'الدمام',
    fromEn: 'Dammam',
    to: 'البحرين',
    toEn: 'Bahrain',
    price: 80,
    carriers: 15,
  },
];

export function PopularRoutes() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-v2-text">الوجهات الشائعة</h2>
          <Link
            href="/routes"
            className="text-v2-primary hover:text-v2-primary-light font-medium flex items-center gap-1 px-4 py-2 rounded-full hover:bg-v2-primary/5 transition-all"
          >
            عرض الكل
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {POPULAR_ROUTES.map((route) => (
            <Link
              key={route.id}
              href={`/search?from=${route.fromEn}&to=${route.toEn}`}
              className="bg-white rounded-[22px] p-6 shadow-bubble-sm hover:shadow-bubble-md transition-all group"
            >
              <div className="flex items-center gap-3 mb-4">
                {/* From dot */}
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-v2-mint" />
                  <span className="text-lg font-semibold text-v2-text">{route.from}</span>
                </div>
                <Plane className="w-5 h-5 text-v2-primary rotate-180 rtl:rotate-0 group-hover:text-v2-primary-light transition-colors" />
                {/* To dot */}
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-v2-secondary" />
                  <span className="text-lg font-semibold text-v2-text">{route.to}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-v2-text-muted text-xs">يبدأ من</span>
                  <p className="font-semibold text-v2-primary">{route.price} ر.س</p>
                </div>
                <div className="text-left">
                  <span className="text-v2-text-muted text-xs">ناقلين متاحين</span>
                  <p className="font-semibold text-v2-text bg-v2-mint/10 px-3 py-0.5 rounded-full text-center">
                    {route.carriers}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
