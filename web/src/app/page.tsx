'use client'

import Link from 'next/link'
import { Suspense, useEffect, useRef, useState } from 'react'
import { KempoNetRedirect } from '@/components/KempoNetRedirect'

// Module-level variables for tracking intro state
let hasPlayedIntro = false
let lastEffectTime = 0

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isFirstVisit, setIsFirstVisit] = useState(false)
  const [isReady, setIsReady] = useState(false)

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
      // Skip - returning from another page
      video.currentTime = video.duration || 999
      video.pause()
      setIsFirstVisit(false)
    } else {
      // Play - first visit or page refresh
      setIsFirstVisit(true)
      video.play()
      hasPlayedIntro = true
      sessionStorage.setItem('kempoIntroPlayed', 'true')
    }
    setIsReady(true)
  }, [])

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black">
      {/* Video Background */}
      <video
        ref={videoRef}
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover scale-110"
      >
        <source src="/comic-tv-fades-to-black.mp4" type="video/mp4" />
      </video>


      <Suspense fallback={null}>
        <KempoNetRedirect />
      </Suspense>

      {/* Content */}
      <div className={`text-center relative z-10 mt-20 -ml-12 ${!isReady ? 'opacity-0' : ''}`}>
        <Link
          href="/about"
          className={`text-5xl font-serif mb-4 text-white tracking-[0.3em] uppercase pl-[0.3em] block hover:text-white transition-colors ${isFirstVisit ? 'opacity-0 animate-[fadeIn_4s_ease-out_0.5s_forwards]' : ''}`}
          style={{
            textShadow: '0 0 20px rgba(100,150,255,1), 0 0 40px rgba(80,130,255,0.9), 0 0 60px rgba(60,120,255,0.8), 0 0 100px rgba(50,100,255,0.7), 0 0 150px rgba(40,80,255,0.5)'
          }}
        >
          KEMPO
        </Link>
        <Link
          href="/about"
          className={`text-gray-300 mb-4 block hover:text-white transition-colors ${isFirstVisit ? 'opacity-0 animate-[fadeIn_4s_ease-out_2s_forwards]' : ''}`}
          style={{
            textShadow: '0 0 20px rgba(100,150,255,1), 0 0 40px rgba(80,130,255,0.9), 0 0 60px rgba(60,120,255,0.8), 0 0 100px rgba(50,100,255,0.7), 0 0 150px rgba(40,80,255,0.5)'
          }}
        >A (nearly) imaginary world.</Link>
        <div
          className={`flex flex-col gap-4 ${isFirstVisit ? 'opacity-0 animate-[fadeIn_4s_ease-out_3.5s_forwards]' : ''}`}
          style={{
            textShadow: '0 0 20px rgba(100,150,255,1), 0 0 40px rgba(80,130,255,0.9), 0 0 60px rgba(60,120,255,0.8), 0 0 100px rgba(50,100,255,0.7), 0 0 150px rgba(40,80,255,0.5)'
          }}
        >
          <Link
            href="/radio"
            className="text-white hover:underline text-lg"
          >
            Kempo Radio
          </Link>
          <Link
            href="/tv"
            className="text-white hover:underline text-lg"
          >
            Kempo TV
          </Link>
          <Link
            href="/kemponet"
            className="text-white hover:underline text-lg"
          >
            KempoNet
          </Link>
        </div>
      </div>
    </main>
  )
}
