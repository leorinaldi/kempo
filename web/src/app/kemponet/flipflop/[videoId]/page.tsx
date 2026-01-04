"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"

interface Video {
  id: string  // FlipFlopVideo ID
  videoId: string  // Underlying Video ID
  name: string
  url: string
  description: string
  artist: string
  artistArticleId: string
  accountId: string
  accountName: string
  accountDisplayName: string | null
}

export default function FlipFlopVideoPage() {
  const params = useParams()
  const router = useRouter()
  const [videos, setVideos] = useState<Video[]>([])
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEmbedded, setIsEmbedded] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [isKempoNet, setIsKempoNet] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const playedVideosRef = useRef<Set<string>>(new Set())
  const historyRef = useRef<Video[]>([])
  const historyIndexRef = useRef(-1)
  const touchStartY = useRef<number | null>(null)
  const initialVideoIdRef = useRef<string | null>(null)

  const loadNextVideoRef = useRef<() => void>(() => {})
  const loadPreviousVideoRef = useRef<() => void>(() => {})

  // Get initial video ID from path
  useEffect(() => {
    if (params.videoId && typeof params.videoId === "string") {
      initialVideoIdRef.current = params.videoId
    }
  }, [params.videoId])

  // Detect mobile/kemponet context
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const mobile = urlParams.get("mobile") === "1"
    const kempoNet = urlParams.get("kemponet") === "1"
    setIsMobile(mobile)
    setIsKempoNet(kempoNet)
    setIsEmbedded(mobile || kempoNet)
  }, [])

  const containerClass = isEmbedded ? "h-screen" : "fixed top-14 left-0 right-0 bottom-0"

  // Fetch videos
  useEffect(() => {
    fetch("/api/flipflop/videos")
      .then((res) => res.json())
      .then((data) => {
        setVideos(data)
        setLoading(false)

        // Start with the video from the URL path
        if (initialVideoIdRef.current) {
          const initialVideo = data.find((v: Video) => v.id === initialVideoIdRef.current)
          if (initialVideo) {
            playedVideosRef.current.add(initialVideo.id)
            historyRef.current.push(initialVideo)
            historyIndexRef.current = 0
            setCurrentVideo(initialVideo)
          }
          initialVideoIdRef.current = null
        }
      })
      .catch((err) => {
        console.error("Failed to fetch videos:", err)
        setLoading(false)
      })
  }, [])

  const getRandomVideo = (): Video | null => {
    if (videos.length === 0) return null
    const unplayed = videos.filter((v) => !playedVideosRef.current.has(v.id))
    if (unplayed.length === 0) {
      playedVideosRef.current.clear()
      const available = currentVideo
        ? videos.filter((v) => v.id !== currentVideo.id)
        : videos
      if (available.length === 0) return videos[0]
      return available[Math.floor(Math.random() * available.length)]
    }
    return unplayed[Math.floor(Math.random() * unplayed.length)]
  }

  const loadNextVideo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current++
      setCurrentVideo(historyRef.current[historyIndexRef.current])
      return
    }
    const next = getRandomVideo()
    if (next) {
      playedVideosRef.current.add(next.id)
      historyRef.current.push(next)
      historyIndexRef.current = historyRef.current.length - 1
      setCurrentVideo(next)
    }
  }, [videos, currentVideo])

  const loadPreviousVideo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--
      setCurrentVideo(historyRef.current[historyIndexRef.current])
    }
  }, [])

  useEffect(() => {
    loadNextVideoRef.current = loadNextVideo
    loadPreviousVideoRef.current = loadPreviousVideo
  }, [loadNextVideo, loadPreviousVideo])

  const canGoBack = historyIndexRef.current > 0

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
        loadNextVideo()
      } else {
        loadPreviousVideo()
      }
    }
    touchStartY.current = null
  }

  const handleVideoEnd = () => {
    loadNextVideo()
  }

  useEffect(() => {
    if (currentVideo && videoRef.current) {
      videoRef.current.play().catch(() => {})
    }
  }, [currentVideo])

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

  const handleAccountClick = (accountId: string) => {
    const extraParams = [
      isKempoNet ? "kemponet=1" : "",
      isMobile ? "mobile=1" : "",
    ].filter(Boolean).join("&")
    const suffix = extraParams ? `?${extraParams}` : ""
    router.push(`/kemponet/flipflop/account/${accountId}${suffix}`)
  }

  const goHome = () => {
    const extraParams = [
      isKempoNet ? "kemponet=1" : "",
      isMobile ? "mobile=1" : "",
    ].filter(Boolean).join("&")
    const suffix = extraParams ? `?${extraParams}` : ""
    router.push(`/kemponet/flipflop${suffix}`)
  }

  if (loading) {
    return (
      <div className={`${containerClass} bg-black flex items-center justify-center`}>
        <div className="text-white text-lg">Loading...</div>
      </div>
    )
  }

  if (!currentVideo) {
    return (
      <div className={`${containerClass} bg-black flex flex-col items-center justify-center px-6`}>
        <div className="text-6xl mb-4">404</div>
        <div className="text-white text-xl font-semibold mb-2">Video not found</div>
        <button onClick={goHome} className="text-pink-400 hover:underline mt-4">
          Back to FlipFlop
        </button>
      </div>
    )
  }

  return (
    <div
      className={`${containerClass} bg-black flex flex-col`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* FlipFlop logo - appears on hover in top left (desktop only) */}
      {!isMobile && (
        <div className="absolute top-0 left-0 z-20 pt-4 pl-4 group">
          <div className="w-16 h-10 cursor-pointer" />
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

      {/* Account name - always visible at bottom left */}
      <div className="absolute bottom-0 left-0 z-20 p-4 pb-6">
        <button
          onClick={() => handleAccountClick(currentVideo.accountId)}
          className="text-white font-semibold hover:text-pink-400 transition-colors"
          style={{ textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}
        >
          {currentVideo.accountName}
        </button>
      </div>

      {/* Bottom overlay with video info - appears on hover */}
      <div className="absolute bottom-0 left-0 right-0 group pointer-events-none">
        <div className="h-24" />
        <div className="absolute bottom-0 left-0 right-0 p-4 pb-6 pl-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-auto">
          <div className="space-y-1 ml-32">
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
