const SUPPORTED_LOCALES = ['de', 'en'];

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ungueltige Locale → 404
  if (!SUPPORTED_LOCALES.includes(locale)) {
    const { notFound } = await import('next/navigation');
    notFound();
  }

  return <>{children}</>;
}
