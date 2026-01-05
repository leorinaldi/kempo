"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"

export default function PublicationsLandingPage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!session) {
    redirect("/login")
  }

  if (!session.user.isAdmin) {
    redirect("/admin")
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/admin/world-data" className="text-gray-500 hover:text-gray-700">
            ← Back
          </Link>
          <h1 className="text-xl font-bold text-cyan-600">Publications</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-gray-600 mb-8">
          Manage newspapers, magazines, comic books, and books in the Kempo universe.
        </p>

        <div className="grid grid-cols-2 gap-6">
          <Link
            href="/admin/world-data/publications/series"
            className="block p-8 bg-white rounded-lg shadow hover:shadow-md transition-shadow border-2 border-transparent hover:border-cyan-200"
          >
            <h2 className="text-lg font-semibold text-cyan-600 mb-2">Publication Series</h2>
            <p className="text-gray-600 text-sm">
              Manage ongoing publications like newspapers, magazines, and comic series
            </p>
          </Link>

          <Link
            href="/admin/world-data/publications/issues"
            className="block p-8 bg-white rounded-lg shadow hover:shadow-md transition-shadow border-2 border-transparent hover:border-cyan-200"
          >
            <h2 className="text-lg font-semibold text-cyan-600 mb-2">Individual Issues</h2>
            <p className="text-gray-600 text-sm">
              Manage specific issues, editions, and standalone books
            </p>
          </Link>
        </div>
      </main>
    </div>
  )
}
