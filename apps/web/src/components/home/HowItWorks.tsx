'use client';

import { Search, MessageSquare, Package, CheckCircle } from 'lucide-react';

const STEPS = [
  {
    icon: Search,
    title: 'ابحث عن ناقل',
    description: 'ابحث عن مسافرين متجهين إلى وجهتك مع مساحة متاحة',
    accent: 'bg-v2-sky/15 text-v2-sky',
    gradient: 'from-v2-sky to-v2-primary',
  },
  {
    icon: MessageSquare,
    title: 'تواصل واتفق',
    description: 'تواصل مع الناقل واتفقا على التفاصيل والسعر',
    accent: 'bg-v2-primary/15 text-v2-primary',
    gradient: 'from-v2-primary to-v2-primary-light',
  },
  {
    icon: Package,
    title: 'سلّم أغراضك',
    description: 'التقِ بالناقل وسلّمه أغراضك قبل السفر',
    accent: 'bg-v2-amber/15 text-v2-amber',
    gradient: 'from-v2-amber to-v2-secondary',
  },
  {
    icon: CheckCircle,
    title: 'استلم وقيّم',
    description: 'يستلم المستلم الأغراض ويتم التقييم',
    accent: 'bg-v2-mint/15 text-v2-mint',
    gradient: 'from-v2-mint to-v2-sky',
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-v2-text mb-3">كيف يعمل حصتي؟</h2>
          <p className="text-v2-text-soft max-w-xl mx-auto">
            خطوات بسيطة لإرسال أغراضك بأمان وبتكلفة أقل
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, index) => (
            <div
              key={index}
              className="text-center bg-white rounded-[22px] p-6 shadow-bubble-sm hover:shadow-bubble-md transition-all"
            >
              {/* Gradient step number */}
              <div
                className={`w-10 h-10 bg-gradient-to-br ${step.gradient} rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-sm shadow-bubble-xs`}
              >
                {index + 1}
              </div>
              {/* Icon */}
              <div
                className={`w-14 h-14 ${step.accent} rounded-2xl flex items-center justify-center mx-auto mb-4`}
              >
                <step.icon className="w-7 h-7" />
              </div>
              <h3 className="font-semibold text-v2-text mb-2">{step.title}</h3>
              <p className="text-sm text-v2-text-soft">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
