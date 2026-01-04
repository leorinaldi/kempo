"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"

interface Event {
  id: string
  title: string
  description: string | null
  kyDateBegin: string
  kyDateEnd: string | null
  eventType: string
  significance: number
  parentId: string | null
  parent: { id: string; title: string } | null
  createdAt: string
  _count: {
    children: number
    people: number
    locations: number
    relationsFrom: number
    relationsTo: number
  }
}

interface Person {
  id: string
  firstName: string
  middleName: string | null
  lastName: string
  article: { id: string } | null
}

interface EventPerson {
  id: string
  personId: string
  role: string | null
  person: Person
}

interface EventLocation {
  id: string
  locationType: string
  locationId: string
  role: string | null
  locationName: string
  articleId: string | null
}

interface EventRelation {
  id: string
  relatedEventId: string
  relatedEvent: { id: string; title: string; eventType: string; kyDateBegin: string }
  relationType: string
  direction: "from" | "to"
}

interface LocationOption {
  id: string
  name: string
}

const EVENT_TYPES = [
  { group: "Life", types: ["birth", "death", "marriage", "divorce"] },
  { group: "Career", types: ["debut", "retirement", "appointment", "resignation"] },
  { group: "Creative", types: ["release", "premiere", "recording", "publication"] },
  { group: "Political", types: ["election", "inauguration", "legislation", "treaty"] },
  { group: "Military", types: ["war", "campaign", "battle", "armistice"] },
  { group: "Business", types: ["founding", "merger", "bankruptcy", "dissolution"] },
  { group: "Other", types: ["incident", "discovery", "milestone", "era"] },
]

const PERSON_ROLES = ["subject", "participant", "witness", "performer", "victim", "perpetrator"]
const LOCATION_ROLES = ["occurred_at", "originated_from", "spread_to", "destination"]
const RELATION_TYPES = ["part_of", "caused_by", "led_to", "concurrent_with", "related_to"]

