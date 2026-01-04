"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"

export default function SeriesLandingPage() {
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
          <Link href="/admin/world-data/video" className="text-gray-500 hover:text-gray-700">
            ← Back
          </Link>
          <h1 className="text-xl font-bold text-indigo-600">TV Series</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 gap-6">
          <Link
            href="/admin/world-data/video/series/create"
            className="block p-8 bg-white rounded-lg shadow hover:shadow-md transition-shadow border-2 border-transparent hover:border-indigo-200"
          >
            <h2 className="text-lg font-semibold text-indigo-600 mb-2">Create Series</h2>
            <p className="text-gray-600 text-sm">Add a new TV series to the database</p>
          </Link>

          <Link
            href="/admin/world-data/video/series/manage"
            className="block p-8 bg-white rounded-lg shadow hover:shadow-md transition-shadow border-2 border-transparent hover:border-indigo-200"
          >
            <h2 className="text-lg font-semibold text-indigo-600 mb-2">Manage Series</h2>
            <p className="text-gray-600 text-sm">View, edit, and delete existing series</p>
          </Link>
        </div>
      </main>
    </div>
  )
}
