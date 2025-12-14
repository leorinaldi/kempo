"use client"

interface VideoPlayerProps {
  src: string
  title?: string
  poster?: string
}

export function VideoPlayer({ src, title, poster }: VideoPlayerProps) {
  return (
    <div className="my-4">
      {title && <p className="text-sm font-medium text-gray-700 mb-2">{title}</p>}
      <video
        src={src}
        poster={poster}
        controls
        className="w-full rounded-lg"
        preload="metadata"
      >
        Your browser does not support the video tag.
      </video>
    </div>
  )
}
