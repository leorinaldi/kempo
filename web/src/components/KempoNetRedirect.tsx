"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export function KempoNetRedirect() {
  const pathname = usePathname()

  useEffect(() => {
    // Check for kemponet param on client side only
    const params = new URLSearchParams(window.location.search)
    const isKempoNet = params.get("kemponet") === "1"

    // If we're at the home page inside KempoNet iframe, redirect to Kemple
    if (isKempoNet && pathname === "/" && window.parent !== window) {
      window.parent.postMessage({ type: "kemponet-go-home" }, "*")
    }
  }, [pathname])

  return null
}
