"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { redirect } from "next/navigation"
import Link from "next/link"

interface City {
  id: string
  name: string
  cityType: string
  stateId: string
  state: { id: string; name: string; nation: { id: string; name: string } }
  dateFounded: string | null
  dateDisbanded: string | null
  articleId: string | null
  article: { id: string;  title: string } | null
  _count: { places: number }
  createdAt: string
}

interface State {
  id: string
  name: string
  nation: { name: string }
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

interface LinkedPlace {
  id: string
  name: string
  placeType: string
  article: { id: string;  } | null
  _count: { childPlaces: number }
}

const CITY_TYPES = [
  { value: "city", label: "City" },
  { value: "town", label: "Town" },
  { value: "village", label: "Village" },
]

export default function ManageCitiesPage() {
  const { data: session, status } = useSession()

  const [cities, setCities] = useState<City[]>([])
  const [states, setStates] = useState<State[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [sortField, setSortField] = useState<"name" | "createdAt" | "dateFounded">("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [filterState, setFilterState] = useState<string>("")

  const [editModal, setEditModal] = useState<City | null>(null)
  const [editData, setEditData] = useState({
    name: "",
    cityType: "city",
    stateId: "",
    dateFounded: "",
    dateDisbanded: "",
    articleId: "",
  })
  const [saving, setSaving] = useState(false)
  const [editMessage, setEditMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [availableArticles, setAvailableArticles] = useState<Article[]>([])
  const [inspirations, setInspirations] = useState<Inspiration[]>([])
  const [linkedImages, setLinkedImages] = useState<LinkedImage[]>([])
  const [linkedPlaces, setLinkedPlaces] = useState<LinkedPlace[]>([])

  const [deleteModal, setDeleteModal] = useState<City | null>(null)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [citiesRes, statesRes] = await Promise.all([
        fetch("/api/cities/list"),
        fetch("/api/states/list")
      ])
      const citiesData = await citiesRes.json()
      const statesData = await statesRes.json()
      if (Array.isArray(citiesData)) setCities(citiesData)
      if (Array.isArray(statesData)) setStates(statesData)
    } catch (err) {
      console.error("Failed to load data:", err)
    } finally {
      setLoading(false)
    }
  }

  const filteredCities = filterState
    ? cities.filter((c) => c.stateId === filterState)
    : cities

  const sortedCities = [...filteredCities].sort((a, b) => {
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

  const openEditModal = async (city: City) => {
    setEditModal(city)
    setEditData({
      name: city.name,
      cityType: city.cityType,
      stateId: city.stateId,
      dateFounded: city.dateFounded ? city.dateFounded.split("T")[0] : "",
      dateDisbanded: city.dateDisbanded ? city.dateDisbanded.split("T")[0] : "",
      articleId: city.articleId || "",
    })
    setEditMessage(null)
    setInspirations([])
    setLinkedImages([])
    setLinkedPlaces([])

    try {
      const [articlesRes, inspirationsRes, imagesRes, placesRes] = await Promise.all([
        fetch("/api/cities/available-articles"),
        fetch(`/api/cities/${city.id}/inspirations`),
        fetch(`/api/cities/${city.id}/images`),
        fetch(`/api/cities/${city.id}/places`)
      ])

      const articlesData = await articlesRes.json()
      if (Array.isArray(articlesData)) {
        if (city.article && !articlesData.find((a: Article) => a.id === city.articleId)) {
          articlesData.unshift(city.article)
        }
        setAvailableArticles(articlesData)
      }

      const inspirationsData = await inspirationsRes.json()
      if (Array.isArray(inspirationsData)) setInspirations(inspirationsData)

      const imagesData = await imagesRes.json()
      if (Array.isArray(imagesData)) setLinkedImages(imagesData)

      const placesData = await placesRes.json()
      if (Array.isArray(placesData)) setLinkedPlaces(placesData)
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
      const res = await fetch("/api/cities/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editModal.id,
          name: editData.name,
          cityType: editData.cityType,
          stateId: editData.stateId,
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

  const openDeleteModal = (city: City) => {
    setDeleteModal(city)
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
      const res = await fetch("/api/cities/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteModal.id }),
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

  const formatCityType = (cityType: string) => {
    const found = CITY_TYPES.find((t) => t.value === cityType)
    return found ? found.label : cityType
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/world-data/locations/cities" className="text-gray-500 hover:text-gray-700">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-emerald-600">Manage Cities</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Cities ({sortedCities.length})</h2>
            <div className="flex items-center gap-2">
              <select
                value={filterState}
                onChange={(e) => setFilterState(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="">All States</option>
                {states.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.name} ({state.nation.name})
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
          ) : sortedCities.length === 0 ? (
            <p className="text-gray-500 text-sm">No cities found</p>
          ) : (
            <div className="space-y-2">
              {sortedCities.map((city) => (
                <div
                  key={city.id}
                  className="flex items-center justify-between p-3 bg-emerald-50 rounded border border-emerald-200"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{city.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatCityType(city.cityType)} · {city.state.name}, {city.state.nation.name}
                      {" · "}{city._count.places} place{city._count.places !== 1 ? "s" : ""}
                      {city.dateFounded && ` · Founded: ${new Date(city.dateFounded).getFullYear()} k.y.`}
                    </p>
                    {city.article && (
                      <a
                        href={`/kemponet/kempopedia/wiki/${city.article.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-emerald-600 hover:text-emerald-800 hover:underline"
                      >
                        📄 {city.article.title}
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <button onClick={() => openEditModal(city)} className="text-emerald-600 hover:text-emerald-800 text-sm">
                      View/Edit
                    </button>
                    <button onClick={() => openDeleteModal(city)} className="text-red-600 hover:text-red-800 text-sm">
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
            <h3 className="text-lg font-bold mb-4">View/Edit City</h3>

            {editMessage && (
              <div className={`mb-4 p-3 rounded ${editMessage.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {editMessage.text}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <select
                  value={editData.stateId}
                  onChange={(e) => setEditData({ ...editData, stateId: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  {states.map((state) => (
                    <option key={state.id} value={state.id}>
                      {state.name} ({state.nation.name})
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={editData.cityType}
                    onChange={(e) => setEditData({ ...editData, cityType: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    {CITY_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
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
                    <option key={article.id} value={article.id}>{article.title}</option>
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
                      <a key={insp.id} href={insp.wikipediaUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm hover:bg-emerald-200">
                        {insp.inspiration}
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      </a>
                    ) : (
                      <span key={insp.id} className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">{insp.inspiration}</span>
                    )
                  ))}
                </div>
              )}
            </div>

            {/* Linked Places */}
            {linkedPlaces.length > 0 && (
              <div className="mt-6 border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Places ({linkedPlaces.length})</h4>
                <div className="space-y-2">
                  {linkedPlaces.map((place) => (
                    <div key={place.id} className="flex items-center gap-2 text-sm">
                      <span className="text-emerald-600">●</span>
                      {place.article ? (
                        <a href={`/kemponet/kempopedia/wiki/${place.article.id}`} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-800 hover:underline">
                          {place.name}
                        </a>
                      ) : (
                        <span className="text-gray-800">{place.name}</span>
                      )}
                      <span className="text-gray-400">({place.placeType})</span>
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
              <button onClick={closeEditModal} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded">Cancel</button>
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
              {deleteModal._count.places > 0 && (
                <span className="text-red-600"> This will also delete {deleteModal._count.places} place{deleteModal._count.places !== 1 ? "s" : ""}.</span>
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
              <button onClick={closeDeleteModal} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded">Cancel</button>
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
