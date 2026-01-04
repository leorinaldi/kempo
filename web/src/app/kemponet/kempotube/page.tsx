"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { KempoNetBridge } from "@/components/KempoNetBridge"

interface Video {
  id: string
  videoId: string
  name: string
  description?: string
  url: string
  artist?: string
  artistArticleId?: string
  channelId: string
  channelName: string
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
  const [thumbState, setThumbState] = useState<'up' | 'down' | null>(null)

  // Check if we're inside KempoNet or mobile app
  const isKempoNet = searchParams.get('kemponet') === '1'
  const isMobile = searchParams.get('mobile') === '1'

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

  // Load videos from KempoTube API on mount - read ky date from localStorage
  useEffect(() => {
    let kyParam: string | null = null
    try {
      const saved = localStorage.getItem("kempo-ky-date")
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.year && parsed.month) {
          kyParam = `${parsed.year}-${String(parsed.month).padStart(2, "0")}`
        }
      }
    } catch {
      // Ignore localStorage errors
    }

    const url = kyParam ? `/api/kempotube/videos?ky=${kyParam}` : "/api/kempotube/videos"

    fetch(url)
      .then(res => res.json())
      .then((data: Video[]) => {
        // Data already comes sorted by publishedAt desc (newest first)
        setVideos(data)
        setIsLoading(false)

        // Check for video ID in URL
        const videoId = searchParams.get('v')
        if (videoId) {
          const video = data.find((v: Video) => v.id === videoId)
          if (video) {
            setSelectedVideo(video)
          }
        }
      })
      .catch(err => {
        console.error('Failed to load videos:', err)
        setIsLoading(false)
      })
  }, [])

  const selectVideo = (video: Video) => {
    const extraParams = [
      isKempoNet ? 'kemponet=1' : '',
      isMobile ? 'mobile=1' : '',
    ].filter(Boolean).join('&')
    const suffix = extraParams ? `?${extraParams}` : ''
    router.push(`/kemponet/kempotube/watch/${video.id}${suffix}`)
  }

  const goBack = () => {
    setSelectedVideo(null)
    setIsInternalFullscreen(false)
    const extraParams = [
      isKempoNet ? 'kemponet=1' : '',
      isMobile ? 'mobile=1' : '',
    ].filter(Boolean).join('&')
    const suffix = extraParams ? `?${extraParams}` : ''
    router.push(`/kemponet/kempotube${suffix}`, { scroll: false })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <KempoNetBridge />
      {/* Header */}
      <header className={`bg-black border-b border-gray-800 sticky z-40 ${isKempoNet || isMobile ? 'top-0' : 'top-14'}`}>
        <div className="max-w-7xl mx-auto px-3 py-1.5 flex items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/kemponet/kempotube"
              onClick={(e) => { if (selectedVideo) { e.preventDefault(); goBack(); } }}
              className={selectedVideo ? "cursor-pointer" : ""}
            >
              <div className="flex items-center gap-1.5">
                <div className="bg-orange-500 rounded p-1 flex items-center justify-center">
                  <svg width="14" height="11" viewBox="0 0 22 16" fill="white">
                    <path d="M0 0L7 8L0 16V0Z" />
                    <path d="M8 0L15 8L8 16V0Z" />
                    <rect x="18" y="0" width="3" height="16" />
                  </svg>
                </div>
                <span className="text-base font-semibold text-white">KempoTube</span>
              </div>
            </Link>
          </div>
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
      <main className={`max-w-7xl mx-auto ${isMobile ? 'px-0 py-0' : 'px-4 py-3'}`}>
        {selectedVideo ? (
          /* Player View */
          <div className={isMobile ? 'w-full' : 'w-[85%] mx-auto'}>
            {/* Video Player */}
            <div className="bg-black overflow-hidden shadow-lg relative group">
              <video
                ref={playerRef}
                src={selectedVideo.url}
                className="w-full aspect-video"
                controls
                autoPlay
                controlsList={isKempoNet ? "nofullscreen nodownload noremoteplayback noplaybackrate" : undefined}
                disablePictureInPicture={isKempoNet}
              />
              {/* Custom fullscreen button for KempoNet - hidden on mobile where native fullscreen auto-triggers */}
              {isKempoNet && (
                <button
                  onClick={enterFullscreen}
                  className="hidden sm:block absolute bottom-[28px] right-[12px] bg-transparent hover:bg-white/10 text-white p-1.5 rounded transition-colors"
                  title="Fullscreen (within monitor)"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </button>
              )}
            </div>

            {/* Video Info */}
            <div className={`py-3 ${isMobile ? 'px-3' : 'px-4'}`}>
              <h1 className="text-sm font-semibold text-white">
                {selectedVideo.name}
              </h1>
              {selectedVideo.artist && selectedVideo.artistArticleId && (
                <p className="mt-0.5 text-xs text-gray-400">
                  <Link
                    href={`/kemponet/kempopedia/wiki/${selectedVideo.artistArticleId}`}
                    className="hover:text-orange-400 transition-colors"
                  >
                    {selectedVideo.artist}
                  </Link>
                </p>
              )}
              {selectedVideo.description && (
                <p className="mt-1 text-xs text-gray-300">
                  {selectedVideo.description}
                </p>
              )}

              {/* Thumbs up/down buttons */}
              <div className="flex gap-4 mt-3">
                <button
                  onClick={() => setThumbState(thumbState === 'up' ? null : 'up')}
                  className="flex items-center gap-1 text-white hover:text-orange-400 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill={thumbState === 'up' ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
                  </svg>
                </button>
                <button
                  onClick={() => setThumbState(thumbState === 'down' ? null : 'down')}
                  className="flex items-center gap-1 text-white hover:text-orange-400 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill={thumbState === 'down' ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.498 15.25H4.372c-1.026 0-1.945-.694-2.054-1.715a12.137 12.137 0 0 1-.068-1.285c0-2.848.992-5.464 2.649-7.521C5.287 4.247 5.886 4 6.504 4h4.016a4.5 4.5 0 0 1 1.423.23l3.114 1.04a4.5 4.5 0 0 0 1.423.23h1.294M7.498 15.25c.618 0 .991.724.725 1.282A7.471 7.471 0 0 0 7.5 19.75 2.25 2.25 0 0 0 9.75 22a.75.75 0 0 0 .75-.75v-.633c0-.573.11-1.14.322-1.672.304-.76.93-1.33 1.653-1.715a9.04 9.04 0 0 0 2.86-2.4c.498-.634 1.226-1.08 2.032-1.08h.384m-10.253 1.5H9.7m8.075-9.75c.01.05.027.1.05.148.593 1.2.925 2.55.925 3.977 0 1.487-.36 2.89-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398-.306.774-1.086 1.227-1.918 1.227h-1.053c-.472 0-.745-.556-.5-.96a8.95 8.95 0 0 0 .303-.54" />
                  </svg>
                </button>
              </div>
            </div>

            {/* More Videos */}
            {videos.length > 1 && (
              <div className={`mt-8 ${isMobile ? 'px-3' : 'px-4'}`}>
                <h2 className="text-sm font-semibold text-white mb-3">More Videos</h2>
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
          <div className={isMobile ? 'px-3' : ''}>
            <h2 className="text-sm font-semibold text-white mb-3">Popular Videos</h2>
            {videos.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No videos available</p>
              </div>
            ) : (
              <div className={`grid gap-4 ${isKempoNet ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}`}>
                {videos.map(video => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    onClick={() => selectVideo(video)}
                    compact
                  />
                ))}
              </div>
            )}
          </div>
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
      className={`group cursor-pointer pb-3 ${compact ? '' : ''}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail */}
      <div className="relative bg-gray-900 overflow-hidden aspect-video">
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
          <div className="w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
            <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Video Info */}
      <div className={`mt-1.5 ${compact ? 'mt-1' : ''}`}>
        <h3 className={`font-medium text-white line-clamp-2 group-hover:text-orange-400 transition-colors ${compact ? 'text-sm' : ''}`}>
          {video.name}
        </h3>
        <p className={`text-gray-400 mt-0.5 ${compact ? 'text-xs' : 'text-sm'}`}>
          {video.channelName}
        </p>
        {video.description && !compact && (
          <p className="text-sm text-gray-400 mt-1 line-clamp-2">
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
