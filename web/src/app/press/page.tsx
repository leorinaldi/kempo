'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { slugify } from '@/lib/slugify'

interface PublicationSeriesData {
  id: string
  name: string
  type: 'magazine' | 'newspaper'
  description: string | null
  publisherName: string | null
  issueCount: number
  latestCoverUrl: string | null
  latestIssueTitle: string | null
}

export default function PressPage() {
  const [series, setSeries] = useState<PublicationSeriesData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'magazine' | 'newspaper'>('all')

  useEffect(() => {
    fetch('/api/press/series')
      .then(res => res.json())
      .then((data: PublicationSeriesData[]) => {
        setSeries(data)
        setIsLoading(false)
      })
      .catch(err => {
        console.error('Failed to load publications:', err)
        setIsLoading(false)
      })
  }, [])

  const filteredSeries = filter === 'all'
    ? series
    : series.filter(s => s.type === filter)

  const magazines = series.filter(s => s.type === 'magazine')
  const newspapers = series.filter(s => s.type === 'newspaper')

  if (isLoading) {
    return (
      <main className="min-h-screen bg-stone-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-stone-900">
      {/* Header */}
      <header className="bg-stone-950 border-b border-stone-800 sticky top-14 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-700 rounded flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h1 className="text-xl font-serif text-white tracking-wide">Kempo Press</h1>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1 bg-stone-800 rounded-lg p-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                filter === 'all'
                  ? 'bg-amber-700 text-white'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              All ({series.length})
            </button>
            <button
              onClick={() => setFilter('magazine')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                filter === 'magazine'
                  ? 'bg-amber-700 text-white'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              Magazines ({magazines.length})
            </button>
            <button
              onClick={() => setFilter('newspaper')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                filter === 'newspaper'
                  ? 'bg-amber-700 text-white'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              Newspapers ({newspapers.length})
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {filteredSeries.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-stone-500 text-lg">No publications available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {filteredSeries.map(pub => (
              <SeriesCard key={pub.id} series={pub} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

function SeriesCard({ series }: { series: PublicationSeriesData }) {
  const slug = slugify(series.name)

  return (
    <Link
      href={`/press/${slug}`}
      className="group block"
    >
      {/* Cover Image */}
      <div className={`relative bg-stone-800 overflow-hidden shadow-lg transition-transform group-hover:scale-[1.02] ${
        series.type === 'magazine' ? 'aspect-[8.5/11]' : 'aspect-[11/15]'
      }`}>
        {series.latestCoverUrl ? (
          <Image
            src={series.latestCoverUrl}
            alt={series.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-4">
              <div className={`text-2xl font-serif ${series.type === 'magazine' ? 'text-amber-600' : 'text-stone-600'}`}>
                {series.name}
              </div>
              <div className="text-xs text-stone-500 mt-2 uppercase tracking-wider">
                {series.type}
              </div>
            </div>
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-white text-sm font-medium">
            View Issues ({series.issueCount})
          </span>
        </div>

        {/* Type Badge */}
        <div className={`absolute top-2 right-2 px-2 py-0.5 text-xs uppercase tracking-wider rounded ${
          series.type === 'magazine'
            ? 'bg-amber-700 text-white'
            : 'bg-stone-700 text-stone-300'
        }`}>
          {series.type}
        </div>
      </div>

      {/* Info */}
      <div className="mt-2">
        <h3 className="text-white font-medium text-sm line-clamp-1 group-hover:text-amber-500 transition-colors">
          {series.name}
        </h3>
        {series.publisherName && (
          <p className="text-stone-500 text-xs mt-0.5 line-clamp-1">
            {series.publisherName}
          </p>
        )}
        <p className="text-stone-600 text-xs mt-0.5">
          {series.issueCount} {series.issueCount === 1 ? 'issue' : 'issues'}
        </p>
      </div>
    </Link>
  )
}
