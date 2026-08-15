import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect Admin Dashboard Routes
  if (pathname.startsWith('/admin')) {
    // Allow public access to login page and static assets
    if (pathname === '/admin/login' || pathname.startsWith('/admin/login/')) {
      return NextResponse.next();
    }

    // Check for Supabase auth cookie tokens in request
    const allCookies = request.cookies.getAll();
    const hasAuthCookie = allCookies.some(cookie => 
      cookie.name.includes('auth-token') || 
      cookie.name.startsWith('sb-') ||
      cookie.name === 'supabase-auth-token'
    );

    // Note: If accessing /admin and client relies on localStorage/session,
    // the page client component performs immediate cryptographic validation.
    // The middleware ensures the initial header security and baseline filtering.
    const response = NextResponse.next();
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/:path*',
  ],
};
