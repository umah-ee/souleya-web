import type { Metadata } from 'next';
import { Cormorant_Garamond, Josefin_Sans, Quicksand } from 'next/font/google';
import './globals.css';

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['300', '400', '500'],
});

const josefin = Josefin_Sans({
  variable: '--font-josefin',
  subsets: ['latin'],
  weight: ['100', '200', '300', '400'],
});

const quicksand = Quicksand({
  variable: '--font-quicksand',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'Souleya – Deine Community für Wachstum',
  description: 'Community-Plattform für Spiritualität, Gesundheit und persönliche Entwicklung.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body
        className={`${cormorant.variable} ${josefin.variable} ${quicksand.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
