"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

const favorites = [
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

export default function FavoritesPage() {
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setIsMobile(params.get("mobile") === "1")
  }, [])

  const handleClick = (path: string) => {
    if (isMobile) {
      router.push(`${path}?mobile=1`)
    } else {
      router.push(path)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <h1
        className="text-lg font-semibold text-gray-800 mb-4"
        style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
      >
        Favorites
      </h1>

      <div className="space-y-3">
        {favorites.map((fav) => (
          <button
            key={fav.path}
            onClick={() => handleClick(fav.path)}
            className="w-full flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
              style={{ background: fav.color }}
            >
              {fav.icon === "search" ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                </svg>
              ) : fav.icon === "book" ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 6.04168C10.4077 4.61656 8.30506 3.75 6 3.75C4.94809 3.75 3.93834 3.93046 3 4.26212V18.5121C3.93834 18.1805 4.94809 18 6 18C8.30506 18 10.4077 18.8666 12 20.2917M12 6.04168C13.5923 4.61656 15.6949 3.75 18 3.75C19.0519 3.75 20.0617 3.93046 21 4.26212V18.5121C20.0617 18.1805 19.0519 18 18 18C15.6949 18 13.5923 18.8666 12 20.2917M12 6.04168V20.2917" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : fav.icon === "flipflop" ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M12 4l-8 8h5v8h6v-8h5z" />
                </svg>
              ) : fav.icon === "play" ? (
                <svg width="22" height="16" viewBox="0 0 22 16" fill="white">
                  <path d="M0 0L7 8L0 16V0Z" />
                  <path d="M8 0L15 8L8 16V0Z" />
                  <rect x="18" y="0" width="3" height="16" />
                </svg>
              ) : fav.icon === "compass" ? (
                <div className="relative w-5 h-5 -rotate-45">
                  <div
                    className="absolute top-0 left-1/2 -translate-x-1/2"
                    style={{
                      width: 0, height: 0,
                      borderLeft: '4px solid transparent',
                      borderRight: '4px solid transparent',
                      borderBottom: '10px solid white',
                    }}
                  />
                  <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2"
                    style={{
                      width: 0, height: 0,
                      borderLeft: '4px solid transparent',
                      borderRight: '4px solid transparent',
                      borderTop: '10px solid rgba(255,255,255,0.4)',
                    }}
                  />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white" />
                </div>
              ) : fav.icon === "soundwaves" ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3v18M8 7v10M4 10v4M16 7v10M20 10v4" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              ) : (
                fav.icon
              )}
            </div>
            <span className="text-gray-800 font-medium">{fav.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
