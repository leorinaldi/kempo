"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"

interface ParentEvent {
  id: string
  title: string
  eventType: string
  kyDateBegin: string
  parent: { id: string; title: string } | null
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

export default function CreateEventPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [parentEvents, setParentEvents] = useState<ParentEvent[]>([])
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    kyDateBegin: "",
    kyDateEnd: "",
    eventType: "",
    significance: 5,
    parentId: "",
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    async function loadParentEvents() {
      try {
        const res = await fetch("/api/events/hierarchy")
        const data = await res.json()
        if (Array.isArray(data)) {
          setParentEvents(data)
        }
      } catch (error) {
        console.error("Failed to load parent events:", error)
      }
    }
    if (session?.user?.isAdmin) {
      loadParentEvents()
    }
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch("/api/entities/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          kyDateBegin: formData.kyDateBegin,
          kyDateEnd: formData.kyDateEnd || null,
          eventType: formData.eventType,
          significance: formData.significance,
          parentId: formData.parentId || null,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to create event")
      }

      setMessage({ type: "success", text: `Event "${result.title}" created successfully!` })
      setTimeout(() => {
        router.push("/admin/events/manage")
      }, 1500)
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to create event",
      })
    } finally {
      setSaving(false)
    }
  }

  if (status === "loading") {
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
            <Link href="/admin/world-data/events" className="text-gray-500 hover:text-gray-700">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-indigo-600">Create Event</h1>
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

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          {message && (
            <div
              className={`mb-4 p-3 rounded ${
                message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="e.g., Birth of Frank Martino"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
                rows={3}
                placeholder="Detailed description of the event..."
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date (k.y.) <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.kyDateBegin}
                  onChange={(e) => setFormData({ ...formData, kyDateBegin: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date (k.y.)
                </label>
                <input
                  type="date"
                  value={formData.kyDateEnd}
                  onChange={(e) => setFormData({ ...formData, kyDateEnd: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty for point events</p>
              </div>
            </div>

            {/* Event Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              >
                <option value="">Select event type...</option>
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

            {/* Significance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Significance (1-10)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.significance}
                  onChange={(e) => setFormData({ ...formData, significance: parseInt(e.target.value) })}
                  className="flex-1"
                />
                <span className="w-8 text-center font-medium text-indigo-600">
                  {formData.significance}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                10 = Major world events, 5 = Standard events, 1 = Minor milestones
              </p>
            </div>

            {/* Parent Event */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parent Event
              </label>
              <select
                value={formData.parentId}
                onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">No parent (top-level event)</option>
                {parentEvents.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title} ({event.eventType})
                    {event.parent ? ` — under ${event.parent.title}` : ""}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Select a parent to place this event within a hierarchy
              </p>
            </div>

            {/* Submit */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Creating..." : "Create Event"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
