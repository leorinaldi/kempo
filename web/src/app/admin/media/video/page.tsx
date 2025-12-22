"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"

export default function VideoLandingPage() {
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
            <Link href="/admin/media" className="text-gray-500 hover:text-gray-700">
              ← Media
            </Link>
            <h1 className="text-2xl font-bold text-green-600">Video Management</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-6">
          <Link
            href="/admin/media/video/upload"
            className="bg-white rounded-lg shadow p-8 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-green-300"
          >
            <div className="text-center">
              <div className="text-4xl mb-4">📤</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Upload New Video</h2>
              <p className="text-gray-500">Upload new video files to the library</p>
            </div>
          </Link>

          <Link
            href="/admin/media/video/manage"
            className="bg-white rounded-lg shadow p-8 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-green-300"
          >
            <div className="text-center">
              <div className="text-4xl mb-4">📁</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Manage Existing Files</h2>
              <p className="text-gray-500">View library, edit files, and manage TV playlist</p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  )
}
