"use client"

import { useState, useEffect } from "react"
import { DeleteConfirmModal, useAdminAuth, AdminPageLayout, MessageBanner } from "@/components/admin"

interface Organization {
  id: string
  name: string
}

interface PublicationSeries {
  id: string
  name: string
}

interface Image {
  id: string
  name: string
  url: string
}

interface Publication {
  id: string
  title: string
  type: string
  kyDate: string | null
  description: string | null
  genre: string | null
  volume: number | null
  issueNumber: number | null
  edition: string | null
  pageCount: number | null
  series: PublicationSeries | null
  publisher: Organization | null
  coverImage: Image | null
}

const TYPES = [
  { value: "newspaper", label: "Newspaper" },
  { value: "magazine", label: "Magazine" },
  { value: "comic", label: "Comic Book" },
  { value: "book", label: "Book" },
]

const GENRES = [
  // Fiction
  { group: "Fiction", value: "literary_fiction", label: "Literary & Contemporary Fiction" },
  { group: "Fiction", value: "historical_fiction", label: "Historical Fiction" },
  { group: "Fiction", value: "science_fiction_fantasy", label: "Science Fiction & Fantasy" },
  { group: "Fiction", value: "mystery_crime_thriller", label: "Mystery, Crime & Thriller" },
  { group: "Fiction", value: "romance", label: "Romance" },
  { group: "Fiction", value: "horror", label: "Horror" },
  { group: "Fiction", value: "adventure_action", label: "Adventure & Action" },
  { group: "Fiction", value: "children_young_adult", label: "Children's & Young Adult Fiction" },
  // Nonfiction
  { group: "Nonfiction", value: "biography_memoir", label: "Biography & Memoir" },
  { group: "Nonfiction", value: "history_politics_society", label: "History, Politics & Society" },
  { group: "Nonfiction", value: "science_nature_technology", label: "Science, Nature & Technology" },
  { group: "Nonfiction", value: "philosophy_religion_mythology", label: "Philosophy, Religion & Mythology" },
  { group: "Nonfiction", value: "business_economics_psychology", label: "Business, Economics & Psychology" },
  { group: "Nonfiction", value: "arts_culture", label: "Arts & Culture" },
  { group: "Nonfiction", value: "current_affairs_journalism", label: "Current Affairs & Journalism" },
]

