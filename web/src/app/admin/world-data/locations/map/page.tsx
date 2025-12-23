"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { redirect } from "next/navigation"
import Link from "next/link"
import dynamic from "next/dynamic"

// Dynamically import the map component to avoid SSR issues with Leaflet
const LocationMap = dynamic(
  () => import("./LocationMap"),
  { ssr: false }
)

interface Nation {
  id: string
  name: string
  shortCode: string | null
  lat: number
  long: number
  article: { slug: string } | null
}

interface State {
  id: string
  name: string
  abbreviation: string | null
  lat: number
  long: number
  nation: { name: string }
  article: { slug: string } | null
}

interface City {
  id: string
  name: string
  cityType: string
  lat: number
  long: number
  state: { name: string; nation: { name: string } }
  article: { slug: string } | null
}

interface Place {
  id: string
  name: string
  placeType: string
  lat: number
  long: number
  city: { name: string; state: { name: string } }
  article: { slug: string } | null
}

interface LocationData {
  nations: Nation[]
  states: State[]
  cities: City[]
  places: Place[]
}

export default function LocationMapPage() {
  const { data: session, status } = useSession()
  const [locations, setLocations] = useState<LocationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    nations: true,
    states: true,
    cities: true,
    places: true,
  })

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/locations/all")
        .then((res) => res.json())
        .then((data) => {
          if (data.nations && data.states && data.cities && data.places) {
            setLocations(data)
          } else {
            console.error("Invalid response:", data)
          }
          setLoading(false)
        })
        .catch((err) => {
          console.error("Failed to load locations:", err)
          setLoading(false)
        })
    }
  }, [status])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Checking session...</p>
      </div>
    )
  }

  if (!session) {
    redirect("/login")
  }

  if (!session.user.isAdmin) {
    redirect("/admin")
  }

  const totalLocations = locations?.nations && locations?.states && locations?.cities && locations?.places
    ? (filters.nations ? locations.nations.length : 0) +
      (filters.states ? locations.states.length : 0) +
      (filters.cities ? locations.cities.length : 0) +
      (filters.places ? locations.places.length : 0)
    : 0

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/world-data/locations" className="text-gray-500 hover:text-gray-700">
              ← Locations
            </Link>
            <h1 className="text-2xl font-bold text-emerald-600">Location Map</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          {/* Filter controls */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <span className="text-sm font-medium text-gray-700">Show:</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.nations}
                onChange={(e) => setFilters({ ...filters, nations: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">
                <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-1"></span>
                Nations ({locations?.nations?.length ?? 0})
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.states}
                onChange={(e) => setFilters({ ...filters, states: e.target.checked })}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm">
                <span className="inline-block w-3 h-3 rounded-full bg-indigo-500 mr-1"></span>
                States ({locations?.states?.length ?? 0})
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.cities}
                onChange={(e) => setFilters({ ...filters, cities: e.target.checked })}
                className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
              />
              <span className="text-sm">
                <span className="inline-block w-3 h-3 rounded-full bg-cyan-500 mr-1"></span>
                Cities ({locations?.cities?.length ?? 0})
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.places}
                onChange={(e) => setFilters({ ...filters, places: e.target.checked })}
                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm">
                <span className="inline-block w-3 h-3 rounded-full bg-emerald-500 mr-1"></span>
                Places ({locations?.places?.length ?? 0})
              </span>
            </label>
            <span className="text-sm text-gray-500 ml-auto">
              Showing {totalLocations} locations
            </span>
          </div>

          {/* Map */}
          {loading ? (
            <div className="h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Loading locations...</p>
            </div>
          ) : locations?.nations && locations?.states && locations?.cities && locations?.places ? (
            <LocationMap locations={locations} filters={filters} />
          ) : (
            <div className="h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-red-500">Failed to load locations</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
