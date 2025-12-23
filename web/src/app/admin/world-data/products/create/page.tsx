"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { redirect, useRouter } from "next/navigation"
import Link from "next/link"

interface Brand {
  id: string
  name: string
  organization: { id: string; name: string } | null
}

interface Article {
  id: string
  
  title: string
  subtype: string | null
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

export default function CreateProductPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [name, setName] = useState("")
  const [productType, setProductType] = useState("")
  const [brandId, setBrandId] = useState("")
  const [dateIntroduced, setDateIntroduced] = useState("")
  const [dateDiscontinued, setDateDiscontinued] = useState("")
  const [articleId, setArticleId] = useState("")

  const [brands, setBrands] = useState<Brand[]>([])
  const [availableArticles, setAvailableArticles] = useState<Article[]>([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    loadBrands()
    loadAvailableArticles()
  }, [])

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

  const loadAvailableArticles = async () => {
    try {
      const res = await fetch("/api/products/available-articles")
      const data = await res.json()
      if (Array.isArray(data)) {
        setAvailableArticles(data)
      }
    } catch (err) {
      console.error("Failed to load articles:", err)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch("/api/products/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          productType,
          brandId: brandId || null,
          dateIntroduced: dateIntroduced || null,
          dateDiscontinued: dateDiscontinued || null,
          articleId: articleId || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to create product")
      }

      setMessage({ type: "success", text: "Product created successfully!" })
      setTimeout(() => {
        router.push("/admin/world-data/products/manage")
      }, 1500)
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Failed to create product" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/admin/world-data/products" className="text-gray-500 hover:text-gray-700">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold text-rose-600">Create Product</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          {message && (
            <div
              className={`mb-4 p-3 rounded ${
                message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="e.g., Monarch Imperial, Feldmann Beer"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Type <span className="text-red-500">*</span>
              </label>
              <select
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              >
                <option value="">-- Select type --</option>
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
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
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
                  value={dateIntroduced}
                  onChange={(e) => setDateIntroduced(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Discontinued (k.y.)</label>
                <input
                  type="date"
                  value={dateDiscontinued}
                  onChange={(e) => setDateDiscontinued(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kempopedia Article</label>
              <select
                value={articleId}
                onChange={(e) => setArticleId(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">-- No article linked --</option>
                {availableArticles.map((article) => (
                  <option key={article.id} value={article.id}>
                    {article.title} ({article.subtype || "product"})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Link
              href="/admin/world-data/products"
              className="flex-1 text-center bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving || !name || !productType}
              className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create Product"}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
