import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

const PUBLIC_PATHS = ["/", "/login", "/register", "/api/auth"]

export default auth((req) => {
  const { pathname } = req.nextUrl

  // Allow public paths and all /api/auth sub-routes
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith("/api/auth"))) {
    return NextResponse.next()
  }

  // Allow API cron routes (secured by CRON_SECRET header, not session)
  if (pathname.startsWith("/api/cron")) {
    return NextResponse.next()
  }

  // Redirect unauthenticated users to login
  if (!req.auth) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", req.url)
    return NextResponse.redirect(loginUrl)
  }

  // Protect /admin — only ADMIN role
  if (pathname.startsWith("/admin") && req.auth.user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/map", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Match all paths except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
}
