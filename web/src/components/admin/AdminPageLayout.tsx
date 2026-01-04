"use client"

import Link from "next/link"
import { ReactNode } from "react"

type AdminColor =
  | "purple"
  | "teal"
  | "green"
  | "blue"
  | "emerald"
  | "amber"
  | "orange"
  | "rose"
  | "indigo"
  | "cyan"

interface AdminPageLayoutProps {
  title: string
  backHref: string
  color: AdminColor
  children: ReactNode
}

const colorClasses: Record<AdminColor, string> = {
  purple: "text-purple-600",
  teal: "text-teal-600",
  green: "text-green-600",
  blue: "text-blue-600",
  emerald: "text-emerald-600",
  amber: "text-amber-600",
  orange: "text-orange-600",
  rose: "text-rose-600",
  indigo: "text-indigo-600",
  cyan: "text-cyan-600",
}

export function AdminPageLayout({ title, backHref, color, children }: AdminPageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={backHref} className="text-gray-500 hover:text-gray-700">
              ← Back
            </Link>
            <h1 className={`text-2xl font-bold ${colorClasses[color]}`}>{title}</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
