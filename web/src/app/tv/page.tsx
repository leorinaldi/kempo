"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import Link from "next/link"

interface Video {
  id: string
  name: string
  description?: string
  url: string
  artist: string
  artistArticleId: string
}

interface Channel {
  id: string
  name: string
  callSign: string
  videos: Video[]
}

type VolumeLevel = "LOW" | "MED" | "HIGH"
const volumeLevels: { level: VolumeLevel; value: number; rotation: number }[] = [
  { level: "LOW", value: 0.3, rotation: -45 },
  { level: "MED", value: 0.6, rotation: 0 },
  { level: "HIGH", value: 1.0, rotation: 45 },
]

const INTRO_VIDEO_URL = "https://8too1xbunlfsupi8.public.blob.vercel-storage.com/kempo-media/video/kempo-tv-start.mp4"

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export default function TVPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const introVideoRef = useRef<HTMLVideoElement>(null)
  const [channels, setChannels] = useState<Channel[]>([])
  const [currentChannelIndex, setCurrentChannelIndex] = useState(0)
  const [shuffledVideos, setShuffledVideos] = useState<Video[]>([])
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [isOn, setIsOn] = useState(false)
  const [isPlayingIntro, setIsPlayingIntro] = useState(false)
  const [volumeIndex, setVolumeIndex] = useState(1) // Start at MED
  const [isLoading, setIsLoading] = useState(true)
  const [channelRotation, setChannelRotation] = useState(0)
  const [showChannelIndicator, setShowChannelIndicator] = useState(false)

  const currentVolume = volumeLevels[volumeIndex]
  const currentChannel = channels[currentChannelIndex]
  const currentVideo = shuffledVideos[currentVideoIndex]

  // Shuffle videos for a channel
  const shuffleChannelVideos = useCallback((channel: Channel) => {
    const shuffled = shuffleArray(channel.videos)
    setShuffledVideos(shuffled)
    setCurrentVideoIndex(0)
  }, [])

  // Show channel indicator then fade after delay
  const showChannelCallSign = useCallback(() => {
    setShowChannelIndicator(true)
    setTimeout(() => {
      setShowChannelIndicator(false)
    }, 3000)
  }, [])

  // Load channels from database
  useEffect(() => {
    fetch('/api/tv/playlist')
      .then(res => res.json())
      .then((data: Channel[]) => {
        setChannels(data)
        if (data.length > 0) {
          // Start with first channel (alphabetically by callSign)
          const shuffled = shuffleArray(data[0].videos)
          setShuffledVideos(shuffled)
          setCurrentVideoIndex(0)
        }
        setIsLoading(false)
      })
      .catch(err => {
        console.error('Failed to load channels:', err)
        setIsLoading(false)
      })
  }, [])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = currentVolume.value
    }
    if (introVideoRef.current) {
      introVideoRef.current.volume = currentVolume.value
    }
  }, [currentVolume])

  useEffect(() => {
    if (isOn) {
      if (isPlayingIntro && introVideoRef.current) {
        introVideoRef.current.play()
      } else if (!isPlayingIntro && videoRef.current) {
        videoRef.current.play()
      }
    } else {
      if (introVideoRef.current) {
        introVideoRef.current.pause()
      }
      if (videoRef.current) {
        videoRef.current.pause()
      }
    }
  }, [isOn, isPlayingIntro])

  // Auto-play when video changes (if TV is on and not playing intro)
  const currentVideoId = currentVideo?.id
  useEffect(() => {
    if (videoRef.current && isOn && !isPlayingIntro && currentVideoId) {
      // Load and play the new video
      videoRef.current.load()
      videoRef.current.play()
    }
  }, [currentVideoId, isOn, isPlayingIntro])

  const togglePower = () => {
    if (!isOn) {
      // Turning on - start with intro
      setIsPlayingIntro(true)
      setIsOn(true)
    } else {
      // Turning off - reset intro for next time
      setIsOn(false)
      setIsPlayingIntro(false)
      if (introVideoRef.current) {
        introVideoRef.current.currentTime = 0
      }
      if (videoRef.current) {
        videoRef.current.currentTime = 0
      }
    }
  }

  const handleIntroEnd = () => {
    setIsPlayingIntro(false)
    // Start playing the first program
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play()
    }
    // Show channel indicator
    showChannelCallSign()
  }

  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const knobWidth = rect.width
    const isLeftSide = clickX < knobWidth * 0.4

    if (isLeftSide) {
      // Quieter (lower index, min 0)
      setVolumeIndex((prev) => Math.max(0, prev - 1))
    } else {
      // Louder (higher index, max 2)
      setVolumeIndex((prev) => Math.min(volumeLevels.length - 1, prev + 1))
    }
  }

  const handleChannelClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // If playing intro, skip it and go to first video
    if (isPlayingIntro) {
      setIsPlayingIntro(false)
      if (introVideoRef.current) {
        introVideoRef.current.pause()
        introVideoRef.current.currentTime = 0
      }
      return
    }

    if (channels.length <= 1) return // No other channels to switch to

    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const knobWidth = rect.width
    const isLeftSide = clickX < knobWidth * 0.4

    // Switch to next/previous channel
    let newChannelIndex: number
    if (isLeftSide) {
      // Previous channel - swing left
      setChannelRotation(-45)
      newChannelIndex = (currentChannelIndex - 1 + channels.length) % channels.length
    } else {
      // Next channel - swing right
      setChannelRotation(45)
      newChannelIndex = (currentChannelIndex + 1) % channels.length
    }

    setCurrentChannelIndex(newChannelIndex)

    // Shuffle the new channel's videos
    const newChannel = channels[newChannelIndex]
    const shuffled = shuffleArray(newChannel.videos)
    setShuffledVideos(shuffled)
    setCurrentVideoIndex(0)

    // Show channel indicator
    showChannelCallSign()

    setTimeout(() => {
      setChannelRotation(0)
    }, 200)
  }

  const handleVideoEnd = () => {
    // Play next video in the shuffled playlist (loops back to start)
    setCurrentVideoIndex((prev) => (prev + 1) % shuffledVideos.length)
  }

  const blueGlow = '0 0 20px rgba(100,150,255,1), 0 0 40px rgba(80,130,255,0.9), 0 0 60px rgba(60,120,255,0.8), 0 0 100px rgba(50,100,255,0.7), 0 0 150px rgba(40,80,255,0.5)'

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      </div>
    )
  }

  if (channels.length === 0 || shuffledVideos.length === 0) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <p className="text-white font-serif" style={{ textShadow: blueGlow }}>No programs scheduled</p>
      </div>
    )
  }

  return (
    <div className="fixed left-0 right-0 bg-black flex flex-col items-center justify-center p-4" style={{ top: 56, bottom: 0, overflow: 'hidden' }}>
      {/* TV Unit - Modern Graphic Novel Style */}
      <div
        className="relative"
        style={{
          filter: 'drop-shadow(0 0 15px rgba(100,150,255,0.4)) drop-shadow(0 0 30px rgba(80,130,255,0.3))',
        }}
      >
        {/* Hard shadow behind TV */}
        <div
          className="absolute top-3 left-3 w-[calc(100vw-2rem)] sm:w-[650px] rounded-lg"
          style={{
            height: 'calc(100% - 12px)',
            background: '#1a1a1a',
          }}
        />

        {/* TV Cabinet */}
        <div
          className="w-[calc(100vw-2rem)] sm:w-[650px] rounded-lg p-3 sm:p-5 relative border-4 border-gray-900"
          style={{
            background: '#4a5568',
          }}
        >
          {/* Screen Bezel */}
          <div
            className="rounded border-4 border-gray-900 p-2 mb-4"
            style={{
              background: '#2d3748',
            }}
          >
            {/* Screen */}
            <Link
              href={!isPlayingIntro && currentVideo?.artistArticleId ? `/kemponet/kempopedia/wiki/${currentVideo.artistArticleId}` : '#'}
              className="relative w-full aspect-video rounded border-2 border-gray-900 overflow-hidden block cursor-pointer"
              style={{
                background: isOn ? '#0f172a' : '#1e293b',
              }}
              onClick={(e) => isPlayingIntro && e.preventDefault()}
            >
              {/* Screen glare - graphic novel style */}
              {isOn && (
                <div
                  className="absolute top-0 left-0 w-1/3 h-1/3 pointer-events-none z-10"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%)',
                  }}
                />
              )}

              {/* Intro video */}
              {isOn && isPlayingIntro && (
                <video
                  ref={introVideoRef}
                  src={INTRO_VIDEO_URL}
                  className="w-full h-full object-cover"
                  preload="metadata"
                  onEnded={handleIntroEnd}
                />
              )}

              {/* Program video */}
              {isOn && !isPlayingIntro && currentVideo && (
                <video
                  ref={videoRef}
                  src={currentVideo.url}
                  className="w-full h-full object-contain"
                  preload="metadata"
                  onEnded={handleVideoEnd}
                />
              )}

              {/* Channel indicator */}
              {isOn && !isPlayingIntro && currentChannel && (
                <div
                  className="absolute bottom-4 left-4 pointer-events-none transition-opacity duration-500"
                  style={{
                    opacity: showChannelIndicator ? 0.4 : 0,
                  }}
                >
                  <span
                    className="text-2xl font-bold tracking-wider"
                    style={{
                      color: '#d1d5db',
                      textShadow: `
                        -1px -1px 0 #111,
                        1px -1px 0 #111,
                        -1px 1px 0 #111,
                        1px 1px 0 #111,
                        0 0 4px rgba(156, 163, 175, 0.8)
                      `,
                    }}
                  >
                    {currentChannel.callSign}
                  </span>
                </div>
              )}

            </Link>
          </div>

          {/* Controls Panel */}
          <div className="flex justify-between items-end px-4">
            {/* Power Toggle - Left side */}
            <div className="flex flex-col items-center">
              <div
                className="w-16 h-8 rounded-full cursor-pointer relative flex items-center px-1 border-3 border-gray-900"
                style={{
                  background: '#2d3748',
                  borderWidth: '3px',
                }}
                onClick={togglePower}
              >
                <div
                  className="w-6 h-6 rounded-full transition-all duration-300 border-2 border-gray-900"
                  style={{
                    background: isOn ? '#60a5fa' : '#4b5563',
                    transform: isOn ? 'translateX(30px)' : 'translateX(0)',
                    boxShadow: isOn ? '0 0 12px rgba(96, 165, 250, 0.8)' : 'none',
                  }}
                />
              </div>
              <span className="text-gray-300 text-xs mt-2 font-bold tracking-wide">
                {isOn ? 'ON' : 'OFF'}
              </span>
            </div>

            {/* Volume and Channel Knobs - Right side */}
            <div className="flex gap-5">
              {/* Volume Knob */}
              <div className="flex flex-col items-center">
                <div
                  className="w-14 h-14 rounded-full cursor-pointer relative border-4 border-gray-900"
                  style={{
                    background: '#374151',
                  }}
                  onClick={handleVolumeClick}
                >
                  {/* Knob indicator line */}
                  <div
                    className="absolute top-2 left-1/2 w-1.5 h-4 bg-gray-300 rounded-sm border border-gray-900"
                    style={{
                      transform: `translateX(-50%) rotate(${currentVolume.rotation}deg)`,
                      transformOrigin: 'bottom center',
                      transition: 'transform 0.2s ease',
                    }}
                  />
                  {/* Center dot */}
                  <div
                    className="absolute top-1/2 left-1/2 w-4 h-4 rounded-full transform -translate-x-1/2 -translate-y-1/2 border-2 border-gray-900"
                    style={{
                      background: '#4b5563',
                    }}
                  />
                </div>
                <span className="text-gray-300 text-xs mt-2 font-bold tracking-wide">VOL</span>
              </div>

              {/* Channel Knob */}
              <div className="flex flex-col items-center">
                <div
                  className="w-14 h-14 rounded-full relative cursor-pointer border-4 border-gray-900"
                  style={{
                    background: '#374151',
                  }}
                  onClick={handleChannelClick}
                >
                  {/* Knob indicator line */}
                  <div
                    className="absolute top-2 left-1/2 w-1.5 h-4 bg-gray-300 rounded-sm border border-gray-900"
                    style={{
                      transform: `translateX(-50%) rotate(${channelRotation}deg)`,
                      transformOrigin: 'bottom center',
                      transition: 'transform 0.15s ease-out',
                    }}
                  />
                  {/* Center dot */}
                  <div
                    className="absolute top-1/2 left-1/2 w-4 h-4 rounded-full transform -translate-x-1/2 -translate-y-1/2 border-2 border-gray-900"
                    style={{
                      background: '#4b5563',
                    }}
                  />
                </div>
                <span className="text-gray-300 text-xs mt-2 font-bold tracking-wide">CH</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
