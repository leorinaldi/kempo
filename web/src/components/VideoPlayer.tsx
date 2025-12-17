"use client"

import { useSearchParams } from "next/navigation"

interface VideoPlayerProps {
  src: string
  title?: string
  poster?: string
}

export function VideoPlayer({ src, title, poster }: VideoPlayerProps) {
  const searchParams = useSearchParams()
  const isKempoNet = searchParams.get("kemponet") === "1"

  return (
    <div className="bg-gray-100 rounded-lg p-4 my-4">
      {title && <p className="text-sm font-medium text-gray-700 mb-2">{title}</p>}
      <video
        src={src}
        poster={poster}
        controls
        controlsList={isKempoNet ? "nofullscreen" : undefined}
        disablePictureInPicture={isKempoNet}
        className={`w-full max-w-[400px] rounded-lg bg-black ${isKempoNet ? "kemponet-video" : ""}`}
        preload="metadata"
      >
        Your browser does not support the video tag.
      </video>
      {isKempoNet && (
        <style>{`
          .kemponet-video::-webkit-media-controls-fullscreen-button {
            display: none !important;
          }
          .kemponet-video::-moz-full-screen-button {
            display: none !important;
          }
        `}</style>
      )}
    </div>
  )
}
