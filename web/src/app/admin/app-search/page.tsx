"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { useState, useEffect } from "react"

interface AppSearchEntry {
  id: string
  path: string
  domain: string
  title: string
  excerpt: string
  content: string
  noSearch: boolean
  refreshedAt: string | null
  updatedAt: string
}

export default function AppSearchAdminPage() {
  const { data: session, status } = useSession()
  const [entries, setEntries] = useState<AppSearchEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [refreshingPage, setRefreshingPage] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<string | null>(null)
  const [refreshResult, setRefreshResult] = useState<{
    scanned: number
    created: number
    updated: number
    skipped: number
  } | null>(null)

  const [formData, setFormData] = useState({
    id: "",
    path: "",
    domain: "",
    title: "",
    excerpt: "",
    content: "",
    noSearch: false,
  })

  useEffect(() => {
    if (session?.user?.isAdmin) {
      fetchEntries()
      // Load last refresh time from localStorage
      const saved = localStorage.getItem("appSearchLastRefresh")
      if (saved) setLastRefresh(saved)
    }
  }, [session])

  const fetchEntries = async () => {
    try {
      const res = await fetch("/api/admin/app-search")
      const data = await res.json()
      setEntries(data)
    } catch (error) {
      console.error("Failed to fetch entries:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    setRefreshResult(null)
    const startTime = Date.now()

    try {
      const res = await fetch("/api/admin/app-search/refresh", {
        method: "POST",
      })
      const data = await res.json()

      // Ensure loading state shows for at least 1 second so users see it working
      const elapsed = Date.now() - startTime
      if (elapsed < 1000) {
        await new Promise(resolve => setTimeout(resolve, 1000 - elapsed))
      }

      if (data.success) {
        setRefreshResult(data.results)
        const timestamp = new Date().toLocaleString()
        setLastRefresh(timestamp)
        localStorage.setItem("appSearchLastRefresh", timestamp)
        fetchEntries()
      }
    } catch (error) {
      console.error("Failed to refresh:", error)
    } finally {
      setRefreshing(false)
    }
  }

  const handleRefreshPage = async (path: string) => {
    setRefreshingPage(path)
    try {
      const res = await fetch("/api/admin/app-search/refresh-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
      })
      const data = await res.json()
      if (data.success) {
        fetchEntries()
      } else {
        console.error("Failed to refresh page:", data.error)
        alert("Failed to refresh: " + (data.error || "Unknown error"))
      }
    } catch (error) {
      console.error("Failed to refresh page:", error)
      alert("Failed to refresh page")
    } finally {
      setRefreshingPage(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const res = await fetch("/api/admin/app-search", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setFormData({ id: "", path: "", domain: "", title: "", excerpt: "", content: "", noSearch: false })
        setShowForm(false)
        setEditing(null)
        fetchEntries()
      }
    } catch (error) {
      console.error("Failed to save:", error)
    }
  }

  const handleEdit = (entry: AppSearchEntry) => {
    setFormData({
      id: entry.id,
      path: entry.path,
      domain: entry.domain,
      title: entry.title,
      excerpt: entry.excerpt,
      content: entry.content,
      noSearch: entry.noSearch,
    })
    setEditing(entry.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this entry?")) return

    try {
      await fetch("/api/admin/app-search", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      fetchEntries()
    } catch (error) {
      console.error("Failed to delete:", error)
    }
  }

  const handleToggleNoSearch = async (entry: AppSearchEntry) => {
    try {
      await fetch("/api/admin/app-search", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: entry.id,
          path: entry.path,
          domain: entry.domain,
          title: entry.title,
          excerpt: entry.excerpt,
          content: entry.content,
          noSearch: !entry.noSearch,
        }),
      })
      fetchEntries()
    } catch (error) {
      console.error("Failed to toggle noSearch:", error)
    }
  }

  const handleCancel = () => {
    setFormData({ id: "", path: "", domain: "", title: "", excerpt: "", content: "", noSearch: false })
    setShowForm(false)
    setEditing(null)
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Never"
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>
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
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-500 hover:text-gray-700">
              ← Back
            </Link>
            <h1 className="text-xl font-bold">App Search Index</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Refresh Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="font-semibold text-lg mb-2">Scan for New Pages</h2>
              <p className="text-gray-600 text-sm mb-2">
                Scans /kemponet/ for page.tsx files. New pages are analyzed by AI to generate search content.
              </p>
              {lastRefresh && (
                <p className="text-sm text-gray-500">
                  Last scan: {lastRefresh}
                </p>
              )}
              {refreshResult && (
                <p className="text-sm text-green-600 mt-1">
                  Scanned {refreshResult.scanned} pages: {refreshResult.created} new (AI-generated)
                </p>
              )}
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`px-4 py-2 rounded flex items-center gap-2 ${
                refreshing
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {refreshing ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Scanning...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Scan for New
                </>
              )}
            </button>
          </div>
        </div>

        {/* Edit Form (shown when editing an entry) */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="font-semibold text-lg mb-4">Edit Entry</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Path</label>
                  <input
                    type="text"
                    value={formData.path}
                    onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                    className="w-full border rounded px-3 py-2 bg-gray-50"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
                  <input
                    type="text"
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt (for search results)</label>
                <input
                  type="text"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Searchable Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full border rounded px-3 py-2 h-32"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="noSearch"
                  checked={formData.noSearch}
                  onChange={(e) => setFormData({ ...formData, noSearch: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="noSearch" className="text-sm text-gray-700">
                  Exclude from search (No Search)
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <p className="text-center text-gray-500">Loading entries...</p>
        ) : entries.length === 0 ? (
          <p className="text-center text-gray-500">No entries yet. Click &quot;Scan for New&quot; to find pages.</p>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className={`bg-white rounded-lg shadow p-4 ${entry.noSearch ? "opacity-60" : ""}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-gray-500">{entry.domain}</span>
                      {entry.noSearch && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                          Hidden from search
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg">{entry.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{entry.excerpt}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <p className="text-xs text-gray-400">Path: {entry.path}</p>
                      <p className="text-xs text-gray-400">AI refreshed: {formatDate(entry.refreshedAt)}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4 items-end">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRefreshPage(entry.path)}
                        disabled={refreshingPage === entry.path}
                        className={`text-sm px-2 py-1 rounded ${
                          refreshingPage === entry.path
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                            : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                        }`}
                      >
                        {refreshingPage === entry.path ? (
                          <span className="flex items-center gap-1">
                            <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            AI...
                          </span>
                        ) : (
                          "AI Refresh"
                        )}
                      </button>
                      <button
                        onClick={() => handleEdit(entry)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                    <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={entry.noSearch}
                        onChange={() => handleToggleNoSearch(entry)}
                        className="w-3 h-3"
                      />
                      No search
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
