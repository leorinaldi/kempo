"use client"

import { useSession, signOut } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"

const PROJECT_HISTORY_DOCUMENTS = [
  {
    slug: "project-history",
    title: "Project History",
    description: "Real-world milestones and development history of the Kempo Project",
    category: "Main",
    color: "indigo",
  },
]

const colorClasses: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  indigo: { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700", badge: "bg-indigo-100 text-indigo-800" },
  teal: { bg: "bg-teal-50", border: "border-teal-200", text: "text-teal-700", badge: "bg-teal-100 text-teal-800" },
  gray: { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-700", badge: "bg-gray-100 text-gray-800" },
}

export default function ProjectHistoryPage() {
  const { data: session, status } = useSession()

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
            You do not have admin privileges. Contact the site administrator if you believe this is an error.
          </p>
          <p className="text-sm text-gray-500 mb-4">Logged in as: {session.user.email}</p>
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
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-500 hover:text-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold">Project History</h1>
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

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-2">Project Documents</h2>
          <p className="text-sm text-gray-600 mb-6">
            Track real-world milestones, achievements, and development history of the Kempo Project.
          </p>

          <div className="space-y-4">
            {PROJECT_HISTORY_DOCUMENTS.map((doc) => {
              const colors = colorClasses[doc.color]
              return (
                <Link
                  key={doc.slug}
                  href={`/admin/project-history/${doc.slug}`}
                  className={`block p-4 rounded-lg border ${colors.bg} ${colors.border} hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-semibold ${colors.text}`}>{doc.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${colors.badge}`}>
                          {doc.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{doc.description}</p>
                    </div>
                    <svg className={`w-5 h-5 ${colors.text} flex-shrink-0 ml-4`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">About Project History</h2>
          <p className="text-sm text-gray-600 mb-4">
            This section tracks the real-world development of the Kempo Project. Unlike the simulation documents
            which track the fictional world, these documents record:
          </p>
          <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
            <li><strong>Content milestones</strong> — Number of articles, characters created, timelines completed</li>
            <li><strong>Feature additions</strong> — New sections, tools, or functionality</li>
            <li><strong>Technical changes</strong> — Architecture decisions, migrations, integrations</li>
            <li><strong>Process improvements</strong> — Methodology updates, workflow changes</li>
            <li><strong>Major decisions</strong> — Significant choices that shaped the project direction</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
