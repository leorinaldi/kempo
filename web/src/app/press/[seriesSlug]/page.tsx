'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

interface Issue {
  id: string
  title: string
  kyDate: string | null
  coverUrl: string | null
  volume: number | null
  issueNumber: number | null
  edition: string | null
  contentCount: number
  hasContent: boolean
}

interface SeriesData {
  id: string
  name: string
  type: 'magazine' | 'newspaper'
  description: string | null
  publisherName: string | null
  frequency: string | null
  startKyDate: string | null
  endKyDate: string | null
  hasDesign: boolean
  issues: Issue[]
}

export default function SeriesPage() {
  const params = useParams()
  const seriesSlug = params.seriesSlug as string
  const [series, setSeries] = useState<SeriesData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/press/series/${seriesSlug}`)
      .then(res => {
        if (!res.ok) throw new Error('Series not found')
        return res.json()
      })
      .then((data: SeriesData) => {
        setSeries(data)
        setIsLoading(false)
      })
      .catch(err => {
        console.error('Failed to load series:', err)
        setError(err.message)
        setIsLoading(false)
      })
  }, [seriesSlug])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-stone-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </main>
    )
  }

  if (error || !series) {
    return (
      <main className="min-h-screen bg-stone-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone-500 text-lg">{error || 'Series not found'}</p>
          <Link href="/press" className="text-amber-500 hover:text-amber-400 mt-4 inline-block">
            Back to Press
          </Link>
        </div>
      </main>
    )
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }

  return (
    <main className="min-h-screen bg-stone-900">
      {/* Header */}
      <header className="bg-stone-950 border-b border-stone-800 sticky top-14 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Link
              href="/press"
              className="text-stone-500 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-xl font-serif text-white tracking-wide">{series.name}</h1>
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <span className="uppercase">{series.type}</span>
                {series.publisherName && (
                  <>
                    <span>&middot;</span>
                    <span>{series.publisherName}</span>
                  </>
                )}
                {series.frequency && (
                  <>
                    <span>&middot;</span>
                    <span className="capitalize">{series.frequency}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Description */}
      {series.description && (
        <div className="max-w-6xl mx-auto px-4 py-4 border-b border-stone-800">
          <p className="text-stone-400 text-sm">{series.description}</p>
        </div>
      )}

      {/* Issues Grid */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h2 className="text-white font-medium mb-4">
          {series.issues.length} {series.issues.length === 1 ? 'Issue' : 'Issues'}
        </h2>

        {series.issues.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-stone-500 text-lg">No issues available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {series.issues.map(issue => (
              <IssueCard
                key={issue.id}
                issue={issue}
                seriesSlug={seriesSlug}
                seriesType={series.type}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

function IssueCard({
  issue,
  seriesSlug,
  seriesType,
}: {
  issue: Issue
  seriesSlug: string
  seriesType: 'magazine' | 'newspaper'
}) {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  const issueLabel = () => {
    const parts: string[] = []
    if (issue.volume) parts.push(`Vol. ${issue.volume}`)
    if (issue.issueNumber) parts.push(`No. ${issue.issueNumber}`)
    if (issue.edition) parts.push(issue.edition)
    return parts.length > 0 ? parts.join(', ') : null
  }

  return (
    <Link
      href={issue.hasContent ? `/press/${seriesSlug}/${issue.id}` : '#'}
      className={`group block ${!issue.hasContent ? 'cursor-not-allowed opacity-60' : ''}`}
      onClick={e => { if (!issue.hasContent) e.preventDefault() }}
    >
      {/* Cover Image */}
      <div className={`relative bg-stone-800 overflow-hidden shadow-lg transition-transform ${
        issue.hasContent ? 'group-hover:scale-[1.02]' : ''
      } ${
        seriesType === 'magazine' ? 'aspect-[8.5/11]' : 'aspect-[11/15]'
      }`}>
        {issue.coverUrl ? (
          <Image
            src={issue.coverUrl}
            alt={issue.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-2">
              <div className="text-sm font-serif text-stone-600">
                {issue.title}
              </div>
            </div>
          </div>
        )}

        {/* Content status */}
        {!issue.hasContent && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-stone-400 text-xs">No content</span>
          </div>
        )}

        {/* Hover overlay */}
        {issue.hasContent && (
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white text-sm font-medium">Read</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-2">
        <h3 className={`text-sm line-clamp-2 ${
          issue.hasContent
            ? 'text-white group-hover:text-amber-500 transition-colors'
            : 'text-stone-500'
        }`}>
          {issue.title}
        </h3>
        {issueLabel() && (
          <p className="text-stone-500 text-xs mt-0.5">{issueLabel()}</p>
        )}
        {issue.kyDate && (
          <p className="text-stone-600 text-xs mt-0.5">{formatDate(issue.kyDate)} k.y.</p>
        )}
      </div>
    </Link>
  )
}
