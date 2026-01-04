"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { redirect } from "next/navigation"
import Link from "next/link"

interface Genre {
  id: string
  name: string
}

interface Organization {
  id: string
  name: string
}

export default function CreateSeriesPage() {
  const { data: session, status } = useSession()
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [genres, setGenres] = useState<Genre[]>([])
  const [networks, setNetworks] = useState<Organization[]>([])

  const [formData, setFormData] = useState({
    title: "",
    networkId: "",
    startYear: "",
    endYear: "",
    description: "",
    selectedGenres: [] as string[],
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [genresRes, networksRes] = await Promise.all([
        fetch("/api/genres"),
        fetch("/api/entities/organizations?orgType=network"),
      ])

      const [genresData, networksData] = await Promise.all([
        genresRes.json(),
        networksRes.json(),
      ])

      if (Array.isArray(genresData)) setGenres(genresData)
      if (Array.isArray(networksData)) setNetworks(networksData)
    } catch (err) {
      console.error("Failed to load data:", err)
    }
  }

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

  const handleGenreToggle = (genreId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedGenres: prev.selectedGenres.includes(genreId)
        ? prev.selectedGenres.filter((g) => g !== genreId)
        : [...prev.selectedGenres, genreId],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title) {
      setMessage({ type: "error", text: "Title is required" })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch("/api/series", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          networkId: formData.networkId || null,
          startYear: formData.startYear || null,
          endYear: formData.endYear || null,
          description: formData.description || null,
          genreIds: formData.selectedGenres,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to create series")
      }

      setMessage({ type: "success", text: "Series created successfully!" })
      setFormData({
        title: "",
        networkId: "",
        startYear: "",
        endYear: "",
        description: "",
        selectedGenres: [],
      })
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Failed to create series" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/admin/world-data/video/series" className="text-gray-500 hover:text-gray-700">
            ← Back
          </Link>
          <h1 className="text-xl font-bold text-indigo-600">Create New Series</h1>
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
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="e.g., The Marshal"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Network</label>
              <select
                value={formData.networkId}
                onChange={(e) => setFormData({ ...formData, networkId: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">-- Select network --</option>
                {networks.map((network) => (
                  <option key={network.id} value={network.id}>
                    {network.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Year</label>
                <input
                  type="number"
                  value={formData.startYear}
                  onChange={(e) => setFormData({ ...formData, startYear: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="1948"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Year</label>
                <input
                  type="number"
                  value={formData.endYear}
                  onChange={(e) => setFormData({ ...formData, endYear: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="1955 (leave blank if ongoing)"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
                rows={3}
                placeholder="Brief description of the series..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Genres</label>
              <div className="flex flex-wrap gap-2">
                {genres.map((genre) => (
                  <button
                    key={genre.id}
                    type="button"
                    onClick={() => handleGenreToggle(genre.id)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      formData.selectedGenres.includes(genre.id)
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {genre.name}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Creating..." : "Create Series"}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
