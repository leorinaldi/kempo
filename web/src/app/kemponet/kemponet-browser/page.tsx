"use client"

import { useState, useEffect } from "react"

const DEFAULT_HOME = "kttp://giggle"

export default function KempoNetPage() {
  const [homePage, setHomePage] = useState(DEFAULT_HOME)
  const [showAddressBar, setShowAddressBar] = useState(true)
  const [saved, setSaved] = useState(false)

  // Load saved settings on mount
  useEffect(() => {
    const savedHome = localStorage.getItem("kemponet-home")
    if (savedHome) {
      setHomePage(savedHome)
    }
    const savedShowAddressBar = localStorage.getItem("kemponet-show-address-bar")
    if (savedShowAddressBar !== null) {
      setShowAddressBar(savedShowAddressBar === "true")
    }
  }, [])

  const notifyParent = (home: string, showAddress: boolean) => {
    // Notify parent KempoNet window that settings changed
    try {
      if (window.top && window.top !== window) {
        window.top.postMessage({
          type: "kemponet-settings-changed",
          showAddressBar: showAddress,
          home: home,
        }, window.location.origin)
      }
    } catch (e) {
      // Cross-origin access blocked, ignore
    }
  }

  const handleSave = () => {
    localStorage.setItem("kemponet-home", homePage)
    localStorage.setItem("kemponet-show-address-bar", String(showAddressBar))
    notifyParent(homePage, showAddressBar)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = () => {
    setHomePage(DEFAULT_HOME)
    setShowAddressBar(true)
    localStorage.setItem("kemponet-home", DEFAULT_HOME)
    localStorage.setItem("kemponet-show-address-bar", "true")
    notifyParent(DEFAULT_HOME, true)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-screen" style={{ background: "#f5f5f0" }}>
      {/* Header */}
      <div
        className="border-b-4 border-gray-900 px-6 py-4"
        style={{ background: "linear-gradient(180deg, #1e40af 0%, #1e3a8a 100%)" }}
      >
        <div className="flex items-center gap-4">
          {/* KempoNet logo */}
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center relative"
            style={{
              background: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)',
              boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.4), 0 0 0 3px white',
            }}
          >
            {/* Compass needle - pointing NE */}
            <div className="absolute w-7 h-7 -rotate-45">
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2"
                style={{
                  width: 0, height: 0,
                  borderLeft: '5px solid transparent',
                  borderRight: '5px solid transparent',
                  borderBottom: '14px solid white',
                }}
              />
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2"
                style={{
                  width: 0, height: 0,
                  borderLeft: '5px solid transparent',
                  borderRight: '5px solid transparent',
                  borderTop: '14px solid rgba(255,255,255,0.4)',
                }}
              />
            </div>
            {/* Center dot */}
            <div className="absolute w-2 h-2 rounded-full bg-white z-10" />
          </div>
          <div>
            <h1 className="text-white text-2xl font-bold" style={{ textShadow: "2px 2px 0 rgba(0,0,0,0.3)" }}>
              KempoNet Browser
            </h1>
            <p className="text-blue-200 text-sm">Version 3.0</p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-2xl mx-auto p-6">
        {/* Welcome section */}
        <div className="mb-8 p-4 border-2 border-gray-900 bg-white">
          <h2 className="text-lg font-bold mb-2" style={{ color: "#1e40af" }}>
            Welcome to KempoNet Browser!
          </h2>
          <p className="text-sm text-gray-700 mb-3">
            Thank you for choosing KempoNet Browser, the premier web browser for exploring
            the information superhighway. With lightning-fast broadband support, you&apos;re ready to surf!
          </p>
          <p className="text-xs text-gray-500 italic">
            &quot;KempoNet Browser - Your Window to the World&quot;
          </p>
        </div>

        {/* Quick Links */}
        <div className="mb-8 p-4 border-2 border-gray-900 bg-white">
          <h3 className="font-bold mb-3 pb-2 border-b-2 border-gray-300">Quick Links</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <a href="/kemponet/kemponet-browser/favorites?kemponet=1" className="text-blue-700 underline hover:text-blue-900">
              → Favorites
            </a>
            <a href="/kemponet/giggle?kemponet=1" className="text-blue-700 underline hover:text-blue-900">
              → Giggle Search
            </a>
            <a href="/kemponet/kempopedia?kemponet=1" className="text-blue-700 underline hover:text-blue-900">
              → Kempopedia
            </a>
            <a href="/kemponet/kempotube?kemponet=1" className="text-blue-700 underline hover:text-blue-900">
              → KempoTube
            </a>
          </div>
        </div>

        {/* Browser Settings */}
        <div className="p-4 border-2 border-gray-900 bg-white">
          <h3 className="font-bold mb-4 pb-2 border-b-2 border-gray-300 flex items-center gap-2">
            <span>⚙</span> Browser Settings
          </h3>

          {/* Home Page Setting */}
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2">
              Home Page Location:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={homePage}
                onChange={(e) => setHomePage(e.target.value)}
                className="flex-1 px-2 py-1 text-sm font-mono border-2 border-gray-900 outline-none"
                style={{ background: "#fffef8" }}
                placeholder="kttp://giggle"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              This page will open when you click the Home button or start KempoNet Browser.
            </p>
          </div>

          {/* Display Options */}
          <div className="mb-4 pt-3 border-t border-gray-200">
            <label className="block text-sm font-bold mb-2">
              Display Options:
            </label>
            <div className="space-y-1 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAddressBar}
                  onChange={(e) => setShowAddressBar(e.target.checked)}
                  className="border-2 border-gray-900"
                />
                Show address bar
              </label>
            </div>
          </div>

          {/* Save buttons */}
          <div className="flex gap-2 pt-3 border-t border-gray-200">
            <button
              onClick={handleSave}
              className="px-4 py-1 text-sm font-bold border-2 border-gray-900"
              style={{ background: "#d1d5db" }}
            >
              Save Settings
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-1 text-sm border-2 border-gray-900"
              style={{ background: "#d1d5db" }}
            >
              Reset to Defaults
            </button>
            {saved && (
              <span className="text-green-700 text-sm font-bold self-center">
                ✓ Saved!
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>© KempoSoft Corporation. All rights reserved.</p>
          <p>KempoNet Browser is a trademark of KempoSoft Corporation.</p>
        </div>
      </div>
    </div>
  )
}
