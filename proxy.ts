import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  // Get the session cookie we'll set after login
  const sessionCookie = request.cookies.get('anchorproof-session');

  const isAuthPage = request.nextUrl.pathname === '/login';
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard');
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');

  // Allow API routes and static files
  if (isApiRoute) {
    return NextResponse.next();
  }

  // Allow OAuth callback (hash fragment)
  const referer = request.headers.get('referer') || '';
  const isGoogleCallback = referer.includes('accounts.google.com');

  if (isGoogleCallback && isDashboardRoute) {
    return NextResponse.next();
  }

  // Protect dashboard routes
  if (!sessionCookie && isDashboardRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect to dashboard if already logged in
  if (sessionCookie && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