export default function ManageEventsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Sorting and filtering
  const [sortField, setSortField] = useState<"kyDateBegin" | "title" | "eventType">("kyDateBegin")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [filterType, setFilterType] = useState("")

  // Edit modal state
  const [editModal, setEditModal] = useState<Event | null>(null)
  const [editData, setEditData] = useState({
    title: "",
    description: "",
    kyDateBegin: "",
    kyDateEnd: "",
    eventType: "",
    significance: 5,
    parentId: "",
  })
  const [parentEvents, setParentEvents] = useState<Event[]>([])
  const [editSaving, setEditSaving] = useState(false)
  const [editMessage, setEditMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Linked data
  const [linkedPeople, setLinkedPeople] = useState<EventPerson[]>([])
  const [linkedLocations, setLinkedLocations] = useState<EventLocation[]>([])
  const [linkedRelations, setLinkedRelations] = useState<{ from: EventRelation[]; to: EventRelation[] }>({ from: [], to: [] })

  // People picker
  const [allPeople, setAllPeople] = useState<Person[]>([])
  const [showPersonPicker, setShowPersonPicker] = useState(false)
  const [newPersonId, setNewPersonId] = useState("")
  const [newPersonRole, setNewPersonRole] = useState("")

  // Location picker
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const [newLocationType, setNewLocationType] = useState("")
  const [newLocationId, setNewLocationId] = useState("")
  const [newLocationRole, setNewLocationRole] = useState("")
  const [locationOptions, setLocationOptions] = useState<LocationOption[]>([])

  // Relation picker
  const [showRelationPicker, setShowRelationPicker] = useState(false)
  const [newRelatedEventId, setNewRelatedEventId] = useState("")
  const [newRelationType, setNewRelationType] = useState("")

  // Delete modal
  const [deleteModal, setDeleteModal] = useState<Event | null>(null)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  const loadEvents = async () => {
    try {
      const url = filterType ? `/api/events/list?eventType=${filterType}` : "/api/events/list"
      const res = await fetch(url)
      const data = await res.json()
      if (Array.isArray(data)) {
        setEvents(data)
      }
    } catch (error) {
      console.error("Failed to load events:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user?.isAdmin) {
      loadEvents()
    }
  }, [session, filterType])

  const sortedEvents = [...events].sort((a, b) => {
    let comparison = 0
    if (sortField === "kyDateBegin") {
      comparison = new Date(a.kyDateBegin).getTime() - new Date(b.kyDateBegin).getTime()
    } else if (sortField === "title") {
      comparison = a.title.localeCompare(b.title)
    } else if (sortField === "eventType") {
      comparison = a.eventType.localeCompare(b.eventType)
    }
    return sortDirection === "asc" ? comparison : -comparison
  })

  const openEditModal = async (event: Event) => {
    setEditModal(event)
    setEditData({
      title: event.title,
      description: event.description || "",
      kyDateBegin: event.kyDateBegin.split("T")[0],
      kyDateEnd: event.kyDateEnd ? event.kyDateEnd.split("T")[0] : "",
      eventType: event.eventType,
      significance: event.significance,
      parentId: event.parentId || "",
    })
    setEditMessage(null)

    // Load related data in parallel
    const [hierarchyRes, peopleRes, locationsRes, relationsRes, allPeopleRes] = await Promise.all([
      fetch(`/api/events/hierarchy?excludeId=${event.id}`),
      fetch(`/api/events/${event.id}/people`),
      fetch(`/api/events/${event.id}/locations`),
      fetch(`/api/events/${event.id}/relations`),
      fetch("/api/people/list"),
    ])

    const [hierarchy, people, locations, relations, allPeopleData] = await Promise.all([
      hierarchyRes.json(),
      peopleRes.json(),
      locationsRes.json(),
      relationsRes.json(),
      allPeopleRes.json(),
    ])

    setParentEvents(Array.isArray(hierarchy) ? hierarchy : [])
    setLinkedPeople(Array.isArray(people) ? people : [])
    setLinkedLocations(Array.isArray(locations) ? locations : [])
    setLinkedRelations({
      from: relations.relationsFrom || [],
      to: relations.relationsTo || [],
    })
    setAllPeople(Array.isArray(allPeopleData) ? allPeopleData : [])
  }

  const closeEditModal = () => {
    setEditModal(null)
    setShowPersonPicker(false)
    setShowLocationPicker(false)
    setShowRelationPicker(false)
  }

  const saveEdit = async () => {
    if (!editModal) return
    setEditSaving(true)
    setEditMessage(null)

    try {
      const res = await fetch("/api/events/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editModal.id,
          title: editData.title,
          description: editData.description || null,
          kyDateBegin: editData.kyDateBegin,
          kyDateEnd: editData.kyDateEnd || null,
          eventType: editData.eventType,
          significance: editData.significance,
          parentId: editData.parentId || null,
        }),
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error)

      setEditMessage({ type: "success", text: "Event updated successfully!" })
      await loadEvents()
      setTimeout(() => closeEditModal(), 1000)
    } catch (error) {
      setEditMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to update event",
      })
    } finally {
      setEditSaving(false)
    }
  }

  // Person linking
  const addPerson = async () => {
    if (!editModal || !newPersonId) return
    try {
      const res = await fetch(`/api/events/${editModal.id}/people`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personId: newPersonId, role: newPersonRole || null }),
      })
      if (!res.ok) {
        const result = await res.json()
        throw new Error(result.error)
      }
      const peopleRes = await fetch(`/api/events/${editModal.id}/people`)
      setLinkedPeople(await peopleRes.json())
      setShowPersonPicker(false)
      setNewPersonId("")
      setNewPersonRole("")
    } catch (error) {
      setEditMessage({ type: "error", text: error instanceof Error ? error.message : "Failed to add person" })
    }
  }

  const removePerson = async (personId: string) => {
    if (!editModal) return
    try {
      await fetch(`/api/events/${editModal.id}/people`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personId }),
      })
      setLinkedPeople(linkedPeople.filter((p) => p.personId !== personId))
    } catch (error) {
      console.error("Failed to remove person:", error)
    }
  }

  // Location linking
  const loadLocationOptions = async (type: string) => {
    setNewLocationType(type)
    setNewLocationId("")
    try {
      let res
      switch (type) {
        case "nation":
          res = await fetch("/api/nations/list")
          break
        case "state":
          res = await fetch("/api/states/list")
          break
        case "city":
          res = await fetch("/api/cities/list")
          break
        case "place":
          res = await fetch("/api/places/list")
          break
        default:
          return
      }
      const data = await res.json()
      setLocationOptions(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Failed to load locations:", error)
    }
  }

  const addLocation = async () => {
    if (!editModal || !newLocationType || !newLocationId) return
    try {
      const res = await fetch(`/api/events/${editModal.id}/locations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationType: newLocationType,
          locationId: newLocationId,
          role: newLocationRole || null,
        }),
      })
      if (!res.ok) {
        const result = await res.json()
        throw new Error(result.error)
      }
      const locationsRes = await fetch(`/api/events/${editModal.id}/locations`)
      setLinkedLocations(await locationsRes.json())
      setShowLocationPicker(false)
      setNewLocationType("")
      setNewLocationId("")
      setNewLocationRole("")
    } catch (error) {
      setEditMessage({ type: "error", text: error instanceof Error ? error.message : "Failed to add location" })
    }
  }

  const removeLocation = async (locationType: string, locationId: string) => {
    if (!editModal) return
    try {
      await fetch(`/api/events/${editModal.id}/locations`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locationType, locationId }),
      })
      setLinkedLocations(linkedLocations.filter((l) => !(l.locationType === locationType && l.locationId === locationId)))
    } catch (error) {
      console.error("Failed to remove location:", error)
    }
  }

  // Relation linking
  const addRelation = async () => {
    if (!editModal || !newRelatedEventId || !newRelationType) return
    try {
      const res = await fetch(`/api/events/${editModal.id}/relations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ relatedEventId: newRelatedEventId, relationType: newRelationType }),
      })
      if (!res.ok) {
        const result = await res.json()
        throw new Error(result.error)
      }
      const relationsRes = await fetch(`/api/events/${editModal.id}/relations`)
      const relations = await relationsRes.json()
      setLinkedRelations({ from: relations.relationsFrom || [], to: relations.relationsTo || [] })
      setShowRelationPicker(false)
      setNewRelatedEventId("")
      setNewRelationType("")
    } catch (error) {
      setEditMessage({ type: "error", text: error instanceof Error ? error.message : "Failed to add relation" })
    }
  }

  const removeRelation = async (relationId: string) => {
    if (!editModal) return
    try {
      await fetch(`/api/events/${editModal.id}/relations`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ relationId }),
      })
      setLinkedRelations({
        from: linkedRelations.from.filter((r) => r.id !== relationId),
        to: linkedRelations.to.filter((r) => r.id !== relationId),
      })
    } catch (error) {
      console.error("Failed to remove relation:", error)
    }
  }

  // Delete
  const openDeleteModal = (event: Event) => {
    setDeleteModal(event)
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
      const res = await fetch("/api/events/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteModal.id }),
      })
      if (!res.ok) throw new Error("Failed to delete")

      setMessage({ type: "success", text: `"${deleteModal.title}" deleted successfully` })
      await loadEvents()
      closeDeleteModal()
    } catch (error) {
      setMessage({ type: "error", text: "Failed to delete event" })
    } finally {
      setDeleting(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!session?.user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Access denied</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/events" className="text-gray-500 hover:text-gray-700">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-indigo-600">Manage Events</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{session.user.email}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <div
            className={`mb-4 p-3 rounded ${
              message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Controls */}
        <div className="mb-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Sort by:</label>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as typeof sortField)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="kyDateBegin">Date</option>
              <option value="title">Title</option>
              <option value="eventType">Type</option>
            </select>
            <button
              onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
              className="p-1 border border-gray-300 rounded hover:bg-gray-100"
            >
              {sortDirection === "asc" ? "↑" : "↓"}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Filter:</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="">All types</option>
              {EVENT_TYPES.flatMap((g) => g.types).map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <span className="text-sm text-gray-500">{sortedEvents.length} events</span>
        </div>

        {/* Events List */}
        <div className="space-y-3">
          {sortedEvents.map((event) => (
            <div
              key={event.id}
              className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900 truncate">{event.title}</span>
                  <span className="text-xs bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded">
                    {event.eventType}
                  </span>
                  <span className="text-xs text-gray-500">
                    sig: {event.significance}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {formatDate(event.kyDateBegin)}
                  {event.kyDateEnd && ` — ${formatDate(event.kyDateEnd)}`}
                  {event.parent && (
                    <span className="ml-2 text-indigo-600">
                      ↳ {event.parent.title}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {event._count.children > 0 && `${event._count.children} children · `}
                  {event._count.people > 0 && `${event._count.people} people · `}
                  {event._count.locations > 0 && `${event._count.locations} locations · `}
                  {(event._count.relationsFrom + event._count.relationsTo) > 0 &&
                    `${event._count.relationsFrom + event._count.relationsTo} relations`}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => openEditModal(event)}
                  className="text-sm bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
                >
                  View/Edit
                </button>
                <button
                  onClick={() => openDeleteModal(event)}
                  className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {sortedEvents.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No events found.{" "}
            <Link href="/admin/events/create" className="text-indigo-600 hover:underline">
              Create one
            </Link>
          </div>
        )}
      </main>

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-indigo-600 mb-4">Edit Event</h2>

            {editMessage && (
              <div
                className={`mb-4 p-3 rounded ${
                  editMessage.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
              >
                {editMessage.text}
              </div>
            )}

            {/* Basic Info */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={editData.kyDateBegin}
                    onChange={(e) => setEditData({ ...editData, kyDateBegin: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={editData.kyDateEnd}
                    onChange={(e) => setEditData({ ...editData, kyDateEnd: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                  <select
                    value={editData.eventType}
                    onChange={(e) => setEditData({ ...editData, eventType: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    {EVENT_TYPES.map((group) => (
                      <optgroup key={group.group} label={group.group}>
                        {group.types.map((type) => (
                          <option key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Significance: {editData.significance}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={editData.significance}
                    onChange={(e) => setEditData({ ...editData, significance: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Event</label>
                <select
                  value={editData.parentId}
                  onChange={(e) => setEditData({ ...editData, parentId: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">No parent</option>
                  {parentEvents.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title} ({e.eventType})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Linked People */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-800">Linked People</h3>
                <button
                  onClick={() => setShowPersonPicker(true)}
                  className="text-sm text-indigo-600 hover:underline"
                >
                  + Add Person
                </button>
              </div>
              {showPersonPicker && (
                <div className="bg-gray-50 p-3 rounded mb-2 space-y-2">
                  <select
                    value={newPersonId}
                    onChange={(e) => setNewPersonId(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    <option value="">Select person...</option>
                    {allPeople
                      .filter((p) => !linkedPeople.find((lp) => lp.personId === p.id))
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.firstName} {p.lastName}
                        </option>
                      ))}
                  </select>
                  <select
                    value={newPersonRole}
                    onChange={(e) => setNewPersonRole(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    <option value="">Role (optional)</option>
                    {PERSON_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={addPerson}
                      disabled={!newPersonId}
                      className="text-sm bg-indigo-600 text-white px-3 py-1 rounded disabled:opacity-50"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setShowPersonPicker(false)}
                      className="text-sm text-gray-600 hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              {linkedPeople.length > 0 ? (
                <div className="space-y-1">
                  {linkedPeople.map((lp) => (
                    <div key={lp.personId} className="flex items-center justify-between bg-purple-50 px-3 py-2 rounded">
                      <span className="text-sm">
                        {lp.person.firstName} {lp.person.lastName}
                        {lp.role && <span className="text-purple-600 ml-2">({lp.role})</span>}
                      </span>
                      <button
                        onClick={() => removePerson(lp.personId)}
                        className="text-red-600 text-sm hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No people linked</p>
              )}
            </div>

            {/* Linked Locations */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-800">Linked Locations</h3>
                <button
                  onClick={() => setShowLocationPicker(true)}
                  className="text-sm text-indigo-600 hover:underline"
                >
                  + Add Location
                </button>
              </div>
              {showLocationPicker && (
                <div className="bg-gray-50 p-3 rounded mb-2 space-y-2">
                  <select
                    value={newLocationType}
                    onChange={(e) => loadLocationOptions(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    <option value="">Select location type...</option>
                    <option value="nation">Nation</option>
                    <option value="state">State</option>
                    <option value="city">City</option>
                    <option value="place">Place</option>
                  </select>
                  {newLocationType && (
                    <select
                      value={newLocationId}
                      onChange={(e) => setNewLocationId(e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                      <option value="">Select {newLocationType}...</option>
                      {locationOptions.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name}
                        </option>
                      ))}
                    </select>
                  )}
                  <select
                    value={newLocationRole}
                    onChange={(e) => setNewLocationRole(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    <option value="">Role (optional)</option>
                    {LOCATION_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={addLocation}
                      disabled={!newLocationType || !newLocationId}
                      className="text-sm bg-indigo-600 text-white px-3 py-1 rounded disabled:opacity-50"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setShowLocationPicker(false)
                        setNewLocationType("")
                        setNewLocationId("")
                      }}
                      className="text-sm text-gray-600 hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              {linkedLocations.length > 0 ? (
                <div className="space-y-1">
                  {linkedLocations.map((ll) => (
                    <div
                      key={`${ll.locationType}-${ll.locationId}`}
                      className="flex items-center justify-between bg-emerald-50 px-3 py-2 rounded"
                    >
                      <span className="text-sm">
                        <span className="text-emerald-600 text-xs uppercase mr-2">{ll.locationType}</span>
                        {ll.locationName}
                        {ll.role && <span className="text-emerald-600 ml-2">({ll.role.replace("_", " ")})</span>}
                      </span>
                      <button
                        onClick={() => removeLocation(ll.locationType, ll.locationId)}
                        className="text-red-600 text-sm hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No locations linked</p>
              )}
            </div>

            {/* Related Events */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-800">Related Events</h3>
                <button
                  onClick={() => setShowRelationPicker(true)}
                  className="text-sm text-indigo-600 hover:underline"
                >
                  + Add Relation
                </button>
              </div>
              {showRelationPicker && (
                <div className="bg-gray-50 p-3 rounded mb-2 space-y-2">
                  <select
                    value={newRelatedEventId}
                    onChange={(e) => setNewRelatedEventId(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    <option value="">Select event...</option>
                    {events
                      .filter((e) => e.id !== editModal.id)
                      .map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.title} ({e.eventType})
                        </option>
                      ))}
                  </select>
                  <select
                    value={newRelationType}
                    onChange={(e) => setNewRelationType(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    <option value="">Relation type...</option>
                    {RELATION_TYPES.map((r) => (
                      <option key={r} value={r}>
                        {r.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={addRelation}
                      disabled={!newRelatedEventId || !newRelationType}
                      className="text-sm bg-indigo-600 text-white px-3 py-1 rounded disabled:opacity-50"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setShowRelationPicker(false)}
                      className="text-sm text-gray-600 hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              {linkedRelations.from.length > 0 || linkedRelations.to.length > 0 ? (
                <div className="space-y-1">
                  {linkedRelations.from.map((r) => (
                    <div key={r.id} className="flex items-center justify-between bg-indigo-50 px-3 py-2 rounded">
                      <span className="text-sm">
                        <span className="text-indigo-600">→</span> {r.relatedEvent.title}
                        <span className="text-indigo-600 ml-2">({r.relationType.replace("_", " ")})</span>
                      </span>
                      <button
                        onClick={() => removeRelation(r.id)}
                        className="text-red-600 text-sm hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {linkedRelations.to.map((r) => (
                    <div key={r.id} className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded">
                      <span className="text-sm">
                        <span className="text-gray-500">←</span> {r.relatedEvent.title}
                        <span className="text-gray-600 ml-2">({r.relationType.replace("_", " ")})</span>
                      </span>
                      <button
                        onClick={() => removeRelation(r.id)}
                        className="text-red-600 text-sm hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No related events</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button onClick={closeEditModal} className="px-4 py-2 text-gray-600 hover:text-gray-800">
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={editSaving}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
              >
                {editSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-red-600 mb-4">Delete Event</h2>
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete <strong>&quot;{deleteModal.title}&quot;</strong>?
              This will also remove all linked people, locations, and relations.
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Type <strong>DELETE</strong> to confirm:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
              placeholder="Type DELETE"
            />
            <div className="flex justify-end gap-3">
              <button onClick={closeDeleteModal} className="px-4 py-2 text-gray-600 hover:text-gray-800">
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteConfirmText !== "DELETE" || deleting}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
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
