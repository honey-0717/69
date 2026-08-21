import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#09090b',
};

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  fallback: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'hotharini69',
  description:
    'hotharini69 info',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'hotharini69',
    description:
      'hotharini69 info',
    images: ['/logo.jpg'],
  },
};

import { RealtimeListener } from '@/components/providers/realtime-listener';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <RealtimeListener />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
