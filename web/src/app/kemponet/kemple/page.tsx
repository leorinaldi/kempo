"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function KemplePage() {
  const router = useRouter()
  const [selectedOption, setSelectedOption] = useState("kempopedia")
  const [isKempoNet, setIsKempoNet] = useState(false)

  // Check if we're inside the KempoNet iframe
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setIsKempoNet(params.get("kemponet") === "1")
  }, [])

  const handleSearch = () => {
    const targetPath = `/kemponet/${selectedOption}`

    if (isKempoNet) {
      // Inside KempoNet iframe - use client-side navigation with param
      router.push(`${targetPath}?kemponet=1`)
    } else {
      // Standalone - just navigate normally
      router.push(targetPath)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      {/* Kemple Logo */}
      <div className="mb-6">
        <h1
          className="text-5xl font-bold tracking-tight"
          style={{
            fontFamily: "serif",
            textShadow: '2px 2px 0px rgba(0,0,0,0.3)',
          }}
        >
          <span style={{ color: "#4285f4" }}>K</span>
          <span style={{ color: "#ea4335" }}>e</span>
          <span style={{ color: "#fbbc05" }}>m</span>
          <span style={{ color: "#4285f4" }}>p</span>
          <span style={{ color: "#34a853" }}>l</span>
          <span style={{ color: "#ea4335" }}>e</span>
        </h1>
      </div>

      {/* Search dropdown */}
      <div className="w-full max-w-sm">
        <select
          value={selectedOption}
          onChange={(e) => setSelectedOption(e.target.value)}
          className="w-full px-3 py-2 text-sm cursor-pointer border border-gray-500 rounded-sm"
          style={{
            background: "#fffef8",
            color: "#000",
            fontFamily: "monospace",
            appearance: "none",
            WebkitAppearance: "none",
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M2 4l4 4 4-4z'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 8px center",
            paddingRight: "28px",
          }}
        >
          <option value="kempopedia">Kempopedia</option>
          <option value="kemponet">KempoNet</option>
          <option value="kempotube">KempoTube</option>
        </select>
      </div>

      {/* Search button */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={handleSearch}
          className="px-4 py-1.5 text-sm font-medium border border-gray-500 rounded-sm"
          style={{
            background: "#f3f4f6",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            color: "#374151",
          }}
        >
          Kemple Search
        </button>
      </div>
    </div>
  )
}
