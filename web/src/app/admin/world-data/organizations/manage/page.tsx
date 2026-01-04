"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { redirect } from "next/navigation"
import Link from "next/link"

interface Organization {
  id: string
  name: string
  abbreviation: string | null
  orgType: string
  dateFounded: string | null
  dateDissolved: string | null
  articleId: string | null
  article: { id: string;  title: string } | null
  createdAt: string
  updatedAt: string
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

interface LinkedProduct {
  id: string
  name: string
  productType: string
  article: { id: string;  } | null
}

interface LinkedBrand {
  id: string
  name: string
  article: { id: string;  } | null
  products: LinkedProduct[]
}

const ORG_TYPES = [
  { value: "company", label: "Company" },
  { value: "political-party", label: "Political Party" },
  { value: "university", label: "University" },
  { value: "institution", label: "Institution" },
  { value: "military-academy", label: "Military Academy" },
  { value: "government-agency", label: "Government Agency" },
  { value: "labor-union", label: "Labor Union" },
  { value: "school", label: "School" },
  { value: "library", label: "Library" },
  { value: "military-base", label: "Military Base" },
  { value: "government", label: "Government Body" },
  { value: "business-school", label: "Business School" },
  { value: "organization", label: "Other Organization" },
]

export default function ManageOrganizationsPage() {
  const { data: session, status } = useSession()

  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Sorting
  const [sortField, setSortField] = useState<"name" | "createdAt" | "dateFounded">("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  // Edit modal
  const [editModal, setEditModal] = useState<Organization | null>(null)
  const [editData, setEditData] = useState({
    name: "",
    abbreviation: "",
    orgType: "organization",
    dateFounded: "",
    dateDissolved: "",
    articleId: "",
  })
  const [saving, setSaving] = useState(false)
  const [editMessage, setEditMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [availableArticles, setAvailableArticles] = useState<Article[]>([])
  const [inspirations, setInspirations] = useState<Inspiration[]>([])
  const [linkedImages, setLinkedImages] = useState<LinkedImage[]>([])
  const [linkedBrands, setLinkedBrands] = useState<LinkedBrand[]>([])

  // Delete modal
  const [deleteModal, setDeleteModal] = useState<Organization | null>(null)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadOrganizations()
  }, [])

  const loadOrganizations = async () => {
    try {
      const res = await fetch("/api/entities/organizations")
      const data = await res.json()
      if (Array.isArray(data)) {
        setOrganizations(data)
      }
    } catch (err) {
      console.error("Failed to load organizations:", err)
    } finally {
      setLoading(false)
    }
  }

  const sortedOrganizations = [...organizations].sort((a, b) => {
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

  const openEditModal = async (org: Organization) => {
    setEditModal(org)
    setEditData({
      name: org.name,
      abbreviation: org.abbreviation || "",
      orgType: org.orgType,
      dateFounded: org.dateFounded ? org.dateFounded.split("T")[0] : "",
      dateDissolved: org.dateDissolved ? org.dateDissolved.split("T")[0] : "",
      articleId: org.articleId || "",
    })
    setEditMessage(null)
    setInspirations([])
    setLinkedImages([])
    setLinkedBrands([])

    // Load available articles, inspirations, images, and brands in parallel
    try {
      const [articlesRes, inspirationsRes, imagesRes, brandsRes] = await Promise.all([
        fetch("/api/entities/organizations/available-articles"),
        fetch(`/api/entities/organizations/${org.id}/inspirations`),
        fetch(`/api/entities/organizations/${org.id}/images`),
        fetch(`/api/entities/organizations/${org.id}/brands`)
      ])

      const articlesData = await articlesRes.json()
      if (Array.isArray(articlesData)) {
        // Add current org's article if it exists
        if (org.article && !articlesData.find((a: Article) => a.id === org.articleId)) {
          articlesData.unshift(org.article)
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

      const brandsData = await brandsRes.json()
      if (Array.isArray(brandsData)) {
        setLinkedBrands(brandsData)
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
      const res = await fetch("/api/entities/organizations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editModal.id,
          name: editData.name,
          abbreviation: editData.abbreviation || null,
          orgType: editData.orgType,
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
      await loadOrganizations()

      setTimeout(() => {
        closeEditModal()
      }, 1000)
    } catch (error) {
      setEditMessage({ type: "error", text: error instanceof Error ? error.message : "Update failed" })
    } finally {
      setSaving(false)
    }
  }

  const openDeleteModal = (org: Organization) => {
    setDeleteModal(org)
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
      const res = await fetch(`/api/entities/organizations/${deleteModal.id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Delete failed")
      }

      setMessage({ type: "success", text: `"${deleteModal.name}" deleted successfully` })
      await loadOrganizations()
      closeDeleteModal()

      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Delete failed" })
    } finally {
      setDeleting(false)
    }
  }

  const formatOrgType = (orgType: string) => {
    const found = ORG_TYPES.find((t) => t.value === orgType)
    return found ? found.label : orgType
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/world-data/organizations" className="text-gray-500 hover:text-gray-700">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-teal-600">Manage Organizations</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Organizations ({organizations.length})</h2>
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
          ) : sortedOrganizations.length === 0 ? (
            <p className="text-gray-500 text-sm">No organizations found</p>
          ) : (
            <div className="space-y-2">
              {sortedOrganizations.map((org) => (
                <div
                  key={org.id}
                  className="flex items-center justify-between p-3 bg-teal-50 rounded border border-teal-200"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {org.name}
                      {org.abbreviation && <span className="text-gray-500"> ({org.abbreviation})</span>}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatOrgType(org.orgType)}
                      {org.dateFounded && ` · Founded: ${new Date(org.dateFounded).getFullYear()} k.y.`}
                      {org.dateDissolved && ` · Dissolved: ${new Date(org.dateDissolved).getFullYear()} k.y.`}
                    </p>
                    {org.article && (
                      <a
                        href={`/kemponet/kempopedia/wiki/${org.article.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-teal-600 hover:text-teal-800 hover:underline"
                      >
                        📄 {org.article.title}
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <button
                      onClick={() => openEditModal(org)}
                      className="text-teal-600 hover:text-teal-800 text-sm"
                    >
                      View/Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(org)}
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
            <h3 className="text-lg font-bold mb-4">View/Edit Organization</h3>

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
                <label className="block text-sm font-medium text-gray-700 mb-1">Organization Type</label>
                <select
                  value={editData.orgType}
                  onChange={(e) => setEditData({ ...editData, orgType: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  {ORG_TYPES.map((type) => (
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
                        className="inline-flex items-center gap-1 px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm hover:bg-teal-200"
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

            {/* Linked Brands & Products */}
            {linkedBrands.length > 0 && (
              <div className="mt-6 border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Brands & Products ({linkedBrands.length} brand{linkedBrands.length !== 1 ? "s" : ""})
                </h4>
                <div className="space-y-3">
                  {linkedBrands.map((brand) => (
                    <div key={brand.id} className="bg-orange-50 rounded p-3 border border-orange-200">
                      <div className="flex items-center gap-2 font-medium text-sm">
                        <span className="text-orange-600">●</span>
                        {brand.article ? (
                          <a
                            href={`/kemponet/kempopedia/wiki/${brand.article.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-orange-600 hover:text-orange-800 hover:underline"
                          >
                            {brand.name}
                          </a>
                        ) : (
                          <span className="text-gray-800">{brand.name}</span>
                        )}
                        {brand.products.length > 0 && (
                          <span className="text-gray-400 text-xs">
                            ({brand.products.length} product{brand.products.length !== 1 ? "s" : ""})
                          </span>
                        )}
                      </div>
                      {brand.products.length > 0 && (
                        <div className="ml-4 mt-2 space-y-1">
                          {brand.products.map((product) => (
                            <div key={product.id} className="flex items-center gap-2 text-sm">
                              <span className="text-rose-500">○</span>
                              {product.article ? (
                                <a
                                  href={`/kemponet/kempopedia/wiki/${product.article.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-rose-600 hover:text-rose-800 hover:underline"
                                >
                                  {product.name}
                                </a>
                              ) : (
                                <span className="text-gray-700">{product.name}</span>
                              )}
                              <span className="text-gray-400 text-xs">({product.productType})</span>
                            </div>
                          ))}
                        </div>
                      )}
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
                        className="h-16 w-16 object-cover rounded border border-teal-300 hover:border-teal-500"
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
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
              >
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
              This action cannot be undone.
            </p>

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
