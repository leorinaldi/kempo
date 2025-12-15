"use client"

import { useRef, useState, useEffect } from "react"
import Link from "next/link"

interface Program {
  id: string
  name: string
  description?: string
  url: string
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
  const [currentProgram, setCurrentProgram] = useState(0)
  const [isOn, setIsOn] = useState(false)
  const [volumeIndex, setVolumeIndex] = useState(1) // Start at MED
  const [isLoading, setIsLoading] = useState(true)
  const [channelRotation, setChannelRotation] = useState(0)

  const currentVolume = volumeLevels[volumeIndex]

  // Load playlist on mount
  useEffect(() => {
    fetch('/tv-playlist.json')
      .then(res => res.json())
      .then(data => {
        setPrograms(data)
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

    if (isLeftSide) {
      setChannelRotation(-45)
      setCurrentProgram((prev) => (prev - 1 + programs.length) % programs.length)
    } else {
      setChannelRotation(45)
      setCurrentProgram((prev) => (prev + 1) % programs.length)
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
    setChannelRotation(45)
    setCurrentProgram((prev) => (prev + 1) % programs.length)

    setTimeout(() => {
      setChannelRotation(0)
    }, 200)
  }

  const program = programs[currentProgram] || null

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-800 to-stone-950 flex flex-col items-center justify-center p-4">
        <p className="text-amber-200/50 font-serif">Warming up tubes...</p>
      </div>
    )
  }

  if (programs.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-800 to-stone-950 flex flex-col items-center justify-center p-4">
        <Link
          href="/"
          className="absolute top-4 left-4 text-amber-200/70 hover:text-amber-200 transition-colors"
        >
          ← Back to Kempo
        </Link>
        <h1 className="text-amber-200 text-3xl font-serif mb-8 tracking-wider">
          KEMPO TV
        </h1>
        <p className="text-amber-200/50 font-serif">No programs scheduled</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-800 to-stone-950 flex flex-col items-center justify-center p-4">
      {/* Back link */}
      <Link
        href="/"
        className="absolute top-4 left-4 text-amber-200/70 hover:text-amber-200 transition-colors"
      >
        ← Back to Kempo
      </Link>

      {/* Title */}
      <h1 className="text-amber-200 text-3xl font-serif mb-8 tracking-wider">
        KEMPO TV
      </h1>

      {/* TV Unit */}
      <div className="relative">
        {/* TV Cabinet */}
        <div
          className="w-[500px] rounded-2xl p-6 relative overflow-hidden"
          style={{
            background: "linear-gradient(145deg, #5D4037, #4E342E, #3E2723)",
            boxShadow: `
              0 20px 40px rgba(0,0,0,0.6),
              inset 0 2px 4px rgba(255,255,255,0.1),
              inset 0 -2px 4px rgba(0,0,0,0.3)
            `,
          }}
        >
          {/* Wood grain texture overlay */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `repeating-linear-gradient(
                85deg,
                transparent,
                transparent 3px,
                rgba(0,0,0,0.15) 3px,
                rgba(0,0,0,0.15) 6px
              )`
            }}
          />

          {/* Screen Bezel */}
          <div
            className="rounded-lg p-3 mb-4"
            style={{
              background: "linear-gradient(180deg, #1a1a1a, #0a0a0a)",
              boxShadow: "inset 0 4px 12px rgba(0,0,0,0.8)",
            }}
          >
            {/* Screen */}
            <div
              className="relative w-full aspect-video rounded overflow-hidden"
              style={{
                background: isOn
                  ? "linear-gradient(180deg, #1a1a1a, #0f0f0f)"
                  : "linear-gradient(180deg, #2a2a2a, #1a1a1a)",
                boxShadow: isOn
                  ? "inset 0 0 30px rgba(200, 200, 200, 0.1)"
                  : "inset 0 0 20px rgba(0,0,0,0.5)",
              }}
            >
              {/* Scanlines overlay */}
              {isOn && (
                <div
                  className="absolute inset-0 pointer-events-none z-10 opacity-10"
                  style={{
                    backgroundImage: `repeating-linear-gradient(
                      0deg,
                      transparent,
                      transparent 2px,
                      rgba(0,0,0,0.3) 2px,
                      rgba(0,0,0,0.3) 4px
                    )`
                  }}
                />
              )}

              {/* Screen curvature effect */}
              <div
                className="absolute inset-0 pointer-events-none z-20"
                style={{
                  background: `radial-gradient(
                    ellipse at center,
                    transparent 60%,
                    rgba(0,0,0,0.3) 100%
                  )`,
                  borderRadius: "4px",
                }}
              />

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

              {/* Off screen - static pattern */}
              {!isOn && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-gray-600 rounded-full" />
                </div>
              )}
            </div>
          </div>

          {/* Program Title Display */}
          <div
            className="w-full h-8 rounded mb-4 flex items-center justify-center"
            style={{
              background: isOn
                ? "linear-gradient(180deg, #fef3c7, #fde68a)"
                : "linear-gradient(180deg, #57534e, #44403c)",
              boxShadow: isOn
                ? "inset 0 0 10px rgba(251, 191, 36, 0.3)"
                : "inset 0 2px 4px rgba(0,0,0,0.3)",
              transition: "all 0.5s ease"
            }}
          >
            {isOn && (
              <p className="text-amber-900 text-sm font-serif font-bold tracking-wide">
                {program.name}
              </p>
            )}
          </div>

          {/* Controls Panel */}
          <div className="flex justify-between items-start px-8">
            {/* Volume Knob */}
            <div className="flex flex-col items-center">
              <div
                className="w-12 h-12 rounded-full cursor-pointer relative"
                style={{
                  background: "linear-gradient(145deg, #4a4a4a, #2a2a2a)",
                  boxShadow: `
                    0 4px 8px rgba(0,0,0,0.4),
                    inset 0 2px 4px rgba(255,255,255,0.1)
                  `
                }}
                onClick={cycleVolume}
              >
                <div
                  className="absolute top-2 left-1/2 w-1 h-2.5 bg-amber-200 rounded-full"
                  style={{
                    transform: `translateX(-50%) rotate(${currentVolume.rotation}deg)`,
                    transformOrigin: "bottom center",
                    transition: "transform 0.2s ease"
                  }}
                />
                <div
                  className="absolute top-1/2 left-1/2 w-4 h-4 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    background: "linear-gradient(145deg, #5a5a5a, #3a3a3a)",
                  }}
                />
              </div>
              <span className="text-amber-200/60 text-xs mt-2 font-serif">VOL</span>
              <span className="text-amber-200/40 text-[10px] font-serif">{currentVolume.level}</span>
            </div>

