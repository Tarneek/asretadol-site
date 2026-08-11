import type { Metadata } from 'next';
import { Vazirmatn } from 'next/font/google';
import './globals.css';

const vazirmatn = Vazirmatn({
  subsets: ['arabic', 'latin'],
  variable: '--font-vazirmatn',
  display: 'swap',
});

/** Bump when replacing public/favicon.png so browsers pick up the new icon. */
const FAVICON_PATH = '/favicon.png?v=2';

export const metadata: Metadata = {
  title: {
    default: 'عصر تعادل | پایگاه خبری تحلیلی',
    template: '%s | عصر تعادل',
  },
  description: 'پایگاه خبری تحلیلی عصر تعادل',
  icons: {
    icon: [{ url: FAVICON_PATH, type: 'image/png' }],
    apple: [{ url: FAVICON_PATH, type: 'image/png' }],
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
