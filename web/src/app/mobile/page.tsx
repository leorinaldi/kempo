"use client"

import { useState, useRef, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"

const DEFAULT_HOME = "/kemponet/giggle"

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
  const [isRealMobile, setIsRealMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsRealMobile(window.innerWidth < 480)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Track which "app" is open (null = home screen)
  const [activeApp, setActiveApp] = useState<"browser" | null>(null)

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

  const canGoBack = historyIndexRef.current > 0

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

  // Open browser app
  const openBrowser = () => {
    // Reset browser state when opening
    historyRef.current = [DEFAULT_HOME]
    historyIndexRef.current = 0
    setCurrentPath(DEFAULT_HOME)
    setIframeSrc(DEFAULT_HOME)
    setIframeKey(k => k + 1)
    setActiveApp("browser")
  }

  // Open FlipFlop app
  const openFlipFlop = () => {
    const flipflopPath = "/kemponet/flipflop"
    historyRef.current = [flipflopPath]
    historyIndexRef.current = 0
    setCurrentPath(flipflopPath)
    setIframeSrc(flipflopPath)
    setIframeKey(k => k + 1)
    setActiveApp("browser")
  }

  // Go to home screen
  const goHome = () => {
    setActiveApp(null)
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
              {/* App Grid - KempoNet in position (1,1) */}
              <div className="flex justify-center items-start pt-2">
                {/* KempoNet Browser App */}
                <button
                  onClick={openBrowser}
                  className="flex flex-col items-center gap-1"
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center relative"
                    style={{
                      background: 'linear-gradient(135deg, #60a5fa 0%, #1d4ed8 100%)',
                      boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.25)',
                    }}
                  >
                    {/* Compass needle - pointing NE */}
                    <div className="absolute w-9 h-9 -rotate-45">
                      {/* North pointer (white) */}
                      <div
                        className="absolute top-0 left-1/2 -translate-x-1/2"
                        style={{
                          width: 0,
                          height: 0,
                          borderLeft: '6px solid transparent',
                          borderRight: '6px solid transparent',
                          borderBottom: '18px solid white',
                        }}
                      />
                      {/* South pointer (translucent white) */}
                      <div
                        className="absolute bottom-0 left-1/2 -translate-x-1/2"
                        style={{
                          width: 0,
                          height: 0,
                          borderLeft: '6px solid transparent',
                          borderRight: '6px solid transparent',
                          borderTop: '18px solid rgba(255,255,255,0.35)',
                        }}
                      />
                    </div>
                    {/* Center dot */}
                    <div className="absolute w-3 h-3 rounded-full bg-white z-10" />
                  </div>
                  <span className="text-white text-xs font-medium">KempoNet Browser</span>
                </button>
              </div>
              {/* FlipFlop App - centered in column 2 */}
              <div className="flex justify-center items-start pt-2">
                <button
                  onClick={openFlipFlop}
                  className="flex flex-col items-center gap-1"
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #f472b6 0%, #db2777 100%)',
                      boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.25)',
                    }}
                  >
                    {/* Up arrow icon */}
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                      <path d="M12 4l-8 8h5v8h6v-8h5z" />
                    </svg>
                  </div>
                  <span className="text-white text-xs font-medium">FlipFlop</span>
                </button>
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
                src={`${iframeSrc}?mobile=1`}
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
            className="w-full h-full rounded-[42px] overflow-hidden relative flex flex-col"
            style={{
              background: '#000',
            }}
          >
            {/* Status Bar */}
            <div className="h-8 px-8 flex items-center justify-between relative z-20" style={{ background: '#1a1a1a' }}>
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
                  {/* App Grid - KempoNet in position (1,1) */}
                  <div className="flex justify-center items-start pt-2">
                    {/* KempoNet Browser App */}
                    <button
                      onClick={openBrowser}
                      className="flex flex-col items-center gap-1"
                    >
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center relative"
                        style={{
                          background: 'linear-gradient(135deg, #60a5fa 0%, #1d4ed8 100%)',
                          boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.25)',
                        }}
                      >
                        {/* Compass needle - pointing NE */}
                        <div className="absolute w-8 h-8 -rotate-45">
                          {/* North pointer (white) */}
                          <div
                            className="absolute top-0 left-1/2 -translate-x-1/2"
                            style={{
                              width: 0,
                              height: 0,
                              borderLeft: '5px solid transparent',
                              borderRight: '5px solid transparent',
                              borderBottom: '16px solid white',
                            }}
                          />
                          {/* South pointer (translucent white) */}
                          <div
                            className="absolute bottom-0 left-1/2 -translate-x-1/2"
                            style={{
                              width: 0,
                              height: 0,
                              borderLeft: '5px solid transparent',
                              borderRight: '5px solid transparent',
                              borderTop: '16px solid rgba(255,255,255,0.35)',
                            }}
                          />
                        </div>
                        {/* Center dot */}
                        <div className="absolute w-2.5 h-2.5 rounded-full bg-white z-10" />
                      </div>
                      <span className="text-white text-[11px] font-medium">KempoNet Browser</span>
                    </button>
                  </div>
                  {/* FlipFlop App - centered */}
                  <div className="flex justify-center items-start pt-2">
                    <button
                      onClick={openFlipFlop}
                      className="flex flex-col items-center gap-1"
                    >
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, #f472b6 0%, #db2777 100%)',
                          boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.25)',
                        }}
                      >
                        {/* Up arrow icon */}
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                          <path d="M12 4l-8 8h5v8h6v-8h5z" />
                        </svg>
                      </div>
                      <span className="text-white text-[11px] font-medium">FlipFlop</span>
                    </button>
                  </div>
                  {/* Empty cell */}
                  <div />
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
                      src={`${iframeSrc}?mobile=1`}
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
