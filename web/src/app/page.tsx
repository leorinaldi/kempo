'use client'

import Link from 'next/link'
import { Suspense, useEffect, useRef, useState } from 'react'
import { KempoNetRedirect } from '@/components/KempoNetRedirect'

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isFirstVisit, setIsFirstVisit] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Use Performance API to detect navigation type
    const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
    const navType = navEntries.length > 0 ? navEntries[0].type : 'navigate'

    // back_forward = user clicked back/forward button
    // navigate = fresh visit (typed URL, clicked link from external)
    // reload = page refresh
    const isBackForward = navType === 'back_forward'

    if (isBackForward) {
      // Skip to end and pause, no animations
      video.currentTime = video.duration || 999
      video.pause()
      setIsFirstVisit(false)
    } else {
      // First visit or refresh - play video with animations
      setIsFirstVisit(true)
      video.play()
    }
    setIsReady(true)
  }, [])

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden">
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
        <h1
          className={`text-5xl font-serif mb-4 text-white tracking-[0.3em] uppercase pl-[0.3em] ${isFirstVisit ? 'opacity-0 animate-[fadeIn_4s_ease-out_0.5s_forwards]' : ''}`}
          style={{
            textShadow: '0 0 20px rgba(100,150,255,1), 0 0 40px rgba(80,130,255,0.9), 0 0 60px rgba(60,120,255,0.8), 0 0 100px rgba(50,100,255,0.7), 0 0 150px rgba(40,80,255,0.5)'
          }}
        >
          KEMPO
        </h1>
        <p
          className={`text-gray-300 mb-4 ${isFirstVisit ? 'opacity-0 animate-[fadeIn_4s_ease-out_2s_forwards]' : ''}`}
          style={{
            textShadow: '0 0 20px rgba(100,150,255,1), 0 0 40px rgba(80,130,255,0.9), 0 0 60px rgba(60,120,255,0.8), 0 0 100px rgba(50,100,255,0.7), 0 0 150px rgba(40,80,255,0.5)'
          }}
        >A fictional world simulation</p>
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
