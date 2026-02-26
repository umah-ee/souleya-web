import type { Metadata } from 'next';
import { Josefin_Sans, Quicksand } from 'next/font/google';
import ThemeProvider from '@/components/ThemeProvider';
import './globals.css';

const josefin = Josefin_Sans({
  variable: '--font-josefin',
  subsets: ['latin'],
  weight: ['400'],
});

const quicksand = Quicksand({
  variable: '--font-quicksand',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
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
    <html lang="de" data-theme="dark" suppressHydrationWarning>
      <body
        className={`${josefin.variable} ${quicksand.variable} antialiased font-body`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
