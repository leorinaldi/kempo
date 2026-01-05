"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { slugify } from "@/lib/slugify"

interface Track {
  id: string
  name: string
  url: string
  artist: string
  artistArticleId: string
  albumId: string
  albumName: string
}

export default function SoundWavesPage() {
  const router = useRouter()
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [isKempoNet, setIsKempoNet] = useState(false)
  const [viewMode, setViewMode] = useState<"tracks" | "albums" | "artists" | "album-tracks" | "artist-tracks">("tracks")
  const [selectedArtist, setSelectedArtist] = useState<{ name: string; articleId: string } | null>(null)
  const [selectedAlbum, setSelectedAlbum] = useState<{ id: string; name: string } | null>(null)
  const [isRolling, setIsRolling] = useState(false)
  const [isEmbedded, setIsEmbedded] = useState(true) // Assume embedded initially to avoid flash
  // Static logo shape: short-tall-tallest-tall-short (matching the icon)
  const staticLevels = [0.25, 0.55, 1.0, 0.55, 0.25]
  const [audioLevels, setAudioLevels] = useState(staticLevels)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const animationRef = useRef<number | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const isAnalyzerSetup = useRef(false)

  // Detect mobile/embedded context
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setIsMobile(params.get("mobile") === "1")
    setIsKempoNet(params.get("kemponet") === "1")
    // Check if embedded (in iframe or has kemponet/mobile params - header is hidden in these cases)
    const inIframe = window.self !== window.top
    const hasEmbedParam = params.get("kemponet") === "1" || params.get("mobile") === "1"
    setIsEmbedded(inIframe || hasEmbedParam)
  }, [])

  // Get unique artists from tracks
  const artists = tracks.reduce((acc, track) => {
    if (track.artist && !acc.find(a => a.articleId === track.artistArticleId)) {
      acc.push({ name: track.artist, articleId: track.artistArticleId })
    }
    return acc
  }, [] as { name: string; articleId: string }[])

  // Get unique albums from tracks
  const albums = tracks.reduce((acc, track) => {
    if (track.albumId && !acc.find(a => a.id === track.albumId)) {
      acc.push({ id: track.albumId, name: track.albumName })
    }
    return acc
  }, [] as { id: string; name: string }[])

  // Toggle view with rolling animation
  const toggleView = () => {
    setIsRolling(true)
    setTimeout(() => {
      if (viewMode === "tracks") {
        setViewMode("albums")
      } else if (viewMode === "albums") {
        setViewMode("artists")
      } else if (viewMode === "artists") {
        setViewMode("tracks")
      } else if (viewMode === "album-tracks") {
        // Go back to albums view
        setViewMode("albums")
        setSelectedAlbum(null)
      } else if (viewMode === "artist-tracks") {
        // Go back to artists view
        setViewMode("artists")
        setSelectedArtist(null)
      }
      setTimeout(() => setIsRolling(false), 150)
    }, 150)
  }

  // Select an artist to view their tracks
  const selectArtist = (artist: { name: string; articleId: string }) => {
    setIsRolling(true)
    setTimeout(() => {
      setSelectedArtist(artist)
      setViewMode("artist-tracks")
      setTimeout(() => setIsRolling(false), 150)
    }, 150)
  }

  // Select an album to view its tracks
  const selectAlbum = (album: { id: string; name: string }) => {
    setIsRolling(true)
    setTimeout(() => {
      setSelectedAlbum(album)
      setViewMode("album-tracks")
      setTimeout(() => setIsRolling(false), 150)
    }, 150)
  }

  // Get tracks for selected artist
  const selectedArtistTracks = selectedArtist
    ? tracks.filter(t => t.artistArticleId === selectedArtist.articleId)
    : []

  // Get tracks for selected album
  const selectedAlbumTracks = selectedAlbum
    ? tracks.filter(t => t.albumId === selectedAlbum.id)
    : []

  // Create persistent audio element on mount
  useEffect(() => {
    const audio = new Audio()
    audio.crossOrigin = "anonymous"
    audioRef.current = audio

    return () => {
      audio.pause()
      audio.src = ""
    }
  }, [])

  // Set up Web Audio API analyzer
  const setupAnalyzer = () => {
    if (isAnalyzerSetup.current || !audioRef.current) return

    try {
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const ctx = new AudioContextClass()
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 128
      analyser.smoothingTimeConstant = 0.75

      const source = ctx.createMediaElementSource(audioRef.current)
      source.connect(analyser)
      analyser.connect(ctx.destination)

      audioContextRef.current = ctx
      analyserRef.current = analyser
      sourceRef.current = source
      isAnalyzerSetup.current = true
    } catch (e) {
      console.error("Failed to set up audio analyzer:", e)
    }
  }

  // Visualizer animation loop
  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
      setAudioLevels(staticLevels)
      return
    }

    const animate = () => {
      if (analyserRef.current) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
        analyserRef.current.getByteFrequencyData(dataArray)

        // Map frequency bins to 5 bars with scaling factors to balance energy
        // Bass has more energy, so we reduce its influence
        const levels = [
          Math.max(0.15, Math.min(1, (dataArray[2] / 255) * 0.6)),   // Sub-bass (reduced)
          Math.max(0.15, Math.min(1, (dataArray[4] / 255) * 0.75)),  // Bass (reduced)
          Math.max(0.15, Math.min(1, (dataArray[8] / 255) * 1.0)),   // Mids
          Math.max(0.15, Math.min(1, (dataArray[12] / 255) * 1.2)),  // Upper mids (boosted)
          Math.max(0.15, Math.min(1, (dataArray[16] / 255) * 1.4)),  // Highs (boosted)
        ]
        setAudioLevels(levels)
      }
      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
    }
  }, [isPlaying])

  // Fetch tracks - read ky date from localStorage (same key as header uses)
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

    const url = kyParam ? `/api/soundwaves/tracks?ky=${kyParam}` : "/api/soundwaves/tracks"

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setTracks(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to fetch tracks:", err)
        setLoading(false)
      })
  }, [])


  const playTrack = async (track: Track) => {
    if (!audioRef.current) return

    // Set up analyzer on first play (requires user interaction)
    setupAnalyzer()

    // Resume audio context if suspended
    if (audioContextRef.current?.state === "suspended") {
      await audioContextRef.current.resume()
    }

    setCurrentTrack(track)
    audioRef.current.src = track.url
    audioRef.current.play().catch(console.error)
    setIsPlaying(true)
  }

  // Set up audio element event listeners
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      setProgress(audio.currentTime)
      setDuration(audio.duration || 0)
    }

    const handleEnded = () => {
      // Auto-play next track
      if (currentTrack) {
        const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id)
        if (currentIndex < tracks.length - 1) {
          playTrack(tracks[currentIndex + 1])
        } else {
          setIsPlaying(false)
        }
      }
    }

    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("loadedmetadata", handleTimeUpdate)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("loadedmetadata", handleTimeUpdate)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [currentTrack, tracks])

  const togglePlayPause = async () => {
    if (!audioRef.current || !currentTrack) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      // Resume audio context if needed
      if (audioContextRef.current?.state === "suspended") {
        await audioContextRef.current.resume()
      }
      audioRef.current.play().catch(console.error)
      setIsPlaying(true)
    }
  }

  const playNext = () => {
    if (!currentTrack) return
    const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id)
    if (currentIndex < tracks.length - 1) {
      playTrack(tracks[currentIndex + 1])
    }
  }

  const playPrevious = () => {
    if (!currentTrack) return
    const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id)
    if (currentIndex > 0) {
      playTrack(tracks[currentIndex - 1])
    }
  }

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percent = x / rect.width
    audioRef.current.currentTime = percent * duration
  }

  const handleArtistClick = (artistName: string) => {
    const extraParams = [
      isKempoNet ? 'kemponet=1' : '',
      isMobile ? 'mobile=1' : '',
    ].filter(Boolean).join('&')
    const suffix = extraParams ? `?${extraParams}` : ''
    router.push(`/kemponet/kempopedia/wiki/${slugify(artistName)}${suffix}`)
  }

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className={`${isEmbedded ? "h-screen" : "h-[calc(100vh-3.5rem)]"} bg-black flex flex-col overflow-hidden`}>
      {/* Header */}
      <div
        className="flex-shrink-0 px-4 py-5"
        style={{ background: "linear-gradient(180deg, #7c3aed 0%, #5b21b6 100%)" }}
      >
        <h1 className="text-white text-xl font-bold tracking-tight flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
            {/* 5 bars that animate based on audio levels - centered at y=12, max height 16 */}
            <line x1="4" y1={12 - audioLevels[0] * 8} x2="4" y2={12 + audioLevels[0] * 8} stroke="white" strokeWidth="2.5" strokeLinecap="round" style={{ transition: 'all 0.05s ease-out' }} />
            <line x1="8" y1={12 - audioLevels[1] * 8} x2="8" y2={12 + audioLevels[1] * 8} stroke="white" strokeWidth="2.5" strokeLinecap="round" style={{ transition: 'all 0.05s ease-out' }} />
            <line x1="12" y1={12 - audioLevels[2] * 8} x2="12" y2={12 + audioLevels[2] * 8} stroke="white" strokeWidth="2.5" strokeLinecap="round" style={{ transition: 'all 0.05s ease-out' }} />
            <line x1="16" y1={12 - audioLevels[3] * 8} x2="16" y2={12 + audioLevels[3] * 8} stroke="white" strokeWidth="2.5" strokeLinecap="round" style={{ transition: 'all 0.05s ease-out' }} />
            <line x1="20" y1={12 - audioLevels[4] * 8} x2="20" y2={12 + audioLevels[4] * 8} stroke="white" strokeWidth="2.5" strokeLinecap="round" style={{ transition: 'all 0.05s ease-out' }} />
          </svg>
          SoundWaves
        </h1>
      </div>

      {/* View selector - click to toggle between tracks/artists */}
      <button
        onClick={toggleView}
        className="flex-shrink-0 w-full px-4 py-4 bg-gray-900 border-b border-gray-800 text-left hover:bg-gray-800 transition-colors flex items-center justify-between"
      >
        <div
          className={`text-purple-300 text-sm font-medium transition-all duration-150 ${
            isRolling ? "opacity-0 -translate-y-2" : "opacity-100 translate-y-0"
          }`}
        >
          {viewMode === "tracks"
            ? `${tracks.length} tracks`
            : viewMode === "albums"
            ? `${albums.length} albums`
            : viewMode === "artists"
            ? `${artists.length} artists`
            : viewMode === "album-tracks"
            ? selectedAlbum?.name
            : selectedArtist?.name}
        </div>
        {/* Rotating chevron indicator */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className={`text-gray-500 transition-transform duration-300 ${
            viewMode === "albums" ? "rotate-90" : viewMode !== "tracks" ? "rotate-180" : ""
          }`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* Content List */}
      <div className="flex-1 overflow-y-auto">
        {tracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-6">
            <div className="text-5xl mb-4">🎵</div>
            <div className="text-white text-xl font-semibold mb-2">No tracks yet</div>
            <div className="text-gray-400 text-center">
              Music will appear here
            </div>
          </div>
        ) : viewMode === "tracks" ? (
          /* Tracks View */
          <div className="divide-y divide-gray-800">
            {tracks.map((track, index) => (
              <button
                key={track.id}
                onClick={() => playTrack(track)}
                className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors ${
                  currentTrack?.id === track.id
                    ? "bg-purple-900/30"
                    : "hover:bg-gray-900 active:bg-gray-800"
                }`}
              >
                {/* Track number or playing indicator */}
                <div className="w-8 text-center flex-shrink-0">
                  {currentTrack?.id === track.id && isPlaying ? (
                    <div className="flex items-end justify-center gap-[2px] h-4">
                      <div className="w-[3px] bg-purple-400 animate-pulse" style={{ height: "60%" }} />
                      <div className="w-[3px] bg-purple-400 animate-pulse" style={{ height: "100%", animationDelay: "0.2s" }} />
                      <div className="w-[3px] bg-purple-400 animate-pulse" style={{ height: "40%", animationDelay: "0.4s" }} />
                    </div>
                  ) : (
                    <span className="text-gray-500 text-sm">{index + 1}</span>
                  )}
                </div>

                {/* Track info */}
                <div className="flex-1 min-w-0">
                  <div
                    className={`font-medium truncate ${
                      currentTrack?.id === track.id ? "text-purple-400" : "text-white"
                    }`}
                  >
                    {track.name}
                  </div>
                  <div className="text-gray-400 text-sm truncate h-5">
                    {track.artist || "\u00A0"}
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : viewMode === "albums" ? (
          /* Albums View */
          <div className="divide-y divide-gray-800">
            {albums.map((album, index) => {
              const albumTrackCount = tracks.filter(t => t.albumId === album.id).length
              return (
                <button
                  key={album.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    selectAlbum(album)
                  }}
                  className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-900 active:bg-gray-800 transition-colors cursor-pointer"
                >
                  {/* Album number */}
                  <div className="w-8 text-center flex-shrink-0 pointer-events-none">
                    <span className="text-gray-500 text-sm">{index + 1}</span>
                  </div>

                  {/* Album info */}
                  <div className="flex-1 min-w-0 pointer-events-none">
                    <div className="font-medium text-white truncate">
                      {album.name}
                    </div>
                    <div className="text-gray-400 text-sm truncate">
                      {albumTrackCount} {albumTrackCount === 1 ? "track" : "tracks"}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        ) : viewMode === "artists" ? (
          /* Artists View */
          <div className="divide-y divide-gray-800">
            {artists.map((artist, index) => {
              const artistTrackCount = tracks.filter(t => t.artistArticleId === artist.articleId).length
              return (
                <button
                  key={artist.articleId}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    selectArtist(artist)
                  }}
                  className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-900 active:bg-gray-800 transition-colors cursor-pointer"
                >
                  {/* Artist number */}
                  <div className="w-8 text-center flex-shrink-0 pointer-events-none">
                    <span className="text-gray-500 text-sm">{index + 1}</span>
                  </div>

                  {/* Artist info */}
                  <div className="flex-1 min-w-0 pointer-events-none">
                    <div className="font-medium text-white truncate">
                      {artist.name}
                    </div>
                    <div className="text-gray-400 text-sm truncate">
                      {artistTrackCount} {artistTrackCount === 1 ? "track" : "tracks"}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        ) : viewMode === "album-tracks" ? (
          /* Album Tracks View */
          <div className="divide-y divide-gray-800">
            {selectedAlbumTracks.map((track, index) => (
              <button
                key={track.id}
                onClick={() => playTrack(track)}
                className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors ${
                  currentTrack?.id === track.id
                    ? "bg-purple-900/30"
                    : "hover:bg-gray-900 active:bg-gray-800"
                }`}
              >
                {/* Track number or playing indicator */}
                <div className="w-8 text-center flex-shrink-0">
                  {currentTrack?.id === track.id && isPlaying ? (
                    <div className="flex items-end justify-center gap-[2px] h-4">
                      <div className="w-[3px] bg-purple-400 animate-pulse" style={{ height: "60%" }} />
                      <div className="w-[3px] bg-purple-400 animate-pulse" style={{ height: "100%", animationDelay: "0.2s" }} />
                      <div className="w-[3px] bg-purple-400 animate-pulse" style={{ height: "40%", animationDelay: "0.4s" }} />
                    </div>
                  ) : (
                    <span className="text-gray-500 text-sm">{index + 1}</span>
                  )}
                </div>

                {/* Track info */}
                <div className="flex-1 min-w-0">
                  <div
                    className={`font-medium truncate ${
                      currentTrack?.id === track.id ? "text-purple-400" : "text-white"
                    }`}
                  >
                    {track.name}
                  </div>
                  <div className="text-gray-400 text-sm truncate h-5">
                    {track.artist || "\u00A0"}
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          /* Artist Tracks View */
          <div className="divide-y divide-gray-800">
            {selectedArtistTracks.map((track, index) => (
              <button
                key={track.id}
                onClick={() => playTrack(track)}
                className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors ${
                  currentTrack?.id === track.id
                    ? "bg-purple-900/30"
                    : "hover:bg-gray-900 active:bg-gray-800"
                }`}
              >
                {/* Track number or playing indicator */}
                <div className="w-8 text-center flex-shrink-0">
                  {currentTrack?.id === track.id && isPlaying ? (
                    <div className="flex items-end justify-center gap-[2px] h-4">
                      <div className="w-[3px] bg-purple-400 animate-pulse" style={{ height: "60%" }} />
                      <div className="w-[3px] bg-purple-400 animate-pulse" style={{ height: "100%", animationDelay: "0.2s" }} />
                      <div className="w-[3px] bg-purple-400 animate-pulse" style={{ height: "40%", animationDelay: "0.4s" }} />
                    </div>
                  ) : (
                    <span className="text-gray-500 text-sm">{index + 1}</span>
                  )}
                </div>

                {/* Track info */}
                <div className="flex-1 min-w-0">
                  <div
                    className={`font-medium truncate ${
                      currentTrack?.id === track.id ? "text-purple-400" : "text-white"
                    }`}
                  >
                    {track.name}
                  </div>
                  <div className="text-gray-400 text-sm truncate h-5">
                    {track.albumName || "\u00A0"}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Mini Player */}
      {currentTrack && (
        <div
          className="flex-shrink-0 border-t border-gray-800"
          style={{ background: "linear-gradient(180deg, #1f1f1f 0%, #0a0a0a 100%)" }}
        >
          {/* Progress bar */}
          <div
            className="h-1 bg-gray-700 cursor-pointer"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-purple-500 transition-all duration-100"
              style={{ width: duration ? `${(progress / duration) * 100}%` : "0%" }}
            />
          </div>

          {/* Controls */}
          <div className="px-4 py-4 flex items-center justify-center gap-4">
            {/* Time - fixed width to prevent layout shift */}
            <div className="text-gray-400 text-sm w-12 text-right tabular-nums">
              {formatTime(progress)}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              {/* Previous */}
              <button
                onClick={playPrevious}
                className="w-10 h-10 flex items-center justify-center text-white hover:text-purple-400 transition-colors"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z" />
                </svg>
              </button>

              {/* Play/Pause */}
              <button
                onClick={togglePlayPause}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
                style={{ background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)" }}
              >
                {isPlaying ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7L8 5z" />
                  </svg>
                )}
              </button>

              {/* Next */}
              <button
                onClick={playNext}
                className="w-10 h-10 flex items-center justify-center text-white hover:text-purple-400 transition-colors"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 18l8.5-6L6 6v12zm10-12v12h2V6h-2z" />
                </svg>
              </button>
            </div>

            {/* Duration - fixed width to prevent layout shift */}
            <div className="text-gray-400 text-sm w-12 text-left tabular-nums">
              {formatTime(duration)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
