import type { Metadata } from 'next';
import { Vazirmatn } from 'next/font/google';
import { getSiteUrl } from '@/lib/site-url';
import './globals.css';

const vazirmatn = Vazirmatn({
  subsets: ['arabic', 'latin'],
  variable: '--font-vazirmatn',
  display: 'swap',
});

/** Bump when replacing public/favicon.png so browsers pick up the new icon. */
const FAVICON_PATH = '/favicon.png?v=3';
const APPLE_TOUCH_ICON_PATH = '/apple-touch-icon.png?v=3';

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: 'نیرا نیوز | پایگاه خبری تحلیلی',
    template: '%s | نیرا نیوز',
  },
  description: 'پایگاه خبری تحلیلی نیرا نیوز',
  openGraph: {
    locale: 'fa_IR',
    type: 'website',
    siteName: 'نیرا نیوز',
    url: getSiteUrl(),
  },
  twitter: {
    card: 'summary_large_image',
  },
  icons: {
    icon: [
      { url: FAVICON_PATH, sizes: '32x32', type: 'image/png' },
      { url: FAVICON_PATH, sizes: '16x16', type: 'image/png' },
    ],
    apple: [{ url: APPLE_TOUCH_ICON_PATH, sizes: '180x180', type: 'image/png' }],
    shortcut: FAVICON_PATH,
  },
  other: {
    'theme-color': '#9d0b0f',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable} suppressHydrationWarning>
      <body className={vazirmatn.className}>{children}</body>
    </html>
  );
}
