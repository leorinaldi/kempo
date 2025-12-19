'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

// Subtitles parsed from SRT file - timestamps in seconds
const subtitles = [
  { start: 0.079, end: 4.759, text: "Imagine, if you will, a world that is eerily like ours, but also different." },
  { start: 5.440, end: 10.159, text: "A world that echoes our reality, but has changed just enough to make you see" },
  { start: 10.159, end: 15.359, text: "everything in a new way. It's as if you woke up from a dream and stepped into a" },
  { start: 15.359, end: 16.840, text: "slightly altered life." },
  { start: 17.779, end: 20.239, text: "This world is called Kempo." },
]

const AUDIO_STOP_TIME = 20.5 // Stop shortly after "This world is called Kempo."

const blueGlow = '0 0 20px rgba(100,150,255,1), 0 0 40px rgba(80,130,255,0.9), 0 0 60px rgba(60,120,255,0.8), 0 0 100px rgba(50,100,255,0.7), 0 0 150px rgba(40,80,255,0.5)'

export default function AboutPage() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const [needsClick, setNeedsClick] = useState(true)
  const [audioEnded, setAudioEnded] = useState(false)

  const startPlayback = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().then(() => {
        setHasStarted(true)
        setNeedsClick(false)
      }).catch(() => {
        // Still blocked
      })
    }
  }

  // Audio playback is triggered by user click (startPlayback function)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
      // Stop audio at the designated time
      if (audio.currentTime >= AUDIO_STOP_TIME) {
        audio.pause()
        setAudioEnded(true)
      }
    }

    const handleEnded = () => {
      setAudioEnded(true)
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  // Get visible text based on current time
  const visibleSubtitles = subtitles.filter(sub => currentTime >= sub.start)

  // Find the latest subtitle that has started (to determine what's "past")
  let latestStartedIndex = -1
  for (let i = 0; i < subtitles.length; i++) {
    if (currentTime >= subtitles[i].start) {
      latestStartedIndex = i
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Back link */}
      <Link
        href="/"
        className="absolute top-4 left-4 text-white hover:underline transition-colors z-10"
        style={{ textShadow: blueGlow }}
      >
        ← Back to Kempo
      </Link>

      {/* Audio element */}
      <audio ref={audioRef} src="/media/kempo-world-description.mp3" />

      {/* Click to play overlay */}
      {needsClick && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center cursor-pointer"
          onClick={startPlayback}
        >
          <div
            className="text-white text-xl px-6 py-3 rounded-lg border border-gray-500 hover:border-white transition-colors"
            style={{
              textShadow: '0 0 10px rgba(100,150,255,0.8)',
              background: 'rgba(0,0,0,0.7)'
            }}
          >
            Click to play
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="min-h-screen flex items-start justify-center pl-8 pr-32 pt-20">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-8 max-w-6xl w-full">
          {/* Announcer image - left side */}
          <div className="flex-shrink-0 md:w-[300px] flex justify-end overflow-hidden">
            <Image
              src="/media/kempo-announcer.png"
              alt="Kempo Announcer"
              width={400}
              height={600}
              className="max-h-[70vh] w-auto object-contain mt-[-10%]"
              priority
            />
          </div>

          {/* Description text - right side */}
          <div className="md:w-[500px] min-h-[400px] flex-shrink-0">
            <p className="text-lg md:text-xl leading-relaxed">
              {visibleSubtitles.map((sub, index) => {
                const subtitleIndex = subtitles.indexOf(sub)
                const isPast = subtitleIndex < latestStartedIndex && !audioEnded

                // Indices 1-4 contain the highlight phrase
                const isHighlightPhrase = subtitleIndex >= 1 && subtitleIndex <= 4

                let color = '#f3f4f6' // white (current)
                if (audioEnded) {
                  color = isHighlightPhrase ? '#f3f4f6' : '#000000' // white or black
                } else if (isPast) {
                  color = '#4b5563' // grey
                }

                return (
                  <span
                    key={index}
                    className="transition-colors duration-[2000ms]"
                    style={{
                      opacity: 0,
                      animation: 'fadeIn 0.3s ease-out forwards',
                      color: color,
                    }}
                  >
                    {sub.text}{' '}
                  </span>
                )
              })}
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </main>
  )
}
