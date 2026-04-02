import { createServerClient, type SetAllCookies } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Öffentliche Routen – kein Auth nötig
const PUBLIC_ROUTES = [
  '/', '/login', '/auth/', '/api/',
  '/de/blog', '/en/blog', '/blog',
  '/impressum', '/datenschutz', '/agb', '/preise', '/ueber-uns', '/mentor', '/wisdom/',
  '/was-ist-souleya', '/features/',
  '/u/',
];

// Pre-Launch: nur diese Routen sind für eingeloggte User zugänglich
const PRE_LAUNCH = process.env.NEXT_PUBLIC_PRE_LAUNCH === 'true';
const PRE_LAUNCH_ALLOWED = ['/', '/profile', '/u/', '/dashboard', '/willkommen'];

export async function proxy(request: NextRequest) {
  // ── www → non-www Redirect (canonical domain) ──
  const host = request.headers.get('host') ?? '';
  if (host.startsWith('www.')) {
    const url = request.nextUrl.clone();
    url.host = host.replace('www.', '');
    return NextResponse.redirect(url, 301);
  }

  let supabaseResponse = NextResponse.next({ request });
  const { pathname } = request.nextUrl;

  // ── Next.js generierte Dateien: immer oeffentlich ──
  if (pathname === '/sitemap.xml' || pathname === '/robots.txt') {
    return supabaseResponse;
  }

  // ── Blog Locale-Redirect: /blog → /de/blog ──
  if (pathname === '/blog' || pathname.startsWith('/blog/')) {
    const slug = pathname.replace('/blog', '');
    return NextResponse.redirect(new URL(`/de/blog${slug}`, request.url));
  }

  // ── Öffentliche Routen: kein Auth-Check nötig ──
  const isPublic = pathname === '/' || PUBLIC_ROUTES.some((r) => r !== '/' && pathname.startsWith(r));
  if (isPublic) {
    return supabaseResponse;
  }

  // ── Session auffrischen + User prüfen ──
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Parameters<SetAllCookies>[0]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── Auth-Guard: nicht eingeloggt → /login ──
  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Onboarding + Pre-Launch Guard ──
  // /onboarding selbst ueberspringt beide Guards (User ist authed, muss aber Setup abschliessen)
  const isOnboarding = pathname.startsWith('/onboarding');

  if (!isOnboarding) {
    // Ein einziger DB-Query fuer Onboarding + Pre-Launch Check
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed_at, is_admin, is_beta_tester, soul_level')
      .eq('id', user.id)
      .single();

    // Onboarding-Guard: noch nicht abgeschlossen → /onboarding
    if (profile && !profile.onboarding_completed_at) {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }

    // Pre-Launch: nur bestimmte Routen zugaenglich (Admins + Beta-Tester ausgenommen)
    if (PRE_LAUNCH) {
      const isAllowed = PRE_LAUNCH_ALLOWED.some(
        (prefix) => pathname === prefix || pathname.startsWith(prefix + '/'),
      );
      if (!isAllowed && !profile?.is_admin && !profile?.is_beta_tester) {
        return NextResponse.redirect(new URL('/profile', request.url));
      }
    }

    // Admin-Guard: nur Admins duerfen /admin/* Seiten oeffnen
    if (pathname.startsWith('/admin') && !profile?.is_admin) {
      return NextResponse.redirect(new URL('/pulse', request.url));
    }

    // Studio-Guard: nur Level 4+ (Zen Master / Soul Mentor) oder Admins
    if (pathname.startsWith('/studio') && !profile?.is_admin && (profile?.soul_level ?? 0) < 4) {
      return NextResponse.redirect(new URL('/pulse', request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
