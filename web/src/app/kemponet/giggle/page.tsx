"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"

interface SearchResult {
  slug: string
  title: string
  type: string
  snippet: string
  url: string
  domain: string
  rank: number
}

export default function GigglePage() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [isKempoNet, setIsKempoNet] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check if we're inside the KempoNet iframe or mobile
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setIsKempoNet(params.get("kemponet") === "1")
    setIsMobile(params.get("mobile") === "1")
  }, [])

  const handleSearch = useCallback(async () => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([])
      setHasSearched(false)
      return
    }

    setIsSearching(true)
    setHasSearched(true)

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`)
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error("Search failed:", error)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }, [query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const navigateTo = (url: string) => {
    if (isKempoNet) {
      router.push(`${url}?kemponet=1`)
    } else if (isMobile) {
      router.push(`${url}?mobile=1`)
    } else {
      router.push(url)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-4">
      {/* Top spacer - pushes content to center the search bar */}
      <div className="flex-1" />

      {/* Giggle Logo - positioned above the centered search bar */}
      <div className="mb-6">
        <h1
          className="text-6xl font-bold tracking-tight"
          style={{
            fontFamily: "serif",
            textShadow: '2px 2px 0px rgba(0,0,0,0.3)',
          }}
        >
          <span style={{ color: "#f97316" }}>G</span>
          <span style={{ color: "#fdba74" }}>i</span>
          <span style={{ color: "#fdba74" }}>g</span>
          <span style={{ color: "#fdba74" }}>g</span>
          <span style={{ color: "#fdba74" }}>l</span>
          <span style={{ color: "#fdba74" }}>e</span>
        </h1>
      </div>

      {/* Search input - this is the vertically centered element */}
      <div className="w-full max-w-md">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search the KempoNet..."
            className="w-full px-4 py-2.5 text-base border border-gray-300 rounded-full outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
            style={{
              background: "#fff",
              color: "#000",
            }}
          />
          {/* Search icon */}
          <button
            onClick={handleSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Search button */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={handleSearch}
          disabled={isSearching}
          className="px-4 py-1.5 text-sm font-medium border border-gray-300 rounded-sm hover:bg-gray-50 disabled:opacity-50"
          style={{
            background: "#f8f9fa",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            color: "#374151",
          }}
        >
          {isSearching ? "Searching..." : "Giggle Search"}
        </button>
      </div>

      {/* Popular Sites link */}
      <div className="mt-4">
        <button
          onClick={() => navigateTo("/kemponet/giggle/popular-sites")}
          className="text-sm text-red-600 hover:underline"
        >
          Popular Sites
        </button>
      </div>

      {/* Search Results */}
      {hasSearched && (
        <div className="w-full max-w-md mt-6">
          {isSearching ? (
            <div className="text-center text-gray-500 text-sm">Searching...</div>
          ) : results.length > 0 ? (
            <div className="space-y-4">
              {results.map((result) => (
                <div
                  key={result.slug}
                  className="cursor-pointer group"
                  onClick={() => navigateTo(result.url)}
                >
                  <div className="text-sm text-gray-500 mb-0.5">
                    {result.domain}
                  </div>
                  <div className="text-lg text-red-600 group-hover:underline">
                    {result.title}
                  </div>
                  <div className="text-sm text-gray-600 mt-0.5">
                    {result.snippet}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 text-sm">
              No results found for &quot;{query}&quot;
            </div>
          )}
        </div>
      )}

      {/* Bottom spacer - grows more to push content up and center the search bar */}
      <div className="flex-[1.3]" />
    </div>
  )
}
