import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Allow public access to API routes (they handle their own auth)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Allow public access to feed viewing pages (username/feedTitle format)
  if (
    pathname.startsWith('/feeds/') && 
    !pathname.startsWith('/feeds/new') &&
    pathname.split('/').length === 4 // /feeds/[username]/[feedTitle]
  ) {
    return NextResponse.next()
  }

  // Allow public access to login page, home, and documentation pages
  if (
    pathname === '/' || 
    pathname.startsWith('/login') || 
    pathname.startsWith('/auth') ||
    pathname === '/docs' ||
    pathname === '/what-is-feeds' ||
    pathname === '/how-to-create-feeds'
  ) {
    return NextResponse.next()
  }

  // For all other routes, require authentication
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

