import type { Metadata } from 'next';
import { Inter, Tajawal } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['400', '500', '700'],
  variable: '--font-tajawal',
});

export const metadata: Metadata = {
  title: 'LuggageShare - حصتي',
  description: 'Share luggage space, save money - شارك أمتعتك، وفر تكاليفك',
  keywords: ['luggage', 'travel', 'shipping', 'Saudi Arabia', 'peer-to-peer'],
  authors: [{ name: 'LuggageShare' }],
  openGraph: {
    title: 'LuggageShare - حصتي',
    description: 'Share luggage space, save money',
    url: 'https://luggageshare.com',
    siteName: 'LuggageShare',
    locale: 'ar_SA',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${inter.variable} ${tajawal.variable} font-arabic antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
