import { NextRequest, NextResponse } from 'next/server';

export async function proxy(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  // runtime: 'nodejs',https://nextjs.org/docs/messages/middleware-to-proxy

  matcher: [
    // Exclude API routes, static files, image optimizations, and .png files
    '/((?!api|favicon.ico|_next/static|_next/image|.*\\.png$).*)',
  ],
};
