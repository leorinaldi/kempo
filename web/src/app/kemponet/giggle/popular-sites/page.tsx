"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

// Top favorites - synced with kemponet-browser/favorites
const topFavorites = [
  {
    name: "FlipFlop",
    path: "/kemponet/flipflop",
    color: "#ec4899",
    icon: "flipflop",
  },
  {
    name: "Giggle",
    path: "/kemponet/giggle",
    color: "#f97316",
    icon: "search",
  },
  {
    name: "Kempopedia",
    path: "/kemponet/kempopedia",
    color: "#f97316",
    icon: "book",
  },
  {
    name: "KempoTube",
    path: "/kemponet/kempotube",
    color: "#f97316",
    icon: "play",
  },
  {
    name: "SoundWaves",
    path: "/kemponet/soundwaves",
    color: "#8b5cf6",
    icon: "soundwaves",
  },
]

interface Domain {
  name: string
  displayName: string | null
  owner: string
}

export default function PopularSitesPage() {
  const router = useRouter()
  const [domains, setDomains] = useState<Domain[]>([])
  const [isKempoNet, setIsKempoNet] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setIsKempoNet(params.get("kemponet") === "1")
    setIsMobile(params.get("mobile") === "1")
  }, [])

  useEffect(() => {
    fetch("/api/domains")
      .then((res) => res.json())
      .then((data) => setDomains(data))
      .catch((err) => console.error("Failed to fetch domains:", err))
  }, [])

  const navigateTo = (path: string) => {
    if (isKempoNet) {
      router.push(`${path}?kemponet=1`)
    } else if (isMobile) {
      router.push(`${path}?mobile=1`)
    } else {
      router.push(path)
    }
  }

  const renderIcon = (icon: string, color: string) => {
    return (
      <div
        className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
        style={{ background: color }}
      >
        {icon === "search" ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          </svg>
        ) : icon === "book" ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 6.04168C10.4077 4.61656 8.30506 3.75 6 3.75C4.94809 3.75 3.93834 3.93046 3 4.26212V18.5121C3.93834 18.1805 4.94809 18 6 18C8.30506 18 10.4077 18.8666 12 20.2917M12 6.04168C13.5923 4.61656 15.6949 3.75 18 3.75C19.0519 3.75 20.0617 3.93046 21 4.26212V18.5121C20.0617 18.1805 19.0519 18 18 18C15.6949 18 13.5923 18.8666 12 20.2917M12 6.04168V20.2917" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : icon === "flipflop" ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M12 4l-8 8h5v8h6v-8h5z" />
          </svg>
        ) : icon === "play" ? (
          <svg width="16" height="12" viewBox="0 0 22 16" fill="white">
            <path d="M0 0L7 8L0 16V0Z" />
            <path d="M8 0L15 8L8 16V0Z" />
            <rect x="18" y="0" width="3" height="16" />
          </svg>
        ) : icon === "soundwaves" ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 3v18M8 7v10M4 10v4M16 7v10M20 10v4" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        ) : icon === "compass" ? (
          <div className="relative w-4 h-4 -rotate-45">
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2"
              style={{
                width: 0, height: 0,
                borderLeft: '3px solid transparent',
                borderRight: '3px solid transparent',
                borderBottom: '8px solid white',
              }}
            />
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2"
              style={{
                width: 0, height: 0,
                borderLeft: '3px solid transparent',
                borderRight: '3px solid transparent',
                borderTop: '8px solid rgba(255,255,255,0.4)',
              }}
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-white" />
          </div>
        ) : (
          <span className="text-white text-xs font-bold">{icon}</span>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-3">
        <button
          onClick={() => navigateTo("/kemponet/giggle")}
          className="flex items-center gap-2"
        >
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: "serif" }}
          >
            <span style={{ color: "#f97316" }}>G</span>
            <span style={{ color: "#fdba74" }}>iggle</span>
          </h1>
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Top Favorites */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Top Favorites</h2>
          <div className="space-y-2">
            {topFavorites.map((fav) => (
              <button
                key={fav.path}
                onClick={() => navigateTo(fav.path)}
                className="w-full flex items-center gap-3 p-2 rounded hover:bg-gray-50 transition-colors text-left"
              >
                {renderIcon(fav.icon, fav.color)}
                <span className="text-red-600 hover:underline">{fav.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Other Sites */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-3">Other Sites</h2>
          <div className="space-y-2">
            {domains
              .filter((domain) => !topFavorites.some((fav) => fav.path === `/kemponet/${domain.name}`))
              .map((domain) => (
              <button
                key={domain.name}
                onClick={() => navigateTo(`/kemponet/${domain.name}`)}
                className="w-full flex items-center p-2 rounded hover:bg-gray-50 transition-colors text-left"
              >
                <span className="text-red-600 hover:underline">
                  {domain.displayName || domain.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
