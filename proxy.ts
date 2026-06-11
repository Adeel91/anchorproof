import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const sessionCookie = request.cookies.get('anchorproof-session');

  const isAuthPage = url.pathname === '/login';
  const isDashboardRoute = url.pathname.startsWith('/dashboard');
  
  // API routes that require session cookie (dashboard/internal)
  const protectedApiRoutes = ['/api/keys', '/api/tenant', '/api/memwal', '/api/test'];
  const needsSession = protectedApiRoutes.some(route => url.pathname.startsWith(route));
  
  // API routes that use API key (public facing) - no session required
  const isVerifyEndpoint = url.pathname === '/api/verify';

  // Protect internal API routes
  if (needsSession && !sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify endpoint - no session check (uses API key inside the request)
  if (isVerifyEndpoint) {
    return NextResponse.next();
  }

  // Protect dashboard routes
  if (!sessionCookie && isDashboardRoute) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Redirect to dashboard if already logged in
  if (sessionCookie && isAuthPage) {
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};