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

interface Nation {
  id: string
  name: string
}

const STATE_TYPES = [
  { value: "state", label: "State" },
  { value: "province", label: "Province" },
  { value: "territory", label: "Territory" },
  { value: "region", label: "Region" },
]

export default function CreateStatePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [nations, setNations] = useState<Nation[]>([])

  const [formData, setFormData] = useState({
    name: "",
    abbreviation: "",
    stateType: "state",
    nationId: "",
    dateFounded: "",
    dateDisbanded: "",
    articleId: "",
  })

  useEffect(() => {
    Promise.all([
      fetch("/api/states/available-articles"),
      fetch("/api/nations/list")
    ])
      .then(async ([articlesRes, nationsRes]) => {
        const articlesData = await articlesRes.json()
        const nationsData = await nationsRes.json()
        if (Array.isArray(articlesData)) setArticles(articlesData)
        if (Array.isArray(nationsData)) setNations(nationsData)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name) {
      setMessage({ type: "error", text: "Name is required" })
      return
    }

    if (!formData.nationId) {
      setMessage({ type: "error", text: "Nation is required" })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch("/api/states/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          abbreviation: formData.abbreviation || null,
          stateType: formData.stateType,
          nationId: formData.nationId,
          dateFounded: formData.dateFounded || null,
          dateDisbanded: formData.dateDisbanded || null,
          articleId: formData.articleId || null,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to create state")
      }

      setMessage({ type: "success", text: "State created successfully!" })

      setFormData({
        name: "",
        abbreviation: "",
        stateType: "state",
        nationId: formData.nationId, // Keep selected nation
        dateFounded: "",
        dateDisbanded: "",
        articleId: "",
      })

      setTimeout(() => {
        router.push("/admin/world-data/locations/states/manage")
      }, 1500)
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Failed to create state" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/admin/world-data/locations/states" className="text-gray-500 hover:text-gray-700">
            ← Back
          </Link>
          <h1 className="text-xl font-bold text-emerald-600">Create New State</h1>
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
                Nation <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.nationId}
                onChange={(e) => setFormData({ ...formData, nationId: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">-- Select Nation --</option>
                {nations.map((nation) => (
                  <option key={nation.id} value={nation.id}>
                    {nation.name}
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
                  placeholder="e.g., California"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Abbreviation
                </label>
                <input
                  type="text"
                  value={formData.abbreviation}
                  onChange={(e) => setFormData({ ...formData, abbreviation: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="e.g., CA"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.stateType}
                onChange={(e) => setFormData({ ...formData, stateType: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                {STATE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Founded (k.y.)
                </label>
                <input
                  type="date"
                  value={formData.dateFounded}
                  onChange={(e) => setFormData({ ...formData, dateFounded: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Disbanded (k.y.)
                </label>
                <input
                  type="date"
                  value={formData.dateDisbanded}
                  onChange={(e) => setFormData({ ...formData, dateDisbanded: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
                <p className="text-xs text-gray-500 mt-1">Leave blank if still active</p>
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
                    {article.title} ({article.slug})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Creating..." : "Create State"}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
