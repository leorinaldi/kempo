"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"

export function KempoNetRedirect() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isKempoNet = searchParams.get("kemponet") === "1"

  useEffect(() => {
    // If we're at the home page inside KempoNet iframe, redirect to Kemple
    if (isKempoNet && pathname === "/" && window.parent !== window) {
      window.parent.postMessage({ type: "kemponet-go-home" }, "*")
    }
  }, [pathname, isKempoNet])

  return null
}
