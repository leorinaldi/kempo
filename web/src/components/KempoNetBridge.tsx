"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"

export function KempoNetBridge() {
  const pathname = usePathname()
  const router = useRouter()
  const [isKempoNet, setIsKempoNet] = useState(false)

  // Check for kemponet param on client side only
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setIsKempoNet(params.get("kemponet") === "1")
  }, [])

  useEffect(() => {
    if (isKempoNet && window.parent !== window) {
      // Send current path to parent KempoNet window
      window.parent.postMessage(
        { type: "kemponet-navigation", path: pathname },
        "*"
      )
    }
  }, [pathname, isKempoNet])

  // Intercept link clicks to add kemponet param or handle base URL
  useEffect(() => {
    if (!isKempoNet) return

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest("a")

      if (link && link.href) {
        const url = new URL(link.href)

        // Check if this is a link to the base URL (Kempo home)
        if (url.pathname === "/" || url.pathname === "") {
          e.preventDefault()
          // Tell parent to go to Kemple home screen
          if (window.parent !== window) {
            window.parent.postMessage({ type: "kemponet-go-home" }, "*")
          }
          return
        }

        // Intercept internal kempopedia and kempotube links
        if (url.pathname.startsWith("/kemponet/kempopedia") || url.pathname.startsWith("/kemponet/kempotube")) {
          e.preventDefault()
          // Use router.push for smooth client-side navigation
          router.push(`${url.pathname}?kemponet=1`)
        }
      }
    }

    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [isKempoNet, router])

  return null
}
