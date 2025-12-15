"use client"

import { useSession, signOut } from "next-auth/react"
import { useState, useRef, useEffect } from "react"
import { redirect } from "next/navigation"

interface PlaylistItem {
  id: string
  name: string
  artist: string
  url: string
}

interface TVPlaylistItem {
  id: string
  name: string
  description?: string
  url: string
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Playlist state
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([])
  const [playlistLoading, setPlaylistLoading] = useState(true)
  const [playlistMessage, setPlaylistMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [newTrack, setNewTrack] = useState({
    id: "",
    name: "",
    artist: "",
    url: "",
  })
  const [loadingTrackInfo, setLoadingTrackInfo] = useState(false)

  // Available audio files from blob storage
  const [audioFiles, setAudioFiles] = useState<{ url: string; slug: string; filename: string }[]>([])
  const [selectedAudioFile, setSelectedAudioFile] = useState("")

  // TV Playlist state
  const [tvPlaylist, setTvPlaylist] = useState<TVPlaylistItem[]>([])
  const [tvPlaylistLoading, setTvPlaylistLoading] = useState(true)
  const [tvPlaylistMessage, setTvPlaylistMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [newProgram, setNewProgram] = useState({
    id: "",
    name: "",
    description: "",
    url: "",
  })

  // Available video files from blob storage
  const [videoFiles, setVideoFiles] = useState<{ url: string; slug: string; filename: string }[]>([])
  const [selectedVideoFile, setSelectedVideoFile] = useState("")

  // Media library state
  const [deletingMedia, setDeletingMedia] = useState<string | null>(null)
  const [mediaMessage, setMediaMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    mediaType: "audio" as "audio" | "video",
    description: "",
  })

  // Load playlists and media files on mount
  useEffect(() => {
    // Load radio playlist
    fetch("/api/radio/playlist")
      .then((res) => res.json())
      .then((data) => {
        setPlaylist(data)
        setPlaylistLoading(false)
      })
      .catch(() => setPlaylistLoading(false))

    // Load TV playlist
    fetch("/api/tv/playlist")
      .then((res) => res.json())
      .then((data) => {
        setTvPlaylist(data)
        setTvPlaylistLoading(false)
      })
      .catch(() => setTvPlaylistLoading(false))

    // Load audio files
    fetch("/api/media/list?type=audio")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAudioFiles(data)
        }
      })
      .catch((err) => console.error("Failed to load audio files:", err))

