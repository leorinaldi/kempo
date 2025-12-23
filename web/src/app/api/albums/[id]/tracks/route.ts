import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { id: albumId } = await params

    // Find all audio elements that link to this album
    const elements = await prisma.audioElement.findMany({
      where: {
        itemId: albumId,
        itemType: "album",
      },
      include: {
        audio: true,
      },
    })

    const tracks = elements.map((e) => ({
      id: e.audio.id,
      name: e.audio.name,
    }))

    return NextResponse.json(tracks)
  } catch (error) {
    console.error("Failed to get album tracks:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get album tracks" },
      { status: 500 }
    )
  }
}
