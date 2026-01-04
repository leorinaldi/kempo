"use client"

import { useState, useEffect } from "react"
import { DeleteConfirmModal, useAdminAuth, AdminPageLayout, MessageBanner } from "@/components/admin"

interface Nation {
  id: string
  name: string
  shortCode: string | null
  dateFounded: string | null
  dateDissolved: string | null
  articleId: string | null
  article: { id: string;  title: string } | null
  _count: { states: number }
  createdAt: string
}

interface Article {
  id: string

  title: string
}

interface Inspiration {
  id: string
  inspiration: string
  wikipediaUrl: string | null
}

interface LinkedImage {
  id: string

  name: string
  url: string
}

interface LinkedState {
  id: string
  name: string
  abbreviation: string | null
  article: { id: string;  } | null
  _count: { cities: number }
}

export default function ManageNationsPage() {
  const { isLoading: authLoading } = useAdminAuth()

  const [nations, setNations] = useState<Nation[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [sortField, setSortField] = useState<"name" | "createdAt" | "dateFounded">("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const [editModal, setEditModal] = useState<Nation | null>(null)
  const [editData, setEditData] = useState({
    name: "",
    shortCode: "",
    dateFounded: "",
    dateDissolved: "",
    articleId: "",
  })
  const [saving, setSaving] = useState(false)
  const [editMessage, setEditMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [availableArticles, setAvailableArticles] = useState<Article[]>([])
  const [inspirations, setInspirations] = useState<Inspiration[]>([])
  const [linkedImages, setLinkedImages] = useState<LinkedImage[]>([])
  const [linkedStates, setLinkedStates] = useState<LinkedState[]>([])

  const [deleteModal, setDeleteModal] = useState<Nation | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadNations()
  }, [])

  const loadNations = async () => {
    try {
      const res = await fetch("/api/entities/nations")
      const data = await res.json()
      if (Array.isArray(data)) {
        setNations(data)
      }
    } catch (err) {
      console.error("Failed to load nations:", err)
    } finally {
      setLoading(false)
    }
  }

  const sortedNations = [...nations].sort((a, b) => {
    let comparison = 0
    if (sortField === "name") {
      comparison = a.name.localeCompare(b.name)
    } else if (sortField === "dateFounded") {
      const aDate = a.dateFounded ? new Date(a.dateFounded).getTime() : 0
      const bDate = b.dateFounded ? new Date(b.dateFounded).getTime() : 0
      comparison = aDate - bDate
    } else {
      comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    }
    return sortDirection === "asc" ? comparison : -comparison
  })

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  const openEditModal = async (nation: Nation) => {
    setEditModal(nation)
    setEditData({
      name: nation.name,
      shortCode: nation.shortCode || "",
      dateFounded: nation.dateFounded ? nation.dateFounded.split("T")[0] : "",
      dateDissolved: nation.dateDissolved ? nation.dateDissolved.split("T")[0] : "",
      articleId: nation.articleId || "",
    })
    setEditMessage(null)
    setInspirations([])
    setLinkedImages([])
    setLinkedStates([])

    try {
      const [articlesRes, inspirationsRes, imagesRes, statesRes] = await Promise.all([
        fetch("/api/entities/nations/available-articles"),
        fetch(`/api/entities/nations/${nation.id}/inspirations`),
        fetch(`/api/entities/nations/${nation.id}/images`),
        fetch(`/api/entities/nations/${nation.id}/states`)
      ])

      const articlesData = await articlesRes.json()
      if (Array.isArray(articlesData)) {
        if (nation.article && !articlesData.find((a: Article) => a.id === nation.articleId)) {
          articlesData.unshift(nation.article)
        }
        setAvailableArticles(articlesData)
      }

      const inspirationsData = await inspirationsRes.json()
      if (Array.isArray(inspirationsData)) {
        setInspirations(inspirationsData)
      }

      const imagesData = await imagesRes.json()
      if (Array.isArray(imagesData)) {
        setLinkedImages(imagesData)
      }

      const statesData = await statesRes.json()
      if (Array.isArray(statesData)) {
        setLinkedStates(statesData)
      }
    } catch (err) {
      console.error("Failed to load data:", err)
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
      const res = await fetch("/api/entities/nations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editModal.id,
          name: editData.name,
          shortCode: editData.shortCode || null,
          dateFounded: editData.dateFounded || null,
          dateDissolved: editData.dateDissolved || null,
          articleId: editData.articleId || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Update failed")
      }

      setEditMessage({ type: "success", text: "Saved successfully!" })
      await loadNations()

      setTimeout(() => {
        closeEditModal()
      }, 1000)
    } catch (error) {
      setEditMessage({ type: "error", text: error instanceof Error ? error.message : "Update failed" })
    } finally {
      setSaving(false)
    }
  }

  const openDeleteModal = (nation: Nation) => {
    setDeleteModal(nation)
  }

  const closeDeleteModal = () => {
    setDeleteModal(null)
  }

  const confirmDelete = async () => {
    if (!deleteModal) return

    setDeleting(true)

    try {
      const res = await fetch(`/api/entities/nations/${deleteModal.id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Delete failed")
      }

      setMessage({ type: "success", text: `"${deleteModal.name}" deleted successfully` })
      await loadNations()
      closeDeleteModal()

      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Delete failed" })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AdminPageLayout
      title="Manage Nations"
      backHref="/admin/world-data/locations/nations"
      color="blue"
    >
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Nations ({nations.length})</h2>
          <div className="flex items-center gap-2">
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as "name" | "createdAt" | "dateFounded")}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="name">Name</option>
              <option value="createdAt">Created Date</option>
              <option value="dateFounded">Founded Date (k.y.)</option>
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

        <MessageBanner message={message} className="mb-4" />

        {loading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : sortedNations.length === 0 ? (
          <p className="text-gray-500 text-sm">No nations found</p>
        ) : (
          <div className="space-y-2">
            {sortedNations.map((nation) => (
              <div
                key={nation.id}
                className="flex items-center justify-between p-3 bg-blue-50 rounded border border-blue-200"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {nation.name}
                    {nation.shortCode && <span className="text-gray-500"> ({nation.shortCode})</span>}
                  </p>
                  <p className="text-xs text-gray-500">
                    {nation._count.states} state{nation._count.states !== 1 ? "s" : ""}
                    {nation.dateFounded && ` · Founded: ${new Date(nation.dateFounded).getFullYear()} k.y.`}
                    {nation.dateDissolved && ` · Dissolved: ${new Date(nation.dateDissolved).getFullYear()} k.y.`}
                  </p>
                  {nation.article && (
                    <a
                      href={`/kemponet/kempopedia/wiki/${nation.article.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      📄 {nation.article.title}
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <button
                    onClick={() => openEditModal(nation)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    View/Edit
                  </button>
                  <button
                    onClick={() => openDeleteModal(nation)}
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
            <h3 className="text-lg font-bold mb-4">View/Edit Nation</h3>

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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Short Code</label>
                  <input
                    type="text"
                    value={editData.shortCode}
                    onChange={(e) => setEditData({ ...editData, shortCode: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Founded (k.y.)</label>
                  <input
                    type="date"
                    value={editData.dateFounded}
                    onChange={(e) => setEditData({ ...editData, dateFounded: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Dissolved (k.y.)</label>
                  <input
                    type="date"
                    value={editData.dateDissolved}
                    onChange={(e) => setEditData({ ...editData, dateDissolved: e.target.value })}
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
                  <option value="">-- No article linked --</option>
                  {availableArticles.map((article) => (
                    <option key={article.id} value={article.id}>
                      {article.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Inspirations */}
            <div className="mt-6 border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Real-World Inspirations</h4>
              {inspirations.length === 0 ? (
                <p className="text-sm text-gray-500">No inspirations recorded</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {inspirations.map((insp) => (
                    insp.wikipediaUrl ? (
                      <a
                        key={insp.id}
                        href={insp.wikipediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200"
                      >
                        {insp.inspiration}
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ) : (
                      <span
                        key={insp.id}
                        className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {insp.inspiration}
                      </span>
                    )
                  ))}
                </div>
              )}
            </div>

            {/* Linked States */}
            {linkedStates.length > 0 && (
              <div className="mt-6 border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  States ({linkedStates.length})
                </h4>
                <div className="space-y-2">
                  {linkedStates.map((state) => (
                    <div key={state.id} className="flex items-center gap-2 text-sm">
                      <span className="text-blue-600">●</span>
                      {state.article ? (
                        <a
                          href={`/kemponet/kempopedia/wiki/${state.article.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {state.name}
                        </a>
                      ) : (
                        <span className="text-gray-800">{state.name}</span>
                      )}
                      {state.abbreviation && <span className="text-gray-400">({state.abbreviation})</span>}
                      <span className="text-gray-400 text-xs">
                        · {state._count.cities} cit{state._count.cities !== 1 ? "ies" : "y"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Linked Images */}
            <div className="mt-6 border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Linked Images</h4>
              {linkedImages.length === 0 ? (
                <p className="text-sm text-gray-500">No linked images</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {linkedImages.map((img) => (
                    <a
                      key={img.id}
                      href={img.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                      title={img.name}
                    >
                      <img
                        src={img.url}
                        alt={img.name}
                        className="h-16 w-16 object-cover rounded border border-blue-300 hover:border-blue-500"
                      />
                    </a>
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

      <DeleteConfirmModal
        isOpen={!!deleteModal}
        itemName={deleteModal?.name || ""}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        isDeleting={deleting}
        warningMessage={
          deleteModal && deleteModal._count?.states > 0
            ? `This will also delete ${deleteModal._count.states} state${deleteModal._count.states !== 1 ? "s" : ""} and all their cities and places.`
            : undefined
        }
      />
    </AdminPageLayout>
  )
}
