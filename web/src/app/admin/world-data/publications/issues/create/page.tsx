"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { redirect } from "next/navigation"
import Link from "next/link"

interface Organization {
  id: string
  name: string
}

interface PublicationSeries {
  id: string
  name: string
}

interface Image {
  id: string
  name: string
  url: string
}

const TYPES = [
  { value: "newspaper", label: "Newspaper" },
  { value: "magazine", label: "Magazine" },
  { value: "comic", label: "Comic Book" },
  { value: "book", label: "Book" },
]

const GENRES = [
  // Fiction
  { group: "Fiction", value: "literary_fiction", label: "Literary & Contemporary Fiction" },
  { group: "Fiction", value: "historical_fiction", label: "Historical Fiction" },
  { group: "Fiction", value: "science_fiction_fantasy", label: "Science Fiction & Fantasy" },
  { group: "Fiction", value: "mystery_crime_thriller", label: "Mystery, Crime & Thriller" },
  { group: "Fiction", value: "romance", label: "Romance" },
  { group: "Fiction", value: "horror", label: "Horror" },
  { group: "Fiction", value: "adventure_action", label: "Adventure & Action" },
  { group: "Fiction", value: "children_young_adult", label: "Children's & Young Adult Fiction" },
  // Nonfiction
  { group: "Nonfiction", value: "biography_memoir", label: "Biography & Memoir" },
  { group: "Nonfiction", value: "history_politics_society", label: "History, Politics & Society" },
  { group: "Nonfiction", value: "science_nature_technology", label: "Science, Nature & Technology" },
  { group: "Nonfiction", value: "philosophy_religion_mythology", label: "Philosophy, Religion & Mythology" },
  { group: "Nonfiction", value: "business_economics_psychology", label: "Business, Economics & Psychology" },
  { group: "Nonfiction", value: "arts_culture", label: "Arts & Culture" },
  { group: "Nonfiction", value: "current_affairs_journalism", label: "Current Affairs & Journalism" },
]

export default function CreatePublicationPage() {
  const { data: session, status } = useSession()
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [seriesList, setSeriesList] = useState<PublicationSeries[]>([])
  const [publishers, setPublishers] = useState<Organization[]>([])
  const [images, setImages] = useState<Image[]>([])

  const [formData, setFormData] = useState({
    title: "",
    type: "newspaper",
    seriesId: "",
    publisherId: "",
    kyDate: "",
    coverImageId: "",
    pageCount: "",
    description: "",
    genre: "",
    volume: "",
    issueNumber: "",
    edition: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [seriesRes, publishersRes, imagesRes] = await Promise.all([
        fetch("/api/entities/publicationSeries"),
        fetch("/api/entities/organizations?orgType=publisher"),
        fetch("/api/image/list"),
      ])

      const [seriesData, publishersData, imagesData] = await Promise.all([
        seriesRes.json(),
        publishersRes.json(),
        imagesRes.json(),
      ])

      if (Array.isArray(seriesData)) setSeriesList(seriesData)
      if (Array.isArray(publishersData)) setPublishers(publishersData)
      if (Array.isArray(imagesData)) setImages(imagesData)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.type) {
      setMessage({ type: "error", text: "Title and type are required" })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch("/api/entities/publications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          type: formData.type,
          seriesId: formData.seriesId || null,
          publisherId: formData.publisherId || null,
          kyDate: formData.kyDate || null,
          coverImageId: formData.coverImageId || null,
          pageCount: formData.pageCount ? parseInt(formData.pageCount) : null,
          description: formData.description || null,
          genre: formData.genre || null,
          volume: formData.volume ? parseInt(formData.volume) : null,
          issueNumber: formData.issueNumber ? parseInt(formData.issueNumber) : null,
          edition: formData.edition || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to create publication")
      }

      setMessage({ type: "success", text: "Publication created successfully!" })
      setFormData({
        title: "",
        type: "newspaper",
        seriesId: "",
        publisherId: "",
        kyDate: "",
        coverImageId: "",
        pageCount: "",
        description: "",
        genre: "",
        volume: "",
        issueNumber: "",
        edition: "",
      })
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Failed to create publication" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/admin/world-data/publications/issues" className="text-gray-500 hover:text-gray-700">
            ← Back
          </Link>
          <h1 className="text-xl font-bold text-cyan-600">Create Publication</h1>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="e.g., January 15, 1950 Issue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  {TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Series</label>
              <select
                value={formData.seriesId}
                onChange={(e) => setFormData({ ...formData, seriesId: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">-- Standalone publication --</option>
                {seriesList.map((series) => (
                  <option key={series.id} value={series.id}>
                    {series.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Publisher (override)</label>
                <select
                  value={formData.publisherId}
                  onChange={(e) => setFormData({ ...formData, publisherId: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">-- Use series publisher --</option>
                  {publishers.map((pub) => (
                    <option key={pub.id} value={pub.id}>
                      {pub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Publication Date (k.y.)</label>
                <input
                  type="date"
                  value={formData.kyDate}
                  onChange={(e) => setFormData({ ...formData, kyDate: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Volume</label>
                <input
                  type="number"
                  value={formData.volume}
                  onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="e.g., 12"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issue Number</label>
                <input
                  type="number"
                  value={formData.issueNumber}
                  onChange={(e) => setFormData({ ...formData, issueNumber: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="e.g., 45"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Edition</label>
                <input
                  type="text"
                  value={formData.edition}
                  onChange={(e) => setFormData({ ...formData, edition: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="e.g., Morning, Sunday"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                <select
                  value={formData.genre}
                  onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">-- Select genre --</option>
                  <optgroup label="Fiction">
                    {GENRES.filter((g) => g.group === "Fiction").map((g) => (
                      <option key={g.value} value={g.value}>
                        {g.label}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Nonfiction">
                    {GENRES.filter((g) => g.group === "Nonfiction").map((g) => (
                      <option key={g.value} value={g.value}>
                        {g.label}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Page Count</label>
                <input
                  type="number"
                  value={formData.pageCount}
                  onChange={(e) => setFormData({ ...formData, pageCount: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="e.g., 64"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
              <select
                value={formData.coverImageId}
                onChange={(e) => setFormData({ ...formData, coverImageId: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">-- No cover image --</option>
                {images.map((img) => (
                  <option key={img.id} value={img.id}>
                    {img.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
                rows={3}
                placeholder="Brief description or summary..."
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Creating..." : "Create Publication"}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
