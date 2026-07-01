import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://swappr.jo'),
  title: {
    default: 'Swappr — Trade What You Have',
    template: '%s | Swappr',
  },
  description: 'Swappr is a local barter marketplace for Amman. No money changes hands — just fair, direct trades between people near you.',
  keywords: ['barter', 'trade', 'swap', 'Amman', 'Jordan', 'marketplace', 'no money', 'local'],
  authors: [{ name: 'Swappr' }],
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'en_JO',
    url: 'https://swappr.jo',
    siteName: 'Swappr',
    title: 'Swappr — Trade What You Have',
    description: 'A local barter marketplace for Amman. No money — just fair trades between people near you.',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Swappr — Trade What You Have' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Swappr — Trade What You Have',
    description: 'A local barter marketplace for Amman. No money — just fair trades between people near you.',
    images: ['/opengraph-image'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
