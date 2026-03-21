import type { Metadata } from 'next';
import { Cormorant_Garamond, Josefin_Sans, Quicksand } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Script from 'next/script';
import ThemeProvider from '@/components/ThemeProvider';
import LightboxProvider from '@/components/shared/LightboxProvider';
import AnalyticsProvider from '@/components/AnalyticsProvider';
import './globals.css';

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
});

const josefin = Josefin_Sans({
  variable: '--font-josefin',
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600'],
});

const quicksand = Quicksand({
  variable: '--font-quicksand',
  subsets: ['latin'],
  weight: ['500', '600'],
});

export const metadata: Metadata = {
  title: 'Souleya – Deine Community für Wachstum',
  description: 'Community-Plattform für Spiritualität, Gesundheit und persönliche Entwicklung.',
  icons: { icon: '/icon.svg' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" data-theme="dark" data-color="gold" suppressHydrationWarning>
      <body
        className={`${cormorant.variable} ${josefin.variable} ${quicksand.variable} antialiased font-body`}
      >
        <ThemeProvider>
          <LightboxProvider>
            {children}
          </LightboxProvider>
        </ThemeProvider>
        <AnalyticsProvider />
        <SpeedInsights />
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-MM58X72XX9" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-MM58X72XX9');
        `}</Script>
      </body>
    </html>
  );
}
