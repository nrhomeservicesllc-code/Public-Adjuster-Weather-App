import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

const publicRoutes = ["/login", "/register", "/api/auth"]
const adminRoutes = ["/admin"]

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const isPublic = publicRoutes.some((r) => nextUrl.pathname.startsWith(r))
  const isAdmin = adminRoutes.some((r) => nextUrl.pathname.startsWith(r))
  const isCron = nextUrl.pathname.startsWith("/api/cron")

  if (isCron) return NextResponse.next()
  if (isPublic) return NextResponse.next()
  if (!session && !isPublic) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }
  if (isAdmin && session?.user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", nextUrl))
  }
  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
}
