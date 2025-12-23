"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { redirect } from "next/navigation"
import Link from "next/link"

interface Place {
  id: string
  name: string
  placeType: string
  cityId: string
  city: { id: string; name: string; state: { id: string; name: string; nation: { id: string; name: string } } }
  parentPlaceId: string | null
  parentPlace: { id: string; name: string } | null
  address: string | null
  dateOpened: string | null
  dateClosed: string | null
  articleId: string | null
  article: { id: string;  title: string } | null
  _count: { childPlaces: number }
  createdAt: string
}

interface City {
  id: string
  name: string
  state: { name: string; nation: { name: string } }
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

interface NeighborhoodOption {
  id: string
  name: string
}

const PLACE_TYPES = [
  { value: "neighborhood", label: "Neighborhood" },
  { value: "building", label: "Building" },
  { value: "landmark", label: "Landmark" },
  { value: "casino", label: "Casino" },
  { value: "studio", label: "Studio" },
  { value: "park", label: "Park" },
  { value: "restaurant", label: "Restaurant" },
  { value: "hotel", label: "Hotel" },
  { value: "theater", label: "Theater" },
  { value: "museum", label: "Museum" },
  { value: "airport", label: "Airport" },
  { value: "station", label: "Station" },
  { value: "other", label: "Other" },
]

export default function ManagePlacesPage() {
  const { data: session, status } = useSession()

  const [places, setPlaces] = useState<Place[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [sortField, setSortField] = useState<"name" | "createdAt" | "dateOpened">("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [filterCity, setFilterCity] = useState<string>("")
  const [filterType, setFilterType] = useState<string>("")

  const [editModal, setEditModal] = useState<Place | null>(null)
  const [editData, setEditData] = useState({
    name: "",
    placeType: "building",
    cityId: "",
    parentPlaceId: "",
    address: "",
    dateOpened: "",
    dateClosed: "",
    articleId: "",
  })
  const [saving, setSaving] = useState(false)
  const [editMessage, setEditMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [availableArticles, setAvailableArticles] = useState<Article[]>([])
  const [inspirations, setInspirations] = useState<Inspiration[]>([])
  const [linkedImages, setLinkedImages] = useState<LinkedImage[]>([])
  const [neighborhoodOptions, setNeighborhoodOptions] = useState<NeighborhoodOption[]>([])

  const [deleteModal, setDeleteModal] = useState<Place | null>(null)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [placesRes, citiesRes] = await Promise.all([
        fetch("/api/places/list"),
        fetch("/api/cities/list")
      ])
      const placesData = await placesRes.json()
      const citiesData = await citiesRes.json()
      if (Array.isArray(placesData)) setPlaces(placesData)
      if (Array.isArray(citiesData)) setCities(citiesData)
    } catch (err) {
      console.error("Failed to load data:", err)
    } finally {
      setLoading(false)
    }
  }

  const filteredPlaces = places.filter((p) => {
    if (filterCity && p.cityId !== filterCity) return false
    if (filterType && p.placeType !== filterType) return false
    return true
  })

  const sortedPlaces = [...filteredPlaces].sort((a, b) => {
    let comparison = 0
    if (sortField === "name") {
      comparison = a.name.localeCompare(b.name)
    } else if (sortField === "dateOpened") {
      const aDate = a.dateOpened ? new Date(a.dateOpened).getTime() : 0
      const bDate = b.dateOpened ? new Date(b.dateOpened).getTime() : 0
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

  const openEditModal = async (place: Place) => {
    setEditModal(place)
    setEditData({
      name: place.name,
      placeType: place.placeType,
      cityId: place.cityId,
      parentPlaceId: place.parentPlaceId || "",
      address: place.address || "",
      dateOpened: place.dateOpened ? place.dateOpened.split("T")[0] : "",
      dateClosed: place.dateClosed ? place.dateClosed.split("T")[0] : "",
      articleId: place.articleId || "",
    })
    setEditMessage(null)
    setInspirations([])
    setLinkedImages([])
    setNeighborhoodOptions([])

    try {
      const [articlesRes, inspirationsRes, imagesRes, placesInCityRes] = await Promise.all([
        fetch("/api/places/available-articles"),
        fetch(`/api/places/${place.id}/inspirations`),
        fetch(`/api/places/${place.id}/images`),
        fetch(`/api/cities/${place.cityId}/places`)
      ])

      const articlesData = await articlesRes.json()
      if (Array.isArray(articlesData)) {
        if (place.article && !articlesData.find((a: Article) => a.id === place.articleId)) {
          articlesData.unshift(place.article)
        }
        setAvailableArticles(articlesData)
      }

      const inspirationsData = await inspirationsRes.json()
      if (Array.isArray(inspirationsData)) setInspirations(inspirationsData)

      const imagesData = await imagesRes.json()
      if (Array.isArray(imagesData)) setLinkedImages(imagesData)

      const placesInCityData = await placesInCityRes.json()
      if (Array.isArray(placesInCityData)) {
        // Only neighborhoods that aren't the current place
        setNeighborhoodOptions(
          placesInCityData
            .filter((p: Place) => p.placeType === "neighborhood" && p.id !== place.id)
            .map((p: Place) => ({ id: p.id, name: p.name }))
        )
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
      const res = await fetch("/api/places/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editModal.id,
          name: editData.name,
          placeType: editData.placeType,
          cityId: editData.cityId,
          parentPlaceId: editData.parentPlaceId || null,
          address: editData.address || null,
          dateOpened: editData.dateOpened || null,
          dateClosed: editData.dateClosed || null,
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

  const openDeleteModal = (place: Place) => {
    setDeleteModal(place)
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
      const res = await fetch("/api/places/delete", {
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

  const formatPlaceType = (placeType: string) => {
    const found = PLACE_TYPES.find((t) => t.value === placeType)
    return found ? found.label : placeType
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/world-data/locations/places" className="text-gray-500 hover:text-gray-700">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-emerald-600">Manage Places</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
            <h2 className="text-lg font-semibold">Places ({sortedPlaces.length})</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="">All Cities</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}, {city.state.name}
                  </option>
                ))}
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="">All Types</option>
                {PLACE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as "name" | "createdAt" | "dateOpened")}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="name">Name</option>
                <option value="createdAt">Created Date</option>
                <option value="dateOpened">Opened Date (k.y.)</option>
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
            <div className={`mb-4 p-3 rounded ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {message.text}
            </div>
          )}

          {loading ? (
            <p className="text-gray-500 text-sm">Loading...</p>
          ) : sortedPlaces.length === 0 ? (
            <p className="text-gray-500 text-sm">No places found</p>
          ) : (
            <div className="space-y-2">
              {sortedPlaces.map((place) => (
                <div key={place.id} className="flex items-center justify-between p-3 bg-emerald-50 rounded border border-emerald-200">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {place.name}
                      {place.parentPlace && <span className="text-gray-500"> (in {place.parentPlace.name})</span>}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatPlaceType(place.placeType)} · {place.city.name}, {place.city.state.name}
                      {place.address && ` · ${place.address}`}
                      {place.dateOpened && ` · Opened: ${new Date(place.dateOpened).getFullYear()} k.y.`}
                      {place.dateClosed && ` · Closed: ${new Date(place.dateClosed).getFullYear()} k.y.`}
                    </p>
                    {place.article && (
                      <a
                        href={`/kemponet/kempopedia/wiki/${place.article.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-emerald-600 hover:text-emerald-800 hover:underline"
                      >
                        📄 {place.article.title}
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <button onClick={() => openEditModal(place)} className="text-emerald-600 hover:text-emerald-800 text-sm">View/Edit</button>
                    <button onClick={() => openDeleteModal(place)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
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
            <h3 className="text-lg font-bold mb-4">View/Edit Place</h3>

            {editMessage && (
              <div className={`mb-4 p-3 rounded ${editMessage.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={editData.placeType}
                    onChange={(e) => setEditData({ ...editData, placeType: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    {PLACE_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <select
                  value={editData.cityId}
                  onChange={(e) => setEditData({ ...editData, cityId: e.target.value, parentPlaceId: "" })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}, {city.state.name} ({city.state.nation.name})
                    </option>
                  ))}
                </select>
              </div>

              {neighborhoodOptions.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Within Neighborhood</label>
                  <select
                    value={editData.parentPlaceId}
                    onChange={(e) => setEditData({ ...editData, parentPlaceId: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="">-- Not in a neighborhood --</option>
                    {neighborhoodOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>{opt.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={editData.address}
                  onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Opened (k.y.)</label>
                  <input
                    type="date"
                    value={editData.dateOpened}
                    onChange={(e) => setEditData({ ...editData, dateOpened: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Closed (k.y.)</label>
                  <input
                    type="date"
                    value={editData.dateClosed}
                    onChange={(e) => setEditData({ ...editData, dateClosed: e.target.value })}
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
              {deleteModal._count.childPlaces > 0 && (
                <span className="text-red-600"> This will also delete {deleteModal._count.childPlaces} child place{deleteModal._count.childPlaces !== 1 ? "s" : ""}.</span>
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
