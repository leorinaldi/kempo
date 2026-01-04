"use client"

import { useState, useEffect } from "react"
import { DeleteConfirmModal, useAdminAuth, AdminPageLayout, MessageBanner } from "@/components/admin"

interface Brand {
  id: string
  name: string
  organizationId: string | null
  organization: { id: string; name: string } | null
  dateFounded: string | null
  dateDiscontinued: string | null
  articleId: string | null
  article: { id: string;  title: string } | null
  _count: { products: number }
  createdAt: string
  updatedAt: string
}

interface Organization {
  id: string
  name: string
}

interface Article {
  id: string
  
  title: string
}

interface LinkedProduct {
  id: string
  name: string
  productType: string
  article: { id: string;  } | null
}

interface Inspiration {
  id: string
  inspiration: string
  wikipediaUrl: string | null
}

interface LinkedImage {
  id: string
  url: string
  altText: string | null
}

export default function ManageBrandsPage() {
  const { isLoading: authLoading } = useAdminAuth()

  const [brands, setBrands] = useState<Brand[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Sorting
  const [sortField, setSortField] = useState<"name" | "createdAt" | "dateFounded">("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  // Edit modal
  const [editModal, setEditModal] = useState<Brand | null>(null)
  const [editData, setEditData] = useState({
    name: "",
    organizationId: "",
    dateFounded: "",
    dateDiscontinued: "",
    articleId: "",
  })
  const [saving, setSaving] = useState(false)
  const [editMessage, setEditMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [availableArticles, setAvailableArticles] = useState<Article[]>([])
  const [linkedProducts, setLinkedProducts] = useState<LinkedProduct[]>([])
  const [inspirations, setInspirations] = useState<Inspiration[]>([])
  const [linkedImages, setLinkedImages] = useState<LinkedImage[]>([])

  // Delete modal
  const [deleteModal, setDeleteModal] = useState<Brand | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadBrands()
    loadOrganizations()
  }, [])

  const loadBrands = async () => {
    try {
      const res = await fetch("/api/entities/brands")
      const data = await res.json()
      if (Array.isArray(data)) {
        setBrands(data)
      }
    } catch (err) {
      console.error("Failed to load brands:", err)
    } finally {
      setLoading(false)
    }
  }

  const loadOrganizations = async () => {
    try {
      const res = await fetch("/api/entities/organizations")
      const data = await res.json()
      if (Array.isArray(data)) {
        setOrganizations(data)
      }
    } catch (err) {
      console.error("Failed to load organizations:", err)
    }
  }

  const sortedBrands = [...brands].sort((a, b) => {
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

  const openEditModal = async (brand: Brand) => {
    setEditModal(brand)
    setEditData({
      name: brand.name,
      organizationId: brand.organizationId || "",
      dateFounded: brand.dateFounded ? brand.dateFounded.split("T")[0] : "",
      dateDiscontinued: brand.dateDiscontinued ? brand.dateDiscontinued.split("T")[0] : "",
      articleId: brand.articleId || "",
    })
    setEditMessage(null)
    setLinkedProducts([])
    setInspirations([])
    setLinkedImages([])

    try {
      const [articlesRes, productsRes, inspirationsRes, imagesRes] = await Promise.all([
        fetch("/api/entities/brands/available-articles"),
        fetch(`/api/entities/brands/${brand.id}/products`),
        fetch(`/api/entities/brands/${brand.id}/inspirations`),
        fetch(`/api/entities/brands/${brand.id}/images`),
      ])

      const articlesData = await articlesRes.json()
      if (Array.isArray(articlesData)) {
        // Add current brand's article if it exists
        if (brand.article && !articlesData.find((a: Article) => a.id === brand.articleId)) {
          articlesData.unshift(brand.article)
        }
        setAvailableArticles(articlesData)
      }

      const productsData = await productsRes.json()
      if (Array.isArray(productsData)) {
        setLinkedProducts(productsData)
      }

      const inspirationsData = await inspirationsRes.json()
      if (Array.isArray(inspirationsData)) {
        setInspirations(inspirationsData)
      }

      const imagesData = await imagesRes.json()
      if (Array.isArray(imagesData)) {
        setLinkedImages(imagesData)
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
      const res = await fetch("/api/entities/brands", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editModal.id,
          name: editData.name,
          organizationId: editData.organizationId || null,
          dateFounded: editData.dateFounded || null,
          dateDiscontinued: editData.dateDiscontinued || null,
          articleId: editData.articleId || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Update failed")
      }

      setEditMessage({ type: "success", text: "Saved successfully!" })
      await loadBrands()

      setTimeout(() => {
        closeEditModal()
      }, 1000)
    } catch (error) {
      setEditMessage({ type: "error", text: error instanceof Error ? error.message : "Update failed" })
    } finally {
      setSaving(false)
    }
  }

  const openDeleteModal = (brand: Brand) => {
    setDeleteModal(brand)
  }

  const closeDeleteModal = () => {
    setDeleteModal(null)
  }

  const confirmDelete = async () => {
    if (!deleteModal) return

    setDeleting(true)

    try {
      const res = await fetch(`/api/entities/brands/${deleteModal.id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Delete failed")
      }

      setMessage({ type: "success", text: `"${deleteModal.name}" deleted successfully` })
      await loadBrands()
      closeDeleteModal()

      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Delete failed" })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AdminPageLayout title="Manage Brands" backHref="/admin/world-data/brands" color="orange">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Brands ({brands.length})</h2>
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
          ) : sortedBrands.length === 0 ? (
            <p className="text-gray-500 text-sm">No brands found</p>
          ) : (
            <div className="space-y-2">
              {sortedBrands.map((brand) => (
                <div
                  key={brand.id}
                  className="flex items-center justify-between p-3 bg-orange-50 rounded border border-orange-200"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{brand.name}</p>
                    <p className="text-xs text-gray-500">
                      {brand.organization && `${brand.organization.name} · `}
                      {brand.dateFounded && `Founded: ${new Date(brand.dateFounded).getFullYear()} k.y.`}
                      {brand.dateDiscontinued && ` · Discontinued: ${new Date(brand.dateDiscontinued).getFullYear()} k.y.`}
                      {brand._count?.products > 0 && ` · ${brand._count.products} product${brand._count.products !== 1 ? "s" : ""}`}
                    </p>
                    {brand.article && (
                      <a
                        href={`/kemponet/kempopedia/wiki/${brand.article.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-orange-600 hover:text-orange-800 hover:underline"
                      >
                        📄 {brand.article.title}
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <button
                      onClick={() => openEditModal(brand)}
                      className="text-orange-600 hover:text-orange-800 text-sm"
                    >
                      View/Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(brand)}
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
            <h3 className="text-lg font-bold mb-4">View/Edit Brand</h3>

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
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Organization</label>
                <select
                  value={editData.organizationId}
                  onChange={(e) => setEditData({ ...editData, organizationId: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">-- No parent organization --</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Discontinued (k.y.)</label>
                  <input
                    type="date"
                    value={editData.dateDiscontinued}
                    onChange={(e) => setEditData({ ...editData, dateDiscontinued: e.target.value })}
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

            {/* Real-World Inspirations */}
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
                        className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm hover:bg-orange-200"
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

            {/* Linked Products */}
            {linkedProducts.length > 0 && (
              <div className="mt-6 border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Linked Products ({linkedProducts.length})</h4>
                <div className="space-y-1">
                  {linkedProducts.map((product) => (
                    <div key={product.id} className="flex items-center gap-2 text-sm">
                      <span className="text-rose-600">●</span>
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
              </div>
            )}

            {/* Linked Images */}
            {linkedImages.length > 0 && (
              <div className="mt-6 border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Linked Images ({linkedImages.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {linkedImages.map((image) => (
                    <a
                      key={image.id}
                      href={image.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <img
                        src={image.url}
                        alt={image.altText || "Brand image"}
                        className="w-20 h-20 object-cover rounded border border-orange-200 hover:border-orange-400"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

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
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={!!deleteModal}
        itemName={deleteModal?.name ?? ""}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        isDeleting={deleting}
        warningMessage={
          deleteModal && deleteModal._count?.products > 0
            ? `${deleteModal._count.products} product${deleteModal._count.products !== 1 ? "s" : ""} will have their brand removed.`
            : undefined
        }
      />
    </AdminPageLayout>
  )
}
