"use client"

import { useSession, signOut } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

interface ArticleData {
  frontmatter: {
    title: string
  }
  htmlContent: string
  infobox?: {
    type: string
    fields: Record<string, unknown>
  }
}

export default function ProjectHistoryArticlePage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: session, status } = useSession()
  const [article, setArticle] = useState<ArticleData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "authenticated" && session?.user?.isAdmin) {
      fetch(`/api/admin/article/${slug}`)
        .then((res) => {
          if (!res.ok) throw new Error("Article not found")
          return res.json()
        })
        .then((data) => {
          setArticle(data)
          setLoading(false)
        })
        .catch((err) => {
          setError(err.message)
          setLoading(false)
        })
    }
  }, [slug, status, session])

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You do not have admin privileges.
          </p>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
          >
            Sign Out
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin/project-history" className="text-gray-500 hover:text-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div>
              <span className="text-2xl font-serif text-gray-900">Project History</span>
              <p className="text-sm text-gray-600">Real-world project milestones</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{session.user.email}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading document...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
            <Link href="/admin/project-history" className="text-blue-600 hover:underline mt-4 block">
              Back to Project History
            </Link>
          </div>
        ) : article ? (
          <article className="wiki-content">
            {/* Infobox */}
            {article.infobox && (
              <div className="float-right ml-6 mb-4 w-72 border border-gray-300 bg-gray-50 text-sm">
                <div className="bg-gray-200 px-3 py-2 font-semibold text-center border-b border-gray-300">
                  {article.frontmatter.title}
                </div>
                <div className="p-3">
                  {Object.entries(article.infobox.fields).map(([key, value]) => (
                    <div key={key} className="flex border-b border-gray-200 py-1 last:border-0">
                      <span className="font-medium text-gray-700 w-24 flex-shrink-0">{key}</span>
                      <span className="text-gray-900">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl font-serif border-b border-gray-300 pb-2 mb-4">
              {article.frontmatter.title}
            </h1>

            {/* Article content */}
            <div
              className="wiki-article-content prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: article.htmlContent }}
            />
          </article>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-8 py-4 text-center text-sm text-gray-500">
        <p>Admin-only project history documents</p>
      </footer>
    </div>
  )
}
