import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

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
    const mediaFiles = await prisma.media.findMany({
      where: { type: mediaType },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        slug: true,
        name: true,
        url: true,
        artist: true,
        artistSlug: true,
        description: true,
        kyDate: true,
        createdAt: true,
      },
    })

    // Transform to include filename for backwards compatibility
    const result = mediaFiles.map((file) => ({
      ...file,
      filename: file.slug, // For display in dropdown
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error("Failed to list media:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to list media" },
      { status: 500 }
    )
  }
}
