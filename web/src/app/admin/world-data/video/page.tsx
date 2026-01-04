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
            <Link href="/admin/world-data" className="text-gray-500 hover:text-gray-700">
              ← World Data
            </Link>
            <h1 className="text-2xl font-bold text-green-600">Video Management</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Video Files */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Video Files</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Link
              href="/admin/world-data/video/upload"
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-green-300"
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">📤</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Upload New Video</h3>
                  <p className="text-gray-500 text-sm">Upload videos with type, metadata, and platform assignments</p>
                </div>
              </div>
            </Link>

            <Link
              href="/admin/world-data/video/manage"
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-green-300"
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">📁</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Manage Videos</h3>
                  <p className="text-gray-500 text-sm">View library, edit metadata, manage platforms</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* TV Series & Channels */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">TV Series & Channels</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Link
              href="/admin/world-data/video/series"
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-indigo-300"
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">📺</div>
                <div>
                  <h3 className="text-lg font-semibold text-indigo-600 mb-1">TV Series</h3>
                  <p className="text-gray-500 text-sm">Create and manage TV series for episode organization</p>
                </div>
              </div>
            </Link>

            <Link
              href="/admin/world-data/video/channels"
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-gray-300"
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">📡</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Channels & Accounts</h3>
                  <p className="text-gray-500 text-sm">
                    Manage <span className="text-red-600">KempoTube</span>,{" "}
                    <span className="text-pink-600">FlipFlop</span>,{" "}
                    <span className="text-blue-600">TV</span> channels
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Video Types</h2>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm">Movie</span>
            <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm">Trailer</span>
            <span className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm">Commercial</span>
            <span className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm">TV Episode</span>
            <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm">Online Clip</span>
          </div>
          <p className="text-gray-500 text-sm mt-3">
            Each video type has specific metadata fields. Upload or edit videos to set type-specific details.
          </p>
        </div>
      </main>
    </div>
  )
}
