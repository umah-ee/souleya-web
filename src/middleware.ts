import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PRE_LAUNCH = process.env.NEXT_PUBLIC_PRE_LAUNCH === 'true'

// Routen die im Pre-Launch Modus zugänglich sind
const ALLOWED_PREFIXES = ['/login', '/auth', '/profile', '/u/']

export function middleware(request: NextRequest) {
  if (!PRE_LAUNCH) return NextResponse.next()

  const { pathname } = request.nextUrl

  const isAllowed = ALLOWED_PREFIXES.some((prefix) =>
    pathname === prefix || pathname.startsWith(prefix + '/')
  )

  if (!isAllowed) {
    return NextResponse.redirect(new URL('/profile', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|favicon|api|.*\\..*).*)'],
}
