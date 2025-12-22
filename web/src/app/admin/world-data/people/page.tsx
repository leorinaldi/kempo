"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"

export default function PeopleLandingPage() {
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/world-data" className="text-gray-500 hover:text-gray-700">
              ← World Data
            </Link>
            <h1 className="text-2xl font-bold text-purple-600">People Management</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-6">
          <Link
            href="/admin/world-data/people/create"
            className="bg-white rounded-lg shadow p-8 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-purple-300"
          >
            <div className="text-center">
              <div className="text-4xl mb-4">➕</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Create New Person</h2>
              <p className="text-gray-500">Add a new person to the Kempo universe</p>
            </div>
          </Link>

          <Link
            href="/admin/world-data/people/manage"
            className="bg-white rounded-lg shadow p-8 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-purple-300"
          >
            <div className="text-center">
              <div className="text-4xl mb-4">👥</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Manage Existing People</h2>
              <p className="text-gray-500">View, edit, and delete people</p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  )
}
