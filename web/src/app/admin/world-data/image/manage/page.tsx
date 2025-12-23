"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { redirect } from "next/navigation"
import Link from "next/link"

interface ImageFile {
  id: string
  name: string
  url: string
  description: string | null
  altText: string | null
  width: number | null
  height: number | null
  shape: string | null
  category: string | null
  articleId: string | null
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

interface LinkedSubject {
  id: string
  itemId: string
  itemType: string
  person?: {
    id: string
    firstName: string
    middleName: string | null
    lastName: string
    articleId: string | null
  }
  organization?: {
    id: string
    name: string
    abbreviation: string | null
    articleId: string | null
  }
  brand?: {
    id: string
    name: string
    articleId: string | null
  }
  product?: {
    id: string
    name: string
    articleId: string | null
  }
  nation?: {
    id: string
    name: string
    shortCode: string | null
    articleId: string | null
  }
  state?: {
    id: string
    name: string
    abbreviation: string | null
    articleId: string | null
  }
  city?: {
    id: string
    name: string
    articleId: string | null
  }
  place?: {
    id: string
    name: string
    placeType: string
    articleId: string | null
  }
}

export default function ImageManagePage() {
  const { data: session, status } = useSession()

  // Image files from database
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([])

  // Library sorting
  const [sortField, setSortField] = useState<"name" | "createdAt" | "kyDate">("createdAt")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const stripPunctuation = (str: string) => str.replace(/^[^\w\s]+/, "").toLowerCase()

  const sortedImageFiles = [...imageFiles].sort((a, b) => {
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
  const [deletingImage, setDeletingImage] = useState<string | null>(null)
  const [libraryMessage, setLibraryMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Delete confirmation modal
  const [deleteModal, setDeleteModal] = useState<{ url: string; name: string; id: string } | null>(null)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [references, setReferences] = useState<Reference[]>([])
  const [loadingReferences, setLoadingReferences] = useState(false)

  // Edit modal
  const [editModal, setEditModal] = useState<ImageFile | null>(null)
  const [editData, setEditData] = useState({
    name: "",
    description: "",
    altText: "",
    shape: "landscape" as "landscape" | "portrait" | "square",
    category: "",
    articleId: "",
    kyDate: "",
  })
  const [saving, setSaving] = useState(false)
  const [editMessage, setEditMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [linkedSubjects, setLinkedSubjects] = useState<LinkedSubject[]>([])

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
    redirect("/admin")
  }

  const openDeleteModal = async (url: string, name: string, id: string) => {
    setDeleteModal({ url, name, id })
    setDeleteConfirmText("")
    setReferences([])
    setLoadingReferences(true)

    try {
      const res = await fetch("/api/media/find-references", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, mediaType: "image" }),
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

  const openEditModal = async (file: ImageFile) => {
    setEditModal(file)
    setEditData({
      name: file.name,
      description: file.description || "",
      altText: file.altText || "",
      shape: (file.shape as "landscape" | "portrait" | "square") || "landscape",
      category: file.category || "",
      articleId: file.articleId || "",
      kyDate: file.kyDate ? file.kyDate.split("T")[0] : "",
    })
    setEditMessage(null)
    setLinkedSubjects([])

    // Fetch linked subjects for this image
    try {
      const res = await fetch(`/api/image/${file.id}/subjects`)
      if (res.ok) {
        const data = await res.json()
        setLinkedSubjects(data)
      }
    } catch (err) {
      console.error("Failed to fetch linked subjects:", err)
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
      const res = await fetch("/api/image/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editModal.id,
          name: editData.name,
          description: editData.description,
          altText: editData.altText,
          shape: editData.shape,
          category: editData.category,
          articleId: editData.articleId,
          kyDate: editData.kyDate || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Update failed")
      }

      setEditMessage({ type: "success", text: "Saved successfully!" })
      await reloadImageFiles()

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

    setDeletingImage(deleteModal.url)
    setLibraryMessage(null)

    try {
      // First, remove references from articles/pages
      if (references.length > 0) {
        await fetch("/api/media/remove-references", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: deleteModal.url }),
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
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/world-data/image" className="text-gray-500 hover:text-gray-700">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-blue-600">Manage Images</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Image Library */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Image Library</h2>
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

          {sortedImageFiles.length === 0 ? (
            <p className="text-gray-500 text-sm">No images uploaded</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {sortedImageFiles.map((file) => (
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
                      {file.width && file.height && `${file.width}x${file.height}`}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {new Date(file.createdAt).toLocaleDateString()}
                      {file.kyDate && ` · k.y. ${new Date(file.kyDate).toLocaleDateString()}`}
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
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => openEditModal(file)}
                        className="flex-1 text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View/Edit
                      </button>
                      <button
                        onClick={() => openDeleteModal(file.url, file.name, file.id)}
                        disabled={deletingImage === file.url}
                        className="flex-1 text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                      >
                        {deletingImage === file.url ? "Deleting..." : "Delete"}
                      </button>
                    </div>
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

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">View/Edit Image</h3>

            {editMessage && (
              <div
                className={`mb-4 p-3 rounded ${
                  editMessage.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
              >
                {editMessage.text}
              </div>
            )}

            {/* Thumbnail preview */}
            <div className="mb-4">
              <img
                src={editModal.url}
                alt={editModal.altText || editModal.name}
                className="max-h-32 mx-auto rounded border"
              />
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
                {(editModal.width || editModal.height) && (
                  <div>
                    <label className="block text-xs text-gray-500">Dimensions</label>
                    <p className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {editModal.width} x {editModal.height} pixels
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alt Text</label>
                <input
                  type="text"
                  value={editData.altText}
                  onChange={(e) => setEditData({ ...editData, altText: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shape</label>
                  <select
                    value={editData.shape}
                    onChange={(e) => setEditData({ ...editData, shape: e.target.value as "landscape" | "portrait" | "square" })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="landscape">Landscape (wide)</option>
                    <option value="portrait">Portrait (tall)</option>
                    <option value="square">Square</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={editData.category}
                    onChange={(e) => setEditData({ ...editData, category: e.target.value })}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Associated Article ID</label>
                <input
                  type="text"
                  value={editData.articleId}
                  onChange={(e) => setEditData({ ...editData, articleId: e.target.value })}
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

            {/* Linked Subjects section */}
            <div className="mt-6 border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Linked Subjects</h4>
              {linkedSubjects.length === 0 ? (
                <p className="text-sm text-gray-500">No linked subjects</p>
              ) : (
                <div className="space-y-2">
                  {linkedSubjects.map((subject) => (
                    <div key={subject.id} className="flex items-center gap-2 text-sm">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        subject.itemType === "person"
                          ? "bg-purple-100 text-purple-700"
                          : subject.itemType === "organization"
                          ? "bg-teal-100 text-teal-700"
                          : subject.itemType === "brand"
                          ? "bg-orange-100 text-orange-700"
                          : subject.itemType === "product"
                          ? "bg-rose-100 text-rose-700"
                          : subject.itemType === "nation"
                          ? "bg-blue-100 text-blue-700"
                          : subject.itemType === "state"
                          ? "bg-indigo-100 text-indigo-700"
                          : subject.itemType === "city"
                          ? "bg-cyan-100 text-cyan-700"
                          : subject.itemType === "place"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {subject.itemType}
                      </span>
                      {subject.person ? (
                        subject.person.articleId ? (
                          <a
                            href={`/kemponet/kempopedia/wiki/${subject.person.articleId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:text-purple-800 hover:underline"
                          >
                            {subject.person.firstName}
                            {subject.person.middleName ? ` ${subject.person.middleName}` : ""}{" "}
                            {subject.person.lastName}
                          </a>
                        ) : (
                          <span className="text-gray-700">
                            {subject.person.firstName}
                            {subject.person.middleName ? ` ${subject.person.middleName}` : ""}{" "}
                            {subject.person.lastName}
                          </span>
                        )
                      ) : subject.organization ? (
                        subject.organization.articleId ? (
                          <a
                            href={`/kemponet/kempopedia/wiki/${subject.organization.articleId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-teal-600 hover:text-teal-800 hover:underline"
                          >
                            {subject.organization.name}
                            {subject.organization.abbreviation ? ` (${subject.organization.abbreviation})` : ""}
                          </a>
                        ) : (
                          <span className="text-gray-700">
                            {subject.organization.name}
                            {subject.organization.abbreviation ? ` (${subject.organization.abbreviation})` : ""}
                          </span>
                        )
                      ) : subject.brand ? (
                        subject.brand.articleId ? (
                          <a
                            href={`/kemponet/kempopedia/wiki/${subject.brand.articleId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-orange-600 hover:text-orange-800 hover:underline"
                          >
                            {subject.brand.name}
                          </a>
                        ) : (
                          <span className="text-gray-700">{subject.brand.name}</span>
                        )
                      ) : subject.product ? (
                        subject.product.articleId ? (
                          <a
                            href={`/kemponet/kempopedia/wiki/${subject.product.articleId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-rose-600 hover:text-rose-800 hover:underline"
                          >
                            {subject.product.name}
                          </a>
                        ) : (
                          <span className="text-gray-700">{subject.product.name}</span>
                        )
                      ) : subject.nation ? (
                        subject.nation.articleId ? (
                          <a
                            href={`/kemponet/kempopedia/wiki/${subject.nation.articleId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {subject.nation.name}
                            {subject.nation.shortCode ? ` (${subject.nation.shortCode})` : ""}
                          </a>
                        ) : (
                          <span className="text-gray-700">
                            {subject.nation.name}
                            {subject.nation.shortCode ? ` (${subject.nation.shortCode})` : ""}
                          </span>
                        )
                      ) : subject.state ? (
                        subject.state.articleId ? (
                          <a
                            href={`/kemponet/kempopedia/wiki/${subject.state.articleId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-800 hover:underline"
                          >
                            {subject.state.name}
                            {subject.state.abbreviation ? ` (${subject.state.abbreviation})` : ""}
                          </a>
                        ) : (
                          <span className="text-gray-700">
                            {subject.state.name}
                            {subject.state.abbreviation ? ` (${subject.state.abbreviation})` : ""}
                          </span>
                        )
                      ) : subject.city ? (
                        subject.city.articleId ? (
                          <a
                            href={`/kemponet/kempopedia/wiki/${subject.city.articleId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-600 hover:text-cyan-800 hover:underline"
                          >
                            {subject.city.name}
                          </a>
                        ) : (
                          <span className="text-gray-700">{subject.city.name}</span>
                        )
                      ) : subject.place ? (
                        subject.place.articleId ? (
                          <a
                            href={`/kemponet/kempopedia/wiki/${subject.place.articleId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-800 hover:underline"
                          >
                            {subject.place.name}
                            {subject.place.placeType ? ` (${subject.place.placeType})` : ""}
                          </a>
                        ) : (
                          <span className="text-gray-700">
                            {subject.place.name}
                            {subject.place.placeType ? ` (${subject.place.placeType})` : ""}
                          </span>
                        )
                      ) : (
                        <span className="text-gray-500">Unknown {subject.itemType}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
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
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
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
