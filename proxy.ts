import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const sessionCookie = request.cookies.get('anchorproof-session');

  const isAuthPage = url.pathname === '/login';
  const isDashboardRoute = url.pathname.startsWith('/dashboard');

  const protectedApiRoutes = [
    '/api/keys',
    '/api/tenant',
    '/api/chat',
    '/api/walrus/list',
    '/api/walrus/blob',
    '/api/walrus/verify',
  ];
  const needsSession = protectedApiRoutes.some((route) =>
    url.pathname.startsWith(route)
  );

  const isVerifyEndpoint = url.pathname === '/api/verify';
  const isChatSendEndpoint = url.pathname === '/api/chat/send';
  const isChatMessagesEndpoint = url.pathname === '/api/chat/messages';

  if (isVerifyEndpoint || isChatSendEndpoint || isChatMessagesEndpoint) {
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
