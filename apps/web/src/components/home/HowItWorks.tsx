'use client';

import { Search, MessageSquare, Package, CheckCircle } from 'lucide-react';

const STEPS = [
  {
    icon: Search,
    title: 'ابحث عن ناقل',
    description: 'ابحث عن مسافرين متجهين إلى وجهتك مع مساحة متاحة',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: MessageSquare,
    title: 'تواصل واتفق',
    description: 'تواصل مع الناقل واتفقا على التفاصيل والسعر',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: Package,
    title: 'سلّم أغراضك',
    description: 'التقِ بالناقل وسلّمه أغراضك قبل السفر',
    color: 'bg-orange-100 text-orange-600',
  },
  {
    icon: CheckCircle,
    title: 'استلم وقيّم',
    description: 'يستلم المستلم الأغراض ويتم التقييم',
    color: 'bg-green-100 text-green-600',
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            كيف يعمل حصتي؟
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            خطوات بسيطة لإرسال أغراضك بأمان وبتكلفة أقل
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {STEPS.map((step, index) => (
            <div key={index} className="text-center">
              <div
                className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}
              >
                <step.icon className="w-8 h-8" />
              </div>
              <div className="relative">
                <span className="absolute -top-8 right-1/2 translate-x-1/2 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 mt-4">
                {step.title}
              </h3>
              <p className="text-sm text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
