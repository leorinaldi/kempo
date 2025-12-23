"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"

interface Video {
  id: string
  name: string
  url: string
  description: string
  artist: string
  artistArticleId: string
}

export default function FlipFlopPage() {
  const router = useRouter()
  const [videos, setVideos] = useState<Video[]>([])
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEmbedded, setIsEmbedded] = useState(true) // Assume embedded initially to avoid flash
  const [isMobile, setIsMobile] = useState(false)
  const [isKempoNet, setIsKempoNet] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const playedVideosRef = useRef<Set<string>>(new Set())
  const historyRef = useRef<Video[]>([])
  const historyIndexRef = useRef(-1)
  const touchStartY = useRef<number | null>(null)

  // Refs to store latest navigation functions for keyboard handler
  const loadNextVideoRef = useRef<() => void>(() => {})
  const loadPreviousVideoRef = useRef<() => void>(() => {})

  // Detect mobile/kemponet context
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const mobile = params.get("mobile") === "1"
    const kempoNet = params.get("kemponet") === "1"
    setIsMobile(mobile)
    setIsKempoNet(kempoNet)
    setIsEmbedded(mobile || kempoNet)
  }, [])

  // When viewing directly (not in KempoNet/Mobile browser), account for the 56px header
  const containerClass = isEmbedded ? "h-screen" : "fixed top-14 left-0 right-0 bottom-0"

  // Fetch videos
  useEffect(() => {
    fetch("/api/flipflop/videos")
      .then((res) => res.json())
      .then((data) => {
        setVideos(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to fetch videos:", err)
        setLoading(false)
      })
  }, [])

  // Get a random video that hasn't been played yet (or reset if all played)
  const getRandomVideo = (): Video | null => {
    if (videos.length === 0) return null

    // Get unplayed videos
    const unplayed = videos.filter((v) => !playedVideosRef.current.has(v.id))

    // If all videos have been played, reset the set
    if (unplayed.length === 0) {
      playedVideosRef.current.clear()
      // Don't replay the current video immediately
      const available = currentVideo
        ? videos.filter((v) => v.id !== currentVideo.id)
        : videos
      if (available.length === 0) return videos[0]
      return available[Math.floor(Math.random() * available.length)]
    }

    return unplayed[Math.floor(Math.random() * unplayed.length)]
  }

  // Load next video
  const loadNextVideo = useCallback(() => {
    // If we're not at the end of history, go forward in history
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current++
      setCurrentVideo(historyRef.current[historyIndexRef.current])
      return
    }

    // Otherwise get a new random video
    const next = getRandomVideo()
    if (next) {
      playedVideosRef.current.add(next.id)
      historyRef.current.push(next)
      historyIndexRef.current = historyRef.current.length - 1
      setCurrentVideo(next)
    }
  }, [videos, currentVideo])

  // Load previous video
  const loadPreviousVideo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--
      setCurrentVideo(historyRef.current[historyIndexRef.current])
    }
  }, [])

  // Keep refs updated with latest functions
  useEffect(() => {
    loadNextVideoRef.current = loadNextVideo
    loadPreviousVideoRef.current = loadPreviousVideo
  }, [loadNextVideo, loadPreviousVideo])

  const canGoBack = historyIndexRef.current > 0

  // Touch handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return

    const touchEndY = e.changedTouches[0].clientY
    const deltaY = touchStartY.current - touchEndY
    const minSwipeDistance = 50

    if (Math.abs(deltaY) > minSwipeDistance) {
      if (deltaY > 0) {
        // Swiped up - next video
        loadNextVideo()
      } else {
        // Swiped down - previous video
        loadPreviousVideo()
      }
    }

    touchStartY.current = null
  }

  // Handle video end - auto advance
  const handleVideoEnd = () => {
    loadNextVideo()
  }

  // Auto-play when video changes
  useEffect(() => {
    if (currentVideo && videoRef.current) {
      videoRef.current.play().catch(() => {})
    }
  }, [currentVideo])

  // Keyboard navigation - up/down arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        e.preventDefault()
        loadNextVideoRef.current()
      } else if (e.key === "ArrowDown") {
        e.preventDefault()
        loadPreviousVideoRef.current()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleArtistClick = (artistArticleId: string) => {
    const extraParams = [
      isKempoNet ? 'kemponet=1' : '',
      isMobile ? 'mobile=1' : '',
    ].filter(Boolean).join('&')
    const suffix = extraParams ? `?${extraParams}` : ''
    router.push(`/kemponet/kempopedia/wiki/${artistArticleId}${suffix}`)
  }

  if (loading) {
    return (
      <div className={`${containerClass} bg-black flex items-center justify-center`}>
        <div className="text-white text-lg">Loading...</div>
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <div className={`${containerClass} bg-black flex flex-col items-center justify-center px-6`}>
        <div className="text-6xl mb-4">📹</div>
        <div className="text-white text-xl font-semibold mb-2">No videos yet</div>
        <div className="text-gray-400 text-center">
          Portrait videos will appear here
        </div>
      </div>
    )
  }

  // Home screen swipe handler
  const handleHomeSwipe = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return

    const touchEndY = e.changedTouches[0].clientY
    const deltaY = touchStartY.current - touchEndY
    const minSwipeDistance = 50

    if (deltaY > minSwipeDistance) {
      // Swiped up - start videos
      loadNextVideo()
    }

    touchStartY.current = null
  }

  // Home screen - no video loaded yet
  if (!currentVideo) {
    return (
      <div
        className={`${containerClass} bg-black flex flex-col`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleHomeSwipe}
      >
        {/* Up arrow button at top right */}
        <div className="flex justify-end pt-8 pr-6">
          <button
            onClick={loadNextVideo}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
            style={{ background: "linear-gradient(135deg, #f472b6 0%, #db2777 100%)" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M12 4l-8 8h5v8h6v-8h5z" />
            </svg>
          </button>
        </div>

        {/* FlipFlop branding centered */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <h1
            className="text-5xl font-bold mb-4"
            style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
          >
            <span className="text-white">Flip</span>
            <span style={{ color: "#ec4899" }}>Flop</span>
          </h1>
          <p className="text-gray-500 text-sm">Tap the arrow to start</p>
        </div>
      </div>
    )
  }

  // Go back to home screen
  const goHome = () => {
    setCurrentVideo(null)
    historyRef.current = []
    historyIndexRef.current = -1
    playedVideosRef.current.clear()
  }

  // Video playing screen
  return (
    <div
      className={`${containerClass} bg-black flex flex-col`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* FlipFlop logo - appears on hover in top left (desktop only) */}
      {!isMobile && (
        <div className="absolute top-0 left-0 z-20 pt-4 pl-4 group">
          <div className="w-16 h-10 cursor-pointer" /> {/* Hover area */}
          <button
            onClick={goHome}
            className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <span
              className="text-xl font-bold"
              style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}
            >
              <span className="text-white">Flip</span>
              <span style={{ color: "#ec4899" }}>Flop</span>
            </span>
          </button>
        </div>
      )}

      {/* Up arrow button at top right */}
      <div className="absolute top-0 right-0 z-20 flex justify-end pt-4 pr-4">
        <button
          onClick={loadNextVideo}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
          style={{ background: "linear-gradient(135deg, #f472b6 0%, #db2777 100%)" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M12 4l-8 8h5v8h6v-8h5z" />
          </svg>
        </button>
      </div>

      {/* Video */}
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          key={currentVideo.id}
          src={currentVideo.url}
          className="max-h-full max-w-full object-contain"
          autoPlay
          playsInline
          onEnded={handleVideoEnd}
        />
      </div>

      {/* Down arrow button at bottom right */}
      {canGoBack && (
        <div className="absolute bottom-0 right-0 z-20 flex justify-end pb-4 pr-4">
          <button
            onClick={loadPreviousVideo}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
            style={{ background: "linear-gradient(135deg, #f472b6 0%, #db2777 100%)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M12 20l8-8h-5V4h-6v8H4z" />
            </svg>
          </button>
        </div>
      )}

      {/* Bottom overlay with info - appears on hover */}
      <div className="absolute bottom-0 left-0 right-0 group">
        <div className="h-24" /> {/* Hover area */}
        <div className="absolute bottom-0 left-0 right-0 p-4 pb-6 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="space-y-1">
            {currentVideo.artist && (
              <button
                onClick={() => handleArtistClick(currentVideo.artistArticleId)}
                className="text-pink-400 font-medium hover:underline"
                style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
              >
                @{currentVideo.artist}
              </button>
            )}
            <h3
              className="text-white font-semibold text-lg"
              style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
            >
              {currentVideo.name}
            </h3>
          </div>
        </div>
      </div>
    </div>
  )
}
