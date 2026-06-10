import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();

  const sessionCookie = request.cookies.get('anchorproof-session');

  const isAuthPage = url.pathname === '/login';
  const isCallbackPage = url.pathname === '/auth-callback';
  const isDashboardRoute = url.pathname.startsWith('/dashboard');

  if (isCallbackPage) {
    return NextResponse.next();
  }

  if (!sessionCookie && isDashboardRoute) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (sessionCookie && isAuthPage) {
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
