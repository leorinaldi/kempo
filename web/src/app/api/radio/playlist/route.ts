import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const playlist = await prisma.radioPlaylistItem.findMany({
      orderBy: { position: "asc" },
      include: {
        audio: {
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
      id: item.audio.slug,
      name: item.audio.name,
      artist: item.audio.artist || "",
      artistSlug: item.audio.artistSlug || "",
      url: item.audio.url,
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
    const { audioId } = await request.json()

    if (!audioId) {
      return NextResponse.json({ error: "audioId is required" }, { status: 400 })
    }

    // Get the next position
    const lastItem = await prisma.radioPlaylistItem.findFirst({
      orderBy: { position: "desc" },
    })
    const nextPosition = (lastItem?.position ?? -1) + 1

    // Add to playlist
    await prisma.radioPlaylistItem.create({
      data: {
        audioId,
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
    const { audioId } = await request.json()

    if (!audioId) {
      return NextResponse.json({ error: "audioId is required" }, { status: 400 })
    }

    await prisma.radioPlaylistItem.delete({
      where: { audioId },
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
