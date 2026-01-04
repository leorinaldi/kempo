'use client'

import Link from 'next/link'
import { Suspense, useState, useRef } from 'react'
import { KempoNetRedirect } from '@/components/KempoNetRedirect'
import { KYDatePicker } from '@/components/KYDatePicker'

const devices = [
  { name: 'Mobile', href: '/mobile', action: 'Play Kempo Apps' },
  { name: 'PC', href: '/pc', action: 'Explore KempoNet' },
  { name: 'TV', href: '/tv', action: 'Watch Kempo TV' },
  { name: 'Radio', href: '/radio', action: 'Listen to Kempo Radio' },
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
      className="w-10 h-20 rounded-xl border-2 border-gray-600 p-1 flex flex-col"
      style={{ background: '#1a1a1a' }}
    >
      {/* Dynamic Island */}
      <div className="w-5 h-1 rounded-full mx-auto mt-0.5" style={{ background: '#000' }} />
      {/* Screen */}
      <div
        className="flex-1 rounded-lg mt-1 mx-0.5"
        style={{ background: '#1e293b' }}
      />
      {/* Home Indicator */}
      <div className="w-6 h-0.5 rounded-full mx-auto mt-1 mb-0.5" style={{ background: '#374151' }} />
    </div>
  )
}

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(1) // Start on PC
  const [titleHover, setTitleHover] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const isHorizontalSwipe = useRef(false)

  const goLeft = () => {
    setCurrentIndex((prev) => (prev - 1 + devices.length) % devices.length)
  }

  const goRight = () => {
    setCurrentIndex((prev) => (prev + 1) % devices.length)
  }

  // Touch handlers for swipe gestures on device rotator
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    isHorizontalSwipe.current = false
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return

    const deltaX = Math.abs(e.touches[0].clientX - touchStartX.current)
    const deltaY = Math.abs(e.touches[0].clientY - touchStartY.current)

    // If moving more horizontally than vertically, it's a horizontal swipe
    if (deltaX > deltaY && deltaX > 10) {
      isHorizontalSwipe.current = true
      e.preventDefault() // Prevent vertical scrolling
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return

    const touchEndX = e.changedTouches[0].clientX
    const deltaX = touchStartX.current - touchEndX
    const minSwipeDistance = 50

    if (Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        // Swiped left - go right (next device)
        goRight()
      } else {
        // Swiped right - go left (previous device)
        goLeft()
      }
      e.preventDefault()
    }

    touchStartX.current = null
    touchStartY.current = null
    isHorizontalSwipe.current = false
  }

  const currentDevice = devices[currentIndex]

  const blueGlow = '0 0 20px rgba(100,150,255,1), 0 0 40px rgba(80,130,255,0.9), 0 0 60px rgba(60,120,255,0.8), 0 0 100px rgba(50,100,255,0.7), 0 0 150px rgba(40,80,255,0.5)'
  const blueGlowHover = '0 0 30px rgba(130,180,255,1), 0 0 60px rgba(100,160,255,1), 0 0 100px rgba(80,140,255,1), 0 0 150px rgba(60,120,255,0.9), 0 0 200px rgba(50,100,255,0.8)'

  return (
    <main
      className="fixed left-0 right-0 flex flex-col items-center bg-black"
      style={{ top: 0, bottom: 0, overflow: 'hidden' }}
    >
      <Suspense fallback={null}>
        <KempoNetRedirect />
      </Suspense>

      {/* Title and tagline */}
      <div
        className="text-center relative z-10 mt-24"
        onMouseEnter={() => setTitleHover(true)}
        onMouseLeave={() => setTitleHover(false)}
      >
        <Link
          href="/about"
          className="text-5xl font-serif mb-4 text-white tracking-[0.3em] uppercase pl-[0.3em] block transition-all duration-300"
          style={{ textShadow: titleHover ? blueGlowHover : blueGlow }}
        >
          KEMPO
        </Link>
        <Link
          href="/about"
          className="text-gray-300 block hover:text-white transition-all duration-300"
          style={{ textShadow: titleHover ? blueGlowHover : blueGlow }}
        >A (nearly) imaginary world.</Link>
      </div>

      {/* KY Date Picker */}
      <div className="mt-8">
        <KYDatePicker variant="home" />
      </div>

      {/* Device Rotator */}
      <div className="mt-10 flex items-center gap-4">
          {/* Left Arrow - outside the box */}
          <button
            onClick={goLeft}
            className="w-12 h-12 flex items-center justify-center hover:scale-110 transition-all duration-200"
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: 'drop-shadow(0 0 8px rgba(100,150,255,0.8))' }}
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Clickable box container */}
          <Link
            href={currentDevice.href}
            className="flex flex-col items-center gap-3 py-4 px-6 rounded-lg border border-gray-700/50 transition-all duration-200 group hover:border-gray-500 hover:shadow-[inset_0_0_30px_rgba(100,150,255,0.15)]"
            style={{
              background: 'rgba(31, 41, 55, 0.3)',
              boxShadow: '0 0 15px rgba(100,150,255,0.3), 0 0 30px rgba(80,130,255,0.2)'
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
              {/* Device Icon - fixed height container with centered icon */}
              <div className="flex items-center justify-center h-[115px] w-[180px]">
                <div
                  className="p-4 rounded-lg transition-transform group-hover:scale-105"
                  style={{
                    filter: 'drop-shadow(0 0 8px rgba(100,150,255,0.5)) drop-shadow(0 0 15px rgba(80,130,255,0.3))'
                  }}
                >
                  {currentIndex === 0 && <MobileIcon />}
                  {currentIndex === 1 && <PCIcon />}
                  {currentIndex === 2 && <TVIcon />}
                  {currentIndex === 3 && <RadioIcon />}
                </div>
              </div>

            {/* Action text - fixed position */}
            <div
              className="text-white font-medium whitespace-nowrap text-center"
              style={{ textShadow: '0 0 10px rgba(100,150,255,0.8)' }}
            >
              {currentDevice.action}
            </div>

            {/* Dots Indicator */}
            <div className="flex gap-2 mt-1">
              {devices.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => { e.preventDefault(); setCurrentIndex(index); }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? 'bg-white'
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                  style={index === currentIndex ? { boxShadow: '0 0 8px rgba(100,150,255,0.8)' } : {}}
                />
              ))}
            </div>
          </Link>

          {/* Right Arrow - outside the box */}
          <button
            onClick={goRight}
            className="w-12 h-12 flex items-center justify-center hover:scale-110 transition-all duration-200"
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: 'drop-shadow(0 0 8px rgba(100,150,255,0.8))' }}
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
      </div>
    </main>
  )
}
