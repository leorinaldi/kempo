"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { redirect } from "next/navigation"
import Link from "next/link"

interface PlaylistItem {
  id: string
  name: string
  description?: string
  url: string
}

interface AudioFile {
  id: string
  slug: string
  name: string
  url: string
  artist: string | null
  artistSlug: string | null
  description: string | null
  duration: number | null
  kyDate: string | null
  createdAt: string
  updatedAt: string
}

interface Reference {
  type: "article" | "page" | "tv-playlist" | "radio-playlist"
  slug: string
  title: string
  field: string
}

export default function AudioManagePage() {
  const { data: session, status } = useSession()

  // Playlist state
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([])
  const [playlistLoading, setPlaylistLoading] = useState(true)
  const [playlistMessage, setPlaylistMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Audio files from database
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([])
  const [selectedAudioId, setSelectedAudioId] = useState("")

  // Library sorting
  const [sortField, setSortField] = useState<"name" | "createdAt" | "kyDate">("createdAt")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const stripPunctuation = (str: string) => str.replace(/^[^\w\s]+/, "").toLowerCase()

  const sortedAudioFiles = [...audioFiles].sort((a, b) => {
    let comparison = 0
    if (sortField === "name") {
      comparison = stripPunctuation(a.name).localeCompare(stripPunctuation(b.name))
    } else if (sortField === "kyDate") {
      const aDate = a.kyDate ? new Date(a.kyDate).getTime() : 0
      const bDate = b.kyDate ? new Date(b.kyDate).getTime() : 0
      comparison = aDate - bDate
    } else {
      comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    }
    return sortDirection === "asc" ? comparison : -comparison
  })

  // Library state
  const [deletingAudio, setDeletingAudio] = useState<string | null>(null)
  const [libraryMessage, setLibraryMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Delete confirmation modal
  const [deleteModal, setDeleteModal] = useState<{ url: string; name: string; slug: string } | null>(null)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [references, setReferences] = useState<Reference[]>([])
  const [loadingReferences, setLoadingReferences] = useState(false)

  // Edit modal
  const [editModal, setEditModal] = useState<AudioFile | null>(null)
  const [editData, setEditData] = useState({
    name: "",
    slug: "",
    description: "",
    artist: "",
    artistSlug: "",
    kyDate: "",
  })
  const [saving, setSaving] = useState(false)
  const [editMessage, setEditMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Load playlist and audio files on mount
  useEffect(() => {
    fetch("/api/radio/playlist")
      .then((res) => res.json())
      .then((data) => {
        setPlaylist(data)
        setPlaylistLoading(false)
      })
      .catch(() => setPlaylistLoading(false))

    reloadAudioFiles()
  }, [])

  const reloadAudioFiles = async () => {
    try {
      const res = await fetch("/api/audio/list")
      const data = await res.json()
      if (Array.isArray(data)) {
        setAudioFiles(data)
      }
    } catch (err) {
      console.error("Failed to load audio files:", err)
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

  const addToRadioPlaylist = async () => {
    if (!selectedAudioId) {
      setPlaylistMessage({ type: "error", text: "Please select an audio file" })
      return
    }

    try {
      const res = await fetch("/api/radio/playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioId: selectedAudioId }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to add to playlist")
      }

      const playlistRes = await fetch("/api/radio/playlist")
      const playlistData = await playlistRes.json()
      setPlaylist(playlistData)

      setPlaylistMessage({ type: "success", text: "Track added to Radio!" })
      setSelectedAudioId("")
      setTimeout(() => setPlaylistMessage(null), 3000)
    } catch (error) {
      setPlaylistMessage({ type: "error", text: error instanceof Error ? error.message : "Failed to add" })
    }
  }

  const removeFromPlaylist = async (audioSlug: string) => {
    const audio = audioFiles.find((f) => f.slug === audioSlug)
    if (!audio) return

    try {
      const res = await fetch("/api/radio/playlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioId: audio.id }),
      })

      if (!res.ok) {
        throw new Error("Failed to remove from playlist")
      }

      const playlistRes = await fetch("/api/radio/playlist")
      const playlistData = await playlistRes.json()
      setPlaylist(playlistData)

      setPlaylistMessage({ type: "success", text: "Track removed!" })
      setTimeout(() => setPlaylistMessage(null), 3000)
    } catch (error) {
      setPlaylistMessage({ type: "error", text: error instanceof Error ? error.message : "Failed to remove" })
    }
  }

  const openDeleteModal = async (url: string, name: string, slug: string) => {
    setDeleteModal({ url, name, slug })
    setDeleteConfirmText("")
    setReferences([])
    setLoadingReferences(true)

    try {
      const res = await fetch("/api/media/find-references", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, slug, mediaType: "audio" }),
      })
      const data = await res.json()
      if (data.references) {
        setReferences(data.references)
      }
    } catch (err) {
      console.error("Failed to find references:", err)
    } finally {
      setLoadingReferences(false)
    }
  }

  const closeDeleteModal = () => {
    setDeleteModal(null)
    setDeleteConfirmText("")
    setReferences([])
  }

  const openEditModal = (file: AudioFile) => {
    setEditModal(file)
    setEditData({
      name: file.name,
      slug: file.slug,
      description: file.description || "",
      artist: file.artist || "",
      artistSlug: file.artistSlug || "",
      kyDate: file.kyDate ? file.kyDate.split("T")[0] : "",
    })
    setEditMessage(null)
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
      const res = await fetch("/api/audio/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editModal.id,
          name: editData.name,
          slug: editData.slug,
          description: editData.description,
          artist: editData.artist,
          artistSlug: editData.artistSlug,
          kyDate: editData.kyDate || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Update failed")
      }

      setEditMessage({ type: "success", text: "Saved successfully!" })
      await reloadAudioFiles()

      // Refresh playlist if this file is in it
      const playlistRes = await fetch("/api/radio/playlist")
      const playlistData = await playlistRes.json()
      setPlaylist(playlistData)

      setTimeout(() => {
        closeEditModal()
      }, 1000)
    } catch (error) {
      setEditMessage({ type: "error", text: error instanceof Error ? error.message : "Update failed" })
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteModal || deleteConfirmText !== "DELETE") return

    setDeletingAudio(deleteModal.url)
    setLibraryMessage(null)

    try {
      // First, remove references from articles/pages
      if (references.length > 0) {
        await fetch("/api/media/remove-references", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: deleteModal.url, slug: deleteModal.slug }),
        })
      }

      // Then delete the file
      const res = await fetch("/api/audio/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: deleteModal.url }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Delete failed")
      }

      const refMsg = references.length > 0 ? ` (${references.length} reference${references.length > 1 ? 's' : ''} removed)` : ''
      setLibraryMessage({ type: "success", text: `"${deleteModal.name}" deleted successfully${refMsg}` })
      await reloadAudioFiles()
      closeDeleteModal()

      // Refresh playlist in case the deleted file was in it
      const playlistRes = await fetch("/api/radio/playlist")
      const playlistData = await playlistRes.json()
      setPlaylist(playlistData)

      setTimeout(() => setLibraryMessage(null), 3000)
    } catch (error) {
      setLibraryMessage({ type: "error", text: error instanceof Error ? error.message : "Delete failed" })
    } finally {
      setDeletingAudio(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/world-data/audio" className="text-gray-500 hover:text-gray-700">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-amber-600">Manage Audio</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Radio Playlist Management */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-6">Kempo Radio Playlist</h2>

          {playlistMessage && (
            <div
              className={`mb-4 p-3 rounded ${
                playlistMessage.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {playlistMessage.text}
            </div>
          )}

          {/* Current Playlist */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Current Tracks</h3>
            {playlistLoading ? (
              <p className="text-gray-500 text-sm">Loading...</p>
            ) : playlist.length === 0 ? (
              <p className="text-gray-500 text-sm">No tracks in playlist</p>
            ) : (
              <div className="space-y-2">
                {playlist.map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center justify-between p-3 bg-amber-50 rounded border border-amber-200"
                  >
                    <div>
                      <p className="font-medium">{track.name}</p>
                      {track.description && (
                        <p className="text-sm text-gray-600">{track.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeFromPlaylist(track.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Track */}
          <div className="border-t pt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Add Track to Radio</h3>

            {audioFiles.length === 0 ? (
              <p className="text-sm text-gray-500">No audio files found. Upload one first.</p>
            ) : (
              <div className="flex gap-4">
                <select
                  value={selectedAudioId}
                  onChange={(e) => setSelectedAudioId(e.target.value)}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  <option value="">-- Select an audio file --</option>
                  {audioFiles
                    .filter((file) => !playlist.some((p) => p.id === file.slug))
                    .map((file) => (
                      <option key={file.id} value={file.id}>
                        {file.name}
                      </option>
                    ))}
                </select>
                <button
                  onClick={addToRadioPlaylist}
                  disabled={!selectedAudioId}
                  className="bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 text-white font-medium py-2 px-6 rounded"
                >
                  Add to Radio
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Audio Library */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Audio Library</h2>
            <div className="flex items-center gap-2">
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as "name" | "createdAt" | "kyDate")}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="name">Alphabetical</option>
                <option value="createdAt">Upload Date</option>
                <option value="kyDate">Kempo Year</option>
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

          {libraryMessage && (
            <div
              className={`mb-4 p-3 rounded ${
                libraryMessage.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {libraryMessage.text}
            </div>
          )}

          {sortedAudioFiles.length === 0 ? (
            <p className="text-gray-500 text-sm">No audio files uploaded</p>
          ) : (
            <div className="space-y-2">
              {sortedAudioFiles.map((file) => (
                <div
                  key={file.url}
                  className="flex items-center justify-between p-3 bg-amber-50 rounded border border-amber-200"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{file.name}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {file.slug}
                      {file.artist && ` - ${file.artist}`}
                      {file.duration && ` (${Math.floor(file.duration / 60)}:${Math.floor(file.duration % 60).toString().padStart(2, '0')})`}
                    </p>
                    <p className="text-xs text-gray-400">
                      Uploaded: {new Date(file.createdAt).toLocaleDateString()}
                      {file.kyDate && ` · k.y. ${new Date(file.kyDate).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <button
                      onClick={() => openEditModal(file)}
                      className="text-amber-600 hover:text-amber-800 text-sm"
                    >
                      View/Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(file.url, file.name, file.slug)}
                      disabled={deletingAudio === file.url}
                      className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                    >
                      {deletingAudio === file.url ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-red-600 mb-2">Confirm Delete</h3>
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete <strong>&quot;{deleteModal.name}&quot;</strong>?
              This will permanently remove both the database record and the blob file. This action cannot be undone.
            </p>

            {/* References section */}
            {loadingReferences ? (
              <div className="mb-4 p-3 bg-gray-50 rounded border">
                <p className="text-sm text-gray-600">Searching for references...</p>
              </div>
            ) : references.length > 0 ? (
              <div className="mb-4 p-3 bg-amber-50 rounded border border-amber-200">
                <p className="text-sm font-medium text-amber-800 mb-2">
                  Found {references.length} reference{references.length > 1 ? 's' : ''} that will be removed:
                </p>
                <ul className="text-sm text-amber-700 space-y-1">
                  {references.map((ref, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-xs bg-amber-100 px-1.5 py-0.5 rounded">
                        {ref.type}
                      </span>
                      <span>{ref.title}</span>
                      <span className="text-xs text-amber-600">({ref.field})</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="mb-4 p-3 bg-green-50 rounded border border-green-200">
                <p className="text-sm text-green-700">No references found in articles or pages.</p>
              </div>
            )}

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
                disabled={deleteConfirmText !== "DELETE" || deletingAudio === deleteModal.url}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingAudio === deleteModal.url ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">View/Edit Audio</h3>

            {editMessage && (
              <div
                className={`mb-4 p-3 rounded ${
                  editMessage.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
              >
                {editMessage.text}
              </div>
            )}

            {/* Audio Player */}
            <div className="mb-4 p-3 bg-amber-50 rounded border border-amber-200">
              <p className="text-xs text-amber-600 uppercase font-medium mb-2">Preview</p>
              <audio controls className="w-full" src={editModal.url}>
                Your browser does not support the audio element.
              </audio>
            </div>

            <div className="space-y-4">
              {/* Read-only fields */}
              <div className="bg-gray-50 p-3 rounded border space-y-2">
                <p className="text-xs text-gray-500 uppercase font-medium">Read-only</p>
                <div>
                  <label className="block text-xs text-gray-500">ID</label>
                  <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{editModal.id}</p>
                </div>
                <div>
                  <label className="block text-xs text-gray-500">Blob URL</label>
                  <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded break-all">{editModal.url}</p>
                </div>
                {editModal.duration && (
                  <div>
                    <label className="block text-xs text-gray-500">Duration</label>
                    <p className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {Math.floor(editModal.duration / 60)}:{Math.floor(editModal.duration % 60).toString().padStart(2, '0')}
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500">Created</label>
                    <p className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {new Date(editModal.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">Updated</label>
                    <p className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {new Date(editModal.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Editable fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={editData.slug}
                  onChange={(e) => setEditData({ ...editData, slug: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Artist Name</label>
                <input
                  type="text"
                  value={editData.artist}
                  onChange={(e) => setEditData({ ...editData, artist: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Artist Slug</label>
                <input
                  type="text"
                  value={editData.artistSlug}
                  onChange={(e) => setEditData({ ...editData, artistSlug: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kempo Date (k.y.)</label>
                <input
                  type="date"
                  value={editData.kyDate}
                  onChange={(e) => setEditData({ ...editData, kyDate: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
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
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
