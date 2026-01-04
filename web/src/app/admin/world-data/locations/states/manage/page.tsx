"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { redirect } from "next/navigation"
import Link from "next/link"

interface State {
  id: string
  name: string
  abbreviation: string | null
  stateType: string
  nationId: string
  nation: { id: string; name: string }
  dateFounded: string | null
  dateDisbanded: string | null
  articleId: string | null
  article: { id: string;  title: string } | null
  _count: { cities: number }
  createdAt: string
}

interface Nation {
  id: string
  name: string
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

interface LinkedCity {
  id: string
  name: string
  cityType: string
  article: { id: string;  } | null
  _count: { places: number }
}

const STATE_TYPES = [
  { value: "state", label: "State" },
  { value: "province", label: "Province" },
  { value: "territory", label: "Territory" },
  { value: "region", label: "Region" },
]

export default function ManageStatesPage() {
  const { data: session, status } = useSession()

  const [states, setStates] = useState<State[]>([])
  const [nations, setNations] = useState<Nation[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [sortField, setSortField] = useState<"name" | "createdAt" | "dateFounded">("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [filterNation, setFilterNation] = useState<string>("")

  const [editModal, setEditModal] = useState<State | null>(null)
  const [editData, setEditData] = useState({
    name: "",
    abbreviation: "",
    stateType: "state",
    nationId: "",
    dateFounded: "",
    dateDisbanded: "",
    articleId: "",
  })
  const [saving, setSaving] = useState(false)
  const [editMessage, setEditMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [availableArticles, setAvailableArticles] = useState<Article[]>([])
  const [inspirations, setInspirations] = useState<Inspiration[]>([])
  const [linkedImages, setLinkedImages] = useState<LinkedImage[]>([])
  const [linkedCities, setLinkedCities] = useState<LinkedCity[]>([])

  const [deleteModal, setDeleteModal] = useState<State | null>(null)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [statesRes, nationsRes] = await Promise.all([
        fetch("/api/entities/states"),
        fetch("/api/entities/nations")
      ])
      const statesData = await statesRes.json()
      const nationsData = await nationsRes.json()
      if (Array.isArray(statesData)) setStates(statesData)
      if (Array.isArray(nationsData)) setNations(nationsData)
    } catch (err) {
      console.error("Failed to load data:", err)
    } finally {
      setLoading(false)
    }
  }

  const filteredStates = filterNation
    ? states.filter((s) => s.nationId === filterNation)
    : states

  const sortedStates = [...filteredStates].sort((a, b) => {
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

  const openEditModal = async (state: State) => {
    setEditModal(state)
    setEditData({
      name: state.name,
      abbreviation: state.abbreviation || "",
      stateType: state.stateType,
      nationId: state.nationId,
      dateFounded: state.dateFounded ? state.dateFounded.split("T")[0] : "",
      dateDisbanded: state.dateDisbanded ? state.dateDisbanded.split("T")[0] : "",
      articleId: state.articleId || "",
    })
    setEditMessage(null)
    setInspirations([])
    setLinkedImages([])
    setLinkedCities([])

    try {
      const [articlesRes, inspirationsRes, imagesRes, citiesRes] = await Promise.all([
        fetch("/api/entities/states/available-articles"),
        fetch(`/api/entities/states/${state.id}/inspirations`),
        fetch(`/api/entities/states/${state.id}/images`),
        fetch(`/api/entities/states/${state.id}/cities`)
      ])

      const articlesData = await articlesRes.json()
      if (Array.isArray(articlesData)) {
        if (state.article && !articlesData.find((a: Article) => a.id === state.articleId)) {
          articlesData.unshift(state.article)
        }
        setAvailableArticles(articlesData)
      }

      const inspirationsData = await inspirationsRes.json()
      if (Array.isArray(inspirationsData)) setInspirations(inspirationsData)

      const imagesData = await imagesRes.json()
      if (Array.isArray(imagesData)) setLinkedImages(imagesData)

      const citiesData = await citiesRes.json()
      if (Array.isArray(citiesData)) setLinkedCities(citiesData)
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
      const res = await fetch("/api/entities/states", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editModal.id,
          name: editData.name,
          abbreviation: editData.abbreviation || null,
          stateType: editData.stateType,
          nationId: editData.nationId,
          dateFounded: editData.dateFounded || null,
          dateDisbanded: editData.dateDisbanded || null,
          articleId: editData.articleId || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Update failed")
      }

      setEditMessage({ type: "success", text: "Saved successfully!" })
      await loadData()

      setTimeout(() => closeEditModal(), 1000)
    } catch (error) {
      setEditMessage({ type: "error", text: error instanceof Error ? error.message : "Update failed" })
    } finally {
      setSaving(false)
    }
  }

  const openDeleteModal = (state: State) => {
    setDeleteModal(state)
    setDeleteConfirmText("")
  }

  const closeDeleteModal = () => {
    setDeleteModal(null)
    setDeleteConfirmText("")
  }

  const confirmDelete = async () => {
    if (!deleteModal || deleteConfirmText !== "DELETE") return

    setDeleting(true)

    try {
      const res = await fetch(`/api/entities/states/${deleteModal.id}`, {
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

  const formatStateType = (stateType: string) => {
    const found = STATE_TYPES.find((t) => t.value === stateType)
    return found ? found.label : stateType
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/world-data/locations/states" className="text-gray-500 hover:text-gray-700">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-emerald-600">Manage States</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">States ({sortedStates.length})</h2>
            <div className="flex items-center gap-2">
              <select
                value={filterNation}
                onChange={(e) => setFilterNation(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="">All Nations</option>
                {nations.map((nation) => (
                  <option key={nation.id} value={nation.id}>
                    {nation.name}
                  </option>
                ))}
              </select>
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
              >
                {sortDirection === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>

          {message && (
            <div
              className={`mb-4 p-3 rounded ${
                message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          {loading ? (
            <p className="text-gray-500 text-sm">Loading...</p>
          ) : sortedStates.length === 0 ? (
            <p className="text-gray-500 text-sm">No states found</p>
          ) : (
            <div className="space-y-2">
              {sortedStates.map((state) => (
                <div
                  key={state.id}
                  className="flex items-center justify-between p-3 bg-emerald-50 rounded border border-emerald-200"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {state.name}
                      {state.abbreviation && <span className="text-gray-500"> ({state.abbreviation})</span>}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatStateType(state.stateType)} · {state.nation.name}
                      {" · "}{state._count.cities} cit{state._count.cities !== 1 ? "ies" : "y"}
                      {state.dateFounded && ` · Founded: ${new Date(state.dateFounded).getFullYear()} k.y.`}
                    </p>
                    {state.article && (
                      <a
                        href={`/kemponet/kempopedia/wiki/${state.article.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-emerald-600 hover:text-emerald-800 hover:underline"
                      >
                        📄 {state.article.title}
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <button
                      onClick={() => openEditModal(state)}
                      className="text-emerald-600 hover:text-emerald-800 text-sm"
                    >
                      View/Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(state)}
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
      </main>

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">View/Edit State</h3>

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
                <label className="block text-sm font-medium text-gray-700 mb-1">Nation</label>
                <select
                  value={editData.nationId}
                  onChange={(e) => setEditData({ ...editData, nationId: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  {nations.map((nation) => (
                    <option key={nation.id} value={nation.id}>
                      {nation.name}
                    </option>
                  ))}
                </select>
              </div>

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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Abbreviation</label>
                  <input
                    type="text"
                    value={editData.abbreviation}
                    onChange={(e) => setEditData({ ...editData, abbreviation: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={editData.stateType}
                  onChange={(e) => setEditData({ ...editData, stateType: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  {STATE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Disbanded (k.y.)</label>
                  <input
                    type="date"
                    value={editData.dateDisbanded}
                    onChange={(e) => setEditData({ ...editData, dateDisbanded: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave blank if still active</p>
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
                        className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm hover:bg-emerald-200"
                      >
                        {insp.inspiration}
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ) : (
                      <span key={insp.id} className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {insp.inspiration}
                      </span>
                    )
                  ))}
                </div>
              )}
            </div>

            {/* Linked Cities */}
            {linkedCities.length > 0 && (
              <div className="mt-6 border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Cities ({linkedCities.length})</h4>
                <div className="space-y-2">
                  {linkedCities.map((city) => (
                    <div key={city.id} className="flex items-center gap-2 text-sm">
                      <span className="text-emerald-600">●</span>
                      {city.article ? (
                        <a
                          href={`/kemponet/kempopedia/wiki/${city.article.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:text-emerald-800 hover:underline"
                        >
                          {city.name}
                        </a>
                      ) : (
                        <span className="text-gray-800">{city.name}</span>
                      )}
                      <span className="text-gray-400">({city.cityType})</span>
                      <span className="text-gray-400 text-xs">· {city._count.places} place{city._count.places !== 1 ? "s" : ""}</span>
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
                    <a key={img.id} href={img.url} target="_blank" rel="noopener noreferrer" className="block" title={img.name}>
                      <img src={img.url} alt={img.name} className="h-16 w-16 object-cover rounded border border-emerald-300 hover:border-emerald-500" />
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={closeEditModal} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded">
                Cancel
              </button>
              <button onClick={saveEdit} disabled={saving} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-red-600 mb-2">Confirm Delete</h3>
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete <strong>&quot;{deleteModal.name}&quot;</strong>?
              {deleteModal._count.cities > 0 && (
                <span className="text-red-600">
                  {" "}This will also delete {deleteModal._count.cities} cit{deleteModal._count.cities !== 1 ? "ies" : "y"} and all their places.
                </span>
              )}
            </p>
            <p className="text-sm text-gray-600 mb-2">Type <strong>DELETE</strong> to confirm:</p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
              placeholder="Type DELETE"
              autoFocus
            />
            <div className="flex gap-3">
              <button onClick={closeDeleteModal} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded">
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteConfirmText !== "DELETE" || deleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
