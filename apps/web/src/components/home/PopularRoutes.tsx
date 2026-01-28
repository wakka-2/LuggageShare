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
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">الوجهات الشائعة</h2>
          <Link
            href="/routes"
            className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
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
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-lg font-semibold text-gray-900">
                  {route.from}
                </span>
                <Plane className="w-5 h-5 text-primary-500 rotate-180 rtl:rotate-0" />
                <span className="text-lg font-semibold text-gray-900">
                  {route.to}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-gray-500">يبدأ من</span>
                  <p className="font-semibold text-primary-600">
                    {route.price} ر.س
                  </p>
                </div>
                <div className="text-left">
                  <span className="text-gray-500">ناقلين متاحين</span>
                  <p className="font-semibold text-gray-900">{route.carriers}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
