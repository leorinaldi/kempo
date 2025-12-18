"use client"

import { useState, useEffect, useRef } from "react"

interface VideoPlayerProps {
  src: string
  title?: string
  poster?: string
}

export function VideoPlayer({ src, title, poster }: VideoPlayerProps) {
  const [isKempoNet, setIsKempoNet] = useState(false)
  const [isInternalFullscreen, setIsInternalFullscreen] = useState(false)
  const playerRef = useRef<HTMLVideoElement>(null)
  const fullscreenPlayerRef = useRef<HTMLVideoElement>(null)

  // Check for kemponet param on client side only
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setIsKempoNet(params.get("kemponet") === "1")
  }, [])

  // Handle Escape key to exit internal fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isInternalFullscreen) {
        exitFullscreen()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isInternalFullscreen])

  // Handle entering fullscreen - sync time and pause original
  const enterFullscreen = () => {
    const currentTime = playerRef.current?.currentTime || 0
    const isPlaying = playerRef.current && !playerRef.current.paused

    if (playerRef.current) {
      playerRef.current.pause()
    }

    setIsInternalFullscreen(true)

    // Set the time on the fullscreen player after it renders
    setTimeout(() => {
      if (fullscreenPlayerRef.current) {
        fullscreenPlayerRef.current.currentTime = currentTime
        if (isPlaying) {
          fullscreenPlayerRef.current.play()
        }
      }
    }, 0)
  }

  // Handle exiting fullscreen - sync time back and pause fullscreen
  const exitFullscreen = () => {
    const currentTime = fullscreenPlayerRef.current?.currentTime || 0
    const isPlaying = fullscreenPlayerRef.current && !fullscreenPlayerRef.current.paused

    if (fullscreenPlayerRef.current) {
      fullscreenPlayerRef.current.pause()
    }

    setIsInternalFullscreen(false)

    // Set the time on the main player after it renders
    setTimeout(() => {
      if (playerRef.current) {
        playerRef.current.currentTime = currentTime
        if (isPlaying) {
          playerRef.current.play()
        }
      }
    }, 0)
  }

  return (
    <>
      {/* Internal Fullscreen Mode (KempoNet only) */}
      {isKempoNet && isInternalFullscreen && (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
          <video
            ref={fullscreenPlayerRef}
            src={src}
            poster={poster}
            className="w-full h-full object-contain"
            controls
            controlsList="nofullscreen nodownload noremoteplayback noplaybackrate"
            disablePictureInPicture
          />
          {/* Exit fullscreen button */}
          <button
            onClick={exitFullscreen}
            className="absolute bottom-[28px] right-[12px] bg-transparent hover:bg-white/10 text-white p-1.5 rounded transition-colors"
            title="Exit fullscreen"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9L4 4m0 0v5m0-5h5m6 6l5 5m0 0v-5m0 5h-5M9 15l-5 5m0 0v-5m0 5h5m6-6l5-5m0 0v5m0-5h-5" />
            </svg>
          </button>
        </div>
      )}

      <div className="bg-gray-100 rounded-lg p-4 my-4">
        {title && <p className="text-sm font-medium text-gray-700 mb-2">{title}</p>}
        <div className="relative group inline-block">
          <video
            ref={playerRef}
            src={src}
            poster={poster}
            controls
            controlsList={isKempoNet ? "nofullscreen nodownload noremoteplayback noplaybackrate" : undefined}
            disablePictureInPicture={isKempoNet}
            className="w-full max-w-[400px] rounded-lg bg-black"
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>
          {/* Custom fullscreen button for KempoNet */}
          {isKempoNet && (
            <button
              onClick={enterFullscreen}
              className="absolute bottom-[28px] right-[12px] bg-transparent hover:bg-white/10 text-white p-1.5 rounded transition-colors"
              title="Fullscreen (within monitor)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </>
  )
}
