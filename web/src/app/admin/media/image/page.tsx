"use client"

import { useSession, signOut } from "next-auth/react"
import { useState, useRef, useEffect } from "react"
import { redirect } from "next/navigation"
import Link from "next/link"

interface ImageFile {
  id: string
  slug: string
  name: string
  url: string
  description: string | null
  altText: string | null
  width: number | null
  height: number | null
  shape: string | null
  category: string | null
  articleSlug: string | null
}

interface Reference {
  type: "article" | "page" | "tv-playlist" | "radio-playlist"
  slug: string
  title: string
  field: string
}

export default function ImageManagementPage() {
  const { data: session, status } = useSession()
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Image files from database
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([])

  // Library state
  const [deletingImage, setDeletingImage] = useState<string | null>(null)
  const [libraryMessage, setLibraryMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Delete confirmation modal
  const [deleteModal, setDeleteModal] = useState<{ url: string; name: string; slug: string } | null>(null)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [references, setReferences] = useState<Reference[]>([])
  const [loadingReferences, setLoadingReferences] = useState(false)

  // Image dimensions (auto-detected)
  const [detectedWidth, setDetectedWidth] = useState<number | null>(null)
  const [detectedHeight, setDetectedHeight] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    altText: "",
    shape: "landscape" as "landscape" | "portrait" | "square",
    category: "",
    articleSlug: "",
  })

  // Load image files on mount
  useEffect(() => {
    reloadImageFiles()
  }, [])

  const reloadImageFiles = async () => {
    try {
      const res = await fetch("/api/image/list")
      const data = await res.json()
      if (Array.isArray(data)) {
        setImageFiles(data)
      }
    } catch (err) {
      console.error("Failed to load image files:", err)
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      setDetectedWidth(null)
      setDetectedHeight(null)
      return
    }

    // Auto-detect dimensions using browser Image API
    const img = new Image()
    img.onload = () => {
      setDetectedWidth(img.naturalWidth)
      setDetectedHeight(img.naturalHeight)
    }
    img.onerror = () => {
      setDetectedWidth(null)
      setDetectedHeight(null)
    }
    img.src = URL.createObjectURL(file)
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
      uploadFormData.append("altText", formData.altText)
      uploadFormData.append("shape", formData.shape)
      uploadFormData.append("category", formData.category)
      uploadFormData.append("articleSlug", formData.articleSlug)
      if (detectedWidth) uploadFormData.append("width", detectedWidth.toString())
      if (detectedHeight) uploadFormData.append("height", detectedHeight.toString())

      const response = await fetch("/api/image/upload", {
        method: "POST",
        body: uploadFormData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Upload failed")
      }

      setMessage({ type: "success", text: "Image uploaded successfully!" })
      setUploadedUrl(result.url)

      await reloadImageFiles()

      setFormData({ title: "", slug: "", description: "", altText: "", shape: "landscape", category: "", articleSlug: "" })
      setDetectedWidth(null)
      setDetectedHeight(null)
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

  const openDeleteModal = async (url: string, name: string, slug: string) => {
    setDeleteModal({ url, name, slug })
    setDeleteConfirmText("")
    setReferences([])
    setLoadingReferences(true)

    try {
      const res = await fetch("/api/media/find-references", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, slug, mediaType: "image" }),
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

    setDeletingImage(deleteModal.url)
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
      const res = await fetch("/api/image/delete", {
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
      await reloadImageFiles()
      closeDeleteModal()

      setTimeout(() => setLibraryMessage(null), 3000)
    } catch (error) {
      setLibraryMessage({ type: "error", text: error instanceof Error ? error.message : "Delete failed" })
    } finally {
      setDeletingImage(null)
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
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold">Image Management</h1>
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
          <h2 className="text-lg font-semibold mb-6">Upload Image</h2>

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
                placeholder="e.g., Clay Marshall portrait"
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
                placeholder="e.g., clay-marshall-portrait"
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
                placeholder="Brief description or caption..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alt Text
              </label>
              <input
                type="text"
                value={formData.altText}
                onChange={(e) => setFormData({ ...formData, altText: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Accessibility description..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shape
                </label>
                <select
                  value={formData.shape}
                  onChange={(e) => setFormData({ ...formData, shape: e.target.value as "landscape" | "portrait" | "square" })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="landscape">Landscape (wide)</option>
                  <option value="portrait">Portrait (tall)</option>
                  <option value="square">Square</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">-- Select --</option>
                  <option value="portrait">Portrait</option>
                  <option value="location">Location</option>
                  <option value="product">Product</option>
                  <option value="logo">Logo</option>
                  <option value="event">Event</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Associated Article Slug
              </label>
              <input
                type="text"
                value={formData.articleSlug}
                onChange={(e) => setFormData({ ...formData, articleSlug: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="e.g., clay-marshall (Kempopedia article)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                File <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
              {detectedWidth && detectedHeight && (
                <p className="mt-1 text-sm text-gray-500">
                  Detected: {detectedWidth} x {detectedHeight} pixels
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? "Uploading..." : "Upload Image"}
            </button>
          </form>
        </div>

        {/* Image Library */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-lg font-semibold mb-6">Image Library</h2>

          {libraryMessage && (
            <div
              className={`mb-4 p-3 rounded ${
                libraryMessage.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {libraryMessage.text}
            </div>
          )}

          {imageFiles.length === 0 ? (
            <p className="text-gray-500 text-sm">No images uploaded</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {imageFiles.map((file) => (
                <div
                  key={file.url}
                  className="bg-blue-50 rounded border border-blue-200 overflow-hidden"
                >
                  <div className="aspect-square relative">
                    <img
                      src={file.url}
                      alt={file.altText || file.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <p className="font-medium text-sm truncate">{file.name}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {file.slug}
                      {file.width && file.height && ` (${file.width}x${file.height})`}
                    </p>
                    {file.shape && (
                      <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                        {file.shape}
                      </span>
                    )}
                    {file.category && (
                      <span className="inline-block mt-1 ml-1 text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                        {file.category}
                      </span>
                    )}
                    <button
                      onClick={() => openDeleteModal(file.url, file.name, file.slug)}
                      disabled={deletingImage === file.url}
                      className="mt-2 w-full text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                    >
                      {deletingImage === file.url ? "Deleting..." : "Delete"}
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
                disabled={deleteConfirmText !== "DELETE" || deletingImage === deleteModal.url}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingImage === deleteModal.url ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
