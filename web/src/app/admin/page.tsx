"use client"

import { useSession, signOut } from "next-auth/react"
import { useState, useRef } from "react"
import { redirect } from "next/navigation"

export default function AdminPage() {
  const { data: session, status } = useSession()
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    mediaType: "audio" as "audio" | "video",
    description: "",
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
      </main>
    </div>
  )
}
