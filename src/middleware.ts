import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Geschuetzte Routen – erfordern Auth
const PROTECTED_PREFIXES = ['/profile', '/circles'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Nur geschuetzte Routen pruefen
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtected) {
    return NextResponse.next();
  }

  // Supabase-Client fuer Middleware (liest/setzt Cookies via Request/Response)
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Cookies auf Request setzen (fuer nachfolgende Server Components)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          // Neue Response mit aktualisierten Request-Headers
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          // Cookies auch auf Response setzen (fuer den Browser)
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Session pruefen (refresht Token automatisch wenn noetig)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Nicht eingeloggt → Redirect zu /login
  if (!user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
