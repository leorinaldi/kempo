'use client'

import Link from 'next/link'
import { Suspense, useEffect, useRef, useState } from 'react'
import { KempoNetRedirect } from '@/components/KempoNetRedirect'

// Module-level variables for tracking intro state
let hasPlayedIntro = false
let lastEffectTime = 0

const devices = [
  { name: 'Mobile', href: '/mobile' },
  { name: 'PC', href: '/pc' },
  { name: 'TV', href: '/tv' },
  { name: 'Radio', href: '/radio' },
]

// Radio icon component
function RadioIcon() {
  return (
    <div className="w-24 h-16 rounded-lg border-2 border-gray-600 relative" style={{ background: '#4a5568' }}>
      {/* Speaker grill */}
      <div className="absolute top-2 left-2 right-2 h-6 rounded border border-gray-700" style={{ background: '#1e293b' }}>
        <div className="flex flex-col justify-between h-full py-1 px-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-0.5 rounded-full" style={{ background: '#374151' }} />
          ))}
        </div>
      </div>
      {/* Bottom controls row */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
        {/* Left knob */}
        <div className="w-4 h-4 rounded-full border border-gray-700" style={{ background: '#374151' }} />
        {/* Display */}
        <div
          className="flex-1 mx-2 h-4 rounded border border-gray-700"
          style={{
            background: '#e5e7eb',
            boxShadow: '0 0 6px rgba(255,255,255,0.5)'
          }}
        />
        {/* Right knob */}
        <div className="w-4 h-4 rounded-full border border-gray-700" style={{ background: '#374151' }} />
      </div>
    </div>
  )
}

// TV icon component
function TVIcon() {
  return (
    <div className="w-24 h-20 rounded-lg border-2 border-gray-600 p-1 relative" style={{ background: '#4a5568' }}>
      {/* Screen bezel */}
      <div className="w-full h-[3.5rem] rounded border border-gray-700 p-0.5" style={{ background: '#2d3748' }}>
        {/* Screen */}
        <div className="w-full h-full rounded" style={{ background: '#0f172a' }} />
      </div>
      {/* Controls */}
      <div className="flex justify-end items-center gap-1 px-1 mt-0.5">
        <div className="w-2 h-2 rounded-full border border-gray-700" style={{ background: '#374151' }} />
        <div className="w-2 h-2 rounded-full border border-gray-700" style={{ background: '#374151' }} />
      </div>
    </div>
  )
}

// PC icon component
function PCIcon() {
  return (
    <div className="flex flex-col items-center">
      {/* Monitor */}
      <div className="w-24 h-16 rounded border-2 border-gray-600 p-1" style={{ background: '#9ca3af' }}>
        <div className="w-full h-full rounded border border-gray-700 p-0.5" style={{ background: '#374151' }}>
          <div className="w-full h-full rounded" style={{ background: '#008080' }} />
        </div>
      </div>
      {/* Stand */}
      <div className="w-8 h-2 border-x-2 border-gray-600" style={{ background: '#9ca3af' }} />
      <div className="w-12 h-1 rounded-b border-2 border-t-0 border-gray-600" style={{ background: '#6b7280' }} />
    </div>
  )
}

