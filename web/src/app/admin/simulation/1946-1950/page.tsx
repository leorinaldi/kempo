"use client"

import { useSession, signOut } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"

const SIMULATION_DOCUMENTS = [
  {
    slug: "simulation-advancement-approach",
    title: "Simulation Advancement Approach",
    description: "Overall methodology and step-by-step process for advancing the simulation",
    step: "Orchestration",
    color: "blue",
  },
  {
    slug: "spawn-registry",
    title: "Spawn Registry",
    description: "Completed parallel switchovers mapping real-world figures to Kempo equivalents",
    step: "Step 1 & 10",
    color: "green",
  },
  {
    slug: "possible-spawns",
    title: "Possible Spawns",
    description: "Characters and entities planned for future parallel switchovers",
    step: "Step 2 & 4",
    color: "amber",
  },
  {
    slug: "real-world-events",
    title: "Real World Events",
    description: "Historical events 1950-1955 for storyline inspiration and reference",
    step: "Step 3",
    color: "purple",
  },
  {
    slug: "places",
    title: "Places",
    description: "Geographic locations needed for storylines and character backgrounds",
    step: "Step 5",
    color: "teal",
  },
  {
    slug: "products-companies-culture",
    title: "Products, Companies & Culture",
    description: "Real-world brands, corporations, and cultural entities to create Kempo equivalents for",
    step: "Step 6",
    color: "cyan",
  },
  {
    slug: "human-drama-amplification",
    title: "Human Drama Amplification",
    description: "Romance, scandal, crime, and everyday life storylines beyond major historical events",
    step: "Step 7",
    color: "orange",
  },
  {
    slug: "character-development-plan",
    title: "Character Development Plan",
    description: "Proposed hybrid characters combining 2-3 real-world figures",
    step: "Step 8 & 9",
    color: "rose",
  },
  {
    slug: "additional-tasks",
    title: "Additional Tasks to Consider",
    description: "Running list of ideas and tasks for future sessions",
    step: "Notes",
    color: "gray",
  },
]

const colorClasses: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  blue: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", badge: "bg-blue-100 text-blue-800" },
  green: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", badge: "bg-green-100 text-green-800" },
  amber: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", badge: "bg-amber-100 text-amber-800" },
  purple: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", badge: "bg-purple-100 text-purple-800" },
  teal: { bg: "bg-teal-50", border: "border-teal-200", text: "text-teal-700", badge: "bg-teal-100 text-teal-800" },
  cyan: { bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-700", badge: "bg-cyan-100 text-cyan-800" },
  rose: { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700", badge: "bg-rose-100 text-rose-800" },
  orange: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", badge: "bg-orange-100 text-orange-800" },
  gray: { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-700", badge: "bg-gray-100 text-gray-800" },
}

export default function Simulation1946to1950Page() {
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
            <Link href="/admin/simulation" className="text-gray-500 hover:text-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div>
              <h1 className="text-xl font-bold">1946-1950</h1>
              <p className="text-sm text-gray-500">Post-War America</p>
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

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-2">Planning Documents</h2>
          <p className="text-sm text-gray-600 mb-6">
            These documents guide the advancement of the Kempo simulation for the 1946-1950 period.
            They are ordered by their role in the simulation advancement process.
          </p>

          <div className="space-y-4">
            {SIMULATION_DOCUMENTS.map((doc) => {
              const colors = colorClasses[doc.color]
              return (
                <Link
                  key={doc.slug}
                  href={`/admin/simulation/${doc.slug}`}
                  className={`block p-4 rounded-lg border ${colors.bg} ${colors.border} hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-semibold ${colors.text}`}>{doc.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${colors.badge}`}>
                          {doc.step}
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

        {/* Process Overview */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Simulation Advancement Process</h2>
          <ol className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">1</span>
              <span><strong>Review Current State</strong> — Gap analysis using Spawn Registry</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">2</span>
              <span><strong>Research Preceding Period</strong> — Update Possible Spawns and Products/Companies/Culture</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">3</span>
              <span><strong>Research Coming Period</strong> — Update Real World Events</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">4</span>
              <span><strong>Identify Fictional Amplifications</strong> — Add themes to Possible Spawns</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">5</span>
              <span><strong>Identify Places</strong> — Review Places gaps for storyline settings</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">6</span>
              <span><strong>Identify Product/Brand Needs</strong> — Review Products, Companies & Culture gaps</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">7</span>
              <span><strong>Human Drama Amplification</strong> — Develop Human Drama Amplification doc</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">8</span>
              <span><strong>Design Hybrid Characters</strong> — Create Character Development Plan</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">9</span>
              <span><strong>Prioritize Creation</strong> — Tier characters in development plan</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-7 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">10</span>
              <span><strong>Execute Creation</strong> — Create articles, update Spawn Registry and Products doc</span>
            </li>
          </ol>
        </div>
      </main>
    </div>
  )
}
