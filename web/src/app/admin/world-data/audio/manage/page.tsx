"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { redirect } from "next/navigation"
import Link from "next/link"

interface AudioElement {
  id: string
  itemId: string
  itemType: string
  itemName?: string // Resolved name for display
}

interface AudioFile {
  id: string
  name: string
  url: string
  type: string
  description: string | null
  duration: number | null
  kyDate: string | null
  createdAt: string
  updatedAt: string
  elements: AudioElement[]
}

interface Reference {
  type: "article" | "page" | "tv-playlist"
  slug: string
  title: string
  field: string
}

export default function AudioManagePage() {
  const { data: session, status } = useSession()

  // Audio files from database
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([])

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
  const [deleteModal, setDeleteModal] = useState<{ url: string; name: string; id: string } | null>(null)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [references, setReferences] = useState<Reference[]>([])
  const [loadingReferences, setLoadingReferences] = useState(false)

  // Edit modal
  const [editModal, setEditModal] = useState<AudioFile | null>(null)
  const [editData, setEditData] = useState({
    name: "",
    description: "",
    type: "song",
    kyDate: "",
  })

  // People for element selection
  const [availablePeople, setAvailablePeople] = useState<Array<{ id: string; name: string }>>([])
  const [selectedPersonId, setSelectedPersonId] = useState("")
  const [selectedElementType, setSelectedElementType] = useState("singer")

  // Albums for element selection
  const [availableAlbums, setAvailableAlbums] = useState<Array<{ id: string; name: string }>>([])
  const [selectedAlbumId, setSelectedAlbumId] = useState("")
  const [saving, setSaving] = useState(false)
  const [editMessage, setEditMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Load audio files and people on mount
  useEffect(() => {
    reloadAudioFiles()

    // Load available people for element selection
    fetch("/api/people/list")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAvailablePeople(
            data.map((p: { id: string; firstName: string; lastName: string; nickname?: string }) => ({
              id: p.id,
              name: `${p.nickname || p.firstName} ${p.lastName}`,
            }))
          )
        }
      })
      .catch((err) => console.error("Failed to load people:", err))

    // Load available albums for element selection
    fetch("/api/albums/list")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAvailableAlbums(
            data.map((a: { id: string; name: string }) => ({
              id: a.id,
              name: a.name,
            }))
          )
        }
      })
      .catch((err) => console.error("Failed to load albums:", err))
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

  const openDeleteModal = async (url: string, name: string, id: string) => {
    setDeleteModal({ url, name, id })
    setDeleteConfirmText("")
    setReferences([])
    setLoadingReferences(true)

    try {
      const res = await fetch("/api/media/find-references", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, mediaType: "audio" }),
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
      description: file.description || "",
      type: file.type || "song",
      kyDate: file.kyDate ? file.kyDate.split("T")[0] : "",
    })
    setSelectedPersonId("")
    setSelectedElementType("singer")
    setSelectedAlbumId("")
    setEditMessage(null)
  }

  const closeEditModal = () => {
    setEditModal(null)
    setEditMessage(null)
  }

  const addElement = async () => {
    if (!editModal || !selectedPersonId) return

    try {
      const res = await fetch(`/api/audio/${editModal.id}/elements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: selectedPersonId,
          itemType: selectedElementType,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to add element")
      }

      setEditMessage({ type: "success", text: "Element added!" })
      await reloadAudioFiles()
      // Update the modal with new data
      const updated = await res.json()
      setEditModal((prev) => prev ? { ...prev, elements: updated.elements } : null)
      setSelectedPersonId("")
      setTimeout(() => setEditMessage(null), 2000)
    } catch (error) {
      setEditMessage({ type: "error", text: error instanceof Error ? error.message : "Failed to add" })
    }
  }

  const removeElement = async (elementId: string) => {
    if (!editModal) return

    try {
      const res = await fetch(`/api/audio/${editModal.id}/elements`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ elementId }),
      })

      if (!res.ok) {
        throw new Error("Failed to remove element")
      }

      await reloadAudioFiles()
      setEditModal((prev) => prev ? { ...prev, elements: prev.elements.filter(e => e.id !== elementId) } : null)
      setEditMessage({ type: "success", text: "Element removed!" })
      setTimeout(() => setEditMessage(null), 2000)
    } catch (error) {
      setEditMessage({ type: "error", text: error instanceof Error ? error.message : "Failed to remove" })
    }
  }

  const addAlbumElement = async () => {
    if (!editModal || !selectedAlbumId) return

    try {
      const res = await fetch(`/api/audio/${editModal.id}/elements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: selectedAlbumId,
          itemType: "album",
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to add album")
      }

      setEditMessage({ type: "success", text: "Album linked!" })
      await reloadAudioFiles()
      const updated = await res.json()
      setEditModal((prev) => prev ? { ...prev, elements: updated.elements } : null)
      setSelectedAlbumId("")
      setTimeout(() => setEditMessage(null), 2000)
    } catch (error) {
      setEditMessage({ type: "error", text: error instanceof Error ? error.message : "Failed to add album" })
    }
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
          description: editData.description,
          type: editData.type,
          kyDate: editData.kyDate || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Update failed")
      }

      setEditMessage({ type: "success", text: "Saved successfully!" })
      await reloadAudioFiles()

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
          body: JSON.stringify({ url: deleteModal.url }),
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
                      {file.duration && `${Math.floor(file.duration / 60)}:${Math.floor(file.duration % 60).toString().padStart(2, '0')}`}
                      <span className="ml-2 px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">
                        {file.type}
                      </span>
                    </p>
                    <p className="text-xs text-gray-400">
                      Uploaded: {new Date(file.createdAt).toLocaleDateString()}
                      {file.kyDate && ` · k.y. ${new Date(file.kyDate).toLocaleDateString()}`}
                      {file.elements.length > 0 && ` · ${file.elements.length} link${file.elements.length > 1 ? 's' : ''}`}
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
                      onClick={() => openDeleteModal(file.url, file.name, file.id)}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={editData.type}
                  onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="song">Song</option>
                  <option value="radio_ad">Radio Ad</option>
                  <option value="podcast">Podcast</option>
                  <option value="speech">Speech</option>
                  <option value="sound_effect">Sound Effect</option>
                </select>
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

              {/* Audio Elements (People connections) */}
              <div className="border-t pt-4 mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Linked People
                </label>

                {/* Current people elements */}
                {editModal.elements.filter((el) => el.itemType !== "album").length > 0 ? (
                  <div className="space-y-2 mb-3">
                    {editModal.elements
                      .filter((el) => el.itemType !== "album")
                      .map((el) => (
                        <div
                          key={el.id}
                          className="flex items-center justify-between p-2 bg-purple-50 rounded border border-purple-200"
                        >
                          <span className="text-sm">
                            <span className="font-medium">{el.itemName || el.itemId}</span>
                            <span className="ml-2 text-xs text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded">
                              {el.itemType}
                            </span>
                          </span>
                          <button
                            onClick={() => removeElement(el.id)}
                            className="text-red-500 hover:text-red-700 text-xs"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mb-3">No linked people</p>
                )}

                {/* Add new person element */}
                <div className="flex gap-2">
                  <select
                    value={selectedPersonId}
                    onChange={(e) => setSelectedPersonId(e.target.value)}
                    className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm"
                  >
                    <option value="">Select person...</option>
                    {availablePeople
                      .filter((p) => !editModal.elements.some((e) => e.itemId === p.id && e.itemType === selectedElementType))
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                  </select>
                  <select
                    value={selectedElementType}
                    onChange={(e) => setSelectedElementType(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1.5 text-sm"
                  >
                    <option value="singer">Singer</option>
                    <option value="composer">Composer</option>
                    <option value="lyricist">Lyricist</option>
                    <option value="producer">Producer</option>
                    <option value="speaker">Speaker</option>
                    <option value="performer">Performer</option>
                  </select>
                  <button
                    onClick={addElement}
                    disabled={!selectedPersonId}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white text-sm px-3 py-1.5 rounded"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Linked Albums */}
              <div className="border-t pt-4 mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Linked Albums
                </label>

                {/* Current album elements */}
                {editModal.elements.filter((el) => el.itemType === "album").length > 0 ? (
                  <div className="space-y-2 mb-3">
                    {editModal.elements
                      .filter((el) => el.itemType === "album")
                      .map((el) => (
                        <div
                          key={el.id}
                          className="flex items-center justify-between p-2 bg-amber-50 rounded border border-amber-200"
                        >
                          <span className="text-sm font-medium">{el.itemName || el.itemId}</span>
                          <button
                            onClick={() => removeElement(el.id)}
                            className="text-red-500 hover:text-red-700 text-xs"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mb-3">No linked albums</p>
                )}

                {/* Add album */}
                <div className="flex gap-2">
                  <select
                    value={selectedAlbumId}
                    onChange={(e) => setSelectedAlbumId(e.target.value)}
                    className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm"
                  >
                    <option value="">Select album...</option>
                    {availableAlbums
                      .filter((a) => !editModal.elements.some((e) => e.itemId === a.id && e.itemType === "album"))
                      .map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                  </select>
                  <button
                    onClick={addAlbumElement}
                    disabled={!selectedAlbumId}
                    className="bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 text-white text-sm px-3 py-1.5 rounded"
                  >
                    Add
                  </button>
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
