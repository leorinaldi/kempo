"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

function formatNumber(n: number): string {
  if (n >= 1_000_000) {
    return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M"
  }
  if (n >= 1_000) {
    return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "k"
  }
  return n.toLocaleString()
}

interface KyTimelinePoint {
  year: number
  articles: number
  media: number
}

interface RealTimelinePoint {
  day: string
  articles: number
  media: number
}

interface ContentStats {
  kyTimeline: KyTimelinePoint[]
  realTimeline: RealTimelinePoint[]
  articles: {
    total: number
    delta24h: number
    delta7d: number
    byType: Record<string, number>
  }
  words: {
    total: number
    delta24h: number
    delta7d: number
  }
  entities: {
    people: number
    people24h: number
    people7d: number
    organizations: number
    orgs24h: number
    orgs7d: number
    brands: number
    products: number
  }
  locations: {
    total: number
    delta24h: number
    delta7d: number
    nations: number
    states: number
    cities: number
    places: number
  }
  media: {
    total: number
    delta24h: number
    delta7d: number
    audio: {
      total: number
      byType: Record<string, number>
    }
    video: {
      total: number
      byType: Record<string, number>
    }
    images: {
      total: number
      byCategory: Record<string, number>
    }
  }
  publications: {
    total: number
    delta24h: number
    delta7d: number
    series: number
    issues: number
  }
  events: {
    total: number
    delta24h: number
    delta7d: number
  }
}

