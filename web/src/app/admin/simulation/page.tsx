"use client"

import { useSession, signOut } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"

const TIME_PERIODS = [
  {
    slug: "pre-1946",
    title: "Pre-1946",
    subtitle: "Foundation Era",
    description: "World Wars, Great Depression, and the foundations of the modern world",
    years: "Before 1946",
    color: "slate",
    status: "Coming Soon",
  },
  {
    slug: "1946-1950",
    title: "1946-1950",
    subtitle: "Post-War America",
    description: "Cold War begins, Hollyvale golden age, organized crime networks, early television",
    years: "1946 - 1950",
    color: "blue",
    status: "Active",
  },
  {
    slug: "post-1950",
    title: "After 1950",
    subtitle: "The Fifties",
    description: "Korean War, McCarthyism, rock and roll, suburban expansion",
    years: "1951 onwards",
    color: "slate",
    status: "Coming Soon",
  },
]

const colorClasses: Record<string, { bg: string; border: string; text: string; badge: string; icon: string }> = {
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    badge: "bg-blue-100 text-blue-800",
    icon: "bg-blue-100"
  },
  slate: {
    bg: "bg-slate-50",
    border: "border-slate-200",
    text: "text-slate-500",
    badge: "bg-slate-100 text-slate-600",
    icon: "bg-slate-100"
  },
}

export default function SimulationManagementPage() {
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
            <Link href="/admin/project" className="text-gray-500 hover:text-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold">Simulation Management</h1>
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
          <h2 className="text-lg font-semibold mb-2">Time Periods</h2>
          <p className="text-sm text-gray-600 mb-6">
            Select a time period to view and manage its simulation planning documents.
            Each period has its own set of character plans, event research, and storyline development.
          </p>

          <div className="space-y-4">
            {TIME_PERIODS.map((period) => {
              const colors = colorClasses[period.color]
              const isActive = period.status === "Active"

              const content = (
                <div className={`block p-6 rounded-lg border ${colors.bg} ${colors.border} ${isActive ? 'hover:shadow-md cursor-pointer' : 'opacity-75'} transition-shadow`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 ${colors.icon} rounded-lg flex items-center justify-center`}>
                          <svg className={`w-5 h-5 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className={`text-lg font-semibold ${colors.text}`}>{period.title}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${colors.badge}`}>
                              {period.status}
                            </span>
                          </div>
                          <p className={`text-sm ${colors.text}`}>{period.subtitle}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{period.description}</p>
                    </div>
                    {isActive && (
                      <svg className={`w-5 h-5 ${colors.text} flex-shrink-0 ml-4`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                </div>
              )

              if (isActive) {
                return (
                  <Link key={period.slug} href={`/admin/simulation/${period.slug}`}>
                    {content}
                  </Link>
                )
              }

              return <div key={period.slug}>{content}</div>
            })}
          </div>
        </div>

        {/* Overview */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">About Time Periods</h2>
          <p className="text-sm text-gray-600 mb-4">
            The Kempo simulation is organized into time periods, each with its own planning documents
            and storylines. This allows for focused worldbuilding while maintaining historical continuity.
          </p>
          <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
            <li><strong>Pre-1946</strong> — Background history, character origins, foundational events</li>
            <li><strong>1946-1950</strong> — Current active simulation period (post-war starting point)</li>
            <li><strong>After 1950</strong> — Future periods to be developed as simulation advances</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
