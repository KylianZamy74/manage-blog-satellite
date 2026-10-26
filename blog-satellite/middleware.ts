import { NextResponse, type NextRequest } from "next/server"

// Edge middleware (Node middleware is not supported on Cloudflare): optimistic check on the
// session cookie only. Real checks happen server-side: auth() in pages/actions, role in admin layout.
const SESSION_COOKIES = ["authjs.session-token", "__Secure-authjs.session-token"]

export default function middleware(req: NextRequest) {
  const hasSession = SESSION_COOKIES.some((name) => req.cookies.has(name))

  if (!hasSession && !req.nextUrl.pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/login", req.nextUrl.origin))
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
