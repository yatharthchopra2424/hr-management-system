import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const { pathname } = req.nextUrl

  // Allow public routes and static files
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('/favicon.ico') ||
    pathname === '/' ||
    pathname === '/auth/login' ||
    pathname === '/auth/register' ||
    pathname === '/auth/callback' ||
    pathname.includes('.') // Allow static files
  ) {
    return res
  }

  // For protected routes, let the page components handle authentication
  // This way we can use proper Supabase session checking
  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
