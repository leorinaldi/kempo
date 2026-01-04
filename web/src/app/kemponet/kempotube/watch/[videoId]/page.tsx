"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

interface Video {
  id: string
  videoId: string
  name: string
  description: string
  url: string
  artist?: string
  artistArticleId?: string
  channelId: string
  channelName: string
  views: number
}

export default function KempoTubeWatchPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const playerRef = useRef<HTMLVideoElement>(null)
  const fullscreenPlayerRef = useRef<HTMLVideoElement>(null)

  const [videos, setVideos] = useState<Video[]>([])
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInternalFullscreen, setIsInternalFullscreen] = useState(false)
  const [thumbState, setThumbState] = useState<'up' | 'down' | null>(null)
  const [descriptionExpanded, setDescriptionExpanded] = useState(false)

  const isKempoNet = searchParams.get('kemponet') === '1'
  const isMobile = searchParams.get('mobile') === '1'

  // Fullscreen handlers
  const enterFullscreen = () => {
    const currentTime = playerRef.current?.currentTime || 0
    const isPlaying = playerRef.current && !playerRef.current.paused
    if (playerRef.current) playerRef.current.pause()
    setIsInternalFullscreen(true)
    setTimeout(() => {
      if (fullscreenPlayerRef.current) {
        fullscreenPlayerRef.current.currentTime = currentTime
        if (isPlaying) fullscreenPlayerRef.current.play()
      }
    }, 0)
  }

  const exitFullscreen = () => {
    const currentTime = fullscreenPlayerRef.current?.currentTime || 0
    const isPlaying = fullscreenPlayerRef.current && !fullscreenPlayerRef.current.paused
    if (fullscreenPlayerRef.current) fullscreenPlayerRef.current.pause()
    setIsInternalFullscreen(false)
    setTimeout(() => {
      if (playerRef.current) {
        playerRef.current.currentTime = currentTime
        if (isPlaying) playerRef.current.play()
      }
    }, 0)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isInternalFullscreen) exitFullscreen()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isInternalFullscreen])

  // Load videos and find current
  useEffect(() => {
    fetch('/api/kempotube/videos')
      .then(res => res.json())
      .then((data: Video[]) => {
        setVideos(data)
        const videoId = params.videoId as string
        const video = data.find((v: Video) => v.id === videoId)
        if (video) setCurrentVideo(video)
        setIsLoading(false)
      })
      .catch(err => {
        console.error('Failed to load videos:', err)
        setIsLoading(false)
      })
  }, [params.videoId])

  const selectVideo = (video: Video) => {
    setCurrentVideo(video)
    setThumbState(null)
    setDescriptionExpanded(false)
    const extraParams = [
      isKempoNet ? 'kemponet=1' : '',
      isMobile ? 'mobile=1' : '',
    ].filter(Boolean).join('&')
    const suffix = extraParams ? `?${extraParams}` : ''
    router.push(`/kemponet/kempotube/watch/${video.id}${suffix}`, { scroll: false })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goHome = () => {
    const extraParams = [
      isKempoNet ? 'kemponet=1' : '',
      isMobile ? 'mobile=1' : '',
    ].filter(Boolean).join('&')
    const suffix = extraParams ? `?${extraParams}` : ''
    router.push(`/kemponet/kempotube${suffix}`)
  }

  const goToChannel = (channelId: string) => {
    const extraParams = [
      isKempoNet ? 'kemponet=1' : '',
      isMobile ? 'mobile=1' : '',
    ].filter(Boolean).join('&')
    const suffix = extraParams ? `?${extraParams}` : ''
    router.push(`/kemponet/kempotube/channel/${channelId}${suffix}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    )
  }

  if (!currentVideo) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="text-6xl mb-4">404</div>
        <div className="text-white text-xl font-semibold mb-2">Video not found</div>
        <button onClick={goHome} className="text-orange-400 hover:underline mt-4">
          Back to KempoTube
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className={`bg-black border-b border-gray-800 sticky z-40 ${isKempoNet || isMobile ? 'top-0' : 'top-14'}`}>
        <div className="max-w-7xl mx-auto px-3 py-1.5 flex items-center justify-between">
          <button onClick={goHome} className="flex items-center gap-1.5">
            <div className="bg-orange-500 rounded p-1 flex items-center justify-center">
              <svg width="14" height="11" viewBox="0 0 22 16" fill="white">
                <path d="M0 0L7 8L0 16V0Z" />
                <path d="M8 0L15 8L8 16V0Z" />
                <rect x="18" y="0" width="3" height="16" />
              </svg>
            </div>
            <span className="text-base font-semibold text-white">KempoTube</span>
          </button>
        </div>
      </header>

      {/* Internal Fullscreen Mode */}
      {isKempoNet && isInternalFullscreen && (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
          <video
            ref={fullscreenPlayerRef}
            src={currentVideo.url}
            className="w-full h-full object-contain"
            controls
            controlsList="nofullscreen nodownload noremoteplayback noplaybackrate"
            disablePictureInPicture
          />
          <button
            onClick={exitFullscreen}
            className="absolute bottom-[28px] right-[12px] bg-transparent hover:bg-white/10 text-white p-1.5 rounded transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9L4 4m0 0v5m0-5h5m6 6l5 5m0 0v-5m0 5h-5M9 15l-5 5m0 0v-5m0 5h5m6-6l5-5m0 0v5m0-5h-5" />
            </svg>
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className={`max-w-7xl mx-auto ${isMobile ? 'px-0 py-0' : 'px-4 py-3'}`}>
        <div className={isMobile ? 'w-full' : 'w-[85%] mx-auto'}>
          {/* Video Player */}
          <div className="bg-black overflow-hidden shadow-lg relative group">
            <video
              ref={playerRef}
              src={currentVideo.url}
              className="w-full aspect-video"
              controls
              autoPlay
              controlsList={isKempoNet ? "nofullscreen nodownload noremoteplayback noplaybackrate" : undefined}
              disablePictureInPicture={isKempoNet}
            />
            {isKempoNet && (
              <button
                onClick={enterFullscreen}
                className="hidden sm:block absolute bottom-[28px] right-[12px] bg-transparent hover:bg-white/10 text-white p-1.5 rounded transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
            )}
          </div>

          {/* Video Info */}
          <div className={`py-3 ${isMobile ? 'px-3' : 'px-4'}`}>
            <h1 className="text-sm font-semibold text-white">{currentVideo.name}</h1>

            {/* Channel link */}
            <button
              onClick={() => goToChannel(currentVideo.channelId)}
              className="mt-1 text-xs text-gray-400 hover:text-orange-400 transition-colors"
            >
              {currentVideo.channelName}
            </button>

            {currentVideo.description && (
              <div className="mt-1">
                {descriptionExpanded ? (
                  <p className="text-xs text-gray-300">
                    {currentVideo.description}
                  </p>
                ) : (
                  <button
                    onClick={() => setDescriptionExpanded(true)}
                    className="text-xs text-gray-300 text-left line-clamp-2"
                  >
                    {currentVideo.description}
                  </button>
                )}
              </div>
            )}

            {/* Thumbs */}
            <div className="flex gap-4 mt-3">
              <button
                onClick={() => setThumbState(thumbState === 'up' ? null : 'up')}
                className="flex items-center gap-1 text-white hover:text-orange-400 transition-colors"
              >
                <svg className="w-5 h-5" fill={thumbState === 'up' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
                </svg>
              </button>
              <button
                onClick={() => setThumbState(thumbState === 'down' ? null : 'down')}
                className="flex items-center gap-1 text-white hover:text-orange-400 transition-colors"
              >
                <svg className="w-5 h-5" fill={thumbState === 'down' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
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
                  .filter(v => v.id !== currentVideo.id)
                  .slice(0, 6)
                  .map(video => (
                    <div
                      key={video.id}
                      className="group cursor-pointer pb-3"
                      onClick={() => selectVideo(video)}
                    >
                      <div className="relative bg-gray-900 overflow-hidden aspect-video">
                        <video
                          src={`${video.url}#t=0.5`}
                          className="w-full h-full object-cover"
                          preload="metadata"
                          muted
                          playsInline
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                            <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div className="mt-1.5">
                        <h3 className="text-sm font-medium text-white line-clamp-2 group-hover:text-orange-400 transition-colors">
                          {video.name}
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">{video.channelName}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
