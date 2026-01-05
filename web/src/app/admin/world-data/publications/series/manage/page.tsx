"use client"

import { useState, useEffect } from "react"
import { DeleteConfirmModal, useAdminAuth, AdminPageLayout, MessageBanner } from "@/components/admin"

interface Organization {
  id: string
  name: string
}

interface Article {
  id: string
  title: string
}

interface PublicationSeries {
  id: string
  name: string
  type: string
  frequency: string | null
  startKyDate: string | null
  endKyDate: string | null
  description: string | null
  publisher: Organization | null
  article: Article | null
  _count: { publications: number }
}

const TYPES = [
  { value: "newspaper", label: "Newspaper" },
  { value: "magazine", label: "Magazine" },
  { value: "comic", label: "Comic Book" },
  { value: "book", label: "Book Series" },
]

const FREQUENCIES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Biweekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annual", label: "Annual" },
  { value: "irregular", label: "Irregular" },
]

export default function ManagePublicationSeriesPage() {
  const { isLoading: authLoading } = useAdminAuth()

  const [seriesList, setSeriesList] = useState<PublicationSeries[]>([])
  const [publishers, setPublishers] = useState<Organization[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Edit modal
  const [editModal, setEditModal] = useState<PublicationSeries | null>(null)
  const [editData, setEditData] = useState({
    name: "",
    type: "newspaper",
    publisherId: "",
    frequency: "",
    startKyDate: "",
    endKyDate: "",
    description: "",
    articleId: "",
  })
  const [saving, setSaving] = useState(false)
  const [editMessage, setEditMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Delete modal
  const [deleteModal, setDeleteModal] = useState<PublicationSeries | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [seriesRes, publishersRes, articlesRes] = await Promise.all([
        fetch("/api/entities/publicationSeries"),
        fetch("/api/entities/organizations?orgType=publisher"),
        fetch("/api/entities/publicationSeries/available-articles"),
      ])

      const [seriesData, publishersData, articlesData] = await Promise.all([
        seriesRes.json(),
        publishersRes.json(),
        articlesRes.json(),
      ])

      if (Array.isArray(seriesData)) setSeriesList(seriesData)
      if (Array.isArray(publishersData)) setPublishers(publishersData)
      if (Array.isArray(articlesData)) setArticles(articlesData)
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

  const openEditModal = (series: PublicationSeries) => {
    setEditModal(series)
    setEditData({
      name: series.name,
      type: series.type,
      publisherId: series.publisher?.id || "",
      frequency: series.frequency || "",
      startKyDate: series.startKyDate ? series.startKyDate.split("T")[0] : "",
      endKyDate: series.endKyDate ? series.endKyDate.split("T")[0] : "",
      description: series.description || "",
      articleId: series.article?.id || "",
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
      const res = await fetch("/api/entities/publicationSeries", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editModal.id,
          name: editData.name,
          type: editData.type,
          publisherId: editData.publisherId || null,
          frequency: editData.frequency || null,
          startKyDate: editData.startKyDate || null,
          endKyDate: editData.endKyDate || null,
          description: editData.description || null,
          articleId: editData.articleId || null,
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

  const openDeleteModal = (series: PublicationSeries) => {
    setDeleteModal(series)
  }

  const closeDeleteModal = () => {
    setDeleteModal(null)
  }

  const confirmDelete = async () => {
    if (!deleteModal) return

    setDeleting(true)

    try {
      const res = await fetch(`/api/entities/publicationSeries/${deleteModal.id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Delete failed")
      }

      setMessage({ type: "success", text: `"${deleteModal.name}" deleted successfully` })
      await loadData()
      closeDeleteModal()

      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Delete failed" })
    } finally {
      setDeleting(false)
    }
  }

  // Get available articles including the currently selected one
  const getAvailableArticles = () => {
    if (!editModal?.article) return articles
    const currentArticle = editModal.article
    if (articles.find((a) => a.id === currentArticle.id)) return articles
    return [currentArticle, ...articles]
  }

  return (
    <AdminPageLayout title="Manage Publication Series" backHref="/admin/world-data/publications/series" color="cyan">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-6">All Publication Series ({seriesList.length})</h2>

        <MessageBanner message={message} className="mb-4" />

        {seriesList.length === 0 ? (
          <p className="text-gray-500 text-sm">No publication series found</p>
        ) : (
          <div className="space-y-2">
            {seriesList.map((series) => (
              <div
                key={series.id}
                className="flex items-center justify-between p-3 bg-cyan-50 rounded border border-cyan-200"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{series.name}</p>
                  <p className="text-xs text-gray-500">
                    {TYPES.find((t) => t.value === series.type)?.label || series.type}
                    {series.publisher?.name && ` · ${series.publisher.name}`}
                    {series.frequency && ` · ${FREQUENCIES.find((f) => f.value === series.frequency)?.label || series.frequency}`}
                    {series.startKyDate && ` · Since ${formatDate(series.startKyDate)}`}
                    {series.endKyDate && ` - ${formatDate(series.endKyDate)}`}
                    {series._count?.publications > 0 && ` · ${series._count.publications} issues`}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <button
                    onClick={() => openEditModal(series)}
                    className="text-cyan-600 hover:text-cyan-800 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openDeleteModal(series)}
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
            <h3 className="text-lg font-bold mb-4">Edit Publication Series</h3>

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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Publisher</label>
                <select
                  value={editData.publisherId}
                  onChange={(e) => setEditData({ ...editData, publisherId: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">-- No publisher --</option>
                  {publishers.map((pub) => (
                    <option key={pub.id} value={pub.id}>
                      {pub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                <select
                  value={editData.frequency}
                  onChange={(e) => setEditData({ ...editData, frequency: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">-- Select frequency --</option>
                  {FREQUENCIES.map((freq) => (
                    <option key={freq.value} value={freq.value}>
                      {freq.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={editData.startKyDate}
                    onChange={(e) => setEditData({ ...editData, startKyDate: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={editData.endKyDate}
                    onChange={(e) => setEditData({ ...editData, endKyDate: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kempopedia Article</label>
                <select
                  value={editData.articleId}
                  onChange={(e) => setEditData({ ...editData, articleId: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">-- No linked article --</option>
                  {getAvailableArticles().map((article) => (
                    <option key={article.id} value={article.id}>
                      {article.title}
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
        itemName={deleteModal?.name || ""}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        isDeleting={deleting}
        warningMessage={
          deleteModal && deleteModal._count.publications > 0
            ? `This series has ${deleteModal._count.publications} publications that will be unlinked.`
            : undefined
        }
      />
    </AdminPageLayout>
  )
}
