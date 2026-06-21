import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const sessionCookie = request.cookies.get('anchorproof-session');

  const isAuthPage = url.pathname === '/login';
  const isDashboardRoute = url.pathname.startsWith('/dashboard');

  const chatRoutes = ['/api/chat/send', '/api/chat/save'];
  const isChatRoute = chatRoutes.some((route) => url.pathname === route);

  const isTenantRoute = url.pathname === '/api/tenant/current';

  const isTestRoute = url.pathname === '/api/test/db';

  const protectedApiRoutes = [
    '/api/audit',
    '/api/keys',
    '/api/chat/list',
    '/api/walrus/list',
    '/api/walrus/blob',
    '/api/walrus/verify',
    '/api/users/list',
    '/api/tenant/update',
    '/api/reports',
  ];
  const needsSession = protectedApiRoutes.some((route) =>
    url.pathname.startsWith(route)
  );

  if (isChatRoute || isTenantRoute || isTestRoute) {
    return NextResponse.next();
  }

  if (needsSession && !sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
