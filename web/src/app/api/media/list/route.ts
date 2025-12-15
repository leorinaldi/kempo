import { auth } from "@/auth"
import { list } from "@vercel/blob"
import { NextResponse } from "next/server"

const videoExtensions = ["mp4", "webm", "mov", "avi", "mkv", "m4v"]
const audioExtensions = ["mp3", "wav", "ogg", "flac", "aac", "m4a"]

function getMediaTypeByExtension(filename: string): "audio" | "video" | null {
  const extension = filename.split(".").pop()?.toLowerCase() || ""
  if (videoExtensions.includes(extension)) return "video"
  if (audioExtensions.includes(extension)) return "audio"
  return null
}

export async function GET(request: Request) {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Get media type from query params (default to audio)
  const { searchParams } = new URL(request.url)
  const mediaType = searchParams.get("type") || "audio"

  if (!["audio", "video"].includes(mediaType)) {
    return NextResponse.json({ error: "Invalid media type" }, { status: 400 })
  }

  try {
    // List all files from kempo-media and filter by extension
    const { blobs } = await list({ prefix: "kempo-media/" })

    const mediaFiles = blobs
      .map((blob) => {
        // Extract filename from pathname
        const pathParts = blob.pathname.split("/")
        const filename = pathParts[pathParts.length - 1]
        // Remove extension to get slug
        const slug = filename.replace(/\.[^/.]+$/, "")
        // Determine actual type by extension
        const actualType = getMediaTypeByExtension(filename)

        return {
          url: blob.url,
          pathname: blob.pathname,
          filename,
          slug,
          size: blob.size,
          uploadedAt: blob.uploadedAt,
          type: actualType,
        }
      })
      .filter((file) => file.type === mediaType)

    return NextResponse.json(mediaFiles)
  } catch (error) {
    console.error("Failed to list blobs:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to list media" },
      { status: 500 }
    )
  }
}
