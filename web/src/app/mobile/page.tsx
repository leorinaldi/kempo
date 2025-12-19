"use client"

import { useState, useRef, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"

const DEFAULT_HOME = "/kemponet/kemple"

export default function MobilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <MobileContent />
    </Suspense>
  )
}

function MobileContent() {
  const searchParams = useSearchParams()
  const urlParam = searchParams.get("url")
  const initialPath = urlParam || DEFAULT_HOME

  const [currentPath, setCurrentPath] = useState(initialPath)
  const [currentTime, setCurrentTime] = useState("")
  const [addressBarValue, setAddressBarValue] = useState("")
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Update clock every minute
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const hours = now.getHours()
      const minutes = now.getMinutes()
      const displayHours = hours % 12 || 12
      const displayMinutes = minutes.toString().padStart(2, "0")
      setCurrentTime(`${displayHours}:${displayMinutes}`)
    }

    updateTime() // Set immediately
    const interval = setInterval(updateTime, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  // Use refs for history to avoid closure issues
  const historyRef = useRef<string[]>([initialPath])
  const historyIndexRef = useRef(0)
  const isNavigatingRef = useRef(false)
  const [, forceUpdate] = useState({})
  const [iframeSrc, setIframeSrc] = useState(initialPath)
  const [iframeKey, setIframeKey] = useState(0)

  const handleBack = () => {
    if (historyIndexRef.current > 0) {
      isNavigatingRef.current = true
      historyIndexRef.current -= 1
      const newPath = historyRef.current[historyIndexRef.current]
      setCurrentPath(newPath)
      setIframeSrc(newPath)
      setIframeKey(k => k + 1)
      forceUpdate({})
    }
  }

  const handleForward = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      isNavigatingRef.current = true
      historyIndexRef.current += 1
      const newPath = historyRef.current[historyIndexRef.current]
      setCurrentPath(newPath)
      setIframeSrc(newPath)
      setIframeKey(k => k + 1)
      forceUpdate({})
    }
  }

  const canGoBack = historyIndexRef.current > 0
  const canGoForward = historyIndexRef.current < historyRef.current.length - 1

  // Get display name for current path (just the site/page name)
  const getDisplayUrl = (path: string) => {
    // /kemponet/kempopedia/wiki/something → kempopedia/wiki/something
    return path.replace(/^\/kemponet\//, "")
  }

  // Parse user input to a path
  const parseAddressInput = (input: string): string | null => {
    const trimmed = input.trim().toLowerCase()
    if (!trimmed) return null
    // Add /kemponet/ prefix if not present
    if (trimmed.startsWith("/kemponet/")) {
      return trimmed
    }
    return `/kemponet/${trimmed}`
  }

  // Keep address bar in sync with current path
  useEffect(() => {
    setAddressBarValue(getDisplayUrl(currentPath))
  }, [currentPath])

  // Handle address bar navigation
  const handleAddressBarKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const newPath = parseAddressInput(addressBarValue)
      if (newPath && newPath !== currentPath) {
        // Add to history
        historyRef.current = [...historyRef.current.slice(0, historyIndexRef.current + 1), newPath]
        historyIndexRef.current = historyRef.current.length - 1
        setCurrentPath(newPath)
        setIframeSrc(newPath)
        setIframeKey(k => k + 1)
        forceUpdate({})
      }
    }
  }

  // Get display name for current site
  const getSiteName = (path: string) => {
    if (path.startsWith("/kemponet/kempotube")) return "KempoTube"
    if (path.startsWith("/kemponet/kempopedia")) return "Kempopedia"
    if (path.startsWith("/kemponet/kemple")) return "Kemple"
    if (path.startsWith("/kemponet/kemposcape")) return "Settings"
    return "KempoNet"
  }

  // Listen for messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "mobile-navigation" || event.data?.type === "kemponet-navigation") {
        const newPath = event.data.path
        const currentHistoryPath = historyRef.current[historyIndexRef.current]

        // Only add to history if this is a new navigation
        if (!isNavigatingRef.current && newPath !== currentHistoryPath) {
          historyRef.current = [...historyRef.current.slice(0, historyIndexRef.current + 1), newPath]
          historyIndexRef.current = historyRef.current.length - 1
          forceUpdate({})
        }
        isNavigatingRef.current = false
        setCurrentPath(newPath)
      }
    }
    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [])

  const blueGlow = '0 0 20px rgba(100,150,255,1), 0 0 40px rgba(80,130,255,0.9), 0 0 60px rgba(60,120,255,0.8), 0 0 100px rgba(50,100,255,0.7), 0 0 150px rgba(40,80,255,0.5)'

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-start pt-12 p-4">
      {/* iPhone Frame */}
      <div
        className="relative"
        style={{
          filter: 'drop-shadow(0 0 15px rgba(100,150,255,0.4)) drop-shadow(0 0 30px rgba(80,130,255,0.3))',
        }}
      >
        {/* Hard shadow behind phone */}
        <div
          className="absolute top-3 left-3 w-[320px] h-[580px] rounded-[45px]"
          style={{
            background: '#1a1a1a',
          }}
        />

        {/* Phone Body */}
        <div
          className="w-[320px] h-[580px] rounded-[45px] p-[3px] relative border-4 border-gray-800"
          style={{
            background: 'linear-gradient(145deg, #2d2d2d 0%, #1a1a1a 50%, #0d0d0d 100%)',
          }}
        >
          {/* Screen bezel */}
          <div
            className="w-full h-full rounded-[42px] overflow-hidden relative flex flex-col"
            style={{
              background: '#000',
            }}
          >
            {/* Status Bar */}
            <div className="h-8 px-6 flex items-center justify-between relative z-20" style={{ background: '#1a1a1a' }}>
              {/* Left - Time */}
              <span className="text-white text-sm font-semibold">{currentTime || "9:41"}</span>

              {/* Right - Icons */}
              <div className="flex items-center gap-1">
                {/* Signal bars */}
                <div className="flex items-end gap-[2px] h-3">
                  <div className="w-[3px] h-1 bg-white rounded-sm" />
                  <div className="w-[3px] h-[6px] bg-white rounded-sm" />
                  <div className="w-[3px] h-2 bg-white rounded-sm" />
                  <div className="w-[3px] h-3 bg-white rounded-sm" />
                </div>
                {/* Battery */}
                <div className="flex items-center ml-1">
                  <div className="w-6 h-3 border border-white rounded-sm relative">
                    <div className="absolute inset-[2px] bg-white rounded-[1px]" style={{ width: 'calc(100% - 4px)' }} />
                  </div>
                  <div className="w-[2px] h-[5px] bg-white rounded-r-sm ml-[1px]" />
                </div>
              </div>
            </div>

            {/* Safari Browser */}
            <div className="flex-1 flex flex-col bg-white overflow-hidden">
              {/* URL Bar */}
              <div
                className="px-3 py-2 border-b border-gray-200 flex items-center gap-2"
                style={{ background: '#f5f5f5' }}
              >
                {/* Back Button */}
                <button
                  onClick={handleBack}
                  disabled={!canGoBack}
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: '#e5e5e5' }}
                >
                  <svg
                    className={`w-3 h-3 ${canGoBack ? 'text-gray-700' : 'text-gray-400'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <input
                  type="text"
                  value={addressBarValue}
                  onChange={(e) => setAddressBarValue(e.target.value)}
                  onKeyDown={handleAddressBarKeyDown}
                  className="flex-1 h-7 text-center text-sm text-gray-600 font-medium px-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-400"
                  style={{ background: '#e5e5e5' }}
                  spellCheck={false}
                />
                {/* Favorites Button */}
                <button
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: '#e5e5e5' }}
                >
                  <svg
                    className="w-3 h-3 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </button>
              </div>

              {/* Web content area */}
              <div className="flex-1 overflow-hidden">
                <iframe
                  key={iframeKey}
                  ref={iframeRef}
                  src={`${iframeSrc}?mobile=1`}
                  className="w-full h-full border-0"
                  style={{ background: "white" }}
                />
              </div>
            </div>

            {/* Home Indicator */}
            <div className="h-8 flex items-center justify-center" style={{ background: '#1a1a1a' }}>
              <div className="w-32 h-1 rounded-full" style={{ background: '#666' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
