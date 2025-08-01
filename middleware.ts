import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  if (pathname.startsWith('/bibles')) {
    let bibleSearchParams: any = pathname.split('/bibles')[1].replace('/', '')
    const fontSize: any = Number(searchParams.get('fontSize')) || Number(request.cookies.get('fontSize')?.value) || 20
    const response = NextResponse.next()

    // If no search params in URL
    if (!bibleSearchParams) {
      // Try to get from cookie
      bibleSearchParams = request.cookies.get('bibleSearchParams')?.value

      // If not in cookie, use default
      if (!bibleSearchParams) {
        bibleSearchParams = 'genesis.1.ko.none'
      }

      // Redirect to URL with params
      return NextResponse.redirect(
        new URL(`/bibles/${bibleSearchParams}${fontSize ? `?fontSize=${fontSize}` : ''}`, request.url)
      )
    }

    // Set cookie with current params
    response.cookies.set('fontSize', fontSize?.toString(), {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/'
    })
    response.cookies.set('bibleSearchParams', bibleSearchParams, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/'
    })

    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/bibles/:path*']
}