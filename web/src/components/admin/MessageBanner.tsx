"use client"

interface MessageBannerProps {
  message: { type: "success" | "error"; text: string } | null
  className?: string
}

export function MessageBanner({ message, className = "" }: MessageBannerProps) {
  if (!message) return null

  return (
    <div
      className={`p-3 rounded ${
        message.type === "success"
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      } ${className}`}
    >
      {message.text}
    </div>
  )
}
