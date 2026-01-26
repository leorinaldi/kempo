"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"

interface EventGroup {
  id: string
  title: string
  eventType: string
  kyDateBegin: string
  kyDateEnd: string | null
  subGroupCount: number
  totalEventCount: number
}

interface LeafEvent {
  id: string
  title: string
  eventType: string
  kyDateBegin: string
  significance: number
}

interface Breadcrumb {
  id: string
  title: string
}

interface BrowseData {
  parentId: string | null
  parentTitle: string | null
  breadcrumbs: Breadcrumb[]
  groups: EventGroup[]
  events: LeafEvent[]
  unclassifiedCount: number
}

export default function EventHierarchyPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<BrowseData | null>(null)
  const [currentParentId, setCurrentParentId] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const url = currentParentId
          ? `/api/events/browse?parentId=${currentParentId}`
          : "/api/events/browse"
        const res = await fetch(url)
        const json = await res.json()
        setData(json)
      } catch (error) {
        console.error("Failed to load hierarchy:", error)
      } finally {
        setLoading(false)
      }
    }
    if (session?.user?.isAdmin) {
      loadData()
    }
  }, [session, currentParentId])

  const navigateTo = (parentId: string | null) => {
    setCurrentParentId(parentId)
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
            <h1 className="text-2xl font-bold text-indigo-600">Event Hierarchy</h1>
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
        {/* Breadcrumbs */}
        <nav className="mb-6">
          <ol className="flex items-center gap-2 text-sm">
            <li>
              <button
                onClick={() => navigateTo(null)}
                className={`hover:text-indigo-600 ${
                  !currentParentId ? "text-indigo-600 font-semibold" : "text-gray-500"
                }`}
              >
                All Events
              </button>
            </li>
            {data?.breadcrumbs.map((crumb, index) => (
              <li key={crumb.id} className="flex items-center gap-2">
                <span className="text-gray-400">›</span>
                <button
                  onClick={() => navigateTo(crumb.id)}
                  className={`hover:text-indigo-600 ${
                    index === data.breadcrumbs.length - 1
                      ? "text-indigo-600 font-semibold"
                      : "text-gray-500"
                  }`}
                >
                  {crumb.title}
                </button>
              </li>
            ))}
          </ol>
        </nav>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : data ? (
          <>
            {/* Groups (clickable cards) */}
            {(data.groups.length > 0 || data.unclassifiedCount > 0) && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                  {currentParentId ? "Sub-Groups" : "Event Categories"}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.groups.map((group) => (
                    <button
                      key={group.id}
                      onClick={() => navigateTo(group.id)}
                      className="bg-white rounded-lg shadow p-5 text-left hover:shadow-lg hover:border-indigo-400 border-2 border-transparent transition-all"
                    >
                      <h3 className="font-semibold text-gray-900 mb-1">{group.title}</h3>
                      <p className="text-sm text-gray-500 capitalize mb-3">{group.eventType}</p>
                      <div className="flex items-center gap-4 text-sm">
                        {group.subGroupCount > 0 && (
                          <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                            {group.subGroupCount} sub-group{group.subGroupCount !== 1 ? "s" : ""}
                          </span>
                        )}
                        <span className="text-gray-600">
                          {group.totalEventCount} event{group.totalEventCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </button>
                  ))}

                  {/* Unclassified card (only at top level) */}
                  {!currentParentId && data.unclassifiedCount > 0 && (
                    <button
                      onClick={() => navigateTo("unclassified")}
                      className="bg-gray-100 rounded-lg shadow p-5 text-left hover:shadow-lg hover:border-gray-400 border-2 border-transparent transition-all"
                    >
                      <h3 className="font-semibold text-gray-700 mb-1">Unclassified</h3>
                      <p className="text-sm text-gray-500 mb-3">Events without a parent category</p>
                      <span className="text-gray-600 text-sm">
                        {data.unclassifiedCount} event{data.unclassifiedCount !== 1 ? "s" : ""}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Leaf events list */}
            {data.events.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                  Events {data.groups.length > 0 && "(Direct)"}
                </h2>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Event
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Significance
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {data.events.map((event) => (
                        <tr key={event.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{event.title}</td>
                          <td className="px-4 py-3 text-sm text-gray-500 capitalize">
                            {event.eventType}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {new Date(event.kyDateBegin).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span
                              className={`inline-block w-6 h-6 rounded-full text-center text-xs font-medium leading-6 ${
                                event.significance >= 8
                                  ? "bg-red-100 text-red-700"
                                  : event.significance >= 5
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {event.significance}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Empty state */}
            {data.groups.length === 0 && data.events.length === 0 && data.unclassifiedCount === 0 && (
              <div className="text-center py-12 text-gray-500">
                No events found at this level.
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">Failed to load data.</div>
        )}
      </main>
    </div>
  )
}
