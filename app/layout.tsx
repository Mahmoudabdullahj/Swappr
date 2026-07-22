import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque } from 'next/font/google';
import { AppProvider } from '@/lib/app-context';
import AppShell from '@/components/AppShell';
import PwaRegister from '@/components/PwaRegister';
import './globals.css';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2258f6',
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://baddel.shop'),
  title: {
    default: 'Baddel: Trade What You Have',
    template: '%s | Baddel',
  },
  description: 'Baddel is a local barter marketplace for Amman. No money changes hands, just fair direct trades between people near you.',
  keywords: ['barter', 'trade', 'swap', 'Amman', 'Jordan', 'marketplace', 'no money', 'local'],
  authors: [{ name: 'Baddel' }],
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'en_JO',
    url: 'https://baddel.shop',
    siteName: 'Baddel',
    title: 'Baddel: Trade What You Have',
    description: 'A local barter marketplace for Amman. No money, just fair trades between people near you.',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Baddel: Trade What You Have' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Baddel: Trade What You Have',
    description: 'A local barter marketplace for Amman. No money, just fair trades between people near you.',
    images: ['/opengraph-image'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={bricolage.variable}>
      <head>
        <link rel="preconnect" href="https://ekcsvucupmmgkekjjdqx.supabase.co" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://infird.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://lh3.googleusercontent.com" crossOrigin="anonymous" />
        <link rel="preload" as="image" href="/hero-poster.webp" fetchPriority="high" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Baddel" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <AppProvider>
          <AppShell>{children}</AppShell>
        </AppProvider>
        <PwaRegister />
      </body>
    </html>
  );
}
