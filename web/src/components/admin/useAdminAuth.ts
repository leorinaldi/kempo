"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"

/**
 * Hook for admin page authentication.
 * Handles loading state, redirects unauthenticated users to login,
 * and redirects non-admin users to /admin.
 *
 * @returns The authenticated admin session
 */
export function useAdminAuth() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return { session: null, isLoading: true }
  }

  if (!session) {
    redirect("/login")
  }

  if (!session.user.isAdmin) {
    redirect("/admin")
  }

  return { session, isLoading: false }
}
