"use client"

import { useSession } from "next-auth/react"
import { useState, useRef } from "react"
import { redirect } from "next/navigation"
import Link from "next/link"

export default function VideoUploadPage() {
  const { data: session, status } = useSession()
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Video dimensions and duration (auto-detected)
  const [detectedWidth, setDetectedWidth] = useState<number | null>(null)
  const [detectedHeight, setDetectedHeight] = useState<number | null>(null)
  const [detectedDuration, setDetectedDuration] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    artist: "",
    artistSlug: "",
    aspectRatio: "landscape" as "landscape" | "portrait" | "square",
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      setDetectedWidth(null)
      setDetectedHeight(null)
      setDetectedDuration(null)
      return
    }

    // Auto-detect video dimensions and duration using HTML5 video element
    const video = document.createElement("video")
    video.preload = "metadata"
    video.onloadedmetadata = () => {
      setDetectedWidth(video.videoWidth)
      setDetectedHeight(video.videoHeight)
      setDetectedDuration(video.duration)
      URL.revokeObjectURL(video.src)
    }
    video.onerror = () => {
      setDetectedWidth(null)
      setDetectedHeight(null)
      setDetectedDuration(null)
    }
    video.src = URL.createObjectURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const file = fileInputRef.current?.files?.[0]

    if (!file) {
      setMessage({ type: "error", text: "Please select a file to upload" })
      return
    }

    if (!formData.title) {
      setMessage({ type: "error", text: "Please fill in all required fields" })
      return
    }

    setUploading(true)
    setMessage(null)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append("file", file)
      uploadFormData.append("title", formData.title)
      uploadFormData.append("description", formData.description)
      uploadFormData.append("artist", formData.artist)
      uploadFormData.append("artistSlug", formData.artistSlug)
      uploadFormData.append("aspectRatio", formData.aspectRatio)
      if (detectedWidth) uploadFormData.append("width", detectedWidth.toString())
      if (detectedHeight) uploadFormData.append("height", detectedHeight.toString())
      if (detectedDuration) uploadFormData.append("duration", detectedDuration.toString())

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

      setFormData({ title: "", description: "", artist: "", artistSlug: "", aspectRatio: "landscape" })
      setDetectedWidth(null)
      setDetectedHeight(null)
      setDetectedDuration(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Upload failed" })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/admin/world-data/video" className="text-gray-500 hover:text-gray-700">
            ← Back
          </Link>
          <h1 className="text-xl font-bold text-green-600">Upload New Video</h1>
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
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="e.g., Kempo News Broadcast"
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
                onChange={handleFileChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
              {(detectedWidth && detectedHeight) || detectedDuration ? (
                <p className="mt-1 text-sm text-gray-500">
                  Detected: {detectedWidth && detectedHeight ? `${detectedWidth} x ${detectedHeight} pixels` : ''}
                  {detectedWidth && detectedHeight && detectedDuration ? ' · ' : ''}
                  {detectedDuration ? `${Math.floor(detectedDuration / 60)}:${Math.floor(detectedDuration % 60).toString().padStart(2, '0')}` : ''}
                </p>
              ) : null}
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
      </main>
    </div>
  )
}
