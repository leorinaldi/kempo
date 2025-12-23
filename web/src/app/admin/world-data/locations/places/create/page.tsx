"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { redirect, useRouter } from "next/navigation"
import Link from "next/link"

interface Article {
  id: string
  
  title: string
}

interface City {
  id: string
  name: string
  state: { name: string; nation: { name: string } }
}

interface Place {
  id: string
  name: string
  placeType: string
}

const PLACE_TYPES = [
  { value: "neighborhood", label: "Neighborhood" },
  { value: "building", label: "Building" },
  { value: "landmark", label: "Landmark" },
  { value: "casino", label: "Casino" },
  { value: "studio", label: "Studio" },
  { value: "park", label: "Park" },
  { value: "restaurant", label: "Restaurant" },
  { value: "hotel", label: "Hotel" },
  { value: "theater", label: "Theater" },
  { value: "museum", label: "Museum" },
  { value: "airport", label: "Airport" },
  { value: "station", label: "Station" },
  { value: "other", label: "Other" },
]

export default function CreatePlacePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [placesInCity, setPlacesInCity] = useState<Place[]>([])

  const [formData, setFormData] = useState({
    name: "",
    placeType: "building",
    cityId: "",
    parentPlaceId: "",
    address: "",
    dateOpened: "",
    dateClosed: "",
    articleId: "",
  })

  useEffect(() => {
    Promise.all([
      fetch("/api/places/available-articles"),
      fetch("/api/cities/list")
    ])
      .then(async ([articlesRes, citiesRes]) => {
        const articlesData = await articlesRes.json()
        const citiesData = await citiesRes.json()
        if (Array.isArray(articlesData)) setArticles(articlesData)
        if (Array.isArray(citiesData)) setCities(citiesData)
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (formData.cityId) {
      fetch(`/api/cities/${formData.cityId}/places`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            // Only show neighborhoods as potential parents
            setPlacesInCity(data.filter((p: Place) => p.placeType === "neighborhood"))
          }
        })
        .catch(console.error)
    } else {
      setPlacesInCity([])
    }
  }, [formData.cityId])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name) {
      setMessage({ type: "error", text: "Name is required" })
      return
    }

    if (!formData.cityId) {
      setMessage({ type: "error", text: "City is required" })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch("/api/places/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          placeType: formData.placeType,
          cityId: formData.cityId,
          parentPlaceId: formData.parentPlaceId || null,
          address: formData.address || null,
          dateOpened: formData.dateOpened || null,
          dateClosed: formData.dateClosed || null,
          articleId: formData.articleId || null,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to create place")
      }

      setMessage({ type: "success", text: "Place created successfully!" })

      setFormData({
        name: "",
        placeType: "building",
        cityId: formData.cityId,
        parentPlaceId: "",
        address: "",
        dateOpened: "",
        dateClosed: "",
        articleId: "",
      })

      setTimeout(() => {
        router.push("/admin/world-data/locations/places/manage")
      }, 1500)
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Failed to create place" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/admin/world-data/locations/places" className="text-gray-500 hover:text-gray-700">
            ← Back
          </Link>
          <h1 className="text-xl font-bold text-emerald-600">Create New Place</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          {message && (
            <div
              className={`mb-4 p-3 rounded ${
                message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.cityId}
                onChange={(e) => setFormData({ ...formData, cityId: e.target.value, parentPlaceId: "" })}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">-- Select City --</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}, {city.state.name} ({city.state.nation.name})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="e.g., The Oasis Casino"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.placeType}
                  onChange={(e) => setFormData({ ...formData, placeType: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  {PLACE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {placesInCity.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Within Neighborhood (optional)
                </label>
                <select
                  value={formData.parentPlaceId}
                  onChange={(e) => setFormData({ ...formData, parentPlaceId: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">-- Not in a neighborhood --</option>
                  {placesInCity.map((place) => (
                    <option key={place.id} value={place.id}>
                      {place.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="e.g., 742 Sunset Boulevard"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Opened (k.y.)
                </label>
                <input
                  type="date"
                  value={formData.dateOpened}
                  onChange={(e) => setFormData({ ...formData, dateOpened: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Closed (k.y.)
                </label>
                <input
                  type="date"
                  value={formData.dateClosed}
                  onChange={(e) => setFormData({ ...formData, dateClosed: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
                <p className="text-xs text-gray-500 mt-1">Leave blank if still open</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link to Kempopedia Article
              </label>
              <select
                value={formData.articleId}
                onChange={(e) => setFormData({ ...formData, articleId: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">-- No article linked --</option>
                {articles.map((article) => (
                  <option key={article.id} value={article.id}>
                    {article.title}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Creating..." : "Create Place"}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
