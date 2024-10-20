import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt'; // We still need to use getToken

export { default } from 'next-auth/middleware';

// Define the protected paths
export const config = {
  matcher: ['/dashboard/:path*', '/signIn', '/signUp', '/', '/verify/:path*'],
};

export async function middleware(request: NextRequest) {
  // Use getToken to retrieve the JWT token (contains user info)
  const token = await getToken({ req: request, secret: process.env.NEXT_AUTH_SECRET });
  const url = request.nextUrl;

  // Extract user info if the token exists
  const user = token?.user;

  // If user is authenticated and trying to access sign-in, sign-up, or verify, redirect to dashboard
  if (
    token &&
    (url.pathname.startsWith('/signIn') ||
      url.pathname.startsWith('/signUp') ||
      url.pathname.startsWith('/verify') ||
      url.pathname === '/')
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If the user is not authenticated and trying to access dashboard, redirect to signIn
  if (!token && url.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/signIn', request.url));
  }

  // Allow the request to proceed normally
  return NextResponse.next();
}