export default function ManagePublicationsPage() {
  const { isLoading: authLoading } = useAdminAuth()

  const [publications, setPublications] = useState<Publication[]>([])
  const [seriesList, setSeriesList] = useState<PublicationSeries[]>([])
  const [publishers, setPublishers] = useState<Organization[]>([])
  const [images, setImages] = useState<Image[]>([])
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [filterType, setFilterType] = useState("")

  // Edit modal
  const [editModal, setEditModal] = useState<Publication | null>(null)
  const [editData, setEditData] = useState({
    title: "",
    type: "newspaper",
    seriesId: "",
    publisherId: "",
    kyDate: "",
    coverImageId: "",
    pageCount: "",
    description: "",
    genre: "",
    volume: "",
    issueNumber: "",
    edition: "",
  })
  const [saving, setSaving] = useState(false)
  const [editMessage, setEditMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Delete modal
  const [deleteModal, setDeleteModal] = useState<Publication | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadData()
  }, [filterType])

  const loadData = async () => {
    try {
      const url = filterType
        ? `/api/entities/publications?type=${filterType}`
        : "/api/entities/publications"

      const [pubRes, seriesRes, publishersRes, imagesRes] = await Promise.all([
        fetch(url),
        fetch("/api/entities/publicationSeries"),
        fetch("/api/entities/organizations?orgType=publisher"),
        fetch("/api/image/list"),
      ])

      const [pubData, seriesData, publishersData, imagesData] = await Promise.all([
        pubRes.json(),
        seriesRes.json(),
        publishersRes.json(),
        imagesRes.json(),
      ])

      if (Array.isArray(pubData)) setPublications(pubData)
      if (Array.isArray(seriesData)) setSeriesList(seriesData)
      if (Array.isArray(publishersData)) setPublishers(publishersData)
      if (Array.isArray(imagesData)) setImages(imagesData)
    } catch (err) {
      console.error("Failed to load data:", err)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getTypeLabel = (type: string) => {
    return TYPES.find((t) => t.value === type)?.label || type
  }

  const openEditModal = (pub: Publication) => {
    setEditModal(pub)
    setEditData({
      title: pub.title,
      type: pub.type,
      seriesId: pub.series?.id || "",
      publisherId: pub.publisher?.id || "",
      kyDate: pub.kyDate ? pub.kyDate.split("T")[0] : "",
      coverImageId: pub.coverImage?.id || "",
      pageCount: pub.pageCount?.toString() || "",
      description: pub.description || "",
      genre: pub.genre || "",
      volume: pub.volume?.toString() || "",
      issueNumber: pub.issueNumber?.toString() || "",
      edition: pub.edition || "",
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
      const res = await fetch("/api/entities/publications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editModal.id,
          title: editData.title,
          type: editData.type,
          seriesId: editData.seriesId || null,
          publisherId: editData.publisherId || null,
          kyDate: editData.kyDate || null,
          coverImageId: editData.coverImageId || null,
          pageCount: editData.pageCount ? parseInt(editData.pageCount) : null,
          description: editData.description || null,
          genre: editData.genre || null,
          volume: editData.volume ? parseInt(editData.volume) : null,
          issueNumber: editData.issueNumber ? parseInt(editData.issueNumber) : null,
          edition: editData.edition || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Update failed")
      }

      setEditMessage({ type: "success", text: "Saved successfully!" })
      await loadData()

      setTimeout(() => {
        closeEditModal()
      }, 1000)
    } catch (error) {
      setEditMessage({ type: "error", text: error instanceof Error ? error.message : "Update failed" })
    } finally {
      setSaving(false)
    }
  }

  const openDeleteModal = (pub: Publication) => {
    setDeleteModal(pub)
  }

  const closeDeleteModal = () => {
    setDeleteModal(null)
  }

  const confirmDelete = async () => {
    if (!deleteModal) return

    setDeleting(true)

    try {
      const res = await fetch(`/api/entities/publications/${deleteModal.id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Delete failed")
      }

      setMessage({ type: "success", text: `"${deleteModal.title}" deleted successfully` })
      await loadData()
      closeDeleteModal()

      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Delete failed" })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AdminPageLayout title="Manage Publications" backHref="/admin/world-data/publications/issues" color="cyan">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">All Publications ({publications.length})</h2>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          >
            <option value="">All types</option>
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <MessageBanner message={message} className="mb-4" />

        {publications.length === 0 ? (
          <p className="text-gray-500 text-sm">No publications found</p>
        ) : (
          <div className="space-y-2">
            {publications.map((pub) => (
              <div
                key={pub.id}
                className="flex items-center justify-between p-3 bg-cyan-50 rounded border border-cyan-200"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      pub.type === "newspaper" ? "bg-gray-200 text-gray-700" :
                      pub.type === "magazine" ? "bg-blue-100 text-blue-700" :
                      pub.type === "comic" ? "bg-yellow-100 text-yellow-700" :
                      "bg-purple-100 text-purple-700"
                    }`}>
                      {getTypeLabel(pub.type)}
                    </span>
                    <p className="font-medium text-sm">{pub.title}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {pub.series?.name || "Standalone"}
                    {pub.kyDate && ` · ${formatDate(pub.kyDate)}`}
                    {pub.volume && ` · Vol. ${pub.volume}`}
                    {pub.issueNumber && ` #${pub.issueNumber}`}
                    {pub.edition && ` · ${pub.edition} Edition`}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  {(pub.type === "magazine" || pub.type === "newspaper") && (
                    <a
                      href={`/admin/world-data/publications/contents?publicationId=${pub.id}`}
                      className="text-amber-600 hover:text-amber-800 text-sm"
                    >
                      Contents
                    </a>
                  )}
                  <button
                    onClick={() => openEditModal(pub)}
                    className="text-cyan-600 hover:text-cyan-800 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openDeleteModal(pub)}
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

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Edit Publication</h3>

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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={editData.title}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={editData.type}
                    onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    {TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Series</label>
                <select
                  value={editData.seriesId}
                  onChange={(e) => setEditData({ ...editData, seriesId: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">-- Standalone --</option>
                  {seriesList.map((series) => (
                    <option key={series.id} value={series.id}>
                      {series.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Publisher</label>
                  <select
                    value={editData.publisherId}
                    onChange={(e) => setEditData({ ...editData, publisherId: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="">-- Use series publisher --</option>
                    {publishers.map((pub) => (
                      <option key={pub.id} value={pub.id}>
                        {pub.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Publication Date</label>
                  <input
                    type="date"
                    value={editData.kyDate}
                    onChange={(e) => setEditData({ ...editData, kyDate: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Volume</label>
                  <input
                    type="number"
                    value={editData.volume}
                    onChange={(e) => setEditData({ ...editData, volume: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issue #</label>
                  <input
                    type="number"
                    value={editData.issueNumber}
                    onChange={(e) => setEditData({ ...editData, issueNumber: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Edition</label>
                  <input
                    type="text"
                    value={editData.edition}
                    onChange={(e) => setEditData({ ...editData, edition: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                  <select
                    value={editData.genre}
                    onChange={(e) => setEditData({ ...editData, genre: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="">-- Select genre --</option>
                    <optgroup label="Fiction">
                      {GENRES.filter((g) => g.group === "Fiction").map((g) => (
                        <option key={g.value} value={g.value}>
                          {g.label}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Nonfiction">
                      {GENRES.filter((g) => g.group === "Nonfiction").map((g) => (
                        <option key={g.value} value={g.value}>
                          {g.label}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Page Count</label>
                  <input
                    type="number"
                    value={editData.pageCount}
                    onChange={(e) => setEditData({ ...editData, pageCount: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
                <select
                  value={editData.coverImageId}
                  onChange={(e) => setEditData({ ...editData, coverImageId: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">-- No cover --</option>
                  {images.map((img) => (
                    <option key={img.id} value={img.id}>
                      {img.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  rows={3}
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
                className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={!!deleteModal}
        itemName={deleteModal?.title || ""}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        isDeleting={deleting}
      />
    </AdminPageLayout>
  )
}
