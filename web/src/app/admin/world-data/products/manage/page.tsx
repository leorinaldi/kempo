"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { redirect } from "next/navigation"
import Link from "next/link"

interface Product {
  id: string
  name: string
  productType: string
  brandId: string | null
  brand: {
    id: string
    name: string
    organization: { id: string; name: string } | null
  } | null
  dateIntroduced: string | null
  dateDiscontinued: string | null
  articleId: string | null
  article: { slug: string; title: string } | null
  createdAt: string
  updatedAt: string
}

interface Brand {
  id: string
  name: string
  organization: { id: string; name: string } | null
}

interface Article {
  id: string
  slug: string
  title: string
  subtype: string | null
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

const PRODUCT_TYPES = [
  { value: "vehicle", label: "Vehicle" },
  { value: "beverage", label: "Beverage" },
  { value: "tobacco", label: "Tobacco Product" },
  { value: "publication", label: "Publication" },
  { value: "food", label: "Food Product" },
  { value: "appliance", label: "Appliance" },
  { value: "electronics", label: "Electronics" },
  { value: "clothing", label: "Clothing" },
  { value: "cosmetics", label: "Cosmetics" },
  { value: "other", label: "Other" },
]

export default function ManageProductsPage() {
  const { data: session, status } = useSession()

  const [products, setProducts] = useState<Product[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Sorting
  const [sortField, setSortField] = useState<"name" | "createdAt" | "dateIntroduced" | "productType">("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  // Edit modal
  const [editModal, setEditModal] = useState<Product | null>(null)
  const [editData, setEditData] = useState({
    name: "",
    productType: "",
    brandId: "",
    dateIntroduced: "",
    dateDiscontinued: "",
    articleId: "",
  })
  const [saving, setSaving] = useState(false)
  const [editMessage, setEditMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [availableArticles, setAvailableArticles] = useState<Article[]>([])
  const [inspirations, setInspirations] = useState<Inspiration[]>([])
  const [linkedImages, setLinkedImages] = useState<LinkedImage[]>([])

  // Delete modal
  const [deleteModal, setDeleteModal] = useState<Product | null>(null)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadProducts()
    loadBrands()
  }, [])

  const loadProducts = async () => {
    try {
      const res = await fetch("/api/products/list")
      const data = await res.json()
      if (Array.isArray(data)) {
        setProducts(data)
      }
    } catch (err) {
      console.error("Failed to load products:", err)
    } finally {
      setLoading(false)
    }
  }

  const loadBrands = async () => {
    try {
      const res = await fetch("/api/brands/list")
      const data = await res.json()
      if (Array.isArray(data)) {
        setBrands(data)
      }
    } catch (err) {
      console.error("Failed to load brands:", err)
    }
  }

  const sortedProducts = [...products].sort((a, b) => {
    let comparison = 0
    if (sortField === "name") {
      comparison = a.name.localeCompare(b.name)
    } else if (sortField === "productType") {
      comparison = a.productType.localeCompare(b.productType)
    } else if (sortField === "dateIntroduced") {
      const aDate = a.dateIntroduced ? new Date(a.dateIntroduced).getTime() : 0
      const bDate = b.dateIntroduced ? new Date(b.dateIntroduced).getTime() : 0
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

  const openEditModal = async (product: Product) => {
    setEditModal(product)
    setEditData({
      name: product.name,
      productType: product.productType,
      brandId: product.brandId || "",
      dateIntroduced: product.dateIntroduced ? product.dateIntroduced.split("T")[0] : "",
      dateDiscontinued: product.dateDiscontinued ? product.dateDiscontinued.split("T")[0] : "",
      articleId: product.articleId || "",
    })
    setEditMessage(null)
    setInspirations([])
    setLinkedImages([])

    try {
      const [articlesRes, inspirationsRes, imagesRes] = await Promise.all([
        fetch("/api/products/available-articles"),
        fetch(`/api/products/${product.id}/inspirations`),
        fetch(`/api/products/${product.id}/images`),
      ])

      const articlesData = await articlesRes.json()
      if (Array.isArray(articlesData)) {
        // Add current product's article if it exists
        if (product.article && !articlesData.find((a: Article) => a.id === product.articleId)) {
          articlesData.unshift(product.article)
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
      const res = await fetch("/api/products/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editModal.id,
          name: editData.name,
          productType: editData.productType,
          brandId: editData.brandId || null,
          dateIntroduced: editData.dateIntroduced || null,
          dateDiscontinued: editData.dateDiscontinued || null,
          articleId: editData.articleId || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Update failed")
      }

      setEditMessage({ type: "success", text: "Saved successfully!" })
      await loadProducts()

      setTimeout(() => {
        closeEditModal()
      }, 1000)
    } catch (error) {
      setEditMessage({ type: "error", text: error instanceof Error ? error.message : "Update failed" })
    } finally {
      setSaving(false)
    }
  }

  const openDeleteModal = (product: Product) => {
    setDeleteModal(product)
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
      const res = await fetch("/api/products/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteModal.id }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Delete failed")
      }

      setMessage({ type: "success", text: `"${deleteModal.name}" deleted successfully` })
      await loadProducts()
      closeDeleteModal()

      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Delete failed" })
    } finally {
      setDeleting(false)
    }
  }

  const formatProductType = (type: string) => {
    const found = PRODUCT_TYPES.find((t) => t.value === type)
    return found ? found.label : type
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/world-data/products" className="text-gray-500 hover:text-gray-700">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-rose-600">Manage Products</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Products ({products.length})</h2>
            <div className="flex items-center gap-2">
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as "name" | "createdAt" | "dateIntroduced" | "productType")}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="name">Name</option>
                <option value="productType">Type</option>
                <option value="createdAt">Created Date</option>
                <option value="dateIntroduced">Introduced Date (k.y.)</option>
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
          ) : sortedProducts.length === 0 ? (
            <p className="text-gray-500 text-sm">No products found</p>
          ) : (
            <div className="space-y-2">
              {sortedProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 bg-rose-50 rounded border border-rose-200"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatProductType(product.productType)}
                      {product.brand && ` · ${product.brand.name}`}
                      {product.brand?.organization && ` (${product.brand.organization.name})`}
                      {product.dateIntroduced && ` · Introduced: ${new Date(product.dateIntroduced).getFullYear()} k.y.`}
                      {product.dateDiscontinued && ` · Discontinued: ${new Date(product.dateDiscontinued).getFullYear()} k.y.`}
                    </p>
                    {product.article && (
                      <a
                        href={`/kemponet/kempopedia/wiki/${product.article.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-rose-600 hover:text-rose-800 hover:underline"
                      >
                        📄 {product.article.title}
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <button
                      onClick={() => openEditModal(product)}
                      className="text-rose-600 hover:text-rose-800 text-sm"
                    >
                      View/Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(product)}
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
            <h3 className="text-lg font-bold mb-4">View/Edit Product</h3>

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
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
                <select
                  value={editData.productType}
                  onChange={(e) => setEditData({ ...editData, productType: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  {PRODUCT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                <select
                  value={editData.brandId}
                  onChange={(e) => setEditData({ ...editData, brandId: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">-- No brand --</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                      {brand.organization && ` (${brand.organization.name})`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Introduced (k.y.)</label>
                  <input
                    type="date"
                    value={editData.dateIntroduced}
                    onChange={(e) => setEditData({ ...editData, dateIntroduced: e.target.value })}
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
                      {article.title} ({article.slug})
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
                        className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-sm hover:bg-rose-200"
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
                        alt={image.altText || "Product image"}
                        className="w-20 h-20 object-cover rounded border border-rose-200 hover:border-rose-400"
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
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
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
