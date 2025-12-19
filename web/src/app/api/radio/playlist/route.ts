import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const playlist = await prisma.radioPlaylistItem.findMany({
      orderBy: { position: "asc" },
      include: {
        media: {
          select: {
            id: true,
            slug: true,
            name: true,
            url: true,
            artist: true,
            artistSlug: true,
          },
        },
      },
    })

    // Transform to the format expected by the frontend
    const items = playlist.map((item) => ({
      id: item.media.slug,
      name: item.media.name,
      artist: item.media.artist || "",
      artistSlug: item.media.artistSlug || "",
      url: item.media.url,
    }))

    return NextResponse.json(items)
  } catch (error) {
    console.error("Failed to fetch radio playlist:", error)
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { mediaId } = await request.json()

    if (!mediaId) {
      return NextResponse.json({ error: "mediaId is required" }, { status: 400 })
    }

    // Get the next position
    const lastItem = await prisma.radioPlaylistItem.findFirst({
      orderBy: { position: "desc" },
    })
    const nextPosition = (lastItem?.position ?? -1) + 1

    // Add to playlist
    await prisma.radioPlaylistItem.create({
      data: {
        mediaId,
        position: nextPosition,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to add to radio playlist:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to add to playlist" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { mediaId } = await request.json()

    if (!mediaId) {
      return NextResponse.json({ error: "mediaId is required" }, { status: 400 })
    }

    await prisma.radioPlaylistItem.delete({
      where: { mediaId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to remove from radio playlist:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to remove from playlist" },
      { status: 500 }
    )
  }
}