function StatCard({
  title,
  total,
  delta24h,
  delta7d,
  breakdown,
  color,
  expanded,
}: {
  title: string
  total: number
  delta24h?: number
  delta7d?: number
  breakdown?: Record<string, number>
  color: string
  expanded: boolean
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className={`text-lg font-semibold ${color} mb-2`}>{title}</h3>
      <p className="text-4xl font-bold text-gray-900">{formatNumber(total)}</p>
      {(delta24h !== undefined || delta7d !== undefined) && (
        <p className="text-xs mt-1">
          {delta7d !== undefined && delta7d > 0 && (
            <>
              <span className="text-sm text-green-600">+{formatNumber(delta7d)}</span>
              <span className="text-gray-400"> 7d</span>
            </>
          )}
          {delta7d !== undefined && delta7d > 0 && delta24h !== undefined && delta24h > 0 && (
            <span className="text-gray-300 mx-1">·</span>
          )}
          {delta24h !== undefined && delta24h > 0 && (
            <>
              <span className="text-sm text-green-600">+{formatNumber(delta24h)}</span>
              <span className="text-gray-400"> 24h</span>
            </>
          )}
        </p>
      )}
      {expanded && breakdown && Object.keys(breakdown).length > 0 && (
        <div className="border-t mt-4 pt-3 space-y-1">
          {Object.entries(breakdown)
            .sort(([, a], [, b]) => b - a)
            .map(([key, count]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-gray-600">{key}</span>
                <span className="text-gray-900 font-medium">{formatNumber(count)}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

export default function ContentStatsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<ContentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeMode, setTimeMode] = useState<"ky" | "real">("real")
  const [countMode, setCountMode] = useState<"incremental" | "cumulative">("cumulative")
  const [cardsExpanded, setCardsExpanded] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/admin/content-stats")
        if (!res.ok) throw new Error("Failed to fetch stats")
        const data = await res.json()
        setStats(data)
      } catch (err) {
        console.error("Failed to load stats:", err)
        setError("Failed to load content stats")
      } finally {
        setLoading(false)
      }
    }
    if (session?.user?.isAdmin) {
      loadStats()
    }
  }, [session])

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
            <Link href="/admin/project" className="text-gray-500 hover:text-gray-700">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-emerald-600">Content Stats</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{session.user.email}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading stats...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        ) : stats ? (
          <div className="space-y-8">
            {/* Timeline Chart */}
            {(stats.kyTimeline.length > 0 || stats.realTimeline.length > 0) && (() => {
              // Get base data based on time mode
              const baseData = timeMode === "ky" ? stats.kyTimeline : stats.realTimeline
              const xKey = timeMode === "ky" ? "year" : "day"

              // Compute cumulative if needed
              const chartData = countMode === "cumulative"
                ? (baseData as Array<{ articles: number; media: number; year?: number; day?: string }>).reduce((acc, point, i) => {
                    const prev = acc[i - 1] || { articles: 0, media: 0 }
                    acc.push({
                      ...point,
                      articles: prev.articles + point.articles,
                      media: prev.media + point.media,
                    })
                    return acc
                  }, [] as Array<{ articles: number; media: number; year?: number; day?: string }>)
                : baseData

              return (
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Content Over Time
                    </h2>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                        <button
                          onClick={() => setCountMode("incremental")}
                          className={`px-3 py-1 text-sm rounded-md transition-colors ${
                            countMode === "incremental"
                              ? "bg-white shadow text-gray-900"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          Per Period
                        </button>
                        <button
                          onClick={() => setCountMode("cumulative")}
                          className={`px-3 py-1 text-sm rounded-md transition-colors ${
                            countMode === "cumulative"
                              ? "bg-white shadow text-gray-900"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          Cumulative
                        </button>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                        <button
                          onClick={() => setTimeMode("ky")}
                          className={`px-3 py-1 text-sm rounded-md transition-colors ${
                            timeMode === "ky"
                              ? "bg-white shadow text-gray-900"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          K.Y.
                        </button>
                        <button
                          onClick={() => setTimeMode("real")}
                          className={`px-3 py-1 text-sm rounded-md transition-colors ${
                            timeMode === "real"
                              ? "bg-white shadow text-gray-900"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          Real Time
                        </button>
                      </div>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    {timeMode === "ky" ? (
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={xKey} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="articles" fill="#3b82f6" name="Articles" />
                        <Bar dataKey="media" fill="#f97316" name="Media" />
                      </BarChart>
                    ) : (
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={xKey} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="articles" stroke="#3b82f6" name="Articles" />
                        <Line type="monotone" dataKey="media" stroke="#f97316" name="Media" />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </div>
              )
            })()}

            {/* Stats Cards Toggle */}
            <div className="flex justify-end">
              <button
                onClick={() => setCardsExpanded(!cardsExpanded)}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                {cardsExpanded ? "Collapse details" : "Expand details"}
                <svg
                  className={`w-4 h-4 transition-transform ${cardsExpanded ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              title="Articles"
              total={stats.articles.total}
              delta24h={stats.articles.delta24h}
              delta7d={stats.articles.delta7d}
              breakdown={stats.articles.byType}
              color="text-blue-600"
              expanded={cardsExpanded}
            />
            <StatCard
              title="Article Words"
              total={stats.words.total}
              delta24h={stats.words.delta24h}
              delta7d={stats.words.delta7d}
              color="text-sky-600"
              expanded={cardsExpanded}
            />
            <StatCard
              title="People"
              total={stats.entities.people}
              delta24h={stats.entities.people24h}
              delta7d={stats.entities.people7d}
              color="text-purple-600"
              expanded={cardsExpanded}
            />
            <StatCard
              title="Locations"
              total={stats.locations.total}
              delta24h={stats.locations.delta24h}
              delta7d={stats.locations.delta7d}
              breakdown={{
                nations: stats.locations.nations,
                states: stats.locations.states,
                cities: stats.locations.cities,
                places: stats.locations.places,
              }}
              color="text-green-600"
              expanded={cardsExpanded}
            />
            <StatCard
              title="Organizations"
              total={stats.entities.organizations}
              delta24h={stats.entities.orgs24h}
              delta7d={stats.entities.orgs7d}
              breakdown={{
                brands: stats.entities.brands,
                products: stats.entities.products,
              }}
              color="text-teal-600"
              expanded={cardsExpanded}
            />
            <StatCard
              title="Media"
              total={stats.media.total}
              delta24h={stats.media.delta24h}
              delta7d={stats.media.delta7d}
              breakdown={{
                images: stats.media.images.total,
                audio: stats.media.audio.total,
                video: stats.media.video.total,
              }}
              color="text-orange-600"
              expanded={cardsExpanded}
            />
            <StatCard
              title="Publications"
              total={stats.publications.total}
              delta24h={stats.publications.delta24h}
              delta7d={stats.publications.delta7d}
              breakdown={{
                series: stats.publications.series,
                issues: stats.publications.issues,
              }}
              color="text-rose-600"
              expanded={cardsExpanded}
            />
            <StatCard
              title="Events"
              total={stats.events.total}
              delta24h={stats.events.delta24h}
              delta7d={stats.events.delta7d}
              color="text-indigo-600"
              expanded={cardsExpanded}
            />
            </div>
          </div>
        ) : null}
      </main>
    </div>
  )
}
