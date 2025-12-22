import { auth } from "@/auth"
import { NextResponse } from "next/server"

// Cache the auth setting to avoid API calls on every request
let cachedAuthRequired: boolean | null = null
let cacheTime = 0
const CACHE_TTL = 10000 // 10 seconds

async function isAuthRequired(baseUrl: string): Promise<boolean> {
  // Check env variable first (allows override)
  if (process.env.AUTH_REQUIRED === "false") {
    return false
  }

  // Use cached value if fresh
  if (cachedAuthRequired !== null && Date.now() - cacheTime < CACHE_TTL) {
    return cachedAuthRequired
  }

  try {
    // Call internal API route (Prisma doesn't work in Edge middleware)
    const res = await fetch(`${baseUrl}/api/auth-required`)
    const data = await res.json()
    cachedAuthRequired = data.required === true
    cacheTime = Date.now()
    return cachedAuthRequired
  } catch {
    // If API fails, default to requiring auth
    return true
  }
}

export default auth(async (req) => {
  const isLoginRoute = req.nextUrl.pathname === "/login"
  const isApiAuthRoute = req.nextUrl.pathname.startsWith("/api/auth")
  const isAuthRequiredRoute = req.nextUrl.pathname === "/api/auth-required"
  const isAuthenticated = !!req.auth

  // Allow login page, auth API routes, and auth-required check always
  if (isLoginRoute || isApiAuthRoute || isAuthRequiredRoute) {
    return NextResponse.next()
  }

  // Check if auth is required
  const baseUrl = req.nextUrl.origin
  const authRequired = await isAuthRequired(baseUrl)
  if (!authRequired) {
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
