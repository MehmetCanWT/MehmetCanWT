import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const adminCookie = request.cookies.get('admin_session');

  // Check if trying to access protected routes
  if (request.nextUrl.pathname.startsWith('/settings')) {
    if (!adminCookie || adminCookie.value !== 'authenticated') {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  // Hide login page if already authenticated
  if (request.nextUrl.pathname === '/login') {
    if (adminCookie && adminCookie.value === 'authenticated') {
      const url = request.nextUrl.clone();
      url.pathname = '/settings';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/settings/:path*', '/login'],
};
