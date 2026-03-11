import type { Metadata, Viewport } from 'next';
import { Inter, Tajawal } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import { BottomTabBar } from '@/components/layout/BottomTabBar';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['400', '500', '700'],
  variable: '--font-tajawal',
});

export const viewport: Viewport = {
  themeColor: '#7C6AFF',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'LuggageShare - حصتي',
  description: 'Share luggage space, save money - شارك أمتعتك، وفر تكاليفك',
  keywords: ['luggage', 'travel', 'shipping', 'Saudi Arabia', 'peer-to-peer'],
  authors: [{ name: 'LuggageShare' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'حصتي',
  },
  icons: {
    apple: '/icons/apple-touch-icon.png',
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'LuggageShare - حصتي',
    description: 'Share luggage space, save money',
    url: 'https://luggageshare.com',
    siteName: 'LuggageShare',
    locale: 'ar_SA',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${inter.variable} ${tajawal.variable} font-arabic antialiased`}>
        <Providers>
          {children}
          <BottomTabBar />
        </Providers>
      </body>
    </html>
  );
}
