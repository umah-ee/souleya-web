import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Willkommen',
  robots: { index: false, follow: false },
};

export default function WillkommenLayout({ children }: { children: React.ReactNode }) {
  return children;
}
