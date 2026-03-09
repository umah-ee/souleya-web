import { createServerClient, type SetAllCookies } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Server-seitige OTP-Verifikation.
 *
 * Landing Page redirected hierhin:
 *   /api/auth/verify?email=xxx&otp=12345678&next=/profile
 *
 * 1. verifyOtp() mit Supabase Server Client
 * 2. Session-Cookies werden automatisch gesetzt
 * 3. Redirect zu ?next (default: /profile)
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const email = searchParams.get('email');
  const otp = searchParams.get('otp');
  const next = searchParams.get('next') ?? '/profile';

  if (!email || !otp) {
    return NextResponse.redirect(`${origin}/login?error=missing_params`);
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Parameters<SetAllCookies>[0]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );

  const { error } = await supabase.auth.verifyOtp({
    email,
    token: otp,
    type: 'email',
  });

  if (error) {
    console.error('OTP verification failed:', error.message);
    return NextResponse.redirect(
      `${origin}/login?error=invalid_otp`,
    );
  }

  // Erfolg – Session-Cookies sind gesetzt, weiter zum Profil
  return NextResponse.redirect(`${origin}${next}`);
}
