import PublicHeader from '@/components/layout/PublicHeader';
import PublicFooter from '@/components/layout/PublicFooter';
import CookieConsent from '@/components/public/CookieConsent';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-gradient)' }}>
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
      <CookieConsent />
    </div>
  );
}
