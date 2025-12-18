"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"

interface Video {
  id: string
  name: string
  description?: string
  url: string
}

function KempoTubeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const playerRef = useRef<HTMLVideoElement>(null)
  const fullscreenPlayerRef = useRef<HTMLVideoElement>(null)

  const [videos, setVideos] = useState<Video[]>([])
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInternalFullscreen, setIsInternalFullscreen] = useState(false)

  // Check if we're inside KempoNet
  const isKempoNet = searchParams.get('kemponet') === '1'

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

  // Load playlist on mount
  useEffect(() => {
    fetch('/tv-playlist.json')
      .then(res => res.json())
      .then((data: Video[]) => {
        setVideos(data)
        setIsLoading(false)

        // Check for video ID in URL
        const videoId = searchParams.get('v')
        if (videoId) {
          const video = data.find(v => v.id === videoId)
          if (video) {
            setSelectedVideo(video)
          }
        }
      })
      .catch(err => {
        console.error('Failed to load videos:', err)
        setIsLoading(false)
      })
  }, [searchParams])

  const selectVideo = (video: Video) => {
    setSelectedVideo(video)
    setIsInternalFullscreen(false)
    const kemponetParam = isKempoNet ? '&kemponet=1' : ''
    router.push(`/kempotube?v=${video.id}${kemponetParam}`, { scroll: false })
    // Scroll to top to show the video player
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goBack = () => {
    setSelectedVideo(null)
    setIsInternalFullscreen(false)
    const kemponetParam = isKempoNet ? '?kemponet=1' : ''
    router.push(`/kempotube${kemponetParam}`, { scroll: false })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {selectedVideo && (
              <button
                onClick={goBack}
                className="text-gray-600 hover:text-gray-900 p-2 -ml-2 rounded-full hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <Link href="/kempotube" onClick={(e) => { if (selectedVideo) { e.preventDefault(); goBack(); } }}>
              <div className="flex items-center gap-1">
                <div className="bg-red-600 rounded-lg p-1.5">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <span className="text-xl font-semibold text-gray-900">KempoTube</span>
              </div>
            </Link>
          </div>
          {isKempoNet ? (
            <button
              onClick={() => {
                if (window.parent !== window) {
                  window.parent.postMessage({ type: "kemponet-go-home" }, "*")
                }
              }}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Back to Kemple
            </button>
          ) : (
            <Link
              href="/"
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Back to Kempo
            </Link>
          )}
        </div>
      </header>

      {/* Internal Fullscreen Mode (KempoNet only) */}
      {isKempoNet && isInternalFullscreen && selectedVideo && (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
          <video
            ref={fullscreenPlayerRef}
            src={selectedVideo.url}
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {selectedVideo ? (
          /* Player View */
          <div className="max-w-5xl mx-auto">
            {/* Video Player */}
            <div className="bg-black rounded-xl overflow-hidden shadow-lg relative group">
              <video
                ref={playerRef}
                src={selectedVideo.url}
                className="w-full aspect-video"
                controls
                autoPlay
                controlsList={isKempoNet ? "nofullscreen nodownload noremoteplayback noplaybackrate" : undefined}
                disablePictureInPicture={isKempoNet}
              />
              {/* Custom fullscreen button for KempoNet - positioned over disabled native button */}
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

            {/* Video Info */}
            <div className="mt-4">
              <h1 className="text-xl font-semibold text-gray-900">
                {selectedVideo.name}
              </h1>
              {selectedVideo.description && (
                <p className="mt-2 text-gray-600">
                  {selectedVideo.description}
                </p>
              )}
            </div>

            {/* More Videos */}
            {videos.length > 1 && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">More Videos</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {videos
                    .filter(v => v.id !== selectedVideo.id)
                    .slice(0, 6)
                    .map(video => (
                      <VideoCard
                        key={video.id}
                        video={video}
                        onClick={() => selectVideo(video)}
                        compact
                      />
                    ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Grid View */
          <>
            {videos.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No videos available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map(video => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    onClick={() => selectVideo(video)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

function VideoCard({
  video,
  onClick,
  compact = false
}: {
  video: Video
  onClick: () => void
  compact?: boolean
}) {
  const [isHovered, setIsHovered] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  return (
    <div
      className={`group cursor-pointer ${compact ? '' : ''}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail */}
      <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video">
        <video
          ref={videoRef}
          src={`${video.url}#t=0.5`}
          className="w-full h-full object-cover"
          preload="metadata"
          muted
          playsInline
        />

        {/* Play button overlay - always visible on mobile, hover on desktop */}
        <div className={`absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 ${isHovered ? 'sm:opacity-100' : ''}`}>
          <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
            <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Video Info */}
      <div className={`mt-3 ${compact ? 'mt-2' : ''}`}>
        <h3 className={`font-medium text-gray-900 line-clamp-2 group-hover:text-red-600 transition-colors ${compact ? 'text-sm' : ''}`}>
          {video.name}
        </h3>
        {video.description && !compact && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {video.description}
          </p>
        )}
      </div>
    </div>
  )
}

export default function KempoTubePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    }>
      <KempoTubeContent />
    </Suspense>
  )
}
