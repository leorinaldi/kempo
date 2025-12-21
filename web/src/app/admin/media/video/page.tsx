"use client"

import { useSession, signOut } from "next-auth/react"
import { useState, useRef, useEffect } from "react"
import { redirect } from "next/navigation"
import Link from "next/link"

interface PlaylistItem {
  id: string
  name: string
  description?: string
  url: string
}

interface VideoFile {
  id: string
  slug: string
  name: string
  url: string
  artist: string | null
  artistSlug: string | null
  description: string | null
  aspectRatio: string | null
}

export default function VideoManagementPage() {
  const { data: session, status } = useSession()
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Playlist state
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([])
  const [playlistLoading, setPlaylistLoading] = useState(true)
  const [playlistMessage, setPlaylistMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Video files from database
  const [videoFiles, setVideoFiles] = useState<VideoFile[]>([])
  const [selectedVideoId, setSelectedVideoId] = useState("")

  // Library state
  const [deletingVideo, setDeletingVideo] = useState<string | null>(null)
  const [libraryMessage, setLibraryMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    artist: "",
    artistSlug: "",
    aspectRatio: "landscape" as "landscape" | "portrait" | "square",
  })

  // Load playlist and video files on mount
  useEffect(() => {
    fetch("/api/tv/playlist")
      .then((res) => res.json())
      .then((data) => {
        setPlaylist(data)
        setPlaylistLoading(false)
      })
      .catch(() => setPlaylistLoading(false))

    reloadVideoFiles()
  }, [])

  const reloadVideoFiles = async () => {
    try {
      const res = await fetch("/api/video/list")
      const data = await res.json()
      if (Array.isArray(data)) {
        setVideoFiles(data)
      }
    } catch (err) {
      console.error("Failed to load video files:", err)
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
      uploadFormData.append("aspectRatio", formData.aspectRatio)

      const response = await fetch("/api/video/upload", {
        method: "POST",
        body: uploadFormData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Upload failed")
      }

      setMessage({ type: "success", text: "Video uploaded successfully!" })
      setUploadedUrl(result.url)

      await reloadVideoFiles()

      setFormData({ title: "", slug: "", description: "", artist: "", artistSlug: "", aspectRatio: "landscape" })
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

  const addToTvPlaylist = async () => {
    if (!selectedVideoId) {
      setPlaylistMessage({ type: "error", text: "Please select a video file" })
      return
    }

    try {
      const res = await fetch("/api/tv/playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId: selectedVideoId }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to add to playlist")
      }

      const playlistRes = await fetch("/api/tv/playlist")
      const playlistData = await playlistRes.json()
      setPlaylist(playlistData)

      setPlaylistMessage({ type: "success", text: "Program added to TV!" })
      setSelectedVideoId("")
      setTimeout(() => setPlaylistMessage(null), 3000)
    } catch (error) {
      setPlaylistMessage({ type: "error", text: error instanceof Error ? error.message : "Failed to add" })
    }
  }

  const removeFromPlaylist = async (videoSlug: string) => {
    const video = videoFiles.find((f) => f.slug === videoSlug)
    if (!video) return

    try {
      const res = await fetch("/api/tv/playlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId: video.id }),
      })

      if (!res.ok) {
        throw new Error("Failed to remove from playlist")
      }

      const playlistRes = await fetch("/api/tv/playlist")
      const playlistData = await playlistRes.json()
      setPlaylist(playlistData)

      setPlaylistMessage({ type: "success", text: "Program removed!" })
      setTimeout(() => setPlaylistMessage(null), 3000)
    } catch (error) {
      setPlaylistMessage({ type: "error", text: error instanceof Error ? error.message : "Failed to remove" })
    }
  }

  const deleteVideoFile = async (url: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) {
      return
    }

    setDeletingVideo(url)
    setLibraryMessage(null)

    try {
      const res = await fetch("/api/video/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Delete failed")
      }

      setLibraryMessage({ type: "success", text: `"${name}" deleted successfully` })
      await reloadVideoFiles()

      // Refresh playlist in case the deleted file was in it
      const playlistRes = await fetch("/api/tv/playlist")
      const playlistData = await playlistRes.json()
      setPlaylist(playlistData)

      setTimeout(() => setLibraryMessage(null), 3000)
    } catch (error) {
      setLibraryMessage({ type: "error", text: error instanceof Error ? error.message : "Delete failed" })
    } finally {
      setDeletingVideo(null)
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
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold">Video Management</h1>
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
          <h2 className="text-lg font-semibold mb-6">Upload Video</h2>

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
                placeholder="e.g., Kempo News Broadcast"
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
                placeholder="e.g., kempo-news-broadcast"
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
                Artist/Creator Name
              </label>
              <input
                type="text"
                value={formData.artist}
                onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="e.g., United Broadcasting Company"
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
                placeholder="e.g., united-broadcasting-company"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Aspect Ratio
              </label>
              <select
                value={formData.aspectRatio}
                onChange={(e) => setFormData({ ...formData, aspectRatio: e.target.value as "landscape" | "portrait" | "square" })}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="landscape">Landscape (wide)</option>
                <option value="portrait">Portrait (tall)</option>
                <option value="square">Square</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                File <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                ref={fileInputRef}
                accept="video/*"
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? "Uploading..." : "Upload Video"}
            </button>
          </form>
        </div>

        {/* TV Playlist Management */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-lg font-semibold mb-6">Kempo TV Playlist</h2>

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
            <h3 className="text-sm font-medium text-gray-700 mb-3">Current Programs</h3>
            {playlistLoading ? (
              <p className="text-gray-500 text-sm">Loading...</p>
            ) : playlist.length === 0 ? (
              <p className="text-gray-500 text-sm">No programs in playlist</p>
            ) : (
              <div className="space-y-2">
                {playlist.map((program) => (
                  <div
                    key={program.id}
                    className="flex items-center justify-between p-3 bg-green-50 rounded border border-green-200"
                  >
                    <div>
                      <p className="font-medium">{program.name}</p>
                      {program.description && (
                        <p className="text-sm text-gray-600">{program.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeFromPlaylist(program.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Program */}
          <div className="border-t pt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Add Program to TV</h3>

            {videoFiles.length === 0 ? (
              <p className="text-sm text-gray-500">No video files found. Upload one above first.</p>
            ) : (
              <div className="flex gap-4">
                <select
                  value={selectedVideoId}
                  onChange={(e) => setSelectedVideoId(e.target.value)}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  <option value="">-- Select a video file --</option>
                  {videoFiles
                    .filter((file) => !playlist.some((p) => p.id === file.slug))
                    .map((file) => (
                      <option key={file.id} value={file.id}>
                        {file.name}
                      </option>
                    ))}
                </select>
                <button
                  onClick={addToTvPlaylist}
                  disabled={!selectedVideoId}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-medium py-2 px-6 rounded"
                >
                  Add to TV
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Video Library */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-lg font-semibold mb-6">Video Library</h2>

          {libraryMessage && (
            <div
              className={`mb-4 p-3 rounded ${
                libraryMessage.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {libraryMessage.text}
            </div>
          )}

          {videoFiles.length === 0 ? (
            <p className="text-gray-500 text-sm">No video files uploaded</p>
          ) : (
            <div className="space-y-2">
              {videoFiles.map((file) => (
                <div
                  key={file.url}
                  className="flex items-center justify-between p-3 bg-green-50 rounded border border-green-200"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{file.name}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {file.slug} {file.aspectRatio ? `(${file.aspectRatio})` : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteVideoFile(file.url, file.name)}
                    disabled={deletingVideo === file.url}
                    className="ml-4 text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                  >
                    {deletingVideo === file.url ? "Deleting..." : "Delete"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
