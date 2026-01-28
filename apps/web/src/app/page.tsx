import Link from 'next/link';
import { SearchBox } from '@/components/home/SearchBox';
import { PopularRoutes } from '@/components/home/PopularRoutes';
import { HowItWorks } from '@/components/home/HowItWorks';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary-50 to-white py-16 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              شارك أمتعتك، وفر تكاليفك
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              أرسل أغراضك مع مسافرين موثوقين، أو اكسب المال من مساحة أمتعتك الإضافية
            </p>

            <div className="max-w-4xl mx-auto">
              <SearchBox />
            </div>
          </div>
        </section>

        {/* How It Works */}
        <HowItWorks />

        {/* Popular Routes */}
        <PopularRoutes />

        {/* CTA Section */}
        <section className="bg-primary-600 py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              هل لديك رحلة قادمة؟
            </h2>
            <p className="text-primary-100 mb-8">
              سجل كناقل واكسب المال من مساحة أمتعتك الإضافية
            </p>
            <Link
              href="/carrier/register"
              className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
            >
              سجل كناقل
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
