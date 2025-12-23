import { auth } from "@/auth"
import { put } from "@vercel/blob"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

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
    const type = formData.get("type") as string | null
    const durationStr = formData.get("duration") as string | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    // Determine file extension
    const extension = file.name.split(".").pop()?.toLowerCase() || "mp3"

    // Parse duration if provided
    const duration = durationStr ? parseFloat(durationStr) : null

    // Create database entry first to get the ID
    const audio = await prisma.audio.create({
      data: {
        name: title,
        url: "", // Temporary, will be updated after blob upload
        type: type || "song",
        description: description || null,
        duration: duration || null,
      },
    })

    // Upload to Vercel Blob using ID-based path
    const blob = await put(
      `kempo-media/audio/${audio.id}.${extension}`,
      file,
      { access: "public" }
    )

    // Update database with the blob URL
    await prisma.audio.update({
      where: { id: audio.id },
      data: { url: blob.url },
    })

    return NextResponse.json({
      success: true,
      id: audio.id,
      url: blob.url,
      title,
      filename: `${audio.id}.${extension}`,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    )
  }
}
