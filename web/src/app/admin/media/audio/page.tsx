"use client"

import { useSession, signOut } from "next-auth/react"
import { useState, useRef, useEffect } from "react"
import { redirect } from "next/navigation"
import Link from "next/link"

interface PlaylistItem {
  id: string
  name: string
  artist: string
  artistSlug: string
  url: string
}

interface AudioFile {
  id: string
  slug: string
  name: string
  url: string
  artist: string | null
  artistSlug: string | null
}

interface Reference {
  type: "article" | "page" | "tv-playlist" | "radio-playlist"
  slug: string
  title: string
  field: string
}

export default function AudioManagementPage() {
  const { data: session, status } = useSession()
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Playlist state
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([])
  const [playlistLoading, setPlaylistLoading] = useState(true)
  const [playlistMessage, setPlaylistMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Audio files from database
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([])
  const [selectedAudioId, setSelectedAudioId] = useState("")

  // Library state
  const [deletingAudio, setDeletingAudio] = useState<string | null>(null)
  const [libraryMessage, setLibraryMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Delete confirmation modal
  const [deleteModal, setDeleteModal] = useState<{ url: string; name: string; slug: string } | null>(null)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [references, setReferences] = useState<Reference[]>([])
  const [loadingReferences, setLoadingReferences] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    artist: "",
    artistSlug: "",
  })

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You do not have admin privileges.
          </p>
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const file = fileInputRef.current?.files?.[0]

    if (!file) {
      setMessage({ type: "error", text: "Please select a file to upload" })
      return
    }

    if (!formData.title || !formData.slug) {
      setMessage({ type: "error", text: "Please fill in all required fields" })
      return
    }

    setUploading(true)
    setMessage(null)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append("file", file)
      uploadFormData.append("title", formData.title)
      uploadFormData.append("slug", formData.slug)
      uploadFormData.append("description", formData.description)
      uploadFormData.append("artist", formData.artist)
      uploadFormData.append("artistSlug", formData.artistSlug)

      const response = await fetch("/api/audio/upload", {
        method: "POST",
        body: uploadFormData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Upload failed")
      }

      setMessage({ type: "success", text: "Audio uploaded successfully!" })
      setUploadedUrl(result.url)

      await reloadAudioFiles()

      setFormData({ title: "", slug: "", description: "", artist: "", artistSlug: "" })
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Upload failed" })
    } finally {
      setUploading(false)
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
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

      setPlaylistMessage({ type: "success", text: "Track added to playlist!" })
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
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin/media" className="text-gray-500 hover:text-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h1 className="text-xl font-bold">Audio Management</h1>
            </div>
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
        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-6">Upload Audio</h2>

          {message && (
            <div
              className={`mb-4 p-3 rounded ${
                message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          {uploadedUrl && (
            <div className="mb-4 p-3 bg-blue-50 rounded">
              <p className="text-sm font-medium text-blue-700">Uploaded URL:</p>
              <code className="text-xs break-all">{uploadedUrl}</code>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    title: e.target.value,
                    slug: generateSlug(e.target.value),
                  })
                }}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="e.g., The Kempo Blues"
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
                placeholder="e.g., the-kempo-blues"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
                rows={2}
                placeholder="Brief description..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Artist Name
              </label>
              <input
                type="text"
                value={formData.artist}
                onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="e.g., Frank Martino"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Artist Slug (for Kempopedia link)
              </label>
              <input
                type="text"
                value={formData.artistSlug}
                onChange={(e) => setFormData({ ...formData, artistSlug: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="e.g., frank-martino"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                File <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                ref={fileInputRef}
                accept="audio/*"
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? "Uploading..." : "Upload Audio"}
            </button>
          </form>
        </div>

        {/* Radio Playlist Management */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
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
                      <p className="text-sm text-gray-600">{track.artist}</p>
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
            <h3 className="text-sm font-medium text-gray-700 mb-3">Add Track to Playlist</h3>

            {audioFiles.length === 0 ? (
              <p className="text-sm text-gray-500">No audio files found. Upload one above first.</p>
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
                        {file.name} {file.artist ? `- ${file.artist}` : ""}
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
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-lg font-semibold mb-6">Audio Library</h2>

          {libraryMessage && (
            <div
              className={`mb-4 p-3 rounded ${
                libraryMessage.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {libraryMessage.text}
            </div>
          )}

          {audioFiles.length === 0 ? (
            <p className="text-gray-500 text-sm">No audio files uploaded</p>
          ) : (
            <div className="space-y-2">
              {audioFiles.map((file) => (
                <div
                  key={file.url}
                  className="flex items-center justify-between p-3 bg-amber-50 rounded border border-amber-200"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{file.name}</p>
                    <p className="text-xs text-gray-500 truncate">{file.artist || file.slug}</p>
                  </div>
                  <button
                    onClick={() => openDeleteModal(file.url, file.name, file.slug)}
                    disabled={deletingAudio === file.url}
                    className="ml-4 text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                  >
                    {deletingAudio === file.url ? "Deleting..." : "Delete"}
                  </button>
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
    </div>
  )
}
