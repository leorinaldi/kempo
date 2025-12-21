"use client"

import { useSession, signOut } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { useState, useEffect } from "react"

const PAGE_SIZE = 10

interface ProjectHistoryEntry {
  id: string
  content: string
  createdAt: string
}

export default function ProjectHistoryPage() {
  const { data: session, status } = useSession()
  const [entries, setEntries] = useState<ProjectHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [newEntry, setNewEntry] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (status === "authenticated" && session?.user?.isAdmin) {
      fetchEntries()
    }
  }, [status, session])

  const fetchEntries = async (offset = 0) => {
    try {
      const res = await fetch(`/api/admin/project-history?limit=${PAGE_SIZE}&offset=${offset}`)
      if (res.ok) {
        const data = await res.json()
        if (offset === 0) {
          setEntries(data.entries)
        } else {
          setEntries((prev) => [...prev, ...data.entries])
        }
        setHasMore(data.hasMore)
      }
    } catch (error) {
      console.error("Failed to fetch entries:", error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMore = () => {
    setLoadingMore(true)
    fetchEntries(entries.length)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEntry.trim() || submitting) return

    setSubmitting(true)
    try {
      const res = await fetch("/api/admin/project-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newEntry }),
      })

      if (res.ok) {
        const entry = await res.json()
        setEntries([entry, ...entries])
        setNewEntry("")
      }
    } catch (error) {
      console.error("Failed to create entry:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this entry?")) return

    try {
      const res = await fetch("/api/admin/project-history", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })

      if (res.ok) {
        setEntries(entries.filter((e) => e.id !== id))
      }
    } catch (error) {
      console.error("Failed to delete entry:", error)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You do not have admin privileges. Contact the site administrator if you believe this is an error.
          </p>
          <p className="text-sm text-gray-500 mb-4">Logged in as: {session.user.email}</p>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
          >
            Sign Out
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-500 hover:text-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold">Project History</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{session.user.email}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Add New Entry */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Add New Entry</h2>
          <form onSubmit={handleSubmit}>
            <textarea
              value={newEntry}
              onChange={(e) => setNewEntry(e.target.value)}
              placeholder="Describe the milestone, feature, or update..."
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={!newEntry.trim() || submitting}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Adding..." : "Add Entry"}
            </button>
          </form>
        </div>

        {/* Entries List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            Recent Entries {!loading && <span className="text-gray-500 font-normal">({entries.length})</span>}
          </h2>

          {loading ? (
            <p className="text-gray-500">Loading entries...</p>
          ) : entries.length === 0 ? (
            <p className="text-gray-500">No entries yet. Add your first project history entry above.</p>
          ) : (
            <>
              <div className="space-y-4">
                {entries.map((entry) => (
                  <div key={entry.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm text-gray-500">{formatDate(entry.createdAt)}</span>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                    <p className="text-gray-800 whitespace-pre-wrap">{entry.content}</p>
                  </div>
                ))}
              </div>
              {hasMore && (
                <div className="mt-6 text-center">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg disabled:opacity-50"
                  >
                    {loadingMore ? "Loading..." : "Show more events"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* About Section */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-lg font-semibold mb-4">About Project History</h2>
          <p className="text-sm text-gray-600 mb-4">
            This section tracks the real-world development of the Kempo Project. Unlike the simulation documents
            which track the fictional world, these entries record:
          </p>
          <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
            <li><strong>Content milestones</strong> — Number of articles, characters created, timelines completed</li>
            <li><strong>Feature additions</strong> — New sections, tools, or functionality</li>
            <li><strong>Technical changes</strong> — Architecture decisions, migrations, integrations</li>
            <li><strong>Process improvements</strong> — Methodology updates, workflow changes</li>
            <li><strong>Major decisions</strong> — Significant choices that shaped the project direction</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
