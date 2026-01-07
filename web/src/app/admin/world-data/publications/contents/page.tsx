"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { DeleteConfirmModal, useAdminAuth, AdminPageLayout, MessageBanner } from "@/components/admin"

interface Person {
  id: string
  firstName: string
  lastName: string
  stageName: string | null
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
  series: { name: string } | null
}

interface Byline {
  id: string
  role: string
  credit: string | null
  person: Person
}

interface Content {
  id: string
  title: string
  subtitle: string | null
  type: string
  content: string
  sortOrder: number
  heroImageId: string | null
  heroImage: Image | null
  heroPosition: string | null
  layoutStyle: string | null
  pullquotes: string[] | null
  useDropcap: boolean | null
  columns: number | null
  accentColor: string | null
  elements: Byline[]
}

const CONTENT_TYPES = [
  { value: "cover", label: "Cover" },
  { value: "table_of_contents", label: "Table of Contents" },
  { value: "feature", label: "Feature Article" },
  { value: "column", label: "Column" },
  { value: "news", label: "News" },
  { value: "interview", label: "Interview" },
  { value: "photo_essay", label: "Photo Essay" },
  { value: "review", label: "Review" },
  { value: "editorial", label: "Editorial" },
  { value: "advertisement", label: "Advertisement" },
  { value: "back_cover", label: "Back Cover" },
]

const HERO_POSITIONS = [
  { value: "", label: "None" },
  { value: "top", label: "Top" },
  { value: "left", label: "Left" },
  { value: "right", label: "Right" },
  { value: "background", label: "Background" },
]

const LAYOUT_STYLES = [
  { value: "", label: "Standard" },
  { value: "full_bleed", label: "Full Bleed" },
  { value: "boxed", label: "Boxed" },
  { value: "minimal", label: "Minimal" },
]

const BYLINE_ROLES = [
  { value: "author", label: "Author" },
  { value: "photographer", label: "Photographer" },
  { value: "illustrator", label: "Illustrator" },
]

