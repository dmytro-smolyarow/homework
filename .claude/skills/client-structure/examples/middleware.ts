import { NextRequest, NextResponse } from 'next/server'

import { ECookieKey, E<Route> } from '@/app/shared/interfaces/<name>.interface'
import { envServer } from '@/config/env'
import { authServer } from '@/pkg/<auth>/auth.server'

// middleware — single file at src/ root, owns locale routing, auth gates, session cookies
export default async function proxy(req: NextRequest) {
  // (api) passthrough: inject the shared secret then exit
  if (req.nextUrl.pathname.startsWith('/api/')) {
    const headers = new Headers(req.headers)
    headers.set('<x-header-name>', envServer.<HEADER_SECRET>)
    return NextResponse.next({ request: { headers } })
  }

  const res = NextResponse.next()

  // session cookie — set once per visitor
  const sessionId = req.cookies.get(ECookieKey.SESSION_ID)?.value
  if (!sessionId) {
    res.cookies.set(ECookieKey.SESSION_ID, crypto.randomUUID(), {
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
    })
  }

  // private route gate
  const isPrivate = req.nextUrl.pathname.startsWith(E<Route>.PRIVATE)
  if (isPrivate) {
    const session = await authServer.getCacheSession()
    if (!session?.user) {
      return NextResponse.redirect(new URL(E<Route>.SIGN_IN, req.url))
    }
  }

  return res
}

// config
export const config = {
  matcher: ['/((?!_next|_next/static|_next/image|.*\\.svg$|.*\\.png$|.*\\.jpg$|.*\\.ico$).*)'],
}
