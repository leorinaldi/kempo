import { auth } from "@/auth"
import { put } from "@vercel/blob"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Calculate aspectRatio from actual dimensions (overrides user selection)
function getAspectRatioFromDimensions(width: number | null, height: number | null): string | null {
  if (!width || !height) return null
  const ratio = width / height
  if (ratio > 1.2) return "landscape"
  if (ratio < 0.8) return "portrait"
  return "square"
}

export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!session.user.isAdmin) {
    return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const title = formData.get("title") as string | null
    const description = formData.get("description") as string | null
    const artist = formData.get("artist") as string | null
    const artistId = formData.get("artistId") as string | null
    const aspectRatio = formData.get("aspectRatio") as string | null
    const widthStr = formData.get("width") as string | null
    const heightStr = formData.get("height") as string | null
    const durationStr = formData.get("duration") as string | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    // Determine file extension
    const extension = file.name.split(".").pop()?.toLowerCase() || "mp4"

    // Parse width/height/duration if provided
    const width = widthStr ? parseInt(widthStr, 10) : null
    const height = heightStr ? parseInt(heightStr, 10) : null
    const duration = durationStr ? parseFloat(durationStr) : null

    // Calculate aspectRatio from actual dimensions (overrides user selection)
    const calculatedAspectRatio = getAspectRatioFromDimensions(width, height) || aspectRatio || "landscape"

    // Create database entry first to get the ID
    const video = await prisma.video.create({
      data: {
        name: title,
        url: "", // Temporary, will be updated after blob upload
        description: description || null,
        artist: artist || null,
        artistId: artistId || null,
        duration: duration || null,
        width: width || null,
        height: height || null,
        aspectRatio: calculatedAspectRatio,
      },
    })

    // Upload to Vercel Blob using ID-based path
    const blob = await put(
      `kempo-media/video/${video.id}.${extension}`,
      file,
      { access: "public" }
    )

    // Update database with the blob URL
    await prisma.video.update({
      where: { id: video.id },
      data: { url: blob.url },
    })

    return NextResponse.json({
      success: true,
      id: video.id,
      url: blob.url,
      title,
      filename: `${video.id}.${extension}`,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    )
  }
}
