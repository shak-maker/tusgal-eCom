// frontend-next/middleware.ts
import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  // Check if user is trying to access admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // For admin routes, we'll let the client-side handle authentication
    // The middleware will just pass through and let the React components handle auth
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
}
