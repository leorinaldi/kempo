"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"

type DeviceContext = "kemponet" | "mobile" | null

export function KempoNetBridge() {
  const pathname = usePathname()
  const router = useRouter()
  const [deviceContext, setDeviceContext] = useState<DeviceContext>(null)

  // Check for kemponet or mobile param on client side - re-check on pathname changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("kemponet") === "1") {
      setDeviceContext("kemponet")
    } else if (params.get("mobile") === "1") {
      setDeviceContext("mobile")
    }
  }, [pathname])

  const isKempoNet = deviceContext !== null

  // Track search params to include in navigation messages
  const [searchParams, setSearchParams] = useState("")

  // Update search params when URL changes
  useEffect(() => {
    const updateSearchParams = () => {
      // Get current search params, excluding our context params
      const params = new URLSearchParams(window.location.search)
      params.delete("kemponet")
      params.delete("mobile")
      const remaining = params.toString()
      setSearchParams(remaining ? `?${remaining}` : "")
    }
    updateSearchParams()

    // Listen for URL changes (for router.push updates)
    const observer = new MutationObserver(updateSearchParams)
    observer.observe(document, { subtree: true, childList: true })

    return () => observer.disconnect()
  }, [pathname])

  useEffect(() => {
    if (deviceContext && window.parent !== window) {
      // Send current path with search params to parent window
      const messageType = deviceContext === "mobile" ? "mobile-navigation" : "kemponet-navigation"
      const fullPath = pathname + searchParams
      window.parent.postMessage(
        { type: messageType, path: fullPath },
        "*"
      )
    }
  }, [pathname, searchParams, deviceContext])

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

  // Intercept kemponet link clicks to add context param
  useEffect(() => {
    if (!deviceContext) return

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest("a")

      if (link && link.href) {
        try {
          const url = new URL(link.href)

          // Only kemponet links should remain, intercept to add param
          if (url.pathname.startsWith("/kemponet/")) {
            e.preventDefault()
            const param = deviceContext === "mobile" ? "mobile=1" : "kemponet=1"
            router.push(`${url.pathname}?${param}`)
          }
        } catch {
          // Invalid URL, prevent navigation
          e.preventDefault()
        }
      }
    }

    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [deviceContext, router])

  return null
}
