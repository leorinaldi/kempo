"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { useState, useEffect } from "react"

const months = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
]

// Generate years from 1900 to 2100
const years = Array.from({ length: 201 }, (_, i) => 1900 + i)

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Date range state
  const [earliestMonth, setEarliestMonth] = useState(1)
  const [earliestYear, setEarliestYear] = useState(1949)
  const [latestMonth, setLatestMonth] = useState(12)
  const [latestYear, setLatestYear] = useState(1950)

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/admin/settings")
        if (res.ok) {
          const settings = await res.json()
          if (settings.kyDateRangeEarliestMonth) {
            setEarliestMonth(parseInt(settings.kyDateRangeEarliestMonth, 10))
          }
          if (settings.kyDateRangeEarliestYear) {
            setEarliestYear(parseInt(settings.kyDateRangeEarliestYear, 10))
          }
          if (settings.kyDateRangeLatestMonth) {
            setLatestMonth(parseInt(settings.kyDateRangeLatestMonth, 10))
          }
          if (settings.kyDateRangeLatestYear) {
            setLatestYear(parseInt(settings.kyDateRangeLatestYear, 10))
          }
        }
      } catch (error) {
        console.error("Failed to load settings:", error)
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  if (status === "loading" || loading) {
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

  async function saveSetting(key: string, value: string) {
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    })
    if (!res.ok) {
      throw new Error(`Failed to save ${key}`)
    }
  }

  async function handleSave() {
    setSaving(true)
    setMessage(null)

    try {
      await Promise.all([
        saveSetting("kyDateRangeEarliestMonth", String(earliestMonth)),
        saveSetting("kyDateRangeEarliestYear", String(earliestYear)),
        saveSetting("kyDateRangeLatestMonth", String(latestMonth)),
        saveSetting("kyDateRangeLatestYear", String(latestYear)),
      ])
      setMessage({ type: "success", text: "Settings saved successfully!" })
    } catch (error) {
      console.error("Failed to save settings:", error)
      setMessage({ type: "error", text: "Failed to save settings. Please try again." })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-500 hover:text-gray-700">
              ← Back
            </Link>
            <h1 className="text-xl font-bold">Settings</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-red-100 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* K.Y. Date Range Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">K.Y. Date Range</h2>
          <p className="text-sm text-gray-600 mb-6">
            Configure the date range available on the home page slider. This controls what time periods
            users can explore in the Kempo universe.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Earliest Date */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Earliest Date</h3>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-1">Month</label>
                  <select
                    value={earliestMonth}
                    onChange={(e) => setEarliestMonth(parseInt(e.target.value, 10))}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  >
                    {months.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-1">Year</label>
                  <select
                    value={earliestYear}
                    onChange={(e) => setEarliestYear(parseInt(e.target.value, 10))}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  >
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Latest Date */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Latest Date</h3>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-1">Month</label>
                  <select
                    value={latestMonth}
                    onChange={(e) => setLatestMonth(parseInt(e.target.value, 10))}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  >
                    {months.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-1">Year</label>
                  <select
                    value={latestYear}
                    onChange={(e) => setLatestYear(parseInt(e.target.value, 10))}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  >
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            Current range: <strong>{months.find((m) => m.value === earliestMonth)?.label} {earliestYear}</strong> to{" "}
            <strong>{months.find((m) => m.value === latestMonth)?.label} {latestYear}</strong>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </main>
    </div>
  )
}
