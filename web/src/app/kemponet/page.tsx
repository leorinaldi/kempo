"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"

export default function KempoNetPage() {
  const [selectedOption, setSelectedOption] = useState("kempopedia")
  const [currentPage, setCurrentPage] = useState<"kemple" | "browsing">("kemple")
  const [currentPath, setCurrentPath] = useState("/kempopedia")
  const [windowState, setWindowState] = useState<"open" | "minimized" | "closed">("closed")
  const [goMenuOpen, setGoMenuOpen] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Use refs for history to avoid closure issues
  const historyRef = useRef<string[]>([])
  const historyIndexRef = useRef(-1)
  const isNavigatingRef = useRef(false)
  const [, forceUpdate] = useState({})

  const handleSearch = () => {
    if (selectedOption === "kempopedia") {
      const newPath = "/kempopedia"
      historyRef.current = [...historyRef.current.slice(0, historyIndexRef.current + 1), newPath]
      historyIndexRef.current = historyRef.current.length - 1
      setCurrentPath(newPath)
      setCurrentPage("browsing")
      forceUpdate({})
    } else if (selectedOption === "kempotube") {
      const newPath = "/kempotube"
      historyRef.current = [...historyRef.current.slice(0, historyIndexRef.current + 1), newPath]
      historyIndexRef.current = historyRef.current.length - 1
      setCurrentPath(newPath)
      setCurrentPage("browsing")
      forceUpdate({})
    }
  }

  const handleHomeClick = () => {
    setCurrentPage("kemple")
    setCurrentPath("/kempopedia")
    // Reset history when going home
    historyRef.current = []
    historyIndexRef.current = -1
    forceUpdate({})
  }

  const handleBack = () => {
    if (historyIndexRef.current > 0) {
      isNavigatingRef.current = true
      historyIndexRef.current -= 1
      setCurrentPath(historyRef.current[historyIndexRef.current])
      forceUpdate({})
    }
  }

  const handleForward = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      isNavigatingRef.current = true
      historyIndexRef.current += 1
      setCurrentPath(historyRef.current[historyIndexRef.current])
      forceUpdate({})
    }
  }

  const canGoBack = historyIndexRef.current > 0
  const canGoForward = historyIndexRef.current < historyRef.current.length - 1

  // Convert real path to kttp:// format
  const getAddressBarUrl = () => {
    if (currentPage === "kemple") {
      return "kttp://kemple"
    }
    // Convert /kempopedia/... to kttp://kempopedia/...
    if (currentPath.startsWith("/kempopedia")) {
      const path = currentPath.replace(/^\/kempopedia/, "")
      return `kttp://kempopedia${path}`
    }
    // Convert /kempotube/... to kttp://kempotube/...
    if (currentPath.startsWith("/kempotube")) {
      const path = currentPath.replace(/^\/kempotube/, "")
      return `kttp://kempotube${path}`
    }
    return `kttp://${currentPath.replace(/^\//, "")}`
  }

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

  // Listen for navigation messages from iframe
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
      } else if (event.data?.type === "kemponet-go-home") {
        // User clicked on base URL inside iframe - go to Kemple home
        setCurrentPage("kemple")
        setCurrentPath("/kempopedia")
        // Reset history when going home
        historyRef.current = []
        historyIndexRef.current = -1
        forceUpdate({})
      }
    }
    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [])

  const blueGlow = '0 0 20px rgba(100,150,255,1), 0 0 40px rgba(80,130,255,0.9), 0 0 60px rgba(60,120,255,0.8), 0 0 100px rgba(50,100,255,0.7), 0 0 150px rgba(40,80,255,0.5)'

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      {/* Back link */}
      <Link
        href="/"
        className="absolute top-4 left-4 text-white hover:underline transition-colors"
        style={{ textShadow: blueGlow }}
      >
        ← Back to Kempo
      </Link>

      {/* Title */}
      <h1 className="text-white text-3xl font-serif mb-8 tracking-wider" style={{ textShadow: blueGlow }}>
        KEMPONET
      </h1>

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
                    {/* KempoScape Navigator icon */}
                    <button
                      onClick={() => setWindowState("open")}
                      className="flex flex-col items-center w-16 p-1 hover:bg-blue-600/30 rounded ml-2"
                    >
                      {/* Ship's wheel / compass icon - graphic novel style */}
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center relative border-2 border-gray-900"
                        style={{
                          background: '#3b82f6',
                        }}
                      >
                        {/* Compass points */}
                        <div className="absolute w-full h-full">
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-2 bg-yellow-400 border border-gray-900"></div>
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-2 bg-yellow-400 border border-gray-900"></div>
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-1 bg-yellow-400 border border-gray-900"></div>
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-1 bg-yellow-400 border border-gray-900"></div>
                        </div>
                        {/* K in center */}
                        <span className="text-white font-bold text-sm z-10">K</span>
                      </div>
                      {/* Label */}
                      <span
                        className="text-white text-xs mt-1 text-center leading-tight font-bold"
                        style={{ textShadow: "1px 1px 0px rgba(0,0,0,1)" }}
                      >
                        KempoScape Navigator
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
                        {/* KempoScape Navigator */}
                        <button
                          onClick={() => {
                            setWindowState("open")
                            setGoMenuOpen(false)
                          }}
                          className="w-full px-2 py-1 flex items-center gap-2 text-xs text-left hover:bg-blue-700 hover:text-white"
                        >
                          {/* Small compass icon */}
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center relative flex-shrink-0 border-2 border-gray-900"
                            style={{
                              background: '#3b82f6',
                            }}
                          >
                            <div className="absolute w-full h-full">
                              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-1 bg-yellow-400"></div>
                              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-1 bg-yellow-400"></div>
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0.5 bg-yellow-400"></div>
                              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-0.5 bg-yellow-400"></div>
                            </div>
                            <span className="text-white font-bold text-[8px] z-10">K</span>
                          </div>
                          KempoScape Navigator
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
                        <span className="truncate">KempoScape Navigator</span>
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
                    <span className="text-white text-xs font-bold">{currentPage === "kemple" ? "Kemple" : currentPath.startsWith("/kempotube") ? "KempoTube" : "Kempopedia"} - KempoScape Navigator</span>
                    <div className="flex gap-1">
                      <div
                        onClick={() => setWindowState("minimized")}
                        className="w-4 h-4 bg-gray-300 border-2 border-gray-900 flex items-center justify-center text-xs font-bold text-black cursor-pointer hover:bg-gray-200"
                      >_</div>
                      <div
                        onClick={() => {
                          if (currentPage === "browsing" && currentPath) {
                            window.location.href = currentPath
                          } else {
                            window.location.href = selectedOption === "kempotube" ? "/kempotube" : "/kempopedia"
                          }
                        }}
                        className="w-4 h-4 bg-gray-300 border-2 border-gray-900 flex items-center justify-center text-xs font-bold text-black cursor-pointer hover:bg-gray-200"
                        title="Open in real browser"
                      >□</div>
                      <div
                        onClick={() => {
                          setWindowState("closed")
                          // Reset to Kemple when closing
                          setCurrentPage("kemple")
                          setCurrentPath("/kempopedia")
                          historyRef.current = []
                          historyIndexRef.current = -1
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
                    className="px-2 py-0.5 text-xs bg-gray-200 border-2 border-gray-900"
                  >
                    🏠 Home
                  </button>
                </div>

                {/* Address bar - graphic novel style */}
                <div
                  className="flex items-center gap-2 px-2 py-1 border-b border-gray-900"
                  style={{ background: '#d1d5db' }}
                >
                  <span className="text-xs font-bold">Address:</span>
                  <div
                    className="flex-1 px-2 py-0.5 text-xs font-mono border-2 border-gray-900"
                    style={{
                      background: 'white',
                    }}
                  >
                    {getAddressBarUrl()}
                  </div>
                </div>

                {/* Web content area */}
                <div className="flex-1 bg-white overflow-hidden">
                  {currentPage === "kemple" ? (
                    /* Kemple Search Page - graphic novel style */
                    <div className="h-full flex flex-col items-center justify-center px-4">
                      {/* Kemple Logo */}
                      <div className="mb-6">
                        <h2
                          className="text-5xl font-bold tracking-tight"
                          style={{
                            fontFamily: "serif",
                            textShadow: '2px 2px 0px rgba(0,0,0,0.3)',
                          }}
                        >
                          <span style={{ color: "#4285f4" }}>K</span>
                          <span style={{ color: "#ea4335" }}>e</span>
                          <span style={{ color: "#fbbc05" }}>m</span>
                          <span style={{ color: "#4285f4" }}>p</span>
                          <span style={{ color: "#34a853" }}>l</span>
                          <span style={{ color: "#ea4335" }}>e</span>
                        </h2>
                      </div>

                      {/* Search dropdown - graphic novel style */}
                      <div className="w-full max-w-sm">
                        <select
                          value={selectedOption}
                          onChange={(e) => setSelectedOption(e.target.value)}
                          className="w-full px-3 py-2 text-sm cursor-pointer border-2 border-gray-900"
                          style={{
                            background: "#fffef8",
                            color: "#000",
                            fontFamily: "monospace",
                            appearance: "none",
                            WebkitAppearance: "none",
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23000' d='M2 4l4 4 4-4z'/%3E%3C/svg%3E")`,
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "right 8px center",
                            paddingRight: "28px",
                          }}
                        >
                          <option value="kempopedia">Kempopedia</option>
                          <option value="kempotube">KempoTube</option>
                        </select>
                      </div>

                      {/* Search button - graphic novel style */}
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={handleSearch}
                          className="px-4 py-1 text-sm font-bold border-2 border-gray-900"
                          style={{
                            background: "#d1d5db",
                          }}
                        >
                          Kemple Search
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Browsing - iframe showing actual Kempopedia */
                    <iframe
                      key={currentPath}
                      ref={iframeRef}
                      src={`${currentPath}?kemponet=1`}
                      className="w-full h-full border-0"
                      style={{ background: "white" }}
                    />
                  )}
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

      {/* Attribution */}
      <p className="text-white text-sm mt-6 font-serif" style={{ textShadow: blueGlow }}>
        Browsing the Kempo Universe
      </p>
    </div>
  )
}
