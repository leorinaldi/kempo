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

interface Series {
  id: string
  title: string
  startYear: number | null
  endYear: number | null
  description: string | null
  network: Organization | null
  genres: { genre: Genre }[]
  _count: { episodes: number }
}

export default function ManageSeriesPage() {
  const { data: session, status } = useSession()

  const [seriesList, setSeriesList] = useState<Series[]>([])
  const [genres, setGenres] = useState<Genre[]>([])
  const [networks, setNetworks] = useState<Organization[]>([])
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Edit modal
  const [editModal, setEditModal] = useState<Series | null>(null)
  const [editData, setEditData] = useState({
    title: "",
    networkId: "",
    startYear: "",
    endYear: "",
    description: "",
    selectedGenres: [] as string[],
  })
  const [saving, setSaving] = useState(false)
  const [editMessage, setEditMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Delete modal
  const [deleteModal, setDeleteModal] = useState<Series | null>(null)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [seriesRes, genresRes, networksRes] = await Promise.all([
        fetch("/api/series"),
        fetch("/api/genres"),
        fetch("/api/organizations/list?orgType=network"),
      ])

      const [seriesData, genresData, networksData] = await Promise.all([
        seriesRes.json(),
        genresRes.json(),
        networksRes.json(),
      ])

      if (Array.isArray(seriesData)) setSeriesList(seriesData)
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

  const openEditModal = (series: Series) => {
    setEditModal(series)
    setEditData({
      title: series.title,
      networkId: series.network?.id || "",
      startYear: series.startYear?.toString() || "",
      endYear: series.endYear?.toString() || "",
      description: series.description || "",
      selectedGenres: series.genres.map((g) => g.genre.id),
    })
    setEditMessage(null)
  }

  const closeEditModal = () => {
    setEditModal(null)
    setEditMessage(null)
  }

  const handleGenreToggle = (genreId: string) => {
    setEditData((prev) => ({
      ...prev,
      selectedGenres: prev.selectedGenres.includes(genreId)
        ? prev.selectedGenres.filter((g) => g !== genreId)
        : [...prev.selectedGenres, genreId],
    }))
  }

  const saveEdit = async () => {
    if (!editModal) return

    setSaving(true)
    setEditMessage(null)

    try {
      const res = await fetch(`/api/series/${editModal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editData.title,
          networkId: editData.networkId || null,
          startYear: editData.startYear || null,
          endYear: editData.endYear || null,
          description: editData.description || null,
          genreIds: editData.selectedGenres,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Update failed")
      }

      setEditMessage({ type: "success", text: "Saved successfully!" })
      await loadData()

      setTimeout(() => {
        closeEditModal()
      }, 1000)
    } catch (error) {
      setEditMessage({ type: "error", text: error instanceof Error ? error.message : "Update failed" })
    } finally {
      setSaving(false)
    }
  }

  const openDeleteModal = (series: Series) => {
    setDeleteModal(series)
    setDeleteConfirmText("")
  }

  const closeDeleteModal = () => {
    setDeleteModal(null)
    setDeleteConfirmText("")
  }

  const confirmDelete = async () => {
    if (!deleteModal || deleteConfirmText !== "DELETE") return

    setDeleting(true)

    try {
      const res = await fetch(`/api/series/${deleteModal.id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Delete failed")
      }

      setMessage({ type: "success", text: `"${deleteModal.title}" deleted successfully` })
      await loadData()
      closeDeleteModal()

      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Delete failed" })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/world-data/video/series" className="text-gray-500 hover:text-gray-700">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-indigo-600">Manage Series</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-6">All Series ({seriesList.length})</h2>

          {message && (
            <div
              className={`mb-4 p-3 rounded ${
                message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          {seriesList.length === 0 ? (
            <p className="text-gray-500 text-sm">No series found</p>
          ) : (
            <div className="space-y-2">
              {seriesList.map((series) => (
                <div
                  key={series.id}
                  className="flex items-center justify-between p-3 bg-indigo-50 rounded border border-indigo-200"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{series.title}</p>
                    <p className="text-xs text-gray-500">
                      {series.network?.name || "No network"}
                      {series.startYear && ` · ${series.startYear}`}
                      {series.endYear && `-${series.endYear}`}
                      {!series.endYear && series.startYear && "-present"}
                      {series._count.episodes > 0 && ` · ${series._count.episodes} episodes`}
                    </p>
                    {series.genres.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {series.genres.map((g) => (
                          <span
                            key={g.genre.id}
                            className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded"
                          >
                            {g.genre.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <button
                      onClick={() => openEditModal(series)}
                      className="text-indigo-600 hover:text-indigo-800 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(series)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Edit Series</h3>

            {editMessage && (
              <div
                className={`mb-4 p-3 rounded ${
                  editMessage.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
              >
                {editMessage.text}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Network</label>
                <select
                  value={editData.networkId}
                  onChange={(e) => setEditData({ ...editData, networkId: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">-- No network --</option>
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
                    value={editData.startYear}
                    onChange={(e) => setEditData({ ...editData, startYear: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Year</label>
                  <input
                    type="number"
                    value={editData.endYear}
                    onChange={(e) => setEditData({ ...editData, endYear: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  rows={3}
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
                      className={`px-2 py-1 rounded-full text-xs ${
                        editData.selectedGenres.includes(genre.id)
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {genre.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeEditModal}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={saving}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-red-600 mb-2">Confirm Delete</h3>
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete <strong>&quot;{deleteModal.title}&quot;</strong>?
              {deleteModal._count.episodes > 0 && (
                <span className="block mt-2 text-amber-600">
                  Warning: This series has {deleteModal._count.episodes} episodes that will be unlinked.
                </span>
              )}
            </p>

            <p className="text-sm text-gray-600 mb-2">
              Type <strong>DELETE</strong> to confirm:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
              placeholder="Type DELETE"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={closeDeleteModal}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteConfirmText !== "DELETE" || deleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
