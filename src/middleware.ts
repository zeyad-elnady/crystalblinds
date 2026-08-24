import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // If user accesses /ar/admin or /en/admin (or /ar/admin/login, etc.), redirect cleanly to /admin
  if (pathname.startsWith('/ar/admin') || pathname.startsWith('/en/admin')) {
    const cleanAdminPath = pathname.replace(/^\/(ar|en)/, '');
    const url = request.nextUrl.clone();
    url.pathname = cleanAdminPath;
    return NextResponse.redirect(url);
  }

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

    const response = NextResponse.next();
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/ar/admin',
    '/ar/admin/:path*',
    '/en/admin',
    '/en/admin/:path*',
    '/api/:path*',
  ],
};
