"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"

export default function LocationsLandingPage() {
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
            <h1 className="text-2xl font-bold text-emerald-600">Locations Management</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Map Link */}
        <div className="mb-6">
          <Link
            href="/admin/world-data/locations/map"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <span>🗺️</span>
            <span>View All Locations on Map</span>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Nations Card */}
          <Link
            href="/admin/world-data/locations/nations"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-emerald-300"
          >
            <div className="text-center">
              <div className="text-4xl mb-3">🌍</div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Nations</h2>
              <p className="text-gray-500 text-sm">Countries and territories</p>
            </div>
          </Link>

          {/* States Card */}
          <Link
            href="/admin/world-data/locations/states"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-emerald-300"
          >
            <div className="text-center">
              <div className="text-4xl mb-3">🗺️</div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">States</h2>
              <p className="text-gray-500 text-sm">States, provinces, regions</p>
            </div>
          </Link>

          {/* Cities Card */}
          <Link
            href="/admin/world-data/locations/cities"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-emerald-300"
          >
            <div className="text-center">
              <div className="text-4xl mb-3">🏙️</div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Cities</h2>
              <p className="text-gray-500 text-sm">Cities, towns, villages</p>
            </div>
          </Link>

          {/* Places Card */}
          <Link
            href="/admin/world-data/locations/places"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-emerald-300"
          >
            <div className="text-center">
              <div className="text-4xl mb-3">📍</div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Places</h2>
              <p className="text-gray-500 text-sm">Buildings, landmarks, neighborhoods</p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  )
}
