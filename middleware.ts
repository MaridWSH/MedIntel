import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected routes that require authentication
  const protectedRoutes = ['/account'];

  const isProtected = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );

  if (isProtected) {
    // Check for auth token cookie or header
    // Since we use localStorage for tokens (client-side), we can't check server-side
    // Instead, we let the page handle auth state and redirect client-side
    // For true server-side protection, we'd need httpOnly cookies
    // For now, we just ensure the page exists and let client-side auth handle it
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/account/:path*'],
};
