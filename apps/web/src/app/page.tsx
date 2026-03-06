import Link from 'next/link';
import { SearchBox } from '@/components/home/SearchBox';
import { PopularRoutes } from '@/components/home/PopularRoutes';
import { HowItWorks } from '@/components/home/HowItWorks';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col blob-background">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto text-center">
            {/* Decorative circles */}
            <div className="relative">
              <div className="absolute -top-10 left-10 w-20 h-20 rounded-full bg-v2-mint/20 blur-xl" />
              <div className="absolute -top-6 right-16 w-16 h-16 rounded-full bg-v2-secondary/15 blur-xl" />
              <div className="absolute top-20 right-4 w-12 h-12 rounded-full bg-v2-amber/20 blur-xl" />
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold text-v2-text mb-4 relative">
              شارك أمتعتك، وفر تكاليفك
            </h1>
            <p className="text-lg text-v2-text-soft mb-10 max-w-2xl mx-auto">
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
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center v2-gradient-primary rounded-[28px] py-16 px-8 shadow-bubble-lg relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-4 left-8 w-24 h-24 rounded-full bg-white/10" />
            <div className="absolute bottom-6 right-12 w-16 h-16 rounded-full bg-white/10" />

            <h2 className="text-3xl font-bold text-white mb-4 relative">هل لديك رحلة قادمة؟</h2>
            <p className="text-white/80 mb-8 relative">
              سجل كناقل واكسب المال من مساحة أمتعتك الإضافية
            </p>
            <Link
              href="/carrier/register"
              className="inline-block bg-white text-v2-primary px-8 py-3 rounded-full font-semibold hover:shadow-bubble-md transition-all relative"
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
