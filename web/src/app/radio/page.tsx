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
  const [currentStation, setCurrentStation] = useState(-1) // Will be set to last item
  const [isOn, setIsOn] = useState(false)
  const [volumeIndex, setVolumeIndex] = useState(1) // Start at MED
  const [isLoading, setIsLoading] = useState(true)

  const currentVolume = volumeLevels[volumeIndex]
  const [tuneRotation, setTuneRotation] = useState(0)

  // Load playlist from database
  useEffect(() => {
    fetch('/api/radio/playlist')
      .then(res => res.json())
      .then(data => {
        setStations(data)
        // Start at the last item (newest/most recent)
        setCurrentStation(data.length - 1)
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
    // Reverse chronological: right = go back in time (lower index), left = go forward in time (higher index)
    if (isLeftSide) {
      // Forward in time (higher index) - swing left
      setTuneRotation(-45)
      setCurrentStation((prev) => (prev + 1) % stations.length)
    } else {
      // Back in time (lower index) - swing right
      setTuneRotation(45)
      setCurrentStation((prev) => (prev - 1 + stations.length) % stations.length)
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
    // Auto-advance to next song (go back in time - lower index)
    setTuneRotation(45)
    setCurrentStation((prev) => (prev - 1 + stations.length) % stations.length)

    setTimeout(() => {
      setTuneRotation(0)
    }, 200)
  }

  const station = stations[currentStation] || null

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      </div>
    )
  }

  if (stations.length === 0) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
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
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      {/* Back link */}
      <Link
        href="/"
        className="absolute top-4 left-4 text-white hover:underline transition-colors"
        style={{
          textShadow: '0 0 20px rgba(100,150,255,1), 0 0 40px rgba(80,130,255,0.9), 0 0 60px rgba(60,120,255,0.8), 0 0 100px rgba(50,100,255,0.7), 0 0 150px rgba(40,80,255,0.5)'
        }}
      >
        ← Back to Kempo
      </Link>

      {/* Title */}
      <h1
        className="text-white text-3xl font-serif mb-8 tracking-wider"
        style={{
          textShadow: '0 0 20px rgba(100,150,255,1), 0 0 40px rgba(80,130,255,0.9), 0 0 60px rgba(60,120,255,0.8), 0 0 100px rgba(50,100,255,0.7), 0 0 150px rgba(40,80,255,0.5)'
        }}
      >
        KEMPO RADIO
      </h1>

      {/* Radio Unit - Modern Graphic Novel Style */}
      <div
        className="relative"
        style={{
          filter: 'drop-shadow(0 0 15px rgba(100,150,255,0.4)) drop-shadow(0 0 30px rgba(80,130,255,0.3))',
        }}
      >
        {/* Hard shadow behind radio */}
        <div
          className="absolute top-3 left-3 w-[400px] h-[260px] rounded-lg"
          style={{
            background: '#1a1a1a',
          }}
        />

        {/* Radio Body */}
        <div
          className="w-[400px] rounded-lg p-5 relative border-4 border-gray-900"
          style={{
            background: '#4a5568',
          }}
        >
          {/* Speaker Grill */}
          <div
            className="w-full h-20 rounded border-4 border-gray-900 mb-4 flex items-center justify-center"
            style={{
              background: '#1e293b',
            }}
          >
            {/* Grill lines */}
            <div className="w-[90%] h-[75%] flex flex-col justify-between">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-1.5 rounded-full border border-gray-900"
                  style={{
                    background: '#374151',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Display Panel */}
          <div
            className="w-full h-14 rounded border-4 border-gray-900 mb-4 flex items-center justify-center transition-all duration-300"
            style={{
              background: isOn ? '#e5e7eb' : '#374151',
            }}
          >
            {isOn && (
              <div className="text-center">
                <p className="text-blue-600 text-xs font-mono tracking-wide font-bold">
                  {station.artist}
                </p>
                <p className="text-blue-800 text-sm font-bold">
                  {station.name}
                </p>
              </div>
            )}
          </div>

          {/* Controls Panel */}
          <div className="flex justify-between items-end px-2">
            {/* Volume Knob */}
            <div className="flex flex-col items-center">
              <div
                className="w-14 h-14 rounded-full cursor-pointer relative border-4 border-gray-900"
                style={{
                  background: '#374151',
                }}
                onClick={cycleVolume}
              >
                {/* Knob indicator */}
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

            {/* Power Toggle */}
            <div className="flex flex-col items-center">
              <div
                className="w-16 h-8 rounded-full cursor-pointer relative flex items-center px-1 border-3 border-gray-900"
                style={{
                  background: '#2d3748',
                  borderWidth: '3px',
                }}
                onClick={togglePower}
              >
                {/* Toggle switch */}
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

            {/* Station/Tuning Knob */}
            <div className="flex flex-col items-center">
              <div
                className="w-14 h-14 rounded-full relative cursor-pointer border-4 border-gray-900"
                style={{
                  background: '#374151',
                }}
                onClick={handleTuneClick}
              >
                {/* Knob indicator - animates on click */}
                <div
                  className="absolute top-2 left-1/2 w-1.5 h-4 bg-gray-300 rounded-sm border border-gray-900"
                  style={{
                    transform: `translateX(-50%) rotate(${tuneRotation}deg)`,
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
              <span className="text-gray-300 text-xs mt-2 font-bold tracking-wide">TUNE</span>
            </div>
          </div>

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
      <p
        className="text-white text-sm mt-4 font-serif"
        style={{
          textShadow: '0 0 20px rgba(100,150,255,1), 0 0 40px rgba(80,130,255,0.9), 0 0 60px rgba(60,120,255,0.8), 0 0 100px rgba(50,100,255,0.7), 0 0 150px rgba(40,80,255,0.5)'
        }}
      >
        Now playing from the Kempo Universe • <Link href={`/kempopedia/wiki/${station.artistSlug}`} className="underline hover:opacity-70">{station.artist}</Link>
      </p>
    </div>
  )
}
