"use client"

import { useRef, useState, useEffect } from "react"
import Link from "next/link"

interface Program {
  id: string
  name: string
  description?: string
  url: string
  artist: string
  artistSlug: string
}

type VolumeLevel = "LOW" | "MED" | "HIGH"
const volumeLevels: { level: VolumeLevel; value: number; rotation: number }[] = [
  { level: "LOW", value: 0.3, rotation: -45 },
  { level: "MED", value: 0.6, rotation: 0 },
  { level: "HIGH", value: 1.0, rotation: 45 },
]

export default function TVPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [programs, setPrograms] = useState<Program[]>([])
  const [currentProgram, setCurrentProgram] = useState(-1) // Will be set to last item
  const [isOn, setIsOn] = useState(false)
  const [volumeIndex, setVolumeIndex] = useState(1) // Start at MED
  const [isLoading, setIsLoading] = useState(true)
  const [channelRotation, setChannelRotation] = useState(0)

  const currentVolume = volumeLevels[volumeIndex]

  // Load playlist from database
  useEffect(() => {
    fetch('/api/tv/playlist')
      .then(res => res.json())
      .then(data => {
        setPrograms(data)
        // Start at the last item (newest/most recent)
        setCurrentProgram(data.length - 1)
        setIsLoading(false)
      })
      .catch(err => {
        console.error('Failed to load playlist:', err)
        setIsLoading(false)
      })
  }, [])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = currentVolume.value
    }
  }, [currentVolume])

  useEffect(() => {
    if (videoRef.current) {
      if (isOn) {
        videoRef.current.play()
      } else {
        videoRef.current.pause()
      }
    }
  }, [isOn])

  // Auto-play when program changes (if TV is on)
  useEffect(() => {
    if (videoRef.current && isOn) {
      videoRef.current.play()
    }
  }, [currentProgram, isOn])

  const togglePower = () => {
    setIsOn(!isOn)
  }

  const cycleVolume = () => {
    setVolumeIndex((prev) => (prev + 1) % volumeLevels.length)
  }

  const handleChannelClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const knobWidth = rect.width
    const isLeftSide = clickX < knobWidth * 0.4

    // Reverse chronological: right = go back in time (lower index), left = go forward in time (higher index)
    if (isLeftSide) {
      // Forward in time (higher index) - swing left
      setChannelRotation(-45)
      setCurrentProgram((prev) => (prev + 1) % programs.length)
    } else {
      // Back in time (lower index) - swing right
      setChannelRotation(45)
      setCurrentProgram((prev) => (prev - 1 + programs.length) % programs.length)
    }

    if (videoRef.current) {
      videoRef.current.currentTime = 0
      if (isOn) {
        videoRef.current.play()
      }
    }

    setTimeout(() => {
      setChannelRotation(0)
    }, 200)
  }

  const handleVideoEnd = () => {
    // Auto-advance to next program (go back in time - lower index)
    setChannelRotation(45)
    setCurrentProgram((prev) => (prev - 1 + programs.length) % programs.length)

    setTimeout(() => {
      setChannelRotation(0)
    }, 200)
  }

  const program = programs[currentProgram] || null

  const blueGlow = '0 0 20px rgba(100,150,255,1), 0 0 40px rgba(80,130,255,0.9), 0 0 60px rgba(60,120,255,0.8), 0 0 100px rgba(50,100,255,0.7), 0 0 150px rgba(40,80,255,0.5)'

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      </div>
    )
  }

  if (programs.length === 0) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <Link
          href="/"
          className="absolute top-4 left-4 text-white hover:underline transition-colors"
          style={{ textShadow: blueGlow }}
        >
          ← Back to Kempo
        </Link>
        <h1 className="text-white text-3xl font-serif mb-8 tracking-wider" style={{ textShadow: blueGlow }}>
          KEMPO TV
        </h1>
        <p className="text-white font-serif" style={{ textShadow: blueGlow }}>No programs scheduled</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      {/* Back link */}
      <Link
        href="/"
        className="absolute top-4 left-4 text-white hover:underline transition-colors"
        style={{ textShadow: blueGlow }}
      >
        ← Back to Kempo
      </Link>

      {/* Title */}
      <h1 className="text-white text-3xl font-serif mb-8 tracking-wider" style={{ textShadow: blueGlow }}>
        KEMPO TV
      </h1>

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
            <div
              className="relative w-full aspect-video rounded border-2 border-gray-900 overflow-hidden"
              style={{
                background: isOn ? '#0f172a' : '#1e293b',
              }}
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

              {/* Video element */}
              {isOn && program && (
                <video
                  ref={videoRef}
                  src={program.url}
                  className="w-full h-full object-contain"
                  preload="metadata"
                  onEnded={handleVideoEnd}
                />
              )}

            </div>
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
                  onClick={cycleVolume}
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

      {/* Attribution */}
      <p
        className="text-white text-sm mt-6 font-serif"
        style={{ textShadow: blueGlow }}
      >
        Broadcasting from the Kempo Universe
        {program?.artist && program?.artistSlug && (
          <> • <Link href={`/kemponet/kempopedia/wiki/${program.artistSlug}`} className="underline hover:opacity-70">{program.artist}</Link></>
        )}
      </p>
    </div>
  )
}
