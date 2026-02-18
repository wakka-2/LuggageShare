import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const SENDER_STEPS = [
  {
    number: 1,
    icon: '🔍',
    title: 'ابحث عن ناقل',
    description: 'تصفح الإعلانات المتاحة أو ابحث بالمدينة والتاريخ. ستجد مسافرين متجهين لوجهتك مع مساحة أمتعة إضافية.',
  },
  {
    number: 2,
    icon: '💬',
    title: 'تواصل واتفق',
    description: 'راسل الناقل مباشرة عبر المنصة. اتفقا على تفاصيل الأغراض، الحجم، والسعر المناسب للطرفين.',
  },
  {
    number: 3,
    icon: '📦',
    title: 'سلّم أغراضك',
    description: 'التقِ بالناقل في الموقع المتفق عليه — المطار، مول، أو أي مكان عام. سلّمه أغراضك بأمان.',
  },
  {
    number: 4,
    icon: '✅',
    title: 'استلم وقيّم',
    description: 'بعد وصول الأغراض، يتم تأكيد الاستلام عبر التطبيق. قيّم تجربتك لمساعدة المجتمع.',
  },
];

const CARRIER_STEPS = [
  {
    number: 1,
    icon: '✈️',
    title: 'أنشئ إعلاناً',
    description: 'حدد وجهتك وتاريخ سفرك والمساحة المتاحة في أمتعتك. حدد الأسعار والقيود التي تناسبك.',
  },
  {
    number: 2,
    icon: '📩',
    title: 'استقبل الطلبات',
    description: 'سيتواصل معك المرسلون عبر المنصة. راجع تفاصيل الأغراض واقبل أو ارفض الطلبات.',
  },
  {
    number: 3,
    icon: '🤝',
    title: 'استلم الأغراض',
    description: 'التقِ بالمرسل في الموقع المتفق عليه واستلم الأغراض. تأكد من مطابقتها للوصف.',
  },
  {
    number: 4,
    icon: '💰',
    title: 'سلّم واكسب',
    description: 'عند وصولك، سلّم الأغراض للمستلم. يتم تحويل المبلغ لرصيدك بعد تأكيد الاستلام.',
  },
];

const SAFETY_FEATURES = [
  {
    icon: '🛡️',
    title: 'التحقق من الهوية',
    description: 'نتحقق من هوية جميع المستخدمين لضمان بيئة آمنة وموثوقة.',
  },
  {
    icon: '⭐',
    title: 'نظام التقييمات',
    description: 'اطّلع على تقييمات وآراء المستخدمين السابقين قبل اتخاذ قرارك.',
  },
  {
    icon: '💬',
    title: 'المراسلة الآمنة',
    description: 'تواصل مع الطرف الآخر عبر نظام المراسلة المدمج دون مشاركة بياناتك الشخصية.',
  },
  {
    icon: '🚫',
    title: 'قائمة المحظورات',
    description: 'نطبّق قائمة واضحة للعناصر المحظورة لحماية الناقلين والمرسلين.',
  },
];

const FAQ = [
  {
    question: 'هل الخدمة قانونية؟',
    answer: 'نعم، مشاركة مساحة الأمتعة مع مسافرين آخرين قانونية تماماً. نحن لا نتعامل مع الشحن التجاري، بل نربط بين أفراد لنقل أغراض شخصية.',
  },
  {
    question: 'ماذا لو تأخرت الأغراض أو تلفت؟',
    answer: 'نوصي بالتواصل المباشر مع الناقل عبر المنصة. في حال وجود خلاف، فريق الدعم متاح للمساعدة في حل النزاعات.',
  },
  {
    question: 'ما هي الأغراض المسموح بنقلها؟',
    answer: 'يمكن نقل الملابس، الإلكترونيات، الهدايا، المستندات، والكتب. يُمنع نقل السوائل، المواد الخطرة، المواد الغذائية القابلة للتلف، والمواد المحظورة قانونياً.',
  },
  {
    question: 'كيف يتم الدفع؟',
    answer: 'يتم الاتفاق على السعر بين المرسل والناقل. يتم تحويل المبلغ عبر المنصة بعد تأكيد استلام الأغراض بنجاح.',
  },
  {
    question: 'هل يمكنني إلغاء الحجز؟',
    answer: 'نعم، يمكن لأي طرف إلغاء الحجز قبل تسليم الأغراض. ننصح بالإلغاء المبكر لإتاحة الفرصة للطرف الآخر بإيجاد بديل.',
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-primary-50 to-white py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              كيف يعمل حصتي؟
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              منصة بسيطة وآمنة تربط بين المسافرين الذين لديهم مساحة أمتعة إضافية والأشخاص الذين يحتاجون لإرسال أغراضهم
            </p>
          </div>
        </section>

        {/* For Senders */}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <span className="inline-block bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-3">
                للمرسلين
              </span>
              <h2 className="text-2xl font-bold text-gray-900">
                أرسل أغراضك بتكلفة أقل
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {SENDER_STEPS.map((step) => (
                <div key={step.number} className="text-center">
                  <div className="relative inline-block mb-4">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mx-auto">
                      {step.icon}
                    </div>
                    <span className="absolute -top-2 -end-2 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link
                href="/listings"
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                تصفح الإعلانات
              </Link>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="max-w-5xl mx-auto px-4">
          <hr className="border-gray-200" />
        </div>

        {/* For Carriers */}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <span className="inline-block bg-green-100 text-green-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-3">
                للناقلين
              </span>
              <h2 className="text-2xl font-bold text-gray-900">
                اكسب المال من مساحة أمتعتك
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {CARRIER_STEPS.map((step) => (
                <div key={step.number} className="text-center">
                  <div className="relative inline-block mb-4">
                    <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-3xl mx-auto">
                      {step.icon}
                    </div>
                    <span className="absolute -top-2 -end-2 w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link
                href="/create-listing"
                className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                أنشئ إعلاناً
              </Link>
            </div>
          </div>
        </section>

        {/* Safety */}
        <section className="bg-gray-50 py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                سلامتك أولويتنا
              </h2>
              <p className="text-gray-600">
                نوفر عدة طبقات حماية لضمان تجربة آمنة للجميع
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {SAFETY_FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="bg-white rounded-xl p-6 border border-gray-200 flex items-start gap-4"
                >
                  <div className="text-3xl flex-shrink-0">{feature.icon}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
              الأسئلة الشائعة
            </h2>

            <div className="space-y-4">
              {FAQ.map((item) => (
                <details
                  key={item.question}
                  className="group bg-white border border-gray-200 rounded-xl overflow-hidden"
                >
                  <summary className="flex items-center justify-between cursor-pointer px-6 py-4 font-semibold text-gray-900 hover:bg-gray-50 transition-colors">
                    {item.question}
                    <span className="text-gray-400 group-open:rotate-180 transition-transform me-2">
                      ▼
                    </span>
                  </summary>
                  <div className="px-6 pb-4 text-gray-600 leading-relaxed">
                    {item.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-primary-600 py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              مستعد للبدء؟
            </h2>
            <p className="text-primary-100 mb-8 max-w-lg mx-auto">
              انضم لآلاف المسافرين الذين يوفرون المال ويكسبون من مساحة أمتعتهم
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/listings"
                className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
              >
                ابحث عن ناقل
              </Link>
              <Link
                href="/create-listing"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                أنشئ إعلاناً
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
