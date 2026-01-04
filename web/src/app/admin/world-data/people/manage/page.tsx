"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { redirect } from "next/navigation"
import Link from "next/link"

interface Person {
  id: string
  firstName: string
  middleName: string | null
  lastName: string
  gender: string
  dateBorn: string | null
  dateDied: string | null
  articleId: string | null
  article: { id: string;  title: string } | null
  createdAt: string
  updatedAt: string
}

interface Article {
  id: string
  
  title: string
}

interface LinkedImage {
  id: string
  
  name: string
  url: string
}

interface Inspiration {
  id: string
  inspiration: string
  wikipediaUrl: string | null
}

export default function ManagePeoplePage() {
  const { data: session, status } = useSession()

  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Sorting
  const [sortField, setSortField] = useState<"lastName" | "createdAt" | "dateBorn">("lastName")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  // Edit modal
  const [editModal, setEditModal] = useState<Person | null>(null)
  const [editData, setEditData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    gender: "male" as "male" | "female",
    dateBorn: "",
    dateDied: "",
    articleId: "",
  })
  const [saving, setSaving] = useState(false)
  const [editMessage, setEditMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [availableArticles, setAvailableArticles] = useState<Article[]>([])
  const [linkedImages, setLinkedImages] = useState<LinkedImage[]>([])
  const [inspirations, setInspirations] = useState<Inspiration[]>([])

  // Delete modal
  const [deleteModal, setDeleteModal] = useState<Person | null>(null)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadPeople()
  }, [])

  const loadPeople = async () => {
    try {
      const res = await fetch("/api/entities/people")
      const data = await res.json()
      if (Array.isArray(data)) {
        setPeople(data)
      }
    } catch (err) {
      console.error("Failed to load people:", err)
    } finally {
      setLoading(false)
    }
  }

  const sortedPeople = [...people].sort((a, b) => {
    let comparison = 0
    if (sortField === "lastName") {
      comparison = a.lastName.localeCompare(b.lastName)
    } else if (sortField === "dateBorn") {
      const aDate = a.dateBorn ? new Date(a.dateBorn).getTime() : 0
      const bDate = b.dateBorn ? new Date(b.dateBorn).getTime() : 0
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

  const openEditModal = async (person: Person) => {
    setEditModal(person)
    setEditData({
      firstName: person.firstName,
      middleName: person.middleName || "",
      lastName: person.lastName,
      gender: person.gender as "male" | "female",
      dateBorn: person.dateBorn ? person.dateBorn.split("T")[0] : "",
      dateDied: person.dateDied ? person.dateDied.split("T")[0] : "",
      articleId: person.articleId || "",
    })
    setEditMessage(null)
    setLinkedImages([])
    setInspirations([])

    // Load available articles, linked images, and inspirations in parallel
    try {
      const [articlesRes, imagesRes, inspirationsRes] = await Promise.all([
        fetch("/api/entities/people/available-articles"),
        fetch(`/api/entities/people/${person.id}/images`),
        fetch(`/api/entities/people/${person.id}/inspirations`)
      ])

      const articlesData = await articlesRes.json()
      if (Array.isArray(articlesData)) {
        // Add current person's article if it exists
        if (person.article && !articlesData.find((a: Article) => a.id === person.articleId)) {
          articlesData.unshift(person.article)
        }
        setAvailableArticles(articlesData)
      }

      const imagesData = await imagesRes.json()
      if (Array.isArray(imagesData)) {
        setLinkedImages(imagesData)
      }

      const inspirationsData = await inspirationsRes.json()
      if (Array.isArray(inspirationsData)) {
        setInspirations(inspirationsData)
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
      const res = await fetch("/api/entities/people", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editModal.id,
          firstName: editData.firstName,
          middleName: editData.middleName || null,
          lastName: editData.lastName,
          gender: editData.gender,
          dateBorn: editData.dateBorn || null,
          dateDied: editData.dateDied || null,
          articleId: editData.articleId || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Update failed")
      }

      setEditMessage({ type: "success", text: "Saved successfully!" })
      await loadPeople()

      setTimeout(() => {
        closeEditModal()
      }, 1000)
    } catch (error) {
      setEditMessage({ type: "error", text: error instanceof Error ? error.message : "Update failed" })
    } finally {
      setSaving(false)
    }
  }

  const openDeleteModal = (person: Person) => {
    setDeleteModal(person)
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
      const res = await fetch(`/api/entities/people/${deleteModal.id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Delete failed")
      }

      setMessage({ type: "success", text: `"${deleteModal.firstName} ${deleteModal.lastName}" deleted successfully` })
      await loadPeople()
      closeDeleteModal()

      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Delete failed" })
    } finally {
      setDeleting(false)
    }
  }

  const formatName = (person: Person) => {
    const parts = [person.firstName, person.middleName, person.lastName].filter(Boolean)
    return parts.join(" ")
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/world-data/people" className="text-gray-500 hover:text-gray-700">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-purple-600">Manage People</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">People ({people.length})</h2>
            <div className="flex items-center gap-2">
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as "lastName" | "createdAt" | "dateBorn")}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="lastName">Last Name</option>
                <option value="createdAt">Created Date</option>
                <option value="dateBorn">Birth Date (k.y.)</option>
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
          ) : sortedPeople.length === 0 ? (
            <p className="text-gray-500 text-sm">No people found</p>
          ) : (
            <div className="space-y-2">
              {sortedPeople.map((person) => (
                <div
                  key={person.id}
                  className="flex items-center justify-between p-3 bg-purple-50 rounded border border-purple-200"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{formatName(person)}</p>
                    <p className="text-xs text-gray-500">
                      {person.gender === "male" ? "♂" : "♀"} {person.gender}
                      {person.dateBorn && ` · Born: ${new Date(person.dateBorn).toLocaleDateString()}`}
                      {person.dateDied && ` · Died: ${new Date(person.dateDied).toLocaleDateString()}`}
                    </p>
                    {person.article && (
                      <a
                        href={`/kemponet/kempopedia/wiki/${person.article.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-purple-600 hover:text-purple-800 hover:underline"
                      >
                        📄 {person.article.title}
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <button
                      onClick={() => openEditModal(person)}
                      className="text-purple-600 hover:text-purple-800 text-sm"
                    >
                      View/Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(person)}
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
            <h3 className="text-lg font-bold mb-4">View/Edit Person</h3>

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
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={editData.firstName}
                    onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                  <input
                    type="text"
                    value={editData.middleName}
                    onChange={(e) => setEditData({ ...editData, middleName: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={editData.lastName}
                    onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  value={editData.gender}
                  onChange={(e) => setEditData({ ...editData, gender: e.target.value as "male" | "female" })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Born (k.y.)</label>
                  <input
                    type="date"
                    value={editData.dateBorn}
                    onChange={(e) => setEditData({ ...editData, dateBorn: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Died (k.y.)</label>
                  <input
                    type="date"
                    value={editData.dateDied}
                    onChange={(e) => setEditData({ ...editData, dateDied: e.target.value })}
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
                        className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200"
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
                        className="h-16 w-16 object-cover rounded border border-purple-300 hover:border-purple-500"
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
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
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
              Are you sure you want to delete <strong>&quot;{formatName(deleteModal)}&quot;</strong>?
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
