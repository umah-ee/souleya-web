import { createServerClient, type SetAllCookies } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Öffentliche Routen – kein Auth nötig
const PUBLIC_ROUTES = ['/login', '/auth/', '/api/'];

// Pre-Launch: nur diese Routen sind für eingeloggte User zugänglich
const PRE_LAUNCH = process.env.NEXT_PUBLIC_PRE_LAUNCH === 'true';
const PRE_LAUNCH_ALLOWED = ['/profile', '/u/'];

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const { pathname } = request.nextUrl;

  // ── Öffentliche Routen: kein Auth-Check nötig ──
  const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
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

  // ── Pre-Launch: nur bestimmte Routen zugänglich ──
  if (PRE_LAUNCH) {
    const isAllowed = PRE_LAUNCH_ALLOWED.some(
      (prefix) => pathname === prefix || pathname.startsWith(prefix + '/'),
    );
    if (!isAllowed) {
      return NextResponse.redirect(new URL('/profile', request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