// Mobile icon component (iPhone style)
function MobileIcon() {
  return (
    <div
      className="w-12 h-24 rounded-xl border-2 border-gray-600 p-1 flex flex-col"
      style={{ background: '#1a1a1a' }}
    >
      {/* Dynamic Island */}
      <div className="w-6 h-1.5 rounded-full mx-auto mt-0.5" style={{ background: '#000' }} />
      {/* Screen */}
      <div
        className="flex-1 rounded-lg mt-1 mx-0.5"
        style={{ background: '#1e293b' }}
      />
      {/* Home Indicator */}
      <div className="w-8 h-1 rounded-full mx-auto mt-1 mb-0.5" style={{ background: '#374151' }} />
    </div>
  )
}

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isFirstVisit, setIsFirstVisit] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(1) // Start on PC
  const [videoEnded, setVideoEnded] = useState(false)
  const [videoRemoved, setVideoRemoved] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const now = Date.now()

    // Detect React Strict Mode double-invocation (happens within milliseconds)
    // Skip the second invocation to prevent it from interrupting the first
    if (now - lastEffectTime < 100) {
      return
    }
    lastEffectTime = now

    // Check if this is a page reload
    const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
    const isReload = navEntries.length > 0 && navEntries[0].type === 'reload'

    // Reset on reload (including hot module reload in development)
    if (isReload) {
      hasPlayedIntro = false
      sessionStorage.removeItem('kempoIntroPlayed')
    }

    // Check sessionStorage as backup (mobile browsers may unload JS on navigation)
    const hasPlayedInSession = sessionStorage.getItem('kempoIntroPlayed') === 'true'

    if ((hasPlayedIntro || hasPlayedInSession) && !isReload) {
      // Skip - returning from another page, remove video entirely
      setIsFirstVisit(false)
      setVideoEnded(true)
      setVideoRemoved(true)
    } else {
      // Play - first visit or page refresh
      setIsFirstVisit(true)
      video.play()
      hasPlayedIntro = true
      sessionStorage.setItem('kempoIntroPlayed', 'true')
    }
    setIsReady(true)
  }, [])

  const goLeft = () => {
    setCurrentIndex((prev) => (prev - 1 + devices.length) % devices.length)
  }

  const goRight = () => {
    setCurrentIndex((prev) => (prev + 1) % devices.length)
  }

  const currentDevice = devices[currentIndex]

  const blueGlow = '0 0 20px rgba(100,150,255,1), 0 0 40px rgba(80,130,255,0.9), 0 0 60px rgba(60,120,255,0.8), 0 0 100px rgba(50,100,255,0.7), 0 0 150px rgba(40,80,255,0.5)'

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black">
      {/* Video Background */}
      {!videoRemoved && (
        <video
          ref={videoRef}
          muted
          playsInline
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${videoEnded ? 'opacity-0' : 'opacity-100'}`}
          style={{ transform: 'scale(1.1) translateX(1%) translateY(-5%)' }}
          onEnded={() => {
            setVideoEnded(true)
            // Remove from DOM after fade completes
            setTimeout(() => setVideoRemoved(true), 1000)
          }}
        >
          <source src="/comic-tv-fades-to-black.mp4" type="video/mp4" />
        </video>
      )}


      <Suspense fallback={null}>
        <KempoNetRedirect />
      </Suspense>

      {/* Content */}
      <div className={`text-center relative z-10 mt-10 ${!isReady ? 'opacity-0' : ''}`}>
        <Link
          href="/about"
          className={`text-5xl font-serif mb-4 text-white tracking-[0.3em] uppercase pl-[0.3em] block hover:text-white transition-colors ${isFirstVisit ? 'opacity-0 animate-[fadeIn_4s_ease-out_0.5s_forwards]' : ''}`}
          style={{ textShadow: blueGlow }}
        >
          KEMPO
        </Link>
        <Link
          href="/about"
          className={`text-gray-300 mb-8 block hover:text-white transition-colors ${isFirstVisit ? 'opacity-0 animate-[fadeIn_4s_ease-out_2s_forwards]' : ''}`}
          style={{ textShadow: blueGlow }}
        >A (nearly) imaginary world.</Link>

        {/* Device Rotator */}
        <div
          className={`flex flex-col items-center gap-4 ${isFirstVisit ? 'opacity-0 animate-[fadeIn_4s_ease-out_3.5s_forwards]' : ''}`}
        >
          <div className="flex items-center justify-center gap-6">
            {/* Left Arrow */}
            <button
              onClick={goLeft}
              className="w-10 h-10 rounded-full border-2 border-gray-700 flex items-center justify-center hover:border-gray-500 transition-colors"
              style={{
                background: '#1f2937',
                boxShadow: '0 0 15px rgba(100,150,255,0.5), 0 0 30px rgba(80,130,255,0.3)'
              }}
            >
              <span className="text-white text-xl leading-none" style={{ marginRight: '2px' }}>‹</span>
            </button>

            {/* Device Icon & Label */}
            <Link href={currentDevice.href} className="flex flex-col items-center justify-center hover:opacity-80 transition-opacity h-28 w-32">
              <div
                className="p-4 rounded-lg"
                style={{
                  filter: 'drop-shadow(0 0 8px rgba(100,150,255,0.5)) drop-shadow(0 0 15px rgba(80,130,255,0.3))'
                }}
              >
                {currentIndex === 0 && <MobileIcon />}
                {currentIndex === 1 && <PCIcon />}
                {currentIndex === 2 && <TVIcon />}
                {currentIndex === 3 && <RadioIcon />}
              </div>
            </Link>

            {/* Right Arrow */}
            <button
              onClick={goRight}
              className="w-10 h-10 rounded-full border-2 border-gray-700 flex items-center justify-center hover:border-gray-500 transition-colors"
              style={{
                background: '#1f2937',
                boxShadow: '0 0 15px rgba(100,150,255,0.5), 0 0 30px rgba(80,130,255,0.3)'
              }}
            >
              <span className="text-white text-xl leading-none" style={{ marginLeft: '2px' }}>›</span>
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="flex gap-2">
            {devices.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-white'
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
                style={index === currentIndex ? { boxShadow: '0 0 8px rgba(100,150,255,0.8)' } : {}}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
