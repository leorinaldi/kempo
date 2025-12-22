"use client"

import Link from "next/link"
import { useState, useEffect } from "react"

export function KempopediaHeader() {
  const [isEmbedded, setIsEmbedded] = useState(true) // Assume embedded initially to avoid flash

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const isKempoNet = params.get("kemponet") === "1"
    const isMobile = params.get("mobile") === "1"
    setIsEmbedded(isKempoNet || isMobile)
  }, [])

  return (
    <header
      className={`border-b border-orange-700 sticky z-40 ${isEmbedded ? 'top-0' : 'top-14'}`}
      style={{ background: "#f97316" }}
    >
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="text-2xl font-serif">
          <Link href="/kemponet/kempopedia" className="text-white hover:opacity-80">Kempopedia</Link>
        </div>
      </div>
    </header>
  )
}
