"use client"

import { useSession } from "next-auth/react"
import { redirect, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useState, useEffect, Suspense } from "react"

function DocViewer() {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const filePath = searchParams.get("path")

  const [content, setContent] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchContent() {
      if (!filePath) {
        setError("No file path specified")
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`/api/admin/docs?path=${encodeURIComponent(filePath)}`)
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || "Failed to fetch file")
        }
        const data = await res.json()
        setContent(data.content)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }
    fetchContent()
  }, [filePath])

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

  // Get display name from path
  const displayName = filePath?.split("/").pop() || "Document"

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin/docs" className="text-gray-500 hover:text-gray-700">
              ← Back to Docs
            </Link>
            <h1 className="text-xl font-bold">{displayName}</h1>
          </div>
          <span className="text-sm text-gray-500 font-mono">{filePath}</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <pre className="p-6 overflow-x-auto text-sm font-mono whitespace-pre-wrap text-gray-800 leading-relaxed">
              {content}
            </pre>
          </div>
        )}
      </main>
    </div>
  )
}

export default function DocsViewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>}>
      <DocViewer />
    </Suspense>
  )
}
