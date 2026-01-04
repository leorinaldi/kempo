"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useKYDate } from "@/context/KYDateContext"

interface Video {
  id: string
  name: string
  url: string
  likes: number
  publishedAt: string
}

interface Account {
  id: string
  name: string
  displayName: string | null
  bio: string | null
  profilePictureUrl: string | null
  websiteUrl: string | null
  websiteName: string | null
  videos: Video[]
}

export default function FlipFlopAccountPage() {
  const params = useParams()
  const router = useRouter()
  const { kyDate } = useKYDate()
  const [account, setAccount] = useState<Account | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEmbedded, setIsEmbedded] = useState(true)
  const [bioExpanded, setBioExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isKempoNet, setIsKempoNet] = useState(false)

  const [urlKyParam, setUrlKyParam] = useState<string | null>(null)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const mobile = urlParams.get("mobile") === "1"
    const kempoNet = urlParams.get("kemponet") === "1"
    setIsMobile(mobile)
    setIsKempoNet(kempoNet)
    setIsEmbedded(mobile || kempoNet)
    setUrlKyParam(urlParams.get("ky"))
  }, [])

  useEffect(() => {
    if (!params.id) return
    // Prefer URL param (set by parent frame), fall back to context
    const kyParam = urlKyParam || (kyDate ? `${kyDate.year}-${String(kyDate.month).padStart(2, "0")}` : null)
    if (!kyParam) return

    fetch(`/api/flipflop/account/${params.id}?ky=${kyParam}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setAccount(null)
        } else {
          setAccount(data)
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to fetch account:", err)
        setLoading(false)
      })
  }, [params.id, urlKyParam, kyDate])

  const containerClass = isEmbedded ? "h-screen" : "fixed top-14 left-0 right-0 bottom-0"

  const handleBackClick = () => {
    const extraParams = [
      isKempoNet ? "kemponet=1" : "",
      isMobile ? "mobile=1" : "",
    ]
      .filter(Boolean)
      .join("&")
    const suffix = extraParams ? `?${extraParams}` : ""
    router.push(`/kemponet/flipflop${suffix}`)
  }

  const handleWebsiteClick = () => {
    if (account?.websiteUrl) {
      const extraParams = [
        isKempoNet ? "kemponet=1" : "",
        isMobile ? "mobile=1" : "",
      ]
        .filter(Boolean)
        .join("&")
      const suffix = extraParams ? `?${extraParams}` : ""
      router.push(`${account.websiteUrl}${suffix}`)
    }
  }

  const handleVideoClick = (videoId: string) => {
    const extraParams = [
      isKempoNet ? "kemponet=1" : "",
      isMobile ? "mobile=1" : "",
    ]
      .filter(Boolean)
      .join("&")
    const suffix = extraParams ? `?${extraParams}` : ""
    router.push(`/kemponet/flipflop/${videoId}${suffix}`)
  }

  if (loading) {
    return (
      <div className={`${containerClass} bg-black flex items-center justify-center`}>
        <div className="text-white text-lg">Loading...</div>
      </div>
    )
  }

  if (!account) {
    return (
      <div className={`${containerClass} bg-black flex flex-col items-center justify-center px-6`}>
        <div className="text-6xl mb-4">404</div>
        <div className="text-white text-xl font-semibold mb-2">Account not found</div>
        <button
          onClick={handleBackClick}
          className="text-pink-400 hover:underline mt-4"
        >
          Back to FlipFlop
        </button>
      </div>
    )
  }

  return (
    <div className={`${containerClass} bg-black overflow-y-auto`}>
      {/* Header with back button - sticky */}
      <div className="sticky top-0 z-10 flex items-center px-4 py-3 border-b border-gray-800 bg-black">
        <button
          onClick={handleBackClick}
          className="text-white mr-4 hover:text-pink-400 transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
        </button>
        <span className="text-white font-semibold">{account.name}</span>
      </div>

      {/* Profile section */}
      <div className="flex flex-col items-center py-6 px-4">
        {/* Profile picture */}
        <div className="w-24 h-24 rounded-full bg-gray-700 overflow-hidden mb-3">
          {account.profilePictureUrl ? (
            <img
              src={account.profilePictureUrl}
              alt={account.displayName || account.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-3xl">
              {(account.displayName || account.name).charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Display name */}
        <h1 className="text-white text-xl font-bold mb-1">
          {account.displayName || account.name}
        </h1>

        {/* Handle */}
        <p className="text-gray-400 text-sm mb-3">{account.name}</p>

        {/* Bio */}
        {account.bio && (
          <div className="max-w-xs mb-3 text-center">
            {bioExpanded ? (
              <p className="text-white text-sm">
                {account.bio}
              </p>
            ) : (
              <button
                onClick={() => setBioExpanded(true)}
                className="text-white text-sm text-center line-clamp-2"
              >
                {account.bio}
              </button>
            )}
          </div>
        )}

        {/* Website link */}
        {account.websiteUrl && (
          <button
            onClick={handleWebsiteClick}
            className="text-pink-400 text-sm hover:underline flex items-center gap-1"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
            </svg>
            {account.websiteName || "Website"}
          </button>
        )}
      </div>

      {/* Videos section header */}
      <div className="flex border-b border-gray-800">
        <div className="flex-1 py-3 text-center border-b-2 border-pink-500">
          <span className="text-white font-medium">Videos</span>
        </div>
      </div>

      {/* Video grid */}
      {account.videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="mb-3">
            <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
          </svg>
          <p>No videos yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-px bg-black">
          {account.videos.map((video) => (
            <button
              key={video.id}
              onClick={() => handleVideoClick(video.id)}
              className="relative aspect-[9/16] bg-gray-900 hover:opacity-80 transition-opacity"
            >
              <video
                src={video.url}
                className="w-full h-full object-cover"
                muted
                preload="metadata"
              />
              {/* Likes overlay */}
              {video.likes > 0 && (
                <div className="absolute bottom-1 left-1 flex items-center gap-1 text-white text-xs">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  {video.likes}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
