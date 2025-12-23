"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { redirect } from "next/navigation"
import Link from "next/link"

interface Album {
  id: string
  name: string
  artistId: string | null
  artistName: string | null
  labelId: string | null
  labelName: string | null
  kyDate: string | null
  articleId: string | null
  article: { id: string; slug: string; title: string } | null
  createdAt: string
  updatedAt: string
}

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

interface LinkedTrack {
  id: string
  name: string
}

interface RecordLabel {
  id: string
  name: string
}

export default function ManageAlbumsPage() {
  const { data: session, status } = useSession()

  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Sorting
  const [sortField, setSortField] = useState<"name" | "createdAt" | "kyDate">("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  // Edit modal
  const [editModal, setEditModal] = useState<Album | null>(null)
  const [editData, setEditData] = useState({
    name: "",
    artistId: "",
    labelId: "",
    kyDate: "",
    articleId: "",
  })
  const [saving, setSaving] = useState(false)
  const [editMessage, setEditMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [availableArticles, setAvailableArticles] = useState<Article[]>([])
  const [artists, setArtists] = useState<Person[]>([])
  const [recordLabels, setRecordLabels] = useState<RecordLabel[]>([])
  const [linkedTracks, setLinkedTracks] = useState<LinkedTrack[]>([])

  // Delete modal
  const [deleteModal, setDeleteModal] = useState<Album | null>(null)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadAlbums()
    loadArtists()
    loadRecordLabels()
  }, [])

  const loadAlbums = async () => {
    try {
      const res = await fetch("/api/albums/list")
      const data = await res.json()
      if (Array.isArray(data)) {
        setAlbums(data)
      }
    } catch (err) {
      console.error("Failed to load albums:", err)
    } finally {
      setLoading(false)
    }
  }

  const loadArtists = async () => {
    try {
      const res = await fetch("/api/people/list")
      const data = await res.json()
      if (Array.isArray(data)) {
        setArtists(data)
      }
    } catch (err) {
      console.error("Failed to load artists:", err)
    }
  }

  const loadRecordLabels = async () => {
    try {
      const res = await fetch("/api/organizations/list?orgType=record+label")
      const data = await res.json()
      if (Array.isArray(data)) {
        setRecordLabels(data)
      }
    } catch (err) {
      console.error("Failed to load record labels:", err)
    }
  }

  const loadLinkedTracks = async (albumId: string) => {
    try {
      const res = await fetch(`/api/albums/${albumId}/tracks`)
      const data = await res.json()
      if (Array.isArray(data)) {
        setLinkedTracks(data)
      }
    } catch (err) {
      console.error("Failed to load linked tracks:", err)
      setLinkedTracks([])
    }
  }

  const sortedAlbums = [...albums].sort((a, b) => {
    let comparison = 0
    if (sortField === "name") {
      comparison = a.name.localeCompare(b.name)
    } else if (sortField === "kyDate") {
      const aDate = a.kyDate ? new Date(a.kyDate).getTime() : 0
      const bDate = b.kyDate ? new Date(b.kyDate).getTime() : 0
      comparison = aDate - bDate
    } else {
      comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    }
    return sortDirection === "asc" ? comparison : -comparison
  })

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

  const openEditModal = async (album: Album) => {
    setEditModal(album)
    setEditData({
      name: album.name,
      artistId: album.artistId || "",
      labelId: album.labelId || "",
      kyDate: album.kyDate ? album.kyDate.split("T")[0] : "",
      articleId: album.articleId || "",
    })
    setEditMessage(null)
    setLinkedTracks([])

    // Load available articles and linked tracks
    try {
      const articlesRes = await fetch("/api/albums/available-articles")
      const articlesData = await articlesRes.json()
      if (Array.isArray(articlesData)) {
        // Add the album's current article if it exists and isn't already in the list
        if (album.article && !articlesData.find((a: Article) => a.id === album.article?.id)) {
          articlesData.unshift(album.article)
        }
        setAvailableArticles(articlesData)
      }

      await loadLinkedTracks(album.id)
    } catch (err) {
      console.error("Failed to load data:", err)
    }
  }

  const closeEditModal = () => {
    setEditModal(null)
    setEditMessage(null)
  }

  const saveEdit = async () => {
    if (!editModal) return

    setSaving(true)
    setEditMessage(null)

    try {
      const res = await fetch("/api/albums/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editModal.id,
          name: editData.name,
          artistId: editData.artistId || null,
          labelId: editData.labelId || null,
          kyDate: editData.kyDate || null,
          articleId: editData.articleId || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Update failed")
      }

      setEditMessage({ type: "success", text: "Saved successfully!" })
      await loadAlbums()

      setTimeout(() => {
        closeEditModal()
      }, 1000)
    } catch (error) {
      setEditMessage({ type: "error", text: error instanceof Error ? error.message : "Update failed" })
    } finally {
      setSaving(false)
    }
  }

  const openDeleteModal = (album: Album) => {
    setDeleteModal(album)
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
      const res = await fetch("/api/albums/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteModal.id }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Delete failed")
      }

      setMessage({ type: "success", text: `"${deleteModal.name}" deleted successfully` })
      await loadAlbums()
      closeDeleteModal()

      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Delete failed" })
    } finally {
      setDeleting(false)
    }
  }

  const formatArtistName = (artist: Person) => {
    return `${artist.nickname || artist.firstName} ${artist.lastName}`
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/world-data/audio" className="text-gray-500 hover:text-gray-700">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-amber-600">Manage Albums</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Albums ({albums.length})</h2>
            <div className="flex items-center gap-2">
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as "name" | "createdAt" | "kyDate")}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="name">Name</option>
                <option value="createdAt">Created Date</option>
                <option value="kyDate">Release Date (k.y.)</option>
              </select>
              <button
                onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
                className="p-1 border border-gray-300 rounded hover:bg-gray-100"
                title={sortDirection === "asc" ? "Ascending" : "Descending"}
              >
                {sortDirection === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>

          {message && (
            <div
              className={`mb-4 p-3 rounded ${
                message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          {loading ? (
            <p className="text-gray-500 text-sm">Loading...</p>
          ) : sortedAlbums.length === 0 ? (
            <p className="text-gray-500 text-sm">No albums found</p>
          ) : (
            <div className="space-y-2">
              {sortedAlbums.map((album) => (
                <div
                  key={album.id}
                  className="flex items-center justify-between p-3 bg-amber-50 rounded border border-amber-200"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{album.name}</p>
                    <p className="text-xs text-gray-500">
                      {album.artistName && `by ${album.artistName}`}
                      {album.kyDate && ` · ${new Date(album.kyDate).getFullYear()}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <button
                      onClick={() => openEditModal(album)}
                      className="text-amber-600 hover:text-amber-800 text-sm"
                    >
                      View/Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(album)}
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
            <h3 className="text-lg font-bold mb-4">View/Edit Album</h3>

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
                <label className="block text-sm font-medium text-gray-700 mb-1">Album Name</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Artist</label>
                <select
                  value={editData.artistId}
                  onChange={(e) => setEditData({ ...editData, artistId: e.target.value })}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Record Label</label>
                <select
                  value={editData.labelId}
                  onChange={(e) => setEditData({ ...editData, labelId: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">-- No label --</option>
                  {recordLabels
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((label) => (
                      <option key={label.id} value={label.id}>
                        {label.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Release Date (k.y.)</label>
                <input
                  type="date"
                  value={editData.kyDate}
                  onChange={(e) => setEditData({ ...editData, kyDate: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kempopedia Article</label>
                <select
                  value={editData.articleId}
                  onChange={(e) => setEditData({ ...editData, articleId: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">-- No article linked --</option>
                  {availableArticles.map((article) => (
                    <option key={article.id} value={article.id}>
                      {article.title} ({article.slug})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Linked Tracks */}
            <div className="mt-6 border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Linked Tracks</h4>
              {linkedTracks.length === 0 ? (
                <p className="text-sm text-gray-500">No tracks linked to this album</p>
              ) : (
                <div className="space-y-1">
                  {linkedTracks.map((track) => (
                    <div
                      key={track.id}
                      className="text-sm text-amber-700 bg-amber-50 px-3 py-1 rounded"
                    >
                      🎵 {track.name}
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-400 mt-2">
                Manage track links from the Audio manage page
              </p>
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
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
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
              Are you sure you want to delete <strong>&quot;{deleteModal.name}&quot;</strong>?
              This action cannot be undone.
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
