import Link from 'next/link';
import { Smartphone } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

interface InfoPageProps {
  icon: LucideIcon;
  title: string;
  description: string;
  showDownload?: boolean;
}

export default function InfoPage({
  icon: Icon,
  title,
  description,
  showDownload = true,
}: InfoPageProps) {
  return (
    <div className="min-h-screen flex flex-col blob-background">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-v2-primary/10 flex items-center justify-center mx-auto mb-6">
            <Icon className="w-10 h-10 text-v2-primary" />
          </div>
          <h1 className="text-2xl font-extrabold text-v2-text mb-3">{title}</h1>
          <p className="text-v2-text-soft mb-8">{description}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="px-6 py-3 rounded-full border border-v2-primary/20 text-v2-text-soft hover:text-v2-text hover:border-v2-primary/40 transition-all"
            >
              العودة للرئيسية
            </Link>
            {showDownload && (
              <a
                href="https://luggageshare.com/download"
                className="v2-gradient-primary text-white px-6 py-3 rounded-full font-semibold hover:shadow-bubble-md transition-all flex items-center justify-center gap-2"
              >
                <Smartphone className="w-4 h-4" />
                حمل التطبيق
              </a>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
