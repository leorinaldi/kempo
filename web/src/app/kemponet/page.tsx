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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-700 to-slate-900 flex flex-col items-center justify-center p-4">
      {/* Back link */}
      <Link
        href="/"
        className="absolute top-4 left-4 text-slate-300/70 hover:text-slate-300 transition-colors"
      >
        ← Back to Kempo
      </Link>

      {/* Title */}
      <h1 className="text-slate-300 text-3xl font-serif mb-8 tracking-wider">
        KEMPONET
      </h1>

      {/* Monitor Unit */}
      <div className="relative">
        {/* Monitor Body */}
        <div
          className="w-[500px] h-[420px] rounded-xl p-4 relative"
          style={{
            background: "linear-gradient(145deg, #d4cfc4, #b8b3a8, #9e998f)",
            boxShadow: `
              0 20px 40px rgba(0,0,0,0.5),
              inset 0 2px 4px rgba(255,255,255,0.3),
              inset 0 -2px 4px rgba(0,0,0,0.2)
            `,
          }}
        >
          {/* Monitor bezel */}
          <div
            className="w-full h-full rounded-lg p-3 relative"
            style={{
              background: "linear-gradient(180deg, #3a3a3a, #2a2a2a)",
              boxShadow: "inset 0 2px 8px rgba(0,0,0,0.5)",
            }}
          >
            {/* Screen area with CRT effect */}
            <div
              className="w-full h-full rounded relative overflow-hidden"
              style={{
                background: "#008080",
                boxShadow: `
                  inset 0 0 30px rgba(0,0,0,0.5),
                  inset 0 0 60px rgba(0,0,0,0.3)
                `,
              }}
            >
              {/* CRT scanline effect */}
              <div
                className="absolute inset-0 pointer-events-none opacity-10"
                style={{
                  backgroundImage: `repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 2px,
                    rgba(0,0,0,0.3) 2px,
                    rgba(0,0,0,0.3) 4px
                  )`
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
                      className="flex flex-col items-center w-16 p-1 hover:bg-blue-600/30 rounded"
                    >
                      {/* Ship's wheel / compass icon like Netscape */}
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center relative"
                        style={{
                          background: "linear-gradient(135deg, #2563eb, #1e40af)",
                          border: "2px solid #60a5fa",
                          boxShadow: "2px 2px 4px rgba(0,0,0,0.4)",
                        }}
                      >
                        {/* Compass points */}
                        <div className="absolute w-full h-full">
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-2 bg-yellow-400"></div>
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-2 bg-yellow-400"></div>
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-1 bg-yellow-400"></div>
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-1 bg-yellow-400"></div>
                        </div>
                        {/* K in center */}
                        <span className="text-white font-bold text-sm z-10">K</span>
                      </div>
                      {/* Label */}
                      <span
                        className="text-white text-xs mt-1 text-center leading-tight"
                        style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.8)" }}
                      >
                        KempoScape Navigator
                      </span>
                    </button>

                    {/* About This PC Dialog */}
                    {showAbout && (
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ zIndex: 10 }}
                      >
                        <div
                          style={{
                            background: "#c0c0c0",
                            border: "2px outset #ffffff",
                            boxShadow: "4px 4px 8px rgba(0,0,0,0.5)",
                            width: "280px",
                          }}
                        >
                          {/* Title bar */}
                          <div
                            className="flex items-center justify-between px-2 py-1"
                            style={{
                              background: "linear-gradient(180deg, #000080, #000060)",
                            }}
                          >
                            <span className="text-white text-xs font-bold">About This PC</span>
                            <div
                              onClick={() => setShowAbout(false)}
                              className="w-4 h-4 bg-gray-300 border border-gray-400 flex items-center justify-center text-xs font-bold text-black cursor-pointer hover:bg-gray-200"
                            >×</div>
                          </div>

                          {/* Content */}
                          <div className="p-4">
                            {/* Portals logo */}
                            <div className="flex items-center gap-4 mb-4">
                              <div className="grid grid-cols-2 gap-1 w-12 h-12 transform -rotate-6">
                                <div style={{ background: "#1e3a8a", boxShadow: "1px 1px 2px rgba(0,0,0,0.3)" }}></div>
                                <div style={{ background: "#7dd3fc", boxShadow: "1px 1px 2px rgba(0,0,0,0.3)" }}></div>
                                <div style={{ background: "#7dd3fc", boxShadow: "1px 1px 2px rgba(0,0,0,0.3)" }}></div>
                                <div style={{ background: "#1e3a8a", boxShadow: "1px 1px 2px rgba(0,0,0,0.3)" }}></div>
                              </div>
                              <div>
                                <div className="font-bold text-sm">KempoSoft Portals 25</div>
                                <div className="text-xs text-gray-600">Version 25.0.1</div>
                              </div>
                            </div>

                            {/* System info */}
                            <div
                              className="text-xs space-y-1 p-2 mb-4"
                              style={{
                                background: "white",
                                border: "2px inset #808080",
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
                                className="px-6 py-1 text-xs font-bold"
                                style={{
                                  background: "#c0c0c0",
                                  border: "2px outset #ffffff",
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

                  {/* Taskbar */}
                  <div
                    className="h-8 flex items-center px-1 gap-1 relative"
                    style={{
                      background: "#c0c0c0",
                      borderTop: "2px solid #ffffff",
                    }}
                  >
                    {/* Go menu popup */}
                    {goMenuOpen && (
                      <div
                        className="absolute bottom-8 left-1"
                        style={{
                          background: "#c0c0c0",
                          border: "2px outset #ffffff",
                          minWidth: "180px",
                        }}
                      >
                        {/* KempoScape Navigator */}
                        <button
                          onClick={() => {
                            setWindowState("open")
                            setGoMenuOpen(false)
                          }}
                          className="w-full px-2 py-1 flex items-center gap-2 text-xs text-left hover:bg-[#000080] hover:text-white"
                        >
                          {/* Small compass icon */}
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center relative flex-shrink-0"
                            style={{
                              background: "linear-gradient(135deg, #2563eb, #1e40af)",
                              border: "1px solid #60a5fa",
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
                        <div className="mx-1 my-1 border-t border-gray-500 border-b border-b-white"></div>

                        {/* About This PC */}
                        <button
                          onClick={() => {
                            setShowAbout(true)
                            setGoMenuOpen(false)
                          }}
                          className="w-full px-2 py-1 flex items-center gap-2 text-xs text-left hover:bg-[#000080] hover:text-white"
                        >
                          {/* Computer icon */}
                          <div
                            className="w-6 h-6 flex items-center justify-center flex-shrink-0"
                          >
                            <div
                              className="w-5 h-4 rounded-sm"
                              style={{
                                background: "linear-gradient(180deg, #e0e0e0, #a0a0a0)",
                                border: "1px solid #606060",
                              }}
                            >
                              <div
                                className="w-3 h-2 mx-auto mt-0.5"
                                style={{ background: "#000080" }}
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
                      className="h-6 px-2 flex items-center gap-1 text-xs font-bold"
                      style={{
                        background: "#c0c0c0",
                        border: goMenuOpen ? "2px inset #808080" : "2px outset #ffffff",
                      }}
                    >
                      <div className="grid grid-cols-2 gap-px w-4 h-4">
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
                        className="h-6 px-2 flex items-center gap-1 text-xs flex-shrink min-w-0"
                        style={{
                          background: "#c0c0c0",
                          border: "2px inset #808080",
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
                /* Browser Window */
                <div className="h-full flex flex-col">
                  {/* Browser chrome - title bar */}
                  <div
                    className="flex items-center justify-between px-2 py-1"
                    style={{
                      background: "linear-gradient(180deg, #000080, #000060)",
                    }}
                  >
                    <span className="text-white text-xs font-bold">{currentPage === "kemple" ? "Kemple" : currentPath.startsWith("/kempotube") ? "KempoTube" : "Kempopedia"} - KempoScape Navigator</span>
                    <div className="flex gap-1">
                      <div
                        onClick={() => setWindowState("minimized")}
                        className="w-4 h-4 bg-gray-300 border border-gray-400 flex items-center justify-center text-xs font-bold text-black cursor-pointer hover:bg-gray-200"
                      >_</div>
                      <div
                        onClick={() => {
                          if (currentPage === "browsing" && currentPath) {
                            window.location.href = currentPath
                          } else {
                            window.location.href = selectedOption === "kempotube" ? "/kempotube" : "/kempopedia"
                          }
                        }}
                        className="w-4 h-4 bg-gray-300 border border-gray-400 flex items-center justify-center text-xs font-bold text-black cursor-pointer hover:bg-gray-200"
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
                        className="w-4 h-4 bg-gray-300 border border-gray-400 flex items-center justify-center text-xs font-bold text-black cursor-pointer hover:bg-gray-200"
                      >×</div>
                    </div>
                  </div>

                {/* Browser toolbar */}
                <div
                  className="flex items-center gap-2 px-2 py-1"
                  style={{ background: "#c0c0c0" }}
                >
                  {/* Navigation buttons */}
                  <button
                    onClick={handleBack}
                    disabled={!canGoBack}
                    className={`px-2 py-0.5 text-xs border-2 ${
                      canGoBack
                        ? "bg-gray-200 border-t-white border-l-white border-b-gray-500 border-r-gray-500"
                        : "bg-gray-300 border-t-gray-400 border-l-gray-400 border-b-gray-400 border-r-gray-400 text-gray-500"
                    }`}
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleForward}
                    disabled={!canGoForward}
                    className={`px-2 py-0.5 text-xs border-2 ${
                      canGoForward
                        ? "bg-gray-200 border-t-white border-l-white border-b-gray-500 border-r-gray-500"
                        : "bg-gray-300 border-t-gray-400 border-l-gray-400 border-b-gray-400 border-r-gray-400 text-gray-500"
                    }`}
                  >
                    → Forward
                  </button>
                  <button
                    onClick={handleHomeClick}
                    className="px-2 py-0.5 text-xs bg-gray-200 border-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500"
                  >
                    🏠 Home
                  </button>
                </div>

                {/* Address bar */}
                <div
                  className="flex items-center gap-2 px-2 py-1"
                  style={{ background: "#c0c0c0" }}
                >
                  <span className="text-xs font-bold">Address:</span>
                  <div
                    className="flex-1 px-2 py-0.5 text-xs font-mono"
                    style={{
                      background: "white",
                      border: "2px inset #808080"
                    }}
                  >
                    {getAddressBarUrl()}
                  </div>
                </div>

                {/* Web content area */}
                <div className="flex-1 bg-white overflow-hidden">
                  {currentPage === "kemple" ? (
                    /* Kemple Search Page */
                    <div className="h-full flex flex-col items-center justify-center px-4">
                      {/* Kemple Logo */}
                      <div className="mb-6">
                        <h2
                          className="text-5xl font-bold tracking-tight"
                          style={{
                            fontFamily: "serif",
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

                      {/* Search dropdown */}
                      <div className="w-full max-w-sm">
                        <select
                          value={selectedOption}
                          onChange={(e) => setSelectedOption(e.target.value)}
                          className="w-full px-3 py-2 text-sm cursor-pointer"
                          style={{
                            border: "2px inset #808080",
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

                      {/* Search button */}
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={handleSearch}
                          className="px-4 py-1 text-sm"
                          style={{
                            background: "#e0e0e0",
                            border: "2px outset #ffffff",
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

              {/* CRT screen curvature overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(
                    ellipse at center,
                    transparent 0%,
                    transparent 70%,
                    rgba(0,0,0,0.15) 100%
                  )`,
                }}
              />
            </div>
          </div>

        </div>

        {/* Monitor stand */}
        <div className="flex justify-center">
          <div
            className="w-32 h-4"
            style={{
              background: "linear-gradient(180deg, #b8b3a8, #9e998f)",
              boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
            }}
          />
        </div>
        <div className="flex justify-center">
          <div
            className="w-48 h-3 rounded-b-lg"
            style={{
              background: "linear-gradient(180deg, #9e998f, #8a857b)",
              boxShadow: "0 4px 8px rgba(0,0,0,0.4)",
            }}
          />
        </div>
      </div>

      {/* Attribution */}
      <p className="text-slate-400/50 text-xs mt-6 font-serif">
        Browsing the Kempo Universe
      </p>
    </div>
  )
}
