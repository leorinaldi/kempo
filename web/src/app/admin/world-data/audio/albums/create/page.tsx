"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { redirect, useRouter } from "next/navigation"
import Link from "next/link"

interface Article {
  id: string
  slug: string
  title: string
}

interface Person {
  id: string
  firstName: string
  lastName: string
  nickname: string | null
}

export default function CreateAlbumPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [artists, setArtists] = useState<Person[]>([])

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    artistId: "",
    kyDate: "",
    articleId: "",
  })

  useEffect(() => {
    // Fetch available articles and artists
    Promise.all([
      fetch("/api/albums/available-articles").then((res) => res.json()),
      fetch("/api/people/list").then((res) => res.json()),
    ])
      .then(([articlesData, peopleData]) => {
        if (Array.isArray(articlesData)) {
          setArticles(articlesData)
        }
        if (Array.isArray(peopleData)) {
          setArtists(peopleData)
        }
      })
      .catch(console.error)
  }, [])

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

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
  }

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.slug) {
      setMessage({ type: "error", text: "Name and slug are required" })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch("/api/albums/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          artistId: formData.artistId || null,
          kyDate: formData.kyDate || null,
          articleId: formData.articleId || null,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to create album")
      }

      setMessage({ type: "success", text: "Album created successfully!" })

      // Reset form
      setFormData({
        name: "",
        slug: "",
        artistId: "",
        kyDate: "",
        articleId: "",
      })

      // Redirect to manage page after a moment
      setTimeout(() => {
        router.push("/admin/world-data/audio/albums/manage")
      }, 1500)
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Failed to create album" })
    } finally {
      setSaving(false)
    }
  }

  const formatArtistName = (artist: Person) => {
    return `${artist.nickname || artist.firstName} ${artist.lastName}`
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/admin/world-data/audio" className="text-gray-500 hover:text-gray-700">
            ← Back
          </Link>
          <h1 className="text-xl font-bold text-amber-600">Create New Album</h1>
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
                Album Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="e.g., A Martino Christmas"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="e.g., a-martino-christmas"
              />
              <p className="text-xs text-gray-500 mt-1">Auto-generated from name, but you can edit it</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Artist
              </label>
              <select
                value={formData.artistId}
                onChange={(e) => setFormData({ ...formData, artistId: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">-- No artist --</option>
                {artists
                  .sort((a, b) => a.lastName.localeCompare(b.lastName))
                  .map((artist) => (
                    <option key={artist.id} value={artist.id}>
                      {formatArtistName(artist)}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Release Date (k.y.)
              </label>
              <input
                type="date"
                value={formData.kyDate}
                onChange={(e) => setFormData({ ...formData, kyDate: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
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
                    {article.title} ({article.slug})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Only unlinked media articles are shown</p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Creating..." : "Create Album"}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
