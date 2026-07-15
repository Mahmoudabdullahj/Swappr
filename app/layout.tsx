import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque } from 'next/font/google';
import './globals.css';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://swaparr.com'),
  title: {
    default: 'Swaparr: Trade What You Have',
    template: '%s | Swaparr',
  },
  description: 'Swaparr is a local barter marketplace for Amman. No money changes hands, just fair direct trades between people near you.',
  keywords: ['barter', 'trade', 'swap', 'Amman', 'Jordan', 'marketplace', 'no money', 'local'],
  authors: [{ name: 'Swaparr' }],
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'en_JO',
    url: 'https://swappr.jo',
    siteName: 'Swaparr',
    title: 'Swaparr: Trade What You Have',
    description: 'A local barter marketplace for Amman. No money, just fair trades between people near you.',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Swaparr: Trade What You Have' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Swaparr: Trade What You Have',
    description: 'A local barter marketplace for Amman. No money, just fair trades between people near you.',
    images: ['/opengraph-image'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={bricolage.variable}>
      <head>
        <link rel="preconnect" href="https://ekcsvucupmmgkekjjdqx.supabase.co" />
        <link rel="preload" as="image" href="/hero-poster.webp" fetchPriority="high" />
      </head>
      <body>{children}</body>
    </html>
  );
}
