import { auth } from "@/auth"
import { list } from "@vercel/blob"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { blobs } = await list({ prefix: "kempo-media/audio/" })

    const audioFiles = blobs.map((blob) => {
      // Extract filename from pathname (e.g., "kempo-media/audio/this-perfect-holiday-song.mp3")
      const pathParts = blob.pathname.split("/")
      const filename = pathParts[pathParts.length - 1]
      // Remove extension to get slug
      const slug = filename.replace(/\.[^/.]+$/, "")

      return {
        url: blob.url,
        pathname: blob.pathname,
        filename,
        slug,
        size: blob.size,
        uploadedAt: blob.uploadedAt,
      }
    })

    return NextResponse.json(audioFiles)
  } catch (error) {
    console.error("Failed to list blobs:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to list media" },
      { status: 500 }
    )
  }
}
