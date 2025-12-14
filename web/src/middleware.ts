import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin")
  const isLoginRoute = req.nextUrl.pathname === "/login"
  const isAuthenticated = !!req.auth

  // Allow login page always
  if (isLoginRoute) {
    return NextResponse.next()
  }

  // Protect admin routes
  if (isAdminRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/admin/:path*", "/login"],
}
