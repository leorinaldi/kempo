"use client"

import { useRef, useState, useEffect } from "react"
import Link from "next/link"

interface Station {
  id: string
  name: string
  artist: string
  artistSlug: string
  url: string
}

type VolumeLevel = "LOW" | "MED" | "HIGH"
const volumeLevels: { level: VolumeLevel; value: number; rotation: number }[] = [
  { level: "LOW", value: 0.3, rotation: -45 },
  { level: "MED", value: 0.6, rotation: 0 },
  { level: "HIGH", value: 1.0, rotation: 45 },
]

export default function RadioPage() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [stations, setStations] = useState<Station[]>([])
  const [currentStation, setCurrentStation] = useState(0)
  const [isOn, setIsOn] = useState(false)
  const [volumeIndex, setVolumeIndex] = useState(1) // Start at MED
  const [isLoading, setIsLoading] = useState(true)

  const currentVolume = volumeLevels[volumeIndex]
  const [tuneRotation, setTuneRotation] = useState(0)

  // Load playlist on mount
  useEffect(() => {
    fetch('/radio-playlist.json')
      .then(res => res.json())
      .then(data => {
        setStations(data)
        setIsLoading(false)
      })
      .catch(err => {
        console.error('Failed to load playlist:', err)
        setIsLoading(false)
      })
  }, [])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = currentVolume.value
    }
  }, [currentVolume])

  useEffect(() => {
    if (audioRef.current) {
      if (isOn) {
        audioRef.current.play()
      } else {
        audioRef.current.pause()
      }
    }
  }, [isOn])

  // Auto-play when station changes (if radio is on)
  useEffect(() => {
    if (audioRef.current && isOn) {
      audioRef.current.play()
    }
  }, [currentStation, isOn])

  const togglePower = () => {
    setIsOn(!isOn)
  }

  const cycleVolume = () => {
    setVolumeIndex((prev) => (prev + 1) % volumeLevels.length)
  }

  const handleTuneClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const knobWidth = rect.width
    const isLeftSide = clickX < knobWidth * 0.4 // Left 40% of knob

    // Animate dial swing
    if (isLeftSide) {
      // Previous station - swing left
      setTuneRotation(-45)
      setCurrentStation((prev) => (prev - 1 + stations.length) % stations.length)
    } else {
      // Next station - swing right
      setTuneRotation(45)
      setCurrentStation((prev) => (prev + 1) % stations.length)
    }

    // Reset audio to beginning
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      if (isOn) {
        audioRef.current.play()
      }
    }

    // Return dial to center after animation
    setTimeout(() => {
      setTuneRotation(0)
    }, 200)
  }

  const handleSongEnd = () => {
    // Auto-advance to next song with dial animation
    setTuneRotation(45)
    setCurrentStation((prev) => (prev + 1) % stations.length)

    setTimeout(() => {
      setTuneRotation(0)
    }, 200)
  }

  const station = stations[currentStation] || null

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-950 to-stone-900 flex flex-col items-center justify-center p-4">
        <p className="text-amber-200/50 font-serif">Loading radio...</p>
      </div>
    )
  }

  if (stations.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-950 to-stone-900 flex flex-col items-center justify-center p-4">
        <Link
          href="/"
          className="absolute top-4 left-4 text-amber-200/70 hover:text-amber-200 transition-colors"
        >
          ← Back to Kempo
        </Link>
        <h1 className="text-amber-200 text-3xl font-serif mb-8 tracking-wider">
          KEMPO RADIO
        </h1>
        <p className="text-amber-200/50 font-serif">No stations available</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-950 to-stone-900 flex flex-col items-center justify-center p-4">
      {/* Back link */}
      <Link
        href="/"
        className="absolute top-4 left-4 text-amber-200/70 hover:text-amber-200 transition-colors"
      >
        ← Back to Kempo
      </Link>

      {/* Title */}
      <h1 className="text-amber-200 text-3xl font-serif mb-8 tracking-wider">
        KEMPO RADIO
      </h1>

      {/* Radio Unit */}
      <div className="relative">
        {/* Radio Body */}
        <div
          className="w-[400px] h-[280px] rounded-2xl p-6 relative overflow-hidden"
          style={{
            background: "linear-gradient(145deg, #8B4513, #654321, #4a3728)",
            boxShadow: `
              0 20px 40px rgba(0,0,0,0.5),
              inset 0 2px 4px rgba(255,255,255,0.1),
              inset 0 -2px 4px rgba(0,0,0,0.3)
            `,
          }}
        >
          {/* Wood grain texture overlay */}
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              backgroundImage: `repeating-linear-gradient(
                90deg,
                transparent,
                transparent 2px,
                rgba(0,0,0,0.1) 2px,
                rgba(0,0,0,0.1) 4px
              )`
            }}
          />

          {/* Speaker Grill */}
          <div
            className="w-full h-24 rounded-lg mb-4 flex items-center justify-center"
            style={{
              background: "linear-gradient(180deg, #2a2a2a, #1a1a1a)",
              boxShadow: "inset 0 2px 8px rgba(0,0,0,0.5)",
            }}
          >
            {/* Grill lines */}
            <div className="w-[90%] h-[80%] flex flex-col justify-between">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-1 rounded-full"
                  style={{
                    background: "linear-gradient(90deg, #3a3a3a, #4a4a4a, #3a3a3a)",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.5)"
                  }}
                />
              ))}
            </div>
          </div>

          {/* Display Panel */}
          <div
            className="w-full h-12 rounded-md mb-4 flex items-center justify-center"
            style={{
              background: isOn
                ? "linear-gradient(180deg, #fef3c7, #fde68a)"
                : "linear-gradient(180deg, #78716c, #57534e)",
              boxShadow: isOn
                ? "inset 0 0 20px rgba(251, 191, 36, 0.5), 0 0 10px rgba(251, 191, 36, 0.3)"
                : "inset 0 2px 4px rgba(0,0,0,0.3)",
              transition: "all 0.5s ease"
            }}
          >
            {isOn && (
              <div className="text-center">
                <p className="text-amber-900 text-xs font-mono tracking-wide">
                  {station.artist}
                </p>
                <p className="text-amber-800 text-sm font-serif font-bold">
                  {station.name}
                </p>
              </div>
            )}
          </div>

          {/* Controls Panel */}
          <div className="flex justify-between items-start px-4 pb-6">
            {/* Volume Knob */}
            <div className="flex flex-col items-center">
              <div
                className="w-14 h-14 rounded-full cursor-pointer relative"
                style={{
                  background: "linear-gradient(145deg, #4a4a4a, #2a2a2a)",
                  boxShadow: `
                    0 4px 8px rgba(0,0,0,0.4),
                    inset 0 2px 4px rgba(255,255,255,0.1)
                  `
                }}
                onClick={cycleVolume}
              >
                {/* Knob indicator */}
                <div
                  className="absolute top-2 left-1/2 w-1 h-3 bg-amber-200 rounded-full"
                  style={{
                    transform: `translateX(-50%) rotate(${currentVolume.rotation}deg)`,
                    transformOrigin: "bottom center",
                    transition: "transform 0.2s ease"
                  }}
                />
                {/* Center cap */}
                <div
                  className="absolute top-1/2 left-1/2 w-5 h-5 rounded-full transform -translate-x-1/2 -translate-y-1/2"
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
                className="w-16 h-8 rounded-full cursor-pointer relative flex items-center px-1"
                style={{
                  background: "linear-gradient(180deg, #2a2a2a, #1a1a1a)",
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3)"
                }}
                onClick={togglePower}
              >
                {/* Toggle switch */}
                <div
                  className="w-6 h-6 rounded-full transition-all duration-300"
                  style={{
                    background: isOn
                      ? "linear-gradient(145deg, #fbbf24, #d97706)"
                      : "linear-gradient(145deg, #5a5a5a, #3a3a3a)",
                    boxShadow: isOn
                      ? "0 0 10px rgba(251, 191, 36, 0.5)"
                      : "0 2px 4px rgba(0,0,0,0.3)",
                    transform: isOn ? "translateX(32px)" : "translateX(0)",
                  }}
                />
              </div>
              <span className="text-amber-200/60 text-xs mt-2 font-serif">
                {isOn ? "ON" : "OFF"}
              </span>
            </div>

            {/* Station/Tuning Knob */}
            <div className="flex flex-col items-center">
              <div
                className="w-14 h-14 rounded-full relative cursor-pointer"
                style={{
                  background: "linear-gradient(145deg, #4a4a4a, #2a2a2a)",
                  boxShadow: `
                    0 4px 8px rgba(0,0,0,0.4),
                    inset 0 2px 4px rgba(255,255,255,0.1)
                  `
                }}
                onClick={handleTuneClick}
              >
                {/* Knob indicator - animates on click */}
                <div
                  className="absolute top-2 left-1/2 w-1 h-3 bg-amber-200 rounded-full"
                  style={{
                    transform: `translateX(-50%) rotate(${tuneRotation}deg)`,
                    transformOrigin: "bottom center",
                    transition: "transform 0.15s ease-out"
                  }}
                />
                {/* Center cap */}
                <div
                  className="absolute top-1/2 left-1/2 w-5 h-5 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    background: "linear-gradient(145deg, #5a5a5a, #3a3a3a)",
                  }}
                />
              </div>
              <span className="text-amber-200/60 text-xs mt-2 font-serif">TUNE</span>
            </div>
          </div>

        </div>

        {/* Radio feet */}
        <div className="flex justify-between px-8 -mt-1">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-8 h-3 rounded-b-lg"
              style={{
                background: "linear-gradient(180deg, #4a3728, #2a1f18)",
                boxShadow: "0 4px 8px rgba(0,0,0,0.4)"
              }}
            />
          ))}
        </div>
      </div>

      {/* Audio element */}
      <audio
        ref={audioRef}
        src={station.url}
        preload="metadata"
        onEnded={handleSongEnd}
      />

      {/* Attribution */}
      <p className="text-amber-200/30 text-xs mt-4 font-serif">
        Now playing from the Kempo Universe • <Link href={`/kempopedia/wiki/${station.artistSlug}`} className="underline hover:text-amber-200/50">{station.artist}</Link>
      </p>
    </div>
  )
}
