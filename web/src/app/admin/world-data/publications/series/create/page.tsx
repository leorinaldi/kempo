"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { redirect } from "next/navigation"
import Link from "next/link"

interface Organization {
  id: string
  name: string
}

interface Article {
  id: string
  title: string
}

const TYPES = [
  { value: "newspaper", label: "Newspaper" },
  { value: "magazine", label: "Magazine" },
  { value: "comic", label: "Comic Book" },
  { value: "book", label: "Book Series" },
]

const FREQUENCIES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Biweekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annual", label: "Annual" },
  { value: "irregular", label: "Irregular" },
]

export default function CreatePublicationSeriesPage() {
  const { data: session, status } = useSession()
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [publishers, setPublishers] = useState<Organization[]>([])
  const [articles, setArticles] = useState<Article[]>([])

  const [formData, setFormData] = useState({
    name: "",
    type: "newspaper",
    publisherId: "",
    frequency: "",
    startKyDate: "",
    endKyDate: "",
    description: "",
    articleId: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [publishersRes, articlesRes] = await Promise.all([
        fetch("/api/entities/organizations?orgType=publisher"),
        fetch("/api/entities/publicationSeries/available-articles"),
      ])

      const [publishersData, articlesData] = await Promise.all([
        publishersRes.json(),
        articlesRes.json(),
      ])

      if (Array.isArray(publishersData)) setPublishers(publishersData)
      if (Array.isArray(articlesData)) setArticles(articlesData)
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

    if (!formData.name) {
      setMessage({ type: "error", text: "Name is required" })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch("/api/entities/publicationSeries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          type: formData.type,
          publisherId: formData.publisherId || null,
          frequency: formData.frequency || null,
          startKyDate: formData.startKyDate || null,
          endKyDate: formData.endKyDate || null,
          description: formData.description || null,
          articleId: formData.articleId || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to create publication series")
      }

      setMessage({ type: "success", text: "Publication series created successfully!" })
      setFormData({
        name: "",
        type: "newspaper",
        publisherId: "",
        frequency: "",
        startKyDate: "",
        endKyDate: "",
        description: "",
        articleId: "",
      })
      // Reload articles to reflect new available articles
      loadData()
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Failed to create publication series" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/admin/world-data/publications/series" className="text-gray-500 hover:text-gray-700">
            ← Back
          </Link>
          <h1 className="text-xl font-bold text-cyan-600">Create Publication Series</h1>
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
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="e.g., Detroit Sentinel, Athlete Magazine"
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Publisher</label>
              <select
                value={formData.publisherId}
                onChange={(e) => setFormData({ ...formData, publisherId: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">-- Select publisher --</option>
                {publishers.map((pub) => (
                  <option key={pub.id} value={pub.id}>
                    {pub.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">-- Select frequency --</option>
                {FREQUENCIES.map((freq) => (
                  <option key={freq.value} value={freq.value}>
                    {freq.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date (k.y.)</label>
                <input
                  type="date"
                  value={formData.startKyDate}
                  onChange={(e) => setFormData({ ...formData, startKyDate: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date (k.y.)</label>
                <input
                  type="date"
                  value={formData.endKyDate}
                  onChange={(e) => setFormData({ ...formData, endKyDate: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
                <p className="text-xs text-gray-500 mt-1">Leave blank if ongoing</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kempopedia Article</label>
              <select
                value={formData.articleId}
                onChange={(e) => setFormData({ ...formData, articleId: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">-- No linked article --</option>
                {articles.map((article) => (
                  <option key={article.id} value={article.id}>
                    {article.title}
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
                placeholder="Brief description of the publication..."
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Creating..." : "Create Publication Series"}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
