"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export default function SecurityPage() {
  const [authRequired, setAuthRequired] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        // Default to true if not set
        setAuthRequired(data.authRequired !== "false")
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to fetch settings:", err)
        setLoading(false)
      })
  }, [])

  const toggleAuth = async () => {
    setSaving(true)
    const newValue = !authRequired

    try {
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "authRequired",
          value: newValue ? "true" : "false",
        }),
      })
      setAuthRequired(newValue)
    } catch (err) {
      console.error("Failed to save setting:", err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/admin" className="text-blue-600 hover:underline">
            &larr; Back to Admin
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Security Settings</h1>

        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Upfront Admin Login Requirement
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  When enabled, users must log in with Google before accessing the site.
                  Disable for testing or development.
                </p>
              </div>

              <button
                onClick={toggleAuth}
                disabled={saving}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  authRequired ? "bg-blue-600" : "bg-gray-300"
                } ${saving ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    authRequired ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className={`mt-4 p-3 rounded text-sm ${authRequired ? "bg-green-50 text-green-800" : "bg-yellow-50 text-yellow-800"}`}>
              {authRequired ? (
                <>
                  <strong>Login Required:</strong> The site is protected. Users must authenticate to access any page.
                </>
              ) : (
                <>
                  <strong>Login Disabled:</strong> Anyone can access the site without logging in. Use for testing only.
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