export default function ContentsPage() {
  const { isLoading: authLoading } = useAdminAuth()
  const searchParams = useSearchParams()
  const publicationId = searchParams.get("publicationId")

  const [publication, setPublication] = useState<Publication | null>(null)
  const [contents, setContents] = useState<Content[]>([])
  const [people, setPeople] = useState<Person[]>([])
  const [images, setImages] = useState<Image[]>([])
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Create/Edit modal
  const [editModal, setEditModal] = useState<Content | "new" | null>(null)
  const [editData, setEditData] = useState({
    title: "",
    subtitle: "",
    type: "feature",
    content: "",
    sortOrder: 1,
    heroImageId: "",
    heroPosition: "",
    layoutStyle: "",
    pullquotes: "",
    useDropcap: "",
    columns: "",
    accentColor: "",
    bylines: [] as { personId: string; role: string; credit: string }[],
  })
  const [saving, setSaving] = useState(false)
  const [editMessage, setEditMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Delete modal
  const [deleteModal, setDeleteModal] = useState<Content | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (publicationId) {
      loadData()
    }
  }, [publicationId])

  const loadData = async () => {
    if (!publicationId) return

    try {
      const [contentsRes, pubRes, peopleRes, imagesRes] = await Promise.all([
        fetch(`/api/admin/newspubcontent?publicationId=${publicationId}`),
        fetch(`/api/entities/publications/${publicationId}`),
        fetch("/api/entities/people"),
        fetch("/api/image/list"),
      ])

      const [contentsData, pubData, peopleData, imagesData] = await Promise.all([
        contentsRes.json(),
        pubRes.json(),
        peopleRes.json(),
        imagesRes.json(),
      ])

      if (Array.isArray(contentsData)) setContents(contentsData)
      if (pubData && !pubData.error) setPublication(pubData)
      if (Array.isArray(peopleData)) setPeople(peopleData)
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

  if (!publicationId) {
    return (
      <AdminPageLayout title="Article Contents" backHref="/admin/world-data/publications/issues" color="amber">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500">No publication selected. Please select a publication first.</p>
          <Link
            href="/admin/world-data/publications/issues/manage"
            className="text-amber-600 hover:text-amber-800 mt-4 inline-block"
          >
            Go to Publications
          </Link>
        </div>
      </AdminPageLayout>
    )
  }

  const openCreateModal = () => {
    const nextSortOrder = contents.length > 0 ? Math.max(...contents.map(c => c.sortOrder)) + 1 : 1
    setEditModal("new")
    setEditData({
      title: "",
      subtitle: "",
      type: "feature",
      content: "",
      sortOrder: nextSortOrder,
      heroImageId: "",
      heroPosition: "",
      layoutStyle: "",
      pullquotes: "",
      useDropcap: "",
      columns: "",
      accentColor: "",
      bylines: [],
    })
    setEditMessage(null)
  }

  const openEditModal = (content: Content) => {
    setEditModal(content)
    setEditData({
      title: content.title,
      subtitle: content.subtitle || "",
      type: content.type,
      content: content.content,
      sortOrder: content.sortOrder,
      heroImageId: content.heroImageId || "",
      heroPosition: content.heroPosition || "",
      layoutStyle: content.layoutStyle || "",
      pullquotes: content.pullquotes?.join("\n") || "",
      useDropcap: content.useDropcap === null ? "" : content.useDropcap ? "true" : "false",
      columns: content.columns?.toString() || "",
      accentColor: content.accentColor || "",
      bylines: content.elements.map(e => ({
        personId: e.person.id,
        role: e.role,
        credit: e.credit || "",
      })),
    })
    setEditMessage(null)
  }

  const closeEditModal = () => {
    setEditModal(null)
    setEditMessage(null)
  }

  const saveContent = async () => {
    if (!publicationId) return

    setSaving(true)
    setEditMessage(null)

    try {
      const payload = {
        id: editModal !== "new" ? (editModal as Content).id : undefined,
        publicationId,
        title: editData.title,
        subtitle: editData.subtitle || null,
        type: editData.type,
        content: editData.content,
        sortOrder: editData.sortOrder,
        heroImageId: editData.heroImageId || null,
        heroPosition: editData.heroPosition || null,
        layoutStyle: editData.layoutStyle || null,
        pullquotes: editData.pullquotes ? editData.pullquotes.split("\n").filter(Boolean) : null,
        useDropcap: editData.useDropcap === "" ? null : editData.useDropcap === "true",
        columns: editData.columns ? parseInt(editData.columns) : null,
        accentColor: editData.accentColor || null,
        bylines: editData.bylines.filter(b => b.personId),
      }

      const res = await fetch("/api/admin/newspubcontent", {
        method: editModal === "new" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Save failed")
      }

      setEditMessage({ type: "success", text: "Saved successfully!" })
      await loadData()

      setTimeout(() => {
        closeEditModal()
      }, 1000)
    } catch (error) {
      setEditMessage({ type: "error", text: error instanceof Error ? error.message : "Save failed" })
    } finally {
      setSaving(false)
    }
  }

  const openDeleteModal = (content: Content) => {
    setDeleteModal(content)
  }

  const closeDeleteModal = () => {
    setDeleteModal(null)
  }

  const confirmDelete = async () => {
    if (!deleteModal) return

    setDeleting(true)

    try {
      const res = await fetch(`/api/admin/newspubcontent?id=${deleteModal.id}`, {
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

  const addByline = () => {
    setEditData({
      ...editData,
      bylines: [...editData.bylines, { personId: "", role: "author", credit: "" }],
    })
  }

  const removeByline = (index: number) => {
    setEditData({
      ...editData,
      bylines: editData.bylines.filter((_, i) => i !== index),
    })
  }

  const updateByline = (index: number, field: string, value: string) => {
    const newBylines = [...editData.bylines]
    newBylines[index] = { ...newBylines[index], [field]: value }
    setEditData({ ...editData, bylines: newBylines })
  }

  const getTypeLabel = (type: string) => CONTENT_TYPES.find(t => t.value === type)?.label || type
  const getPersonName = (person: Person) => person.stageName || `${person.firstName} ${person.lastName}`

  return (
    <AdminPageLayout
      title={publication ? `Contents: ${publication.title}` : "Article Contents"}
      backHref="/admin/world-data/publications/issues/manage"
      color="amber"
    >
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold">Articles ({contents.length})</h2>
            {publication && (
              <p className="text-sm text-gray-500">{publication.series?.name || "Standalone"}</p>
            )}
          </div>
          <button
            onClick={openCreateModal}
            className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded"
          >
            Add Content
          </button>
        </div>

        <MessageBanner message={message} className="mb-4" />

        {contents.length === 0 ? (
          <p className="text-gray-500 text-sm">No content yet. Click "Add Content" to create articles.</p>
        ) : (
          <div className="space-y-2">
            {contents.map((content) => (
              <div
                key={content.id}
                className="flex items-center justify-between p-3 bg-amber-50 rounded border border-amber-200"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded">
                      {content.sortOrder}
                    </span>
                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                      {getTypeLabel(content.type)}
                    </span>
                    <p className="font-medium text-sm">{content.title}</p>
                  </div>
                  {content.elements.length > 0 && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      By {content.elements.filter(e => e.role === "author").map(e => getPersonName(e.person)).join(", ")}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <button
                    onClick={() => openEditModal(content)}
                    className="text-amber-600 hover:text-amber-800 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openDeleteModal(content)}
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

      {/* Edit/Create Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">
              {editModal === "new" ? "Add Content" : "Edit Content"}
            </h3>

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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={editData.title}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select
                    value={editData.type}
                    onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    {CONTENT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle / Deck</label>
                <input
                  type="text"
                  value={editData.subtitle}
                  onChange={(e) => setEditData({ ...editData, subtitle: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order *</label>
                  <input
                    type="number"
                    value={editData.sortOrder}
                    onChange={(e) => setEditData({ ...editData, sortOrder: parseInt(e.target.value) || 1 })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Layout Style</label>
                  <select
                    value={editData.layoutStyle}
                    onChange={(e) => setEditData({ ...editData, layoutStyle: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    {LAYOUT_STYLES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Columns</label>
                  <select
                    value={editData.columns}
                    onChange={(e) => setEditData({ ...editData, columns: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="">Default</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hero Image</label>
                  <select
                    value={editData.heroImageId}
                    onChange={(e) => setEditData({ ...editData, heroImageId: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="">-- None --</option>
                    {images.map((img) => (
                      <option key={img.id} value={img.id}>
                        {img.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hero Position</label>
                  <select
                    value={editData.heroPosition}
                    onChange={(e) => setEditData({ ...editData, heroPosition: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    {HERO_POSITIONS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content (Markdown) *</label>
                <textarea
                  value={editData.content}
                  onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 font-mono text-sm"
                  rows={10}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pullquotes (one per line)</label>
                <textarea
                  value={editData.pullquotes}
                  onChange={(e) => setEditData({ ...editData, pullquotes: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  rows={2}
                  placeholder="Enter pullquotes, one per line"
                />
              </div>

              {/* Bylines Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Bylines</label>
                  <button
                    type="button"
                    onClick={addByline}
                    className="text-sm text-amber-600 hover:text-amber-800"
                  >
                    + Add Byline
                  </button>
                </div>
                {editData.bylines.length === 0 ? (
                  <p className="text-sm text-gray-500">No bylines added</p>
                ) : (
                  <div className="space-y-2">
                    {editData.bylines.map((byline, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <select
                          value={byline.personId}
                          onChange={(e) => updateByline(index, "personId", e.target.value)}
                          className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                        >
                          <option value="">-- Select Person --</option>
                          {people.map((p) => (
                            <option key={p.id} value={p.id}>
                              {getPersonName(p)}
                            </option>
                          ))}
                        </select>
                        <select
                          value={byline.role}
                          onChange={(e) => updateByline(index, "role", e.target.value)}
                          className="w-32 border border-gray-300 rounded px-3 py-2 text-sm"
                        >
                          {BYLINE_ROLES.map((r) => (
                            <option key={r.value} value={r.value}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={byline.credit}
                          onChange={(e) => updateByline(index, "credit", e.target.value)}
                          placeholder="Credit"
                          className="w-32 border border-gray-300 rounded px-3 py-2 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeByline(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Drop Cap</label>
                  <select
                    value={editData.useDropcap}
                    onChange={(e) => setEditData({ ...editData, useDropcap: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="">Default</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Accent Color</label>
                  <input
                    type="text"
                    value={editData.accentColor}
                    onChange={(e) => setEditData({ ...editData, accentColor: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="#000000"
                  />
                </div>
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
                onClick={saveContent}
                disabled={saving || !editData.title || !editData.content}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
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
