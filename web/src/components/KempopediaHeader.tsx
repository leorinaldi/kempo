"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export function KempopediaHeader() {
  const [isKempoNet, setIsKempoNet] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setIsKempoNet(params.get("kemponet") === "1")
  }, [])

  const handleKempleClick = () => {
    if (window.parent !== window) {
      window.parent.postMessage({ type: "kemponet-go-home" }, "*")
    }
  }

  return (
    <header className="border-b border-wiki-border bg-wiki-background">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="text-2xl font-serif">
          {isKempoNet ? (
            <button
              onClick={handleKempleClick}
              className="text-gray-500 hover:text-gray-700"
            >
              Kemple
            </button>
          ) : (
            <Link href="/" className="text-gray-500 hover:text-gray-700">Kempo</Link>
          )}
          <span className="text-gray-400 mx-2">›</span>
          <Link href="/kempopedia" className="text-gray-900">Kempopedia</Link>
        </div>
        <p className="text-sm text-gray-600">The encyclopedia of the Kempo universe</p>
      </div>
    </header>
  )
}
