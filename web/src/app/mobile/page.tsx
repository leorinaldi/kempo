"use client"

import { useState, useRef, useEffect, Suspense, ReactNode } from "react"
import { useSearchParams } from "next/navigation"

const DEFAULT_HOME = "/kemponet/giggle"

// Mobile app configuration - add new apps here
const MOBILE_APPS = {
  browser: {
    path: "/kemponet/giggle",
    fullscreen: false, // Shows address bar
    label: "KempoNet Browser",
    resetHistory: true, // Reset browser history when opening
  },
  flipflop: {
    path: "/kemponet/flipflop",
    fullscreen: true,
    label: "FlipFlop",
  },
  soundwaves: {
    path: "/kemponet/soundwaves",
    fullscreen: true,
    label: "SoundWaves",
  },
  kempotube: {
    path: "/kemponet/kempotube",
    fullscreen: true,
    label: "KempoTube",
  },
} as const

type AppId = keyof typeof MOBILE_APPS

// Helper to append mobile=1 param properly (handles existing query strings)
const addMobileParam = (path: string): string => {
  const separator = path.includes("?") ? "&" : "?"
  return `${path}${separator}mobile=1`
}

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

  // Detect if viewing on actual mobile device (skip phone frame)
  // Only check once on mount to prevent iframe reload on resize
  const [isRealMobile, setIsRealMobile] = useState<boolean | null>(null)

  // Track which "app" is open (null = home screen)
  const [activeApp, setActiveApp] = useState<AppId | null>(null)

  const [currentPath, setCurrentPath] = useState(initialPath)
  const [currentTime, setCurrentTime] = useState("")
  const [addressBarValue, setAddressBarValue] = useState("")
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Use refs for history to avoid closure issues
  const historyRef = useRef<string[]>([initialPath])
  const historyIndexRef = useRef(0)
  const isNavigatingRef = useRef(false)
  const [, forceUpdate] = useState({})
  const [iframeSrc, setIframeSrc] = useState(initialPath)
  const [iframeKey, setIframeKey] = useState(0)

  useEffect(() => {
    setIsRealMobile(window.innerWidth < 480)
  }, [])

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

  const canGoBack = historyIndexRef.current > 0

  // Get display name for current path (just the site/page name)
  const getDisplayUrl = (path: string) => {
    // /kemponet/kempopedia/wiki/something → kempopedia/wiki/something
    return path.replace(/^\/kemponet\//, "")
  }

  // Parse user input to a path
  // Accepts: "giggle", "kttp://giggle", "/kemponet/giggle"
  const parseAddressInput = (input: string): string | null => {
    const trimmed = input.trim().toLowerCase()
    if (!trimmed) return null
    // Handle kttp:// prefix - strip it and treat as site name
    if (trimmed.startsWith("kttp://")) {
      return `/kemponet/${trimmed.slice(7)}`
    }
    // Handle /kemponet/ prefix (already a path)
    if (trimmed.startsWith("/kemponet/")) {
      return trimmed
    }
    // Plain site name - add /kemponet/ prefix
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
        setIframeSrc(newPath) // Keep iframeSrc in sync so resize doesn't reset
      }
    }
    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [])

  // Open any app by ID
  const openApp = (appId: AppId) => {
    const app = MOBILE_APPS[appId]
    if ('resetHistory' in app && app.resetHistory) {
      // Reset browser history when opening browser
      historyRef.current = [app.path]
      historyIndexRef.current = 0
    }
    setCurrentPath(app.path)
    setIframeSrc(app.path)
    setIframeKey(k => k + 1)
    setActiveApp(appId)
  }

  // Go to home screen
  const goHome = () => {
    setActiveApp(null)
  }

  // Check if current app is fullscreen (no browser UI)
  const isFullscreenApp = activeApp !== null && MOBILE_APPS[activeApp]?.fullscreen

  // Don't render until we know if we're on mobile (prevents flash)
  if (isRealMobile === null) {
    return <div className="min-h-screen bg-black" />
  }

  // Render content for real mobile (no phone frame)
  // Use fixed positioning that accounts for the 56px header
  if (isRealMobile) {
    return (
      <div
        className="fixed left-0 right-0 flex flex-col bg-black"
        style={{ top: '56px', bottom: 0, overflow: 'hidden' }}
      >
        {activeApp === null ? (
          /* Home Screen - fullscreen */
          <>
            <div
              className="flex-1 px-6 pt-12 min-h-0"
              style={{
                background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gridTemplateRows: 'repeat(4, 1fr)',
              }}
            >
              {/* App Grid */}
              {/* Row 1: KempoNet, FlipFlop, SoundWaves */}
              <div className="flex justify-center items-start pt-2">
                <AppIcon appId="browser" onClick={() => openApp("browser")} size="large" />
              </div>
              <div className="flex justify-center items-start pt-2">
                <AppIcon appId="flipflop" onClick={() => openApp("flipflop")} size="large" />
              </div>
              <div className="flex justify-center items-start pt-2">
                <AppIcon appId="soundwaves" onClick={() => openApp("soundwaves")} size="large" />
              </div>
              {/* Row 2: KempoTube */}
              <div className="flex justify-center items-start pt-2">
                <AppIcon appId="kempotube" onClick={() => openApp("kempotube")} size="large" />
              </div>
            </div>

            {/* Bottom Home Bar */}
            <div
              className="flex-shrink-0 flex items-center justify-center"
              style={{
                height: '56px',
                background: '#1a1a1a',
                paddingBottom: 'env(safe-area-inset-bottom)'
              }}
            >
              <button
                onClick={goHome}
                className="w-10 h-10 rounded-lg border-2 border-gray-600 hover:border-gray-400 active:border-white transition-colors"
                style={{ background: '#111' }}
              />
            </div>
          </>
        ) : isFullscreenApp ? (
          /* Fullscreen apps - no browser UI */
          <div className="flex-1 flex flex-col min-h-0">
            {/* Fullscreen content area */}
            <div className="flex-1 min-h-0 overflow-hidden bg-black">
              <iframe
                key={iframeKey}
                ref={iframeRef}
                src={addMobileParam(iframeSrc)}
                className="w-full h-full border-0"
                style={{ background: "black" }}
              />
            </div>

            {/* Bottom Home Bar */}
            <div
              className="flex-shrink-0 flex items-center justify-center"
              style={{
                height: '56px',
                background: '#1a1a1a',
                paddingBottom: 'env(safe-area-inset-bottom)'
              }}
            >
              <button
                onClick={goHome}
                className="w-10 h-10 rounded-lg border-2 border-gray-600 hover:border-gray-400 active:border-white transition-colors"
                style={{ background: '#111' }}
              />
            </div>
          </div>
        ) : (
          /* Browser App - fullscreen with fixed header/footer */
          <div className="flex-1 flex flex-col min-h-0">
            {/* Fixed URL Bar at top */}
            <div
              className="flex-shrink-0 px-3 py-2 border-b border-gray-200 flex items-center gap-2"
              style={{
                background: '#f5f5f5',
                paddingTop: 'max(0.5rem, env(safe-area-inset-top))'
              }}
            >
              {/* Back Button */}
              <button
                onClick={handleBack}
                disabled={!canGoBack}
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: '#e5e5e5' }}
              >
                <svg
                  className={`w-4 h-4 ${canGoBack ? 'text-gray-700' : 'text-gray-400'}`}
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
                className="flex-1 h-8 text-center text-sm text-gray-600 font-medium px-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-400"
                style={{ background: '#e5e5e5' }}
                spellCheck={false}
              />
              {/* Favorites Button */}
              <button
                onClick={() => {
                  const favoritesPath = "/kemponet/kemponet-browser/favorites"
                  historyRef.current = [...historyRef.current.slice(0, historyIndexRef.current + 1), favoritesPath]
                  historyIndexRef.current = historyRef.current.length - 1
                  setCurrentPath(favoritesPath)
                  setIframeSrc(favoritesPath)
                  setIframeKey(k => k + 1)
                  forceUpdate({})
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: '#e5e5e5' }}
              >
                <svg
                  className="w-4 h-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </button>
            </div>

            {/* Scrollable content area - takes remaining space */}
            <div className="flex-1 min-h-0 overflow-hidden bg-white">
              <iframe
                key={iframeKey}
                ref={iframeRef}
                src={addMobileParam(iframeSrc)}
                className="w-full h-full border-0"
                style={{ background: "white" }}
              />
            </div>

            {/* Bottom Home Bar */}
            <div
              className="flex-shrink-0 flex items-center justify-center"
              style={{
                height: '56px',
                background: '#1a1a1a',
                paddingBottom: 'env(safe-area-inset-bottom)'
              }}
            >
              <button
                onClick={goHome}
                className="w-10 h-10 rounded-lg border-2 border-gray-600 hover:border-gray-400 active:border-white transition-colors"
                style={{ background: '#111' }}
              />
            </div>
          </div>
        )}
      </div>
    )
  }

  // Desktop view with phone frame
  return (
    <div className="bg-black flex flex-col items-center justify-center p-4" style={{ minHeight: 'calc(100vh - 56px)' }}>
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
            className="w-full h-full rounded-[42px] overflow-hidden relative flex flex-col pt-3"
            style={{
              background: '#000',
            }}
          >
            {/* Status Bar */}
            <div className="h-8 px-8 flex items-center justify-between relative z-20" style={{ background: '#000' }}>
              {/* Left - Time */}
              <span className="text-white text-sm font-semibold">{currentTime || "9:41"}</span>

              {/* Right - Icons */}
              <div className="flex items-center gap-1">
                {/* Signal bars */}
                <div className="flex items-end gap-[2px] h-3">
                  <div className="w-[3px] h-1 bg-white rounded-sm" />
                  <div className="w-[3px] h-[6px] bg-white rounded-sm" />
                  <div className="w-[3px] h-2 bg-white rounded-sm" />
                  <div className="w-[3px] h-3 bg-gray-500 rounded-sm" />
                </div>
                {/* Battery */}
                <div className="flex items-center ml-1">
                  <div className="w-6 h-3 border border-white rounded-sm relative overflow-hidden p-[2px]">
                    <div className="h-full w-full flex rounded-[1px] overflow-hidden">
                      <div className="h-full bg-white" style={{ width: '80%' }} />
                      <div className="h-full bg-gray-500 flex-1" />
                    </div>
                  </div>
                  <div className="w-[2px] h-[5px] bg-white rounded-r-sm ml-[1px]" />
                </div>
              </div>
            </div>

            {/* Main Screen Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {activeApp === null ? (
                /* Home Screen */
                <div
                  className="flex-1 px-6 pt-6"
                  style={{
                    background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gridTemplateRows: 'repeat(4, 1fr)',
                  }}
                >
                  {/* App Grid */}
                  {/* Row 1: KempoNet, FlipFlop, SoundWaves */}
                  <div className="flex justify-center items-start pt-2">
                    <AppIcon appId="browser" onClick={() => openApp("browser")} size="small" />
                  </div>
                  <div className="flex justify-center items-start pt-2">
                    <AppIcon appId="flipflop" onClick={() => openApp("flipflop")} size="small" />
                  </div>
                  <div className="flex justify-center items-start pt-2">
                    <AppIcon appId="soundwaves" onClick={() => openApp("soundwaves")} size="small" />
                  </div>
                  {/* Row 2: KempoTube */}
                  <div className="flex justify-center items-start pt-2">
                    <AppIcon appId="kempotube" onClick={() => openApp("kempotube")} size="small" />
                  </div>
                </div>
              ) : isFullscreenApp ? (
                /* Fullscreen apps - no browser UI */
                <div className="flex-1 overflow-hidden bg-black">
                  <iframe
                    key={iframeKey}
                    ref={iframeRef}
                    src={addMobileParam(iframeSrc)}
                    className="w-full h-full border-0"
                    style={{ background: "black" }}
                  />
                </div>
              ) : (
                /* Browser App */
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
                      onClick={() => {
                        const favoritesPath = "/kemponet/kemponet-browser/favorites"
                        historyRef.current = [...historyRef.current.slice(0, historyIndexRef.current + 1), favoritesPath]
                        historyIndexRef.current = historyRef.current.length - 1
                        setCurrentPath(favoritesPath)
                        setIframeSrc(favoritesPath)
                        setIframeKey(k => k + 1)
                        forceUpdate({})
                      }}
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: '#e5e5e5' }}
                    >
                      <svg
                        className="w-3 h-3 text-gray-500"
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
                      src={addMobileParam(iframeSrc)}
                      className="w-full h-full border-0"
                      style={{ background: "white" }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Home Button */}
            <div className="h-12 flex items-center justify-center" style={{ background: '#1a1a1a' }}>
              <button
                onClick={goHome}
                className="w-8 h-8 rounded-md border-2 border-gray-600 hover:border-gray-400 transition-colors"
                style={{ background: '#111' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// App icon component - renders the correct icon for each app
function AppIcon({ appId, onClick, size }: { appId: AppId; onClick: () => void; size: "small" | "large" }) {
  const app = MOBILE_APPS[appId]
  const iconSize = size === "large" ? "w-16 h-16 rounded-2xl" : "w-14 h-14 rounded-xl"
  const labelSize = size === "large" ? "text-xs" : "text-[11px]"
  const svgSize = size === "large" ? 28 : 24
  const compassSize = size === "large" ? "w-9 h-9" : "w-8 h-8"
  const pointerSize = size === "large" ? { border: 6, height: 18 } : { border: 5, height: 16 }
  const dotSize = size === "large" ? "w-3 h-3" : "w-2.5 h-2.5"

  const renderIcon = () => {
    switch (appId) {
      case "browser":
        return (
          <div
            className={`${iconSize} flex items-center justify-center relative`}
            style={{
              background: 'linear-gradient(135deg, #60a5fa 0%, #1d4ed8 100%)',
              boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.25)',
            }}
          >
            {/* Compass needle */}
            <div className={`absolute ${compassSize} -rotate-45`}>
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2"
                style={{
                  width: 0, height: 0,
                  borderLeft: `${pointerSize.border}px solid transparent`,
                  borderRight: `${pointerSize.border}px solid transparent`,
                  borderBottom: `${pointerSize.height}px solid white`,
                }}
              />
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2"
                style={{
                  width: 0, height: 0,
                  borderLeft: `${pointerSize.border}px solid transparent`,
                  borderRight: `${pointerSize.border}px solid transparent`,
                  borderTop: `${pointerSize.height}px solid rgba(255,255,255,0.35)`,
                }}
              />
            </div>
            <div className={`absolute ${dotSize} rounded-full bg-white z-10`} />
          </div>
        )
      case "flipflop":
        return (
          <div
            className={`${iconSize} flex items-center justify-center`}
            style={{
              background: 'linear-gradient(135deg, #f472b6 0%, #db2777 100%)',
              boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.25)',
            }}
          >
            <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="white">
              <path d="M12 4l-8 8h5v8h6v-8h5z" />
            </svg>
          </div>
        )
      case "soundwaves":
        return (
          <div
            className={`${iconSize} flex items-center justify-center`}
            style={{
              background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
              boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.25)',
            }}
          >
            <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="white">
              <path d="M12 3v18M8 7v10M4 10v4M16 7v10M20 10v4" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
            </svg>
          </div>
        )
      case "kempotube":
        return (
          <div
            className={`${iconSize} flex items-center justify-center`}
            style={{
              background: 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)',
              boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.25)',
            }}
          >
            {/* Two arrows + vertical line (fast-forward style logo) */}
            <svg width={svgSize} height={svgSize * 0.73} viewBox="0 0 22 16" fill="white">
              <path d="M0 0L7 8L0 16V0Z" />
              <path d="M8 0L15 8L8 16V0Z" />
              <rect x="18" y="0" width="3" height="16" />
            </svg>
          </div>
        )
    }
  }

  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1">
      {renderIcon()}
      <span className={`text-white ${labelSize} font-medium`}>{app.label}</span>
    </button>
  )
}
