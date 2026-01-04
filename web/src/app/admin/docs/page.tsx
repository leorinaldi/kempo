"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { useState, useEffect } from "react"

interface DocItem {
  name: string
  path: string
  type: "file" | "folder"
  children?: DocItem[]
}

function FileIcon() {
  return (
    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function FolderIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
      </svg>
    )
  }
  return (
    <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  )
}

function FolderTree({ items, level = 0 }: { items: DocItem[], level?: number }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    "docs": true,
    "docs/Skills": true,
    "docs/Skills/Kempopedia": true,
  })

  const toggle = (path: string) => {
    setExpanded(prev => ({ ...prev, [path]: !prev[path] }))
  }

  return (
    <ul className={level === 0 ? "" : "ml-4"}>
      {items.map(item => (
        <li key={item.path} className="my-1">
          {item.type === "folder" ? (
            <div>
              <button
                onClick={() => toggle(item.path)}
                className="flex items-center gap-2 hover:bg-gray-100 px-2 py-1 rounded w-full text-left"
              >
                <span className="text-gray-400 w-4 text-center">
                  {expanded[item.path] ? "▼" : "▶"}
                </span>
                <FolderIcon open={expanded[item.path]} />
                <span className="text-gray-700 font-medium">{item.name}</span>
              </button>
              {expanded[item.path] && item.children && (
                <FolderTree items={item.children} level={level + 1} />
              )}
            </div>
          ) : (
            <Link
              href={`/admin/docs/view?path=${encodeURIComponent(item.path)}`}
              className="flex items-center gap-2 hover:bg-cyan-50 px-2 py-1 rounded ml-6"
            >
              <FileIcon />
              <span className="text-cyan-700 hover:text-cyan-900">{item.name}</span>
            </Link>
          )}
        </li>
      ))}
    </ul>
  )
}

export default function DocsPage() {
  const { data: session, status } = useSession()
  const [structure, setStructure] = useState<DocItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStructure() {
      try {
        const res = await fetch("/api/admin/docs")
        if (!res.ok) throw new Error("Failed to fetch docs structure")
        const data = await res.json()
        setStructure(data.structure)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }
    fetchStructure()
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-500 hover:text-gray-700">
              ← Back
            </Link>
            <h1 className="text-xl font-bold">Documentation</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500 mb-6">
              Browse project documentation. Click a file to view its contents.
            </p>
            <FolderTree items={structure} />
          </div>
        )}
      </main>
    </div>
  )
}
