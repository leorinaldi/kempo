"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams, useRouter } from "next/navigation"

export function KempoNetBridge() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const isKempoNet = searchParams.get("kemponet") === "1"

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

        // Only intercept internal kempopedia links
        if (url.pathname.startsWith("/kempopedia")) {
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
