"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { redirect, useRouter } from "next/navigation"
import Link from "next/link"

interface Organization {
  id: string
  name: string
}

interface Article {
  id: string
  slug: string
  title: string
}

export default function CreateBrandPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [name, setName] = useState("")
  const [organizationId, setOrganizationId] = useState("")
  const [dateFounded, setDateFounded] = useState("")
  const [dateDiscontinued, setDateDiscontinued] = useState("")
  const [articleId, setArticleId] = useState("")

  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [availableArticles, setAvailableArticles] = useState<Article[]>([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    loadOrganizations()
    loadAvailableArticles()
  }, [])

  const loadOrganizations = async () => {
    try {
      const res = await fetch("/api/organizations/list")
      const data = await res.json()
      if (Array.isArray(data)) {
        setOrganizations(data)
      }
    } catch (err) {
      console.error("Failed to load organizations:", err)
    }
  }

  const loadAvailableArticles = async () => {
    try {
      const res = await fetch("/api/brands/available-articles")
      const data = await res.json()
      if (Array.isArray(data)) {
        setAvailableArticles(data)
      }
    } catch (err) {
      console.error("Failed to load articles:", err)
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
    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch("/api/brands/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          organizationId: organizationId || null,
          dateFounded: dateFounded || null,
          dateDiscontinued: dateDiscontinued || null,
          articleId: articleId || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to create brand")
      }

      setMessage({ type: "success", text: "Brand created successfully!" })
      setTimeout(() => {
        router.push("/admin/world-data/brands/manage")
      }, 1500)
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Failed to create brand" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/admin/world-data/brands" className="text-gray-500 hover:text-gray-700">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold text-orange-600">Create Brand</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          {message && (
            <div
              className={`mb-4 p-3 rounded ${
                message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="e.g., Monarch, Sterling, Regal"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parent Organization</label>
              <select
                value={organizationId}
                onChange={(e) => setOrganizationId(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">-- No parent organization --</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Founded (k.y.)</label>
                <input
                  type="date"
                  value={dateFounded}
                  onChange={(e) => setDateFounded(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Discontinued (k.y.)</label>
                <input
                  type="date"
                  value={dateDiscontinued}
                  onChange={(e) => setDateDiscontinued(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kempopedia Article</label>
              <select
                value={articleId}
                onChange={(e) => setArticleId(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">-- No article linked --</option>
                {availableArticles.map((article) => (
                  <option key={article.id} value={article.id}>
                    {article.title} ({article.slug})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Most brands won&apos;t have their own article</p>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Link
              href="/admin/world-data/brands"
              className="flex-1 text-center bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving || !name}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create Brand"}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