    // Load video files
    fetch("/api/media/list?type=video")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setVideoFiles(data)
        }
      })
      .catch((err) => console.error("Failed to load video files:", err))
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
      uploadFormData.append("mediaType", formData.mediaType)
      uploadFormData.append("description", formData.description)

      const response = await fetch("/api/media/upload", {
        method: "POST",
        body: uploadFormData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Upload failed")
      }

      setMessage({ type: "success", text: "Media uploaded successfully!" })
      setUploadedUrl(result.url)

      // Refresh media files list
      await reloadMediaFiles()

      // Reset form
      setFormData({ title: "", slug: "", mediaType: "audio", description: "" })
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

  const savePlaylist = async (newPlaylist: PlaylistItem[]) => {
    try {
      const res = await fetch("/api/radio/playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPlaylist),
      })

      if (!res.ok) {
        throw new Error("Failed to save playlist")
      }

      setPlaylist(newPlaylist)
      setPlaylistMessage({ type: "success", text: "Playlist saved!" })
      setTimeout(() => setPlaylistMessage(null), 3000)
    } catch (error) {
      setPlaylistMessage({ type: "error", text: error instanceof Error ? error.message : "Failed to save" })
    }
  }

  const removeFromPlaylist = (id: string) => {
    const newPlaylist = playlist.filter((item) => item.id !== id)
    savePlaylist(newPlaylist)
  }

  const handleAudioFileSelect = async (url: string) => {
    setSelectedAudioFile(url)
    const file = audioFiles.find((f) => f.url === url)
    if (file) {
      setNewTrack({
        id: file.slug,
        name: "",
        artist: "",
        url: file.url,
      })

      // Try to find track info from Kempopedia
      setLoadingTrackInfo(true)
      try {
        const res = await fetch(`/api/media/lookup?slug=${encodeURIComponent(file.slug)}`)
        if (res.ok) {
          const data = await res.json()
          if (data.name || data.artist) {
            setNewTrack({
              id: file.slug,
              name: data.name || "",
              artist: data.artist || "",
              url: file.url,
            })
          }
        }
      } catch (err) {
        console.error("Failed to lookup track info:", err)
      } finally {
        setLoadingTrackInfo(false)
      }
    }
  }

  const addToPlaylist = () => {
    if (!newTrack.id || !newTrack.name || !newTrack.artist || !newTrack.url) {
      setPlaylistMessage({ type: "error", text: "Please fill in all fields" })
      return
    }

    if (playlist.some((item) => item.id === newTrack.id)) {
      setPlaylistMessage({ type: "error", text: "Track with this ID already exists" })
      return
    }

    const newPlaylist = [...playlist, newTrack]
    savePlaylist(newPlaylist)
    setNewTrack({ id: "", name: "", artist: "", url: "" })
    setSelectedAudioFile("")
  }

  // TV Playlist functions
  const saveTvPlaylist = async (newPlaylist: TVPlaylistItem[]) => {
    try {
      const res = await fetch("/api/tv/playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPlaylist),
      })

      if (!res.ok) {
        throw new Error("Failed to save TV playlist")
      }

      setTvPlaylist(newPlaylist)
      setTvPlaylistMessage({ type: "success", text: "TV Playlist saved!" })
      setTimeout(() => setTvPlaylistMessage(null), 3000)
    } catch (error) {
      setTvPlaylistMessage({ type: "error", text: error instanceof Error ? error.message : "Failed to save" })
    }
  }

  const removeFromTvPlaylist = (id: string) => {
    const newPlaylist = tvPlaylist.filter((item) => item.id !== id)
    saveTvPlaylist(newPlaylist)
  }

  const handleVideoFileSelect = (url: string) => {
    setSelectedVideoFile(url)
    const file = videoFiles.find((f) => f.url === url)
    if (file) {
      setNewProgram({
        id: file.slug,
        name: "",
        description: "",
        url: file.url,
      })
    }
  }

  const addToTvPlaylist = () => {
    if (!newProgram.id || !newProgram.name || !newProgram.url) {
      setTvPlaylistMessage({ type: "error", text: "Please fill in Program ID and Name" })
      return
    }

    if (tvPlaylist.some((item) => item.id === newProgram.id)) {
      setTvPlaylistMessage({ type: "error", text: "Program with this ID already exists" })
      return
    }

    const newPlaylist = [...tvPlaylist, newProgram]
    saveTvPlaylist(newPlaylist)
    setNewProgram({ id: "", name: "", description: "", url: "" })
    setSelectedVideoFile("")
  }

  // Reload media files
  const reloadMediaFiles = async () => {
    try {
      const [audioRes, videoRes] = await Promise.all([
        fetch("/api/media/list?type=audio"),
        fetch("/api/media/list?type=video")
      ])
      const audioData = await audioRes.json()
      const videoData = await videoRes.json()
      if (Array.isArray(audioData)) setAudioFiles(audioData)
      if (Array.isArray(videoData)) setVideoFiles(videoData)
    } catch (err) {
      console.error("Failed to reload media files:", err)
    }
  }

  // Delete media file
  const deleteMediaFile = async (url: string, filename: string) => {
    if (!confirm(`Are you sure you want to delete "${filename}"? This cannot be undone.`)) {
      return
    }

    setDeletingMedia(url)
    setMediaMessage(null)

    try {
      const res = await fetch("/api/media/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Delete failed")
      }

      setMediaMessage({ type: "success", text: `"${filename}" deleted successfully` })
      await reloadMediaFiles()
      setTimeout(() => setMediaMessage(null), 3000)
    } catch (error) {
      setMediaMessage({ type: "error", text: error instanceof Error ? error.message : "Delete failed" })
    } finally {
      setDeletingMedia(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Kempo Admin</h1>
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
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-6">Upload Media</h2>

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
                Media Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.mediaType}
                onChange={(e) => setFormData({ ...formData, mediaType: e.target.value as "audio" | "video" })}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="audio">Audio (MP3, WAV, etc.)</option>
                <option value="video">Video (MP4, WebM, etc.)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
                rows={3}
                placeholder="Brief description of the media..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                File <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                ref={fileInputRef}
                accept={formData.mediaType === "audio" ? "audio/*" : "video/*"}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? "Uploading..." : "Upload Media"}
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
                    className="flex items-center justify-between p-3 bg-gray-50 rounded border"
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

            {/* Audio File Dropdown */}
            <div className="mb-4">
              <label className="block text-xs text-gray-500 mb-1">Select Audio File</label>
              <select
                value={selectedAudioFile}
                onChange={(e) => handleAudioFileSelect(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="">-- Select an audio file --</option>
                {audioFiles.map((file) => (
                  <option key={file.url} value={file.url}>
                    {file.filename}
                  </option>
                ))}
              </select>
            </div>

            {selectedAudioFile && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Track ID</label>
                  <input
                    type="text"
                    value={newTrack.id}
                    readOnly
                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Storage URL</label>
                  <input
                    type="text"
                    value={newTrack.url}
                    readOnly
                    className="w-full border border-gray-200 rounded px-3 py-2 text-xs bg-gray-100 text-gray-500 cursor-not-allowed truncate"
                    title={newTrack.url}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Track Name *</label>
                  <input
                    type="text"
                    value={newTrack.name}
                    onChange={(e) => setNewTrack({ ...newTrack, name: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    disabled={loadingTrackInfo}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Artist Name *</label>
                  <input
                    type="text"
                    value={newTrack.artist}
                    onChange={(e) => setNewTrack({ ...newTrack, artist: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    disabled={loadingTrackInfo}
                  />
                </div>
                {loadingTrackInfo && (
                  <div className="col-span-2 text-sm text-gray-500">
                    Looking up track info from Kempopedia...
                  </div>
                )}
                <div className="col-span-2">
                  <button
                    onClick={addToPlaylist}
                    disabled={loadingTrackInfo}
                    className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-medium py-2 px-4 rounded"
                  >
                    Add to Radio
                  </button>
                </div>
              </div>
            )}

            {audioFiles.length === 0 && (
              <p className="text-sm text-gray-500">No audio files found in storage. Upload one above first.</p>
            )}
          </div>
        </div>

        {/* TV Playlist Management */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-lg font-semibold mb-6">Kempo TV Playlist</h2>

          {tvPlaylistMessage && (
            <div
              className={`mb-4 p-3 rounded ${
                tvPlaylistMessage.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {tvPlaylistMessage.text}
            </div>
          )}

          {/* Current TV Playlist */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Current Programs</h3>
            {tvPlaylistLoading ? (
              <p className="text-gray-500 text-sm">Loading...</p>
            ) : tvPlaylist.length === 0 ? (
              <p className="text-gray-500 text-sm">No programs in playlist</p>
            ) : (
              <div className="space-y-2">
                {tvPlaylist.map((program) => (
                  <div
                    key={program.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded border"
                  >
                    <div>
                      <p className="font-medium">{program.name}</p>
                      {program.description && (
                        <p className="text-sm text-gray-600">{program.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeFromTvPlaylist(program.id)}
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

            {/* Video File Dropdown */}
            <div className="mb-4">
              <label className="block text-xs text-gray-500 mb-1">Select Video File</label>
              <select
                value={selectedVideoFile}
                onChange={(e) => handleVideoFileSelect(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="">-- Select a video file --</option>
                {videoFiles.map((file) => (
                  <option key={file.url} value={file.url}>
                    {file.filename}
                  </option>
                ))}
              </select>
            </div>

            {selectedVideoFile && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Program ID</label>
                  <input
                    type="text"
                    value={newProgram.id}
                    readOnly
                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Storage URL</label>
                  <input
                    type="text"
                    value={newProgram.url}
                    readOnly
                    className="w-full border border-gray-200 rounded px-3 py-2 text-xs bg-gray-100 text-gray-500 cursor-not-allowed truncate"
                    title={newProgram.url}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Program Name *</label>
                  <input
                    type="text"
                    value={newProgram.name}
                    onChange={(e) => setNewProgram({ ...newProgram, name: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Description (optional)</label>
                  <input
                    type="text"
                    value={newProgram.description}
                    onChange={(e) => setNewProgram({ ...newProgram, description: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                </div>
                <div className="col-span-2">
                  <button
                    onClick={addToTvPlaylist}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded"
                  >
                    Add to TV
                  </button>
                </div>
              </div>
            )}

            {videoFiles.length === 0 && (
              <p className="text-sm text-gray-500">No video files found in storage. Upload one above first.</p>
            )}
          </div>
        </div>

        {/* Media Library */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-lg font-semibold mb-6">Media Library</h2>

          {mediaMessage && (
            <div
              className={`mb-4 p-3 rounded ${
                mediaMessage.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {mediaMessage.text}
            </div>
          )}

          {/* Audio Files */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Audio Files</h3>
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
                      <p className="font-medium text-sm truncate">{file.filename}</p>
                      <p className="text-xs text-gray-500 truncate">{file.url}</p>
                    </div>
                    <button
                      onClick={() => deleteMediaFile(file.url, file.filename)}
                      disabled={deletingMedia === file.url}
                      className="ml-4 text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                    >
                      {deletingMedia === file.url ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Video Files */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Video Files</h3>
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
                      <p className="font-medium text-sm truncate">{file.filename}</p>
                      <p className="text-xs text-gray-500 truncate">{file.url}</p>
                    </div>
                    <button
                      onClick={() => deleteMediaFile(file.url, file.filename)}
                      disabled={deletingMedia === file.url}
                      className="ml-4 text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                    >
                      {deletingMedia === file.url ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
