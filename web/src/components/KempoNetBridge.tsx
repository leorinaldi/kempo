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

  // Strip external links on mount and watch for DOM changes
  useEffect(() => {
    if (!isKempoNet) return

    let isProcessing = false

    const stripExternalLinks = () => {
      if (isProcessing) return
      isProcessing = true

      // Pause observer while we modify DOM
      observer.disconnect()

      try {
        const links = Array.from(document.querySelectorAll("a[href]"))
        links.forEach((link) => {
          const anchor = link as HTMLAnchorElement
          // Skip if already removed from DOM
          if (!anchor.parentNode) return

          try {
            const url = new URL(anchor.href)
            const isKempoNetLink = url.pathname.startsWith("/kemponet/")

            if (!isKempoNetLink) {
              // Replace link with a span containing its content
              const span = document.createElement("span")
              span.innerHTML = anchor.innerHTML
              anchor.parentNode.replaceChild(span, anchor)
            }
          } catch {
            // Invalid URL, strip it
            if (anchor.parentNode) {
              const span = document.createElement("span")
              span.innerHTML = anchor.innerHTML
              anchor.parentNode.replaceChild(span, anchor)
            }
          }
        })
      } finally {
        // Resume observer
        observer.observe(document.body, { childList: true, subtree: true })
        isProcessing = false
      }
    }

    const observer = new MutationObserver(() => {
      stripExternalLinks()
    })

    // Initial strip after a small delay to let React finish rendering
    setTimeout(stripExternalLinks, 0)

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    return () => observer.disconnect()
  }, [isKempoNet])

  // Intercept kemponet link clicks to add kemponet param
  useEffect(() => {
    if (!isKempoNet) return

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest("a")

      if (link && link.href) {
        try {
          const url = new URL(link.href)

          // Only kemponet links should remain, intercept to add param
          if (url.pathname.startsWith("/kemponet/")) {
            e.preventDefault()
            router.push(`${url.pathname}?kemponet=1`)
          }
        } catch {
          // Invalid URL, prevent navigation
          e.preventDefault()
        }
      }
    }

    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [isKempoNet, router])

  return null
}
