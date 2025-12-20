"use client"

import { useState, useRef, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

// KempoNet default home page
const DEFAULT_HOME = "/kemponet/kemple"

// Convert kttp:// URL to real path
const kttpToPath = (kttp: string): string => {
  const trimmed = kttp.trim().toLowerCase()
  if (trimmed.startsWith("kttp://")) {
    return `/kemponet/${trimmed.slice(7)}`
  }
  return DEFAULT_HOME
}

export default function PCPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <PCContent />
    </Suspense>
  )
}

function PCContent() {
  const searchParams = useSearchParams()
  const urlParam = searchParams.get("url")
  const initialPath = urlParam ? kttpToPath(urlParam) : null

  // Skip intro if coming from a URL param (e.g., from the compass button)
  const skipIntro = !!urlParam

  const [browserHome, setBrowserHome] = useState(DEFAULT_HOME)
  const [currentPath, setCurrentPath] = useState(initialPath || DEFAULT_HOME)
  const [windowState, setWindowState] = useState<"open" | "minimized" | "closed">(skipIntro ? "open" : "closed")
  const [goMenuOpen, setGoMenuOpen] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const [addressBarValue, setAddressBarValue] = useState("")
  const [showAddressBar, setShowAddressBar] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Intro animation state
  const [introPhase, setIntroPhase] = useState<"waiting" | "moving" | "hovering" | "clicking" | "done">(skipIntro ? "done" : "waiting")
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 50 }) // percentage position

  // Use refs for history to avoid closure issues
  const historyRef = useRef<string[]>([initialPath || DEFAULT_HOME])
  const historyIndexRef = useRef(0)
  const isNavigatingRef = useRef(false)
  const [, forceUpdate] = useState({})
  const [iframeSrc, setIframeSrc] = useState(initialPath || DEFAULT_HOME)
  const [iframeKey, setIframeKey] = useState(0)

  // Intro animation sequence
  useEffect(() => {
    if (skipIntro || introPhase === "done") return

    if (introPhase === "waiting") {
      // Start moving after a short delay
      const timer = setTimeout(() => {
        setIntroPhase("moving")
      }, 500)
      return () => clearTimeout(timer)
    }

    if (introPhase === "moving") {
      // Animate cursor to icon position (top-left area where icon is)
      setCursorPos({ x: 18, y: 22 })
      const timer = setTimeout(() => {
        setIntroPhase("hovering")
      }, 1200)
      return () => clearTimeout(timer)
    }

    if (introPhase === "hovering") {
      // Pause on icon so user can read the label
      const timer = setTimeout(() => {
        setIntroPhase("clicking")
      }, 300)
      return () => clearTimeout(timer)
    }

    if (introPhase === "clicking") {
      // Brief pause for "click", then open browser
      const timer = setTimeout(() => {
        setWindowState("open")
        setIntroPhase("done")
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [introPhase, skipIntro])

  // Load settings from localStorage on mount (but don't override URL param)
  useEffect(() => {
    const savedHome = localStorage.getItem("kemponet-home")
    if (savedHome) {
      const homePath = kttpToPath(savedHome)
      setBrowserHome(homePath)
      // Only update current path if we haven't navigated yet AND no URL param was provided
      if (!isInitialized && !initialPath) {
        setCurrentPath(homePath)
        setIframeSrc(homePath)
        historyRef.current = [homePath]
        historyIndexRef.current = 0
      }
    }
    const savedShowAddressBar = localStorage.getItem("kemponet-show-address-bar")
    if (savedShowAddressBar !== null) {
      setShowAddressBar(savedShowAddressBar === "true")
    }
    setIsInitialized(true)
  }, [isInitialized, initialPath])

  const handleHomeClick = () => {
    // Navigate to browser home page
    if (currentPath !== browserHome) {
      historyRef.current = [...historyRef.current.slice(0, historyIndexRef.current + 1), browserHome]
      historyIndexRef.current = historyRef.current.length - 1
    }
    setCurrentPath(browserHome)
    setIframeSrc(browserHome)
    setIframeKey(k => k + 1)
    forceUpdate({})
  }

  const handleBack = () => {
    if (historyIndexRef.current > 0) {
      isNavigatingRef.current = true
      historyIndexRef.current -= 1
      const newPath = historyRef.current[historyIndexRef.current]
      setCurrentPath(newPath)
      setIframeSrc(newPath)
      setIframeKey(k => k + 1) // Force iframe reload
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
      setIframeKey(k => k + 1) // Force iframe reload
      forceUpdate({})
    }
  }

  const canGoBack = historyIndexRef.current > 0
  const canGoForward = historyIndexRef.current < historyRef.current.length - 1

  // Convert real path to kttp:// format
  // /kemponet/xyz → kttp://xyz
  const getAddressBarUrl = (path: string) => {
    return `kttp://${path.replace(/^\/kemponet\//, "")}`
  }

  // Convert kttp:// URL to real path
  // kttp://xyz → /kemponet/xyz
  const parseAddressBarUrl = (url: string): string | null => {
    const trimmed = url.trim().toLowerCase()
    // Handle kttp:// prefix
    if (trimmed.startsWith("kttp://")) {
      return `/kemponet/${trimmed.slice(7)}`
    }
    // Also allow just typing the site name without protocol
    if (trimmed && !trimmed.includes("://")) {
      return `/kemponet/${trimmed}`
    }
    return null
  }

  // Handle address bar navigation
  const handleAddressBarKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const newPath = parseAddressBarUrl(addressBarValue)
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

  // Keep address bar in sync with current path
  useEffect(() => {
    setAddressBarValue(getAddressBarUrl(currentPath))
  }, [currentPath])

  // Close Go menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (goMenuOpen) {
        setGoMenuOpen(false)
      }
    }
    // Use a slight delay to avoid closing immediately when opening
    const timer = setTimeout(() => {
      if (goMenuOpen) {
        document.addEventListener("click", handleClickOutside)
      }
    }, 0)
    return () => {
      clearTimeout(timer)
      document.removeEventListener("click", handleClickOutside)
    }
  }, [goMenuOpen])

  // Listen for messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "kemponet-navigation") {
        const newPath = event.data.path
        const currentHistoryPath = historyRef.current[historyIndexRef.current]

        // Only add to history if this is a new navigation (not back/forward and different path)
        if (!isNavigatingRef.current && newPath !== currentHistoryPath) {
          historyRef.current = [...historyRef.current.slice(0, historyIndexRef.current + 1), newPath]
          historyIndexRef.current = historyRef.current.length - 1
          forceUpdate({})
        }
        isNavigatingRef.current = false
        setCurrentPath(newPath)
      } else if (event.data?.type === "kemponet-settings-changed") {
        // Settings were changed in kemponet - apply immediately
        setShowAddressBar(event.data.showAddressBar)
        if (event.data.home) {
          setBrowserHome(kttpToPath(event.data.home))
        }
      }
    }
    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [])

  // Listen for storage changes from iframe (settings updates)
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "kemponet-show-address-bar") {
        setShowAddressBar(event.newValue === "true")
      } else if (event.key === "kemponet-home" && event.newValue) {
        setBrowserHome(kttpToPath(event.newValue))
      }
    }
    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  const blueGlow = '0 0 20px rgba(100,150,255,1), 0 0 40px rgba(80,130,255,0.9), 0 0 60px rgba(60,120,255,0.8), 0 0 100px rgba(50,100,255,0.7), 0 0 150px rgba(40,80,255,0.5)'

  return (
    <div className="bg-black flex flex-col items-center justify-center p-4" style={{ minHeight: 'calc(100vh - 56px)' }}>
      {/* Monitor Unit - Modern Graphic Novel Style */}
      <div
        className="relative"
        style={{
          filter: 'drop-shadow(0 0 15px rgba(100,150,255,0.4)) drop-shadow(0 0 30px rgba(80,130,255,0.3))',
        }}
      >
        {/* Hard shadow behind monitor */}
        <div
          className="absolute top-3 left-3 w-[calc(100vw-2rem)] sm:w-[650px] h-[400px] sm:h-[500px] rounded-lg"
          style={{
            background: '#1a1a1a',
          }}
        />

        {/* Monitor Body */}
        <div
          className="w-[calc(100vw-2rem)] sm:w-[650px] h-[400px] sm:h-[500px] rounded-lg p-2 sm:p-4 relative border-4 border-gray-900"
          style={{
            background: '#9ca3af',
          }}
        >
          {/* Monitor bezel */}
          <div
            className="w-full h-full rounded border-4 border-gray-900 p-3 relative"
            style={{
              background: '#374151',
            }}
          >
            {/* Screen area */}
            <div
              className="w-full h-full rounded border-2 border-gray-900 relative overflow-hidden"
              style={{
                background: '#008080',
              }}
            >
              {/* Screen glare - graphic novel style */}
              <div
                className="absolute top-0 left-0 w-1/4 h-1/4 pointer-events-none z-30"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%)',
                }}
              />

              {/* Desktop when minimized or closed */}
              {windowState !== "open" ? (
                <div className="h-full flex flex-col">
                  {/* Desktop area */}
                  <div className="flex-1 p-2 relative">
                    {/* Animated mouse cursor during intro */}
                    {introPhase !== "done" && (
                      <div
                        className="absolute z-50 pointer-events-none transition-all duration-[1200ms] ease-out"
                        style={{
                          left: `${cursorPos.x}%`,
                          top: `${cursorPos.y}%`,
                          transform: 'translate(-2px, -2px)',
                        }}
                      >
                        {/* Mouse cursor arrow */}
                        <svg
                          width="20"
                          height="24"
                          viewBox="0 0 20 24"
                          fill="none"
                          className={introPhase === "clicking" ? "scale-90" : ""}
                          style={{ transition: "transform 0.1s" }}
                        >
                          <path
                            d="M2 2L2 20L6 16L10 22L13 20L9 14L15 14L2 2Z"
                            fill="white"
                            stroke="black"
                            strokeWidth="1.5"
                          />
                        </svg>
                      </div>
                    )}

                    {/* KempoNet icon */}
                    <button
                      onClick={() => setWindowState("open")}
                      className="flex flex-col items-center w-16 p-1 hover:bg-blue-600/30 rounded ml-8 mt-6"
                    >
                      {/* Compass icon - graphic novel style */}
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center relative"
                        style={{
                          background: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)',
                          boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.4), 0 0 0 2px #1e3a5f',
                        }}
                      >
                        {/* Compass needle - pointing NE */}
                        <div className="absolute w-6 h-6 -rotate-45">
                          {/* North pointer (white) */}
                          <div
                            className="absolute top-0 left-1/2 -translate-x-1/2"
                            style={{
                              width: 0,
                              height: 0,
                              borderLeft: '4px solid transparent',
                              borderRight: '4px solid transparent',
                              borderBottom: '12px solid white',
                            }}
                          />
                          {/* South pointer (light blue) */}
                          <div
                            className="absolute bottom-0 left-1/2 -translate-x-1/2"
                            style={{
                              width: 0,
                              height: 0,
                              borderLeft: '4px solid transparent',
                              borderRight: '4px solid transparent',
                              borderTop: '12px solid rgba(255,255,255,0.4)',
                            }}
                          />
                        </div>
                        {/* Center dot */}
                        <div className="absolute w-2 h-2 rounded-full bg-white z-10" />
                      </div>
                      {/* Label */}
                      <span
                        className="text-white text-xs mt-1 text-center leading-tight font-bold"
                        style={{ textShadow: "1px 1px 0px rgba(0,0,0,1)" }}
                      >
                        KempoNet Browser
                      </span>
                    </button>

                    {/* About This PC Dialog - graphic novel style */}
                    {showAbout && (
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ zIndex: 10 }}
                      >
                        <div
                          className="border-4 border-gray-900 rounded"
                          style={{
                            background: "#c0c0c0",
                            width: "280px",
                          }}
                        >
                          {/* Title bar */}
                          <div
                            className="flex items-center justify-between px-2 py-1 border-b-2 border-gray-900"
                            style={{
                              background: '#1e40af',
                            }}
                          >
                            <span className="text-white text-xs font-bold">About This PC</span>
                            <div
                              onClick={() => setShowAbout(false)}
                              className="w-4 h-4 bg-gray-300 border-2 border-gray-900 flex items-center justify-center text-xs font-bold text-black cursor-pointer hover:bg-gray-200"
                            >×</div>
                          </div>

                          {/* Content */}
                          <div className="p-4">
                            {/* Portals logo */}
                            <div className="flex items-center gap-4 mb-4">
                              <div className="grid grid-cols-2 gap-0.5 w-12 h-12 transform -rotate-6 border-2 border-gray-900">
                                <div style={{ background: "#1e3a8a" }}></div>
                                <div style={{ background: "#7dd3fc" }}></div>
                                <div style={{ background: "#7dd3fc" }}></div>
                                <div style={{ background: "#1e3a8a" }}></div>
                              </div>
                              <div>
                                <div className="font-bold text-sm">KempoSoft Portals 25</div>
                                <div className="text-xs text-gray-600">Version 25.0.1</div>
                              </div>
                            </div>

                            {/* System info */}
                            <div
                              className="text-xs space-y-1 p-2 mb-4 border-2 border-gray-900"
                              style={{
                                background: "white",
                              }}
                            >
                              <div><span className="font-bold">System:</span> Kempaq Scenario</div>
                              <div><span className="font-bold">Processor:</span> Kemptel Prontium II</div>
                              <div><span className="font-bold">Graphics:</span> Kvidia Nova 128</div>
                              <div><span className="font-bold">Memory:</span> 64 MB RAM</div>
                            </div>

                            {/* OK button */}
                            <div className="flex justify-center">
                              <button
                                onClick={() => setShowAbout(false)}
                                className="px-6 py-1 text-xs font-bold border-2 border-gray-900"
                                style={{
                                  background: "#d1d5db",
                                }}
                              >
                                OK
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Taskbar - graphic novel style */}
                  <div
                    className="h-8 flex items-center px-1 gap-1 relative border-t-2 border-gray-900"
                    style={{
                      background: "#d1d5db",
                    }}
                  >
                    {/* Go menu popup */}
                    {goMenuOpen && (
                      <div
                        className="absolute bottom-8 left-1 border-2 border-gray-900 rounded"
                        style={{
                          background: "#d1d5db",
                          minWidth: "180px",
                        }}
                      >
                        {/* KempoNet */}
                        <button
                          onClick={() => {
                            setWindowState("open")
                            setGoMenuOpen(false)
                          }}
                          className="w-full px-2 py-1 flex items-center gap-2 text-xs text-left hover:bg-blue-700 hover:text-white"
                        >
                          {/* Small compass icon */}
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center relative flex-shrink-0"
                            style={{
                              background: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)',
                              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.4), 0 0 0 2px #1e3a5f',
                            }}
                          >
                            <div className="absolute w-4 h-4 -rotate-45">
                              <div
                                className="absolute top-0 left-1/2 -translate-x-1/2"
                                style={{
                                  width: 0, height: 0,
                                  borderLeft: '2px solid transparent',
                                  borderRight: '2px solid transparent',
                                  borderBottom: '8px solid white',
                                }}
                              />
                              <div
                                className="absolute bottom-0 left-1/2 -translate-x-1/2"
                                style={{
                                  width: 0, height: 0,
                                  borderLeft: '2px solid transparent',
                                  borderRight: '2px solid transparent',
                                  borderTop: '8px solid rgba(255,255,255,0.4)',
                                }}
                              />
                            </div>
                            <div className="absolute w-1 h-1 rounded-full bg-white z-10" />
                          </div>
                          KempoNet Browser
                        </button>

                        {/* Separator */}
                        <div className="mx-1 my-1 border-t-2 border-gray-900"></div>

                        {/* About This PC */}
                        <button
                          onClick={() => {
                            setShowAbout(true)
                            setGoMenuOpen(false)
                          }}
                          className="w-full px-2 py-1 flex items-center gap-2 text-xs text-left hover:bg-blue-700 hover:text-white"
                        >
                          {/* Computer icon */}
                          <div
                            className="w-6 h-6 flex items-center justify-center flex-shrink-0"
                          >
                            <div
                              className="w-5 h-4 rounded-sm border-2 border-gray-900"
                              style={{
                                background: '#9ca3af',
                              }}
                            >
                              <div
                                className="w-3 h-2 mx-auto mt-0.5"
                                style={{ background: '#1e40af' }}
                              ></div>
                            </div>
                          </div>
                          About This PC
                        </button>
                      </div>
                    )}

                    {/* Go button */}
                    <button
                      onClick={() => setGoMenuOpen(!goMenuOpen)}
                      className="h-6 px-2 flex items-center gap-1 text-xs font-bold border-2 border-gray-900"
                      style={{
                        background: goMenuOpen ? '#9ca3af' : '#d1d5db',
                      }}
                    >
                      <div className="grid grid-cols-2 gap-px w-4 h-4 border border-gray-900">
                        <div style={{ background: "#1e3a8a" }}></div>
                        <div style={{ background: "#7dd3fc" }}></div>
                        <div style={{ background: "#7dd3fc" }}></div>
                        <div style={{ background: "#1e3a8a" }}></div>
                      </div>
                      Go
                    </button>

                    {/* Minimized window button - only show when minimized, not closed */}
                    {windowState === "minimized" && (
                      <button
                        onClick={() => setWindowState("open")}
                        className="h-6 px-2 flex items-center gap-1 text-xs flex-shrink min-w-0 border-2 border-gray-900"
                        style={{
                          background: '#9ca3af',
                          maxWidth: "150px",
                        }}
                      >
                        <span className="truncate">KempoNet Browser</span>
                      </button>
                    )}

                    {/* Spacer */}
                    <div className="flex-1"></div>
                  </div>
                </div>
              ) : (
                /* Browser Window - graphic novel style */
                <div className="h-full flex flex-col">
                  {/* Browser chrome - title bar */}
                  <div
                    className="flex items-center justify-between px-2 py-1 border-b-2 border-gray-900"
                    style={{
                      background: '#1e40af',
                    }}
                  >
                    <span className="text-white text-xs font-bold">KempoNet Browser</span>
                    <div className="flex gap-1">
                      <div
                        onClick={() => setWindowState("minimized")}
                        className="w-4 h-4 bg-gray-300 border-2 border-gray-900 flex items-center justify-center text-xs font-bold text-black cursor-pointer hover:bg-gray-200"
                      >_</div>
                      <div
                        onClick={() => {
                          window.location.href = currentPath
                        }}
                        className="w-4 h-4 bg-gray-300 border-2 border-gray-900 flex items-center justify-center text-xs font-bold text-black cursor-pointer hover:bg-gray-200"
                        title="Open in real browser"
                      >□</div>
                      <div
                        onClick={() => {
                          setWindowState("closed")
                          // Reset to home when closing
                          setCurrentPath(browserHome)
                          setIframeSrc(browserHome)
                          historyRef.current = [browserHome]
                          historyIndexRef.current = 0
                          setIframeKey(k => k + 1)
                        }}
                        className="w-4 h-4 bg-gray-300 border-2 border-gray-900 flex items-center justify-center text-xs font-bold text-black cursor-pointer hover:bg-gray-200"
                      >×</div>
                    </div>
                  </div>

                {/* Browser toolbar - graphic novel style */}
                <div
                  className="flex items-center gap-2 px-2 py-1 border-b border-gray-900"
                  style={{ background: '#d1d5db' }}
                >
                  {/* Navigation buttons */}
                  <button
                    onClick={handleBack}
                    disabled={!canGoBack}
                    className={`px-2 py-0.5 text-xs border-2 border-gray-900 ${
                      canGoBack
                        ? 'bg-gray-200'
                        : 'bg-gray-400 text-gray-500'
                    }`}
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleForward}
                    disabled={!canGoForward}
                    className={`px-2 py-0.5 text-xs border-2 border-gray-900 ${
                      canGoForward
                        ? 'bg-gray-200'
                        : 'bg-gray-400 text-gray-500'
                    }`}
                  >
                    → Forward
                  </button>
                  <button
                    onClick={handleHomeClick}
                    className="px-2 py-0.5 text-xs bg-gray-200 border-2 border-gray-900 flex items-center gap-1"
                  >
                    <svg width="12" height="11" viewBox="0 0 12 11" fill="none">
                      <path d="M6 1L1 5V10H4.5V7H7.5V10H11V5L6 1Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                      <rect x="8.5" y="0.5" width="2" height="3.5" fill="currentColor"/>
                    </svg>
                    Home
                  </button>

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Browser settings button */}
                  <button
                    onClick={() => {
                      const settingsPath = "/kemponet/kemponet-browser"
                      if (currentPath !== settingsPath) {
                        historyRef.current = [...historyRef.current.slice(0, historyIndexRef.current + 1), settingsPath]
                        historyIndexRef.current = historyRef.current.length - 1
                      }
                      setCurrentPath(settingsPath)
                      setIframeSrc(settingsPath)
                      setIframeKey(k => k + 1)
                      forceUpdate({})
                    }}
                    className="w-5 h-5 rounded-full flex items-center justify-center relative hover:opacity-80 mr-0.5"
                    style={{
                      background: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)',
                      boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.4), 0 0 0 1px #1e3a5f',
                    }}
                    title="KempoNet Settings"
                  >
                    <div className="absolute w-3 h-3 -rotate-45">
                      <div
                        className="absolute top-0 left-1/2 -translate-x-1/2"
                        style={{
                          width: 0, height: 0,
                          borderLeft: '2px solid transparent',
                          borderRight: '2px solid transparent',
                          borderBottom: '6px solid white',
                        }}
                      />
                      <div
                        className="absolute bottom-0 left-1/2 -translate-x-1/2"
                        style={{
                          width: 0, height: 0,
                          borderLeft: '2px solid transparent',
                          borderRight: '2px solid transparent',
                          borderTop: '6px solid rgba(255,255,255,0.4)',
                        }}
                      />
                    </div>
                    <div className="absolute w-1 h-1 rounded-full bg-white z-10" />
                  </button>
                </div>

                {/* Address bar - graphic novel style */}
                {showAddressBar && (
                  <div
                    className="flex items-center gap-2 px-2 py-1 border-b border-gray-900"
                    style={{ background: '#d1d5db' }}
                  >
                    <span className="text-xs font-bold">Address:</span>
                    <input
                      type="text"
                      value={addressBarValue}
                      onChange={(e) => setAddressBarValue(e.target.value)}
                      onKeyDown={handleAddressBarKeyDown}
                      className="flex-1 px-2 py-0.5 text-xs font-mono border-2 border-gray-900 outline-none"
                      style={{
                        background: 'white',
                      }}
                      spellCheck={false}
                    />
                  </div>
                )}

                {/* Web content area */}
                <div className="flex-1 bg-white overflow-hidden">
                  <iframe
                    key={iframeKey}
                    ref={iframeRef}
                    src={`${iframeSrc}?kemponet=1`}
                    className="w-full h-full border-0"
                    style={{ background: "white" }}
                  />
                </div>
              </div>
              )}

            </div>
          </div>

        </div>

        {/* Monitor stand - graphic novel style */}
        <div className="flex justify-center">
          <div
            className="w-32 h-12 border-4 border-t-0 border-gray-900"
            style={{
              background: '#9ca3af',
            }}
          />
        </div>
        <div className="flex justify-center">
          <div
            className="w-48 h-5 rounded-b border-4 border-t-0 border-gray-900"
            style={{
              background: '#6b7280',
            }}
          />
        </div>
      </div>

    </div>
  )
}
