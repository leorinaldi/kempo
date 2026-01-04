"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"

interface Video {
  id: string
  name: string
  url: string
  description: string | null
  views: number
  publishedAt: string
}

interface Channel {
  id: string
  name: string
  description: string | null
  avatarUrl: string | null
  bannerUrl: string | null
  websiteUrl: string | null
  websiteName: string | null
  videos: Video[]
}

export default function KempoTubeChannelPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [channel, setChannel] = useState<Channel | null>(null)
  const [loading, setLoading] = useState(true)
  const [descriptionExpanded, setDescriptionExpanded] = useState(false)

  const isKempoNet = searchParams.get('kemponet') === '1'
  const isMobile = searchParams.get('mobile') === '1'

  useEffect(() => {
    if (params.channelId) {
      fetch(`/api/kempotube/channel/${params.channelId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            setChannel(null)
          } else {
            setChannel(data)
          }
          setLoading(false)
        })
        .catch((err) => {
          console.error("Failed to fetch channel:", err)
          setLoading(false)
        })
    }
  }, [params.channelId])

  const goHome = () => {
    const extraParams = [
      isKempoNet ? "kemponet=1" : "",
      isMobile ? "mobile=1" : "",
    ].filter(Boolean).join("&")
    const suffix = extraParams ? `?${extraParams}` : ""
    router.push(`/kemponet/kempotube${suffix}`)
  }

  const goToVideo = (videoId: string) => {
    const extraParams = [
      isKempoNet ? "kemponet=1" : "",
      isMobile ? "mobile=1" : "",
    ].filter(Boolean).join("&")
    const suffix = extraParams ? `?${extraParams}` : ""
    router.push(`/kemponet/kempotube/watch/${videoId}${suffix}`)
  }

  const goToWebsite = () => {
    if (channel?.websiteUrl) {
      const extraParams = [
        isKempoNet ? "kemponet=1" : "",
        isMobile ? "mobile=1" : "",
      ].filter(Boolean).join("&")
      const suffix = extraParams ? `?${extraParams}` : ""
      router.push(`${channel.websiteUrl}${suffix}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    )
  }

  if (!channel) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="text-6xl mb-4">404</div>
        <div className="text-white text-xl font-semibold mb-2">Channel not found</div>
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

      {/* Banner */}
      {channel.bannerUrl && (
        <div className="w-full h-32 sm:h-48 bg-gray-800 overflow-hidden">
          <img
            src={channel.bannerUrl}
            alt={`${channel.name} banner`}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Channel Info */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-700 overflow-hidden flex-shrink-0">
            {channel.avatarUrl ? (
              <img
                src={channel.avatarUrl}
                alt={channel.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-3xl">
                {channel.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Channel Details */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-white">{channel.name}</h1>
            <p className="text-sm text-gray-400">
              @{channel.name.toLowerCase().replace(/\s+/g, '')}
            </p>

            <p className="text-sm text-gray-400 mt-1">
              {channel.videos.length} video{channel.videos.length !== 1 ? 's' : ''}
              {channel.websiteUrl && channel.websiteName && (
                <>
                  {' • '}
                  <button
                    onClick={goToWebsite}
                    className="text-orange-400 hover:underline"
                  >
                    {channel.websiteName}
                  </button>
                </>
              )}
            </p>

            {channel.description && (
              <div className="mt-2">
                {descriptionExpanded ? (
                  <p className="text-sm text-gray-300">
                    {channel.description}
                  </p>
                ) : (
                  <button
                    onClick={() => setDescriptionExpanded(true)}
                    className="text-sm text-gray-300 text-left line-clamp-2"
                  >
                    {channel.description}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Videos Tab */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="py-3 border-b-2 border-orange-500 inline-block">
            <span className="text-white font-medium">Videos</span>
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        {channel.videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="mb-3">
              <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
            </svg>
            <p>No videos yet</p>
          </div>
        ) : (
          <div className={`grid gap-4 ${isKempoNet ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}`}>
            {channel.videos.map((video) => (
              <div
                key={video.id}
                className="group cursor-pointer pb-3"
                onClick={() => goToVideo(video.id)}
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
                    <div className="w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
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
                  {video.views > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {video.views.toLocaleString()} view{video.views !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
