import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoginRoute = req.nextUrl.pathname === "/login"
  const isApiAuthRoute = req.nextUrl.pathname.startsWith("/api/auth")
  const isAuthenticated = !!req.auth

  // Allow login page and auth API routes always
  if (isLoginRoute || isApiAuthRoute) {
    return NextResponse.next()
  }

  // Protect ALL other routes - redirect to login if not authenticated
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
})

export const config = {
  // Match all routes except static files and images
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp3|mp4|wav)$).*)",
  ],
}