            {/* Power Toggle */}
            <div className="flex flex-col items-center">
              <div
                className="w-14 h-7 rounded-full cursor-pointer relative flex items-center px-1"
                style={{
                  background: "linear-gradient(180deg, #2a2a2a, #1a1a1a)",
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3)"
                }}
                onClick={togglePower}
              >
                <div
                  className="w-5 h-5 rounded-full transition-all duration-300"
                  style={{
                    background: isOn
                      ? "linear-gradient(145deg, #22c55e, #16a34a)"
                      : "linear-gradient(145deg, #5a5a5a, #3a3a3a)",
                    boxShadow: isOn
                      ? "0 0 10px rgba(34, 197, 94, 0.5)"
                      : "0 2px 4px rgba(0,0,0,0.3)",
                    transform: isOn ? "translateX(28px)" : "translateX(0)",
                  }}
                />
              </div>
              <span className="text-amber-200/60 text-xs mt-2 font-serif">
                {isOn ? "ON" : "OFF"}
              </span>
            </div>

            {/* Channel Knob */}
            <div className="flex flex-col items-center">
              <div
                className="w-12 h-12 rounded-full relative cursor-pointer"
                style={{
                  background: "linear-gradient(145deg, #4a4a4a, #2a2a2a)",
                  boxShadow: `
                    0 4px 8px rgba(0,0,0,0.4),
                    inset 0 2px 4px rgba(255,255,255,0.1)
                  `
                }}
                onClick={handleChannelClick}
              >
                <div
                  className="absolute top-2 left-1/2 w-1 h-2.5 bg-amber-200 rounded-full"
                  style={{
                    transform: `translateX(-50%) rotate(${channelRotation}deg)`,
                    transformOrigin: "bottom center",
                    transition: "transform 0.15s ease-out"
                  }}
                />
                <div
                  className="absolute top-1/2 left-1/2 w-4 h-4 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    background: "linear-gradient(145deg, #5a5a5a, #3a3a3a)",
                  }}
                />
              </div>
              <span className="text-amber-200/60 text-xs mt-2 font-serif">CH</span>
            </div>
          </div>
        </div>

        {/* TV legs */}
        <div className="flex justify-center gap-48 -mt-1">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="w-4 h-16 rounded-b"
              style={{
                background: "linear-gradient(180deg, #3E2723, #2a1f18)",
                boxShadow: "0 4px 8px rgba(0,0,0,0.4)"
              }}
            />
          ))}
        </div>
      </div>

      {/* Attribution */}
      <p className="text-amber-200/30 text-xs mt-6 font-serif">
        Broadcasting from the Kempo Universe
      </p>
    </div>
  )
}
